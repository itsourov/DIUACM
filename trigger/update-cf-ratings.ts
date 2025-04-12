import { logger, schedules } from "@trigger.dev/sdk/v3";
import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";

// Initialize Prisma client
const prisma = new PrismaClient();

interface CodeforcesUserInfo {
  handle: string;
  rating?: number;
  maxRating?: number;
}

interface CodeforcesApiResponse {
  status: string;
  result: CodeforcesUserInfo[];
}

export const updateCodeforcesRatings = schedules.task({
  id: "update-codeforces-ratings",
  // Run every 6 hours
  cron: "0 */6 * * *", 
  // Set a maximum duration to prevent tasks from running indefinitely
  maxDuration: 300, // 5 minutes
  run: async (payload) => {
    try {
      logger.log("Starting Codeforces usernames cleanup and ratings update", { timestamp: payload.timestamp });
      
      // Get all users who have a Codeforces handle
      const users = await prisma.user.findMany({
        where: {
          codeforcesHandle: {
            not: null,
          },
        },
        select: {
          id: true,
          codeforcesHandle: true,
          maxCfRating: true,
        },
      });

      logger.log(`Found ${users.length} users with Codeforces handles`);

      if (users.length === 0) {
        logger.log("No users with Codeforces handles found");
        return;
      }

      let updatedCount = 0;
      let cleanedHandles = 0;
      let removedHandles = 0;
      
      // Process each user individually (like the Laravel implementation)
      for (const user of users) {
        if (!user.codeforcesHandle) continue;
        
        // Clean up the handle if it's a URL
        let cfHandle = user.codeforcesHandle;
        
        if (cfHandle.startsWith('https')) {
          try {
            // Extract handle from URL, similar to Laravel's approach
            const urlParts = cfHandle.split('/');
            cfHandle = decodeURIComponent(urlParts[4] || '');
            
            // Update the handle in database to the cleaned version
            await prisma.user.update({
              where: { id: user.id },
              data: { codeforcesHandle: cfHandle },
            });
            
            cleanedHandles++;
            logger.log(`Cleaned up handle for user ${user.id}: ${user.codeforcesHandle} -> ${cfHandle}`);
          } catch (error) {
            logger.error(`Error cleaning URL handle: ${cfHandle}`, { error });
            continue;
          }
        }
        
        logger.log(`Checking Codeforces handle: ${cfHandle}`);
        
        try {
          // Fetch user info from Codeforces API
          const response = await fetch(`https://codeforces.com/api/user.info?handles=${cfHandle}`);
          
          if (!response.ok) {
            logger.warn(`API request failed for ${cfHandle}. Setting handle to null.`);
            
            await prisma.user.update({
              where: { id: user.id },
              data: { codeforcesHandle: null },
            });
            
            removedHandles++;
            continue;
          }
          
          const data = await response.json() as CodeforcesApiResponse;
          
          if (data.status !== "OK" || !data.result || !data.result[0]) {
            logger.warn(`Invalid handle: ${cfHandle}. Setting to null.`);
            
            await prisma.user.update({
              where: { id: user.id },
              data: { codeforcesHandle: null },
            });
            
            removedHandles++;
            continue;
          }
          
          const cfUser = data.result[0];
          const maxRating = cfUser.maxRating || cfUser.rating || 0;
          
          // Update with the proper handle case from API and the max rating
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              codeforcesHandle: cfUser.handle, // Use the proper case from API
              maxCfRating: maxRating 
            },
          });
          
          logger.log(`Updated handle and rating for ${cfUser.handle}`, {
            oldHandle: user.codeforcesHandle,
            newHandle: cfUser.handle,
            oldRating: user.maxCfRating,
            newRating: maxRating,
          });
          
          updatedCount++;
          
          // Add a small delay to prevent rate limiting
          await new Promise(resolve => setTimeout(resolve, 300));
          
        } catch (error) {
          logger.error(`Error processing handle: ${cfHandle}`, { error });
        }
      }

      logger.log(`Codeforces usernames cleanup and ratings update completed`, {
        processed: users.length,
        updated: updatedCount,
        cleanedHandles,
        removedHandles
      });
      
    } catch (error) {
      logger.error("Error in Codeforces cleanup task", { error });
    } finally {
      // Ensure Prisma connection is closed
      await prisma.$disconnect();
    }
  },
});