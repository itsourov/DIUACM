// Server actions for managing contact form submissions
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Function to check if the current user is an admin
export async function isAdmin() {
  const session = await auth();
  return session?.user?.email === "sourov2305101004@diu.edu.bd";
}

// Get all contact form submissions
export async function getContactSubmissions() {
  const isUserAdmin = await isAdmin();

  if (!isUserAdmin) {
    return {
      success: false,
      message: "Unauthorized access",
      data: null,
    };
  }

  try {
    const submissions = await prisma.contactFormSubmission.findMany({
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      message: "Successfully retrieved submissions",
      data: submissions,
    };
  } catch (error) {
    console.error("Error fetching contact submissions:", error);
    return {
      success: false,
      message: "Failed to retrieve submissions",
      data: null,
    };
  }
}

// Delete a single contact form submission
export async function deleteContactSubmission(id: string) {
  const isUserAdmin = await isAdmin();

  if (!isUserAdmin) {
    return {
      success: false,
      message: "Unauthorized access",
    };
  }

  try {
    await prisma.contactFormSubmission.delete({
      where: { id },
    });

    revalidatePath("/admin/contact-submissions");

    return {
      success: true,
      message: "Submission deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting contact submission:", error);
    return {
      success: false,
      message: "Failed to delete submission",
    };
  }
}

// Delete all contact form submissions
export async function deleteAllContactSubmissions() {
  const isUserAdmin = await isAdmin();

  if (!isUserAdmin) {
    return {
      success: false,
      message: "Unauthorized access",
    };
  }

  try {
    await prisma.contactFormSubmission.deleteMany({});

    revalidatePath("/admin/contact-submissions");

    return {
      success: true,
      message: "All submissions deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting all contact submissions:", error);
    return {
      success: false,
      message: "Failed to delete all submissions",
    };
  }
}
