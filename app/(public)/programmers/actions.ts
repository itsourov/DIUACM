"use server";

import { prisma } from "@/lib/prisma";

interface GetProgrammersOptions {
  page?: number;
  limit?: number;
  name?: string;
}

// Function to fetch all programmers with pagination and search
export async function getProgrammers({
  page = 1,
  limit = 12,
  name,
}: GetProgrammersOptions) {
  const skip = (page - 1) * limit;

  // Build filter conditions
  const where = {
    ...(name ? { name: { contains: name, mode: "insensitive" as const } } : {}),
  };

  // Fetch programmers with pagination
  const [programmers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        department: true,
        studentId: true,
        gender: true,
        codeforcesHandle: true,
        maxCfRating: true,
      },
      orderBy: {
        maxCfRating: {
          sort: "desc",
          nulls: "last",
        },
      },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  // Calculate pagination values
  const totalPages = Math.ceil(total / limit);

  return {
    programmers,
    pagination: {
      page,
      limit,
      total,
      pages: totalPages,
    },
  };
}

// Function to fetch a single programmer by username
export async function getProgrammerByUsername(username: string) {
  const programmer = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
      gender: true,
      phone: true,
      codeforcesHandle: true,
      atcoderHandle: true,
      vjudgeHandle: true,
      department: true,
      studentId: true,
      startingSemester: true,
      maxCfRating: true,
      createdAt: true,
      _count: {
        select: {
          eventAttendances: true,
        },
      },
    },
  });

  if (!programmer) {
    return null;
  }

  return programmer;
}

// Function to get all departments for filter options
export async function getDepartments() {
  const departmentsData = await prisma.user.findMany({
    select: {
      department: true,
    },
    where: {
      department: {
        not: null,
      },
    },
    distinct: ["department"],
  });

  return departmentsData
    .map((item) => item.department)
    .filter(Boolean) as string[];
}
