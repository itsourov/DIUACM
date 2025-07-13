"use server";

import { db } from "@/db/drizzle";
import { contactFormSubmissions } from "@/db/schema";
import { desc, eq, like, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPaginatedSubmissions(
    page: number = 1,
    pageSize: number = 10,
    search?: string
) {
    try {
        const offset = (page - 1) * pageSize;

        // Base query
        const baseQuery = db.select().from(contactFormSubmissions);

        // Add search condition if search term is provided
        const query = search
            ? baseQuery.where(like(contactFormSubmissions.name, `%${search}%`))
            : baseQuery;

        // Get total count for pagination
        const totalCountResult = await db
            .select({
                count: sql<number>`count(${contactFormSubmissions.id})`,
            })
            .from(contactFormSubmissions);

        const totalCount = Number(totalCountResult[0].count);

        // Get paginated results
        const submissions = await query
            .orderBy(desc(contactFormSubmissions.createdAt))
            .limit(pageSize)
            .offset(offset);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            success: true,
            data: {
                submissions,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    pageSize,
                },
            },
        };
    } catch (error) {
        console.error("Error fetching contact submissions:", error);
        return {
            success: false,
            error: "Failed to fetch contact submissions",
        };
    }
}

export async function deleteSubmission(id: string) {
    try {
        await db.delete(contactFormSubmissions).where(eq(contactFormSubmissions.id, parseInt(id, 10)));
        revalidatePath("/admin/contact-submissions");
        return { success: true };
    } catch (error) {
        console.error("Error deleting contact submission:", error);
        return {
            success: false,
            error: "Failed to delete contact submission",
        };
    }
} 