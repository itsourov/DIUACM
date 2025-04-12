import { PrismaClient } from "@prisma/client";
import axios from "axios";

// Initialize Prisma client
const prisma = new PrismaClient();

// Define types based on the API response
interface UserPivot {
  rank_list_id: number;
  user_id: string;
  score: number;
}

interface DIUACMUser {
  id: string;
  name: string;
  email: string;
  username: string;
  image: string | null;
  email_verified_at: string | null;
  password: string;
  gender: string;
  phone: string | null;
  codeforces_handle: string | null;
  atcoder_handle: string | null;
  vjudge_handle: string | null;
  starting_semester: string | null;
  department: string | null;
  student_id: string | null;
  max_cf_rating: number | null;
  created_at: string;
  updated_at: string;
  pivot: UserPivot;
}


interface RankListData {
  id: number;
  tracker_id: number;
  title: string;
  session: string;
  description: string | null;
  weight_of_upsolve: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  users: DIUACMUser[];
}

// Main function to import rank list users
async function importRankListUsers() {
  try {
    console.log("Fetching rank lists from API...");

    // Fetch rank lists from the API
    const response = await axios.get<RankListData[]>(
      "https://admin.diuacm.com/api/ranklists"
    );
    const rankLists = response.data;
    console.log(`Fetched ${rankLists.length} rank lists`);

    // Track statistics
    let rankListsFound = 0;
    let rankListsNotFound = 0;
    let usersImported = 0;
    let usersSkipped = 0;
    let usersNotFound = 0;

    // Process each rank list
    for (const rankListData of rankLists) {
      console.log(
        `Processing rank list: ${rankListData.title} (Session: ${rankListData.session})`
      );

      // Find matching rank list in our database using session as keyword
      const existingRankList = await prisma.rankList.findFirst({
        where: {
          keyword: rankListData.session,
        },
      });

      if (!existingRankList) {
        console.log(
          `Rank list with keyword "${rankListData.session}" not found in database`
        );
        rankListsNotFound++;
        continue;
      }

      console.log(`Found matching rank list with ID: ${existingRankList.id}`);
      rankListsFound++;

      // Process users for this rank list
      for (const userData of rankListData.users) {
        console.log(`Processing user: ${userData.name} (ID: ${userData.id})`);

        // Check if user exists in our database
        const existingUser = await prisma.user.findUnique({
          where: { id: userData.id },
        });

        if (!existingUser) {
          console.log(
            `User with ID ${userData.id} (${userData.name}) not found in database, skipping...`
          );
          usersNotFound++;
          continue;
        }

        // Check if user is already in this rank list
        const existingRankListUser = await prisma.rankListUser.findFirst({
          where: {
            userId: userData.id,
            rankListId: existingRankList.id,
          },
        });

        if (existingRankListUser) {
          console.log(
            `User ${userData.name} is already in rank list ${existingRankList.id}, updating score...`
          );

          // Update the score if different
          if (existingRankListUser.score !== userData.pivot.score) {
            await prisma.rankListUser.update({
              where: { id: existingRankListUser.id },
              data: { score: userData.pivot.score },
            });
            console.log(
              `Updated score for ${userData.name} to ${userData.pivot.score}`
            );
          } else {
            console.log(
              `Score for ${userData.name} is already ${userData.pivot.score}, no update needed`
            );
          }

          usersSkipped++;
          continue;
        }

        // Create rank list user entry
        await prisma.rankListUser.create({
          data: {
            userId: userData.id,
            rankListId: existingRankList.id,
            score: userData.pivot.score,
          },
        });

        console.log(
          `Added user ${userData.name} to rank list ${existingRankList.id} with score ${userData.pivot.score}`
        );
        usersImported++;
      }
    }

    // Print summary
    console.log("\n=== IMPORT SUMMARY ===");
    console.log(`Rank lists found: ${rankListsFound}`);
    console.log(`Rank lists not found: ${rankListsNotFound}`);
    console.log(`Users imported: ${usersImported}`);
    console.log(`Users skipped (already existed): ${usersSkipped}`);
    console.log(`Users not found: ${usersNotFound}`);
  } catch (error) {
    console.error("Error during import:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importRankListUsers().catch(console.error);
