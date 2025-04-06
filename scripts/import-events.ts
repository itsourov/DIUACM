import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AttendanceScope, PrismaClient } from "@prisma/client";
import fetch from "node-fetch";
import axios from "axios";

// Initialize Prisma client
const prisma = new PrismaClient();

console.log("Environment variables loaded successfully");
console.log(`Bucket name: ${process.env.CLOUDFLARE_R2_BUCKET_NAME}`);
console.log(`R2 Account ID: ${process.env.CLOUDFLARE_R2_ACCOUNT_ID}`);

// Initialize S3 client for Cloudflare R2
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

// Define types based on the API response
interface DIUACMUser {
  id: string;
  name: string;
  email: string;
  image: string;
  username: string;
  student_id: string | null;
  gender: string | null;
  phone: string | null;
  codeforces_handle: string | null;
  atcoder_handle: string | null;
  vjudge_handle: string | null;
  starting_semester: string | null;
  department: string | null;
  created_at: string;
}

interface DIUACMEvent {
  id: number;
  title: string;
  description: string;
  status: string;
  starting_at: string;
  ending_at: string;
  event_link: string;
  event_password: string;
  open_for_attendance: boolean;
  strict_attendance: boolean;
  type: string;
  attendance_scope: string;
  attenders: DIUACMUser[];
  created_at: string;
  updated_at: string;
}

// Function to download a file from URL and return as buffer
async function downloadFile(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  const buffer = await response.buffer();
  return buffer;
}

// Function to upload file buffer to S3/R2
async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string,
  contentDisposition?: string
): Promise<string> {
  if (!process.env.CLOUDFLARE_R2_BUCKET_NAME) {
    throw new Error(
      "CLOUDFLARE_R2_BUCKET_NAME environment variable is not set"
    );
  }

  console.log(`Uploading to bucket: ${process.env.CLOUDFLARE_R2_BUCKET_NAME}`);
  console.log(`File key: ${key}`);

  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ContentDisposition: contentDisposition,
  });

  try {
    await s3.send(command);
    return `${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN}/${key}`;
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw error;
  }
}

// Main function to import questions
async function importEvents() {
  try {
    console.log("Fetching events from API...");

    // Fetch questions from the API
    const response = await axios.get<DIUACMEvent[]>(
      "https://admin.diuacm.com/api/events"
    );
    const events = response.data;
    console.log(`Fetched ${events.length} events`);

    // Loop through each event and process it
    for (const event of events) {
      console.log(`Processing event: ${event.title}`);
      const existingEvent = await prisma.event.findFirst({
        where: { eventLink: event.event_link },
      });
      if (existingEvent) {
        console.log(`Event "${event.title}" already exists, skipping...`);
        continue;
      }

      await prisma.event.create({
        data: {
          title: event.title,
          startingAt: new Date(event.starting_at),
          endingAt: new Date(event.ending_at),
          eventLink: event.event_link,
          eventPassword: event.event_password,
          openForAttendance: event.open_for_attendance,
          strictAttendance: event.strict_attendance,
          createdAt: new Date(event.created_at),
          updatedAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error("Error during import:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importEvents().catch(console.error);
