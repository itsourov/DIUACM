"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { userFormSchema, userUpdateFormSchema, type UserFormValues, type UserUpdateFormValues } from "./schemas/user";

export async function createUser(values: UserFormValues) {
  try {
    const validatedFields = userFormSchema.parse(values);
    
    // Check if email is already taken
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: validatedFields.email }
    });

    if (existingUserByEmail) {
      return { 
        success: false, 
        error: { email: ["This email is already in use."] } 
      };
    }
    
    // Check if username is already taken
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: validatedFields.username }
    });

    if (existingUserByUsername) {
      return { 
        success: false, 
        error: { username: ["This username is already in use."] } 
      };
    }
    
    // Hash password if provided
    const userData = { ...validatedFields };
    
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
    }

    const user = await prisma.user.create({
      data: userData,
    });

    revalidatePath("/admin/users");
    return { success: true, data: user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }
    
    return { 
      success: false, 
      error: "Something went wrong. Please try again." 
    };
  }
}

export async function updateUser(
  id: string,
  values: UserUpdateFormValues
) {
  try {
    const validatedFields = userUpdateFormSchema.parse(values);
    
    // Check if email is already taken by another user
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: validatedFields.email }
    });

    if (existingUserByEmail && existingUserByEmail.id !== id) {
      return { 
        success: false, 
        error: { email: ["This email is already in use."] } 
      };
    }
    
    // Check if username is already taken by another user
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: validatedFields.username }
    });

    if (existingUserByUsername && existingUserByUsername.id !== id) {
      return { 
        success: false, 
        error: { username: ["This username is already in use."] } 
      };
    }
    
    // Prepare update data
    const updateData: Prisma.UserUpdateInput = { ...validatedFields };
    
    // If password is empty string or null, remove it from update
    if (!updateData.password) {
      delete updateData.password;
    } else {
      // Hash password if it was provided
      updateData.password = await bcrypt.hash(updateData.password as string, 12);
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}/edit`);
    return { success: true, data: user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }
    
    return { 
      success: false, 
      error: "Something went wrong. Please try again." 
    };
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { 
      success: false, 
      error: "Something went wrong. Please try again." 
    };
  }
}

export async function getUser(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Remove password from response for security
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;


    return { success: true, data: userWithoutPassword };
  } catch (error) {
    console.error(error);
    return { 
      success: false, 
      error: "Something went wrong. Please try again." 
    };
  }
}

export async function getPaginatedUsers(
  page: number = 1, 
  pageSize: number = 10, 
  search?: string
) {
  try {
    const skip = (page - 1) * pageSize;
    
    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { username: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { studentId: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};
    
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          gender: true,
          phone: true,
          image: true,
          codeforcesHandle: true,
          atcoderHandle: true,
          vjudgeHandle: true,
          department: true,
          studentId: true,
          maxCfRating: true,
          startingSemester: true,
          createdAt: true,
          _count: {
            select: {
              eventAttendances: true,
              rankListUsers: true,
            }
          }
        }
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);
    
    return { 
      success: true, 
      data: { 
        users, 
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          pageSize,
        }
      } 
    };
  } catch (error) {
    console.error(error);
    return { 
      success: false, 
      error: "Something went wrong. Please try again." 
    };
  }
}