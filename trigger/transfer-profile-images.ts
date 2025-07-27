import { logger, schedules } from "@trigger.dev/sdk/v3";
import { db } from "../db/drizzle";
import { users as usersTable } from "../db/schema";
import { isNotNull, eq, and, not, like } from "drizzle-orm";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../lib/s3";
import { v4 as uuid } from "uuid";

export const transferProfileImagesToS3 = schedules.task({
  id: "transfer-profile-images-to-s3",
  // Run every 2 hours
  cron: "0 */2 * * *",
  // Set a maximum duration to prevent tasks from running indefinitely
  maxDuration: 600, // 10 minutes
  run: async (payload) => {
    try {
      logger.log("Starting profile images transfer to S3", {
        timestamp: payload.timestamp,
      });

      // Skip if NEXT_PUBLIC_S3_DOMAIN is not configured
      if (!process.env.NEXT_PUBLIC_S3_DOMAIN) {
        logger.log("NEXT_PUBLIC_S3_DOMAIN not configured, skipping task");
        return;
      }

      // Get all users who have profile images that are not already on our S3
      const users = await db
        .select({
          id: usersTable.id,
          image: usersTable.image,
        })
        .from(usersTable)
        .where(
          and(
            isNotNull(usersTable.image),
            not(like(usersTable.image, `${process.env.NEXT_PUBLIC_S3_DOMAIN}%`))
          )
        );

      logger.log(`Found ${users.length} users with external profile images`);

      if (users.length === 0) {
        logger.log("No external profile images found to transfer");
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        if (!user.image) continue;

        try {
          logger.log(`Processing image for user ${user.id}: ${user.image}`);

          // Download the image from the external URL with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

          const response = await fetch(user.image, {
            signal: controller.signal,
            headers: {
              "User-Agent": "DIUACM-ImageTransfer/1.0",
            },
          });
          clearTimeout(timeoutId);

          if (!response.ok) {
            logger.warn(
              `Failed to fetch image for user ${user.id}: ${response.status}`
            );
            errorCount++;
            continue;
          }

          // Get the content type and validate it's an image
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.startsWith("image/")) {
            logger.warn(
              `Invalid content type for user ${user.id}: ${contentType}`
            );
            errorCount++;
            continue;
          }

          // Convert response to buffer
          const imageBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(imageBuffer);

          // Check file size (5MB limit)
          const maxSize = 5 * 1024 * 1024; // 5MB
          if (buffer.length > maxSize) {
            logger.warn(
              `Image too large for user ${user.id}: ${buffer.length} bytes`
            );
            errorCount++;
            continue;
          }

          // Generate unique key for S3
          const fileExtension = contentType.split("/")[1] || "jpg";
          const uniqueId = uuid();
          const key = `profile-images/${uniqueId}.${fileExtension}`;

          // Upload to S3
          const putObjectCommand = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            ContentLength: buffer.length,
          });

          await s3.send(putObjectCommand);

          // Generate the new S3 URL
          const newImageUrl = `${process.env.NEXT_PUBLIC_S3_DOMAIN}/${key}`;

          // Update user record with new S3 URL
          await db
            .update(usersTable)
            .set({
              image: newImageUrl,
              updatedAt: new Date(),
            })
            .where(eq(usersTable.id, user.id));

          logger.log(`Successfully transferred image for user ${user.id}`, {
            oldUrl: user.image,
            newUrl: newImageUrl,
            size: buffer.length,
          });

          successCount++;

          // Add a small delay to prevent overwhelming S3
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (error) {
          logger.error(`Error processing image for user ${user.id}`, {
            error: error instanceof Error ? error.message : String(error),
            imageUrl: user.image,
          });
          errorCount++;
        }
      }

      logger.log("Profile images transfer to S3 completed", {
        processed: users.length,
        successful: successCount,
        errors: errorCount,
      });
    } catch (error) {
      logger.error("Error in profile images transfer task", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
});
