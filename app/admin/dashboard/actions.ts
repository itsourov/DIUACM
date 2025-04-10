"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Function to check if the current user is an admin
async function isAdmin() {
  const session = await auth();
  return session?.user?.email === "sourov2305101004@diu.edu.bd";
}

// Get summary stats for the dashboard
export async function getStats() {
  const userIsAdmin = await isAdmin();

  if (!userIsAdmin) {
    return {
      success: false,
      message: "Unauthorized access",
      data: null,
    };
  }

  try {
    // Fetch counts in parallel for better performance
    const [
      usersCount,
      eventsCount,
      blogsCount,
      contestsCount,
      trackersCount,
      contactSubmissionsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.blogPost.count(), // Updated from blog to blogPost
      prisma.contest.count(),
      prisma.tracker.count(),
      prisma.contactFormSubmission.count(),
    ]);

    return {
      success: true,
      message: "Stats fetched successfully",
      data: {
        users: usersCount,
        events: eventsCount,
        blogs: blogsCount,
        contests: contestsCount,
        trackers: trackersCount,
        contactSubmissions: contactSubmissionsCount,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      success: false,
      message: "Failed to fetch dashboard stats",
      data: null,
    };
  }
}
