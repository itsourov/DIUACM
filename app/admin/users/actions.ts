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
