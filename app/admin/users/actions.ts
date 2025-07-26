"use server";

import { db } from "@/db/drizzle";
import {
  users,
  eventUserAttendance,
  rankListUser,
  type User,
  type NewUser,
  type UserWithCounts,
} from "@/db/schema";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq, or, ilike, count, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  userFormSchema,
  userUpdateFormSchema,
  type UserFormValues,
  type UserUpdateFormValues,
} from "./schemas/user";
import { hasPermission } from "@/lib/authorization";

export async function createUser(values: UserFormValues) {
  try {
    // Check if the user has permission to manage users
    if (!(await hasPermission("USERS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }
    const validatedFields = userFormSchema.parse(values);

    // Check if email is already taken
    const existingUserByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedFields.email))
      .limit(1);

    if (existingUserByEmail.length > 0) {
      return {
        success: false,
        error: { email: ["This email is already in use."] },
      };
    }

    // Check if username is already taken
    if (validatedFields.username) {
      const existingUserByUsername = await db
        .select()
        .from(users)
        .where(eq(users.username, validatedFields.username))
        .limit(1);

      if (existingUserByUsername.length > 0) {
        return {
          success: false,
          error: { username: ["This username is already in use."] },
        };
      }
    }

    // Hash password if provided
    const userData: NewUser = { ...validatedFields };
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
    }

    await db.insert(users).values(userData);

    // Get the created user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedFields.email))
      .limit(1);

    revalidatePath("/admin/users");
    return { success: true, data: user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }

    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function updateUser(id: string, values: UserUpdateFormValues) {
  try {
    // Check if the user has permission to manage users
    if (!(await hasPermission("USERS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }
    const validatedFields = userUpdateFormSchema.parse(values);

    // Check if email is already taken by another user
    const existingUserByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedFields.email))
      .limit(1);

    if (existingUserByEmail.length > 0 && existingUserByEmail[0].id !== id) {
      return {
        success: false,
        error: { email: ["This email is already in use."] },
      };
    }

    // Check if username is already taken by another user
    if (validatedFields.username) {
      const existingUserByUsername = await db
        .select()
        .from(users)
        .where(eq(users.username, validatedFields.username))
        .limit(1);

      if (
        existingUserByUsername.length > 0 &&
        existingUserByUsername[0].id !== id
      ) {
        return {
          success: false,
          error: { username: ["This username is already in use."] },
        };
      }
    }

    // Prepare update data
    const updateData: Partial<User> = { ...validatedFields };

    // If password is empty string or null, remove it from update
    if (!updateData.password) {
      delete updateData.password;
    } else {
      // Hash password if it was provided
      updateData.password = await bcrypt.hash(
        updateData.password as string,
        12
      );
    }

    await db.update(users).set(updateData).where(eq(users.id, id));

    // Get the updated user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}/edit`);
    return { success: true, data: user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }

    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function deleteUser(id: string) {
  try {
    // Check if the user has permission to manage users
    if (!(await hasPermission("USERS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    await db.delete(users).where(eq(users.id, id));

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function getUser(id: string) {
  try {
    // Check if the user has permission to manage users
    if (!(await hasPermission("USERS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Remove password from response for security
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return { success: true, data: userWithoutPassword };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function getPaginatedUsers(
  page: number = 1,
  pageSize: number = 10,
  search?: string
) {
  try {
    // Check if the user has permission to manage users
    if (!(await hasPermission("USERS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const offset = (page - 1) * pageSize;

    // Build search condition
    const searchCondition = search
      ? or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.username, `%${search}%`),
          ilike(users.studentId, `%${search}%`)
        )
      : undefined;

    // Get users with counts
    const usersQuery = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        username: users.username,
        gender: users.gender,
        phone: users.phone,
        image: users.image,
        codeforcesHandle: users.codeforcesHandle,
        atcoderHandle: users.atcoderHandle,
        vjudgeHandle: users.vjudgeHandle,
        department: users.department,
        studentId: users.studentId,
        maxCfRating: users.maxCfRating,
        startingSemester: users.startingSemester,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);

    if (searchCondition) {
      usersQuery.where(searchCondition);
    }

    const usersList = await usersQuery
      .orderBy(desc(users.createdAt))
      .limit(pageSize)
      .offset(offset);

    // Get total count
    const totalCountQuery = db.select({ count: count() }).from(users);

    if (searchCondition) {
      totalCountQuery.where(searchCondition);
    }

    const [{ count: totalCount }] = await totalCountQuery;

    // Get counts for each user
    const usersWithCounts: UserWithCounts[] = await Promise.all(
      usersList.map(async (user) => {
        const [eventAttendancesCount] = await db
          .select({ count: count() })
          .from(eventUserAttendance)
          .where(eq(eventUserAttendance.userId, user.id));

        const [rankListUsersCount] = await db
          .select({ count: count() })
          .from(rankListUser)
          .where(eq(rankListUser.userId, user.id));

        return {
          ...user,
          _count: {
            eventAttendances: eventAttendancesCount.count,
            rankListUsers: rankListUsersCount.count,
          },
        };
      })
    );

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      data: {
        users: usersWithCounts,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          pageSize,
        },
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// CSV Import Functions

// Transform CSV row data to match user schema format
function transformCSVUserData(
  data: Record<string, string>
): Record<string, string | null | undefined> {
  const transformed: Record<string, string | null | undefined> = { ...data };

  // Convert empty strings to null for optional fields that expect null
  const nullableFields = [
    "password",
    "phone",
    "codeforcesHandle",
    "atcoderHandle",
    "vjudgeHandle",
    "startingSemester",
    "department",
    "studentId",
    "image",
  ];

  nullableFields.forEach((field) => {
    if (transformed[field] === "") {
      transformed[field] = null;
    }
  });

  // Handle gender field specifically (convert empty to undefined since it's optional but not nullable)
  if (transformed.gender === "") {
    transformed.gender = undefined;
  }

  return transformed;
}

export async function downloadSampleCSV() {
  try {
    // Check if the user has permission to manage users
    if (!(await hasPermission("USERS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const sampleData = [
      "name,email,username,password,gender,phone,codeforcesHandle,atcoderHandle,vjudgeHandle,startingSemester,department,studentId,image",
      "John Doe,john.doe@example.com,johndoe,Password123,male,+1234567890,john_doe,johndoe_at,johndoe_vj,Fall 2024,CSE,123456789,",
      "Jane Smith,jane.smith@example.com,janesmith,SecurePass456,female,+0987654321,jane_smith,janesmith_at,janesmith_vj,Spring 2024,EEE,987654321,",
      "Alex Johnson,alex.johnson@example.com,alexjohnson,MyPass789,other,,alex_johnson,,,Summer 2024,BBA,456789123,",
    ];

    return {
      success: true,
      data: sampleData.join("\n"),
    };
  } catch (error) {
    console.error("Error generating sample CSV:", error);
    return {
      success: false,
      error: "Failed to generate sample CSV",
    };
  }
}

export async function importUsersFromCSV(formData: FormData) {
  try {
    // Check if the user has permission to manage users
    if (!(await hasPermission("USERS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const file = formData.get("file") as File;
    const mode = formData.get("mode") as "update" | "ignore" | "stop";

    if (!file) {
      return { success: false, message: "No file provided" };
    }

    // Read and parse CSV
    const csvText = await file.text();
    const lines = csvText.trim().split("\n");

    if (lines.length < 2) {
      return {
        success: false,
        message: "CSV file must contain at least a header and one data row",
      };
    }

    // Simple CSV parser that handles quoted values
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }

      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]);
    const dataLines = lines.slice(1);

    // Validate headers
    const requiredHeaders = ["name", "email", "username"];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

    if (missingHeaders.length > 0) {
      return {
        success: false,
        message: `Missing required headers: ${missingHeaders.join(", ")}`,
      };
    }

    const stats = {
      total: dataLines.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
    };
    const errors: string[] = [];

    // Process each row
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim();
      if (!line) continue;

      try {
        const values = parseCSVLine(line);
        const rowData: Record<string, string> = {};

        // Map values to headers
        headers.forEach((header, index) => {
          rowData[header] = values[index] || "";
        });

        // Transform and validate data
        const transformedData = transformCSVUserData(rowData);
        const validatedData = userFormSchema.parse(transformedData);

        // Check if user already exists
        const existingUser = await db
          .select()
          .from(users)
          .where(
            or(
              eq(users.email, validatedData.email),
              eq(users.username, validatedData.username)
            )
          )
          .limit(1);

        if (existingUser.length > 0) {
          if (mode === "stop") {
            return {
              success: false,
              message: `Import stopped: User with email "${
                validatedData.email
              }" or username "${
                validatedData.username
              }" already exists at row ${i + 2}`,
              stats,
              errors,
            };
          }

          if (mode === "ignore") {
            stats.skipped++;
            continue;
          }

          if (mode === "update") {
            // Update existing user
            const updateData: Partial<User> = { ...validatedData };

            // Hash password if provided
            if (updateData.password) {
              updateData.password = await bcrypt.hash(updateData.password, 12);
            } else {
              delete updateData.password;
            }

            await db
              .update(users)
              .set(updateData)
              .where(eq(users.id, existingUser[0].id));

            stats.updated++;
          }
        } else {
          // Create new user
          const userData: NewUser = { ...validatedData };

          // Hash password if provided
          if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 12);
          }

          await db.insert(users).values(userData);
          stats.created++;
        }
      } catch (error) {
        stats.errors++;
        const errorMessage =
          error instanceof z.ZodError
            ? `Row ${i + 2}: ${error.errors.map((e) => e.message).join(", ")}`
            : `Row ${i + 2}: ${
                error instanceof Error ? error.message : "Unknown error"
              }`;

        errors.push(errorMessage);

        // If there are too many errors, stop processing
        if (errors.length >= 10) {
          errors.push("Too many errors. Import stopped.");
          break;
        }
      }
    }

    revalidatePath("/admin/users");

    const successCount = stats.created + stats.updated;
    let message = "";

    if (successCount === 0 && stats.errors === 0 && stats.skipped > 0) {
      message = `All ${stats.skipped} users were skipped (already exist)`;
    } else if (successCount > 0) {
      message = `Successfully processed ${successCount} users`;
      if (stats.created > 0) message += ` (${stats.created} created`;
      if (stats.updated > 0)
        message += `${stats.created > 0 ? ", " : " ("}${stats.updated} updated`;
      if (stats.created > 0 || stats.updated > 0) message += ")";
      if (stats.skipped > 0) message += `, ${stats.skipped} skipped`;
      if (stats.errors > 0) message += `, ${stats.errors} errors`;
    } else {
      message = "No users were processed successfully";
    }

    return {
      success: successCount > 0 || stats.skipped > 0,
      message,
      stats,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("CSV import error:", error);
    return {
      success: false,
      message: "An unexpected error occurred during import",
    };
  }
}
