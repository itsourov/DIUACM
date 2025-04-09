import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

// Initialize S3 client with Cloudflare R2 config
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Generates a unique file name with a given extension
 */
export function generateFileName(extension: string): string {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(16).toString("hex");
  return `${timestamp}-${randomString}.${extension}`;
}

/**
 * Uploads a file to S3 (Cloudflare R2)
 */
export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<{ success: boolean; key?: string; error?: string }> {
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: file,
        ContentType: contentType,
      })
    );

    return { success: true, key: fileName };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    return { success: false, error: "Failed to upload file" };
  }
}

/**
 * Gets a temporary URL for a file from S3
 */
export async function getSignedFileUrl(key: string): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });

    // URL expires in 3600 seconds (1 hour)
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return null;
  }
}

/**
 * Gets a public URL for a file using the NEXT_PUBLIC_S3_DOMAIN
 */
export function getPublicFileUrl(key: string): string {
  const domain = process.env.NEXT_PUBLIC_S3_DOMAIN;
  return `${domain}/${key}`;
}

/**
 * Deletes a file from S3
 */
export async function deleteFromS3(
  key: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      })
    );

    return { success: true };
  } catch (error) {
    console.error("Error deleting from S3:", error);
    return { success: false, error: "Failed to delete file" };
  }
}

/**
 * Lists files from a prefix/folder in S3
 */
export async function listFilesFromS3(prefix: string = ""): Promise<string[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: prefix,
    });

    const response = await s3.send(command);
    return (response.Contents || [])
      .map((item) => item.Key || "")
      .filter((key) => key !== "");
  } catch (error) {
    console.error("Error listing files from S3:", error);
    return [];
  }
}
