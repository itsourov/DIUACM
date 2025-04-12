import { PrismaClient, Gender } from "@prisma/client";
import axios from "axios";

// Initialize Prisma client
const prisma = new PrismaClient();

// Define types based on the API response
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
  created_at: string | null;
  updated_at: string | null;
}

// Convert gender string from API to Gender enum
function mapGender(gender: string): Gender | null {
  switch (gender.toLowerCase()) {
    case "male":
      return Gender.MALE;
    case "female":
      return Gender.FEMALE;
    case "other":
      return Gender.OTHER;
    case "unspecified":
      return null;
    default:
      throw new Error(`Unknown gender : ${gender}`);
  }
}

// Main function to import users
async function importUsers() {
  try {
    console.log("Fetching users from API...");

    // Fetch users from the API
    const response = await axios.get<DIUACMUser[]>(
      "https://admin.diuacm.com/api/users"
    );
    const users = response.data;
    console.log(`Fetched ${users.length} users`);

    // Loop through each user and process it
    let importedCount = 0;
    let skipCount = 0;

    for (const user of users) {
      console.log(`Processing user: ${user.name} (${user.email})`);

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: user.email }, { username: user.username }],
        },
      });

      if (existingUser) {
        console.log(
          `....User with email "${user.email}" or username "${user.username}" already exists, skipping...`
        );
        skipCount++;
        continue;
      }

      // Parse email_verified_at
      let emailVerified: Date | null = null;
      if (user.email_verified_at) {
        emailVerified = new Date(user.email_verified_at);
      }

      // Map gender string to Gender enum
      const gender = mapGender(user.gender);

      // Create user in the database
      await prisma.user.create({
        data: {
          id: user.id, // Preserve the original ID
          name: user.name,
          email: user.email,
          username: user.username,
          emailVerified,
          image: user.image,
          password: user.password, // Note: This assumes the passwords are hashed in the same way
          gender,
          phone: user.phone,
          codeforcesHandle: user.codeforces_handle,
          atcoderHandle: user.atcoder_handle,
          vjudgeHandle: user.vjudge_handle,
          startingSemester: user.starting_semester,
          department: user.department,
          studentId: user.student_id,
          maxCfRating: user.max_cf_rating,
          createdAt: user.created_at ? new Date(user.created_at) : new Date(),
          updatedAt: user.updated_at ? new Date(user.updated_at) : new Date(),
        },
      });

      importedCount++;
      console.log(`Successfully imported user: ${user.name}`);
    }

    console.log(
      `Import completed. Imported: ${importedCount}, Skipped: ${skipCount}`
    );
  } catch (error) {
    console.error("Error during import:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importUsers().catch(console.error);
