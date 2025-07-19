"use server";

import { db } from "@/db/drizzle";
import { users, teams, teamUser, contests, galleries, media } from "@/db/schema";
import { desc, like, asc, sql, count, and, isNotNull, eq, inArray } from "drizzle-orm";

export interface GetProgrammersParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProgrammerResult {
  id: string;
  name: string;
  image: string | null;
  studentId: string | null;
  maxCfRating: number | null;
  codeforcesHandle: string | null;
  username: string;
}

export interface GetProgrammersResponse {
  programmers: ProgrammerResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function getProgrammers({
  search = "",
  page = 1,
  limit = 12,
}: GetProgrammersParams = {}): Promise<GetProgrammersResponse> {
  try {
    const offset = (page - 1) * limit;

    // Build the where conditions
    const whereConditions = [];

    // Add search condition for name or student ID
    if (search) {
      whereConditions.push(
        sql`(${like(users.name, `%${search}%`)} OR ${like(users.studentId, `%${search}%`)} OR ${like(users.codeforcesHandle, `%${search}%`)})`
      );
    }

    // Only show users with codeforces handles (programmers)
    whereConditions.push(isNotNull(users.codeforcesHandle));

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count for pagination
    const [{ total }] = await db
      .select({
        total: count(),
      })
      .from(users)
      .where(whereClause);

    // Get programmers with pagination, sorted by maxCfRating (highest first)
    const programmers = await db
      .select({
        id: users.id,
        name: users.name,
        image: users.image,
        studentId: users.studentId,
        maxCfRating: users.maxCfRating,
        codeforcesHandle: users.codeforcesHandle,
        username: users.username,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.maxCfRating), asc(users.name))
      .limit(limit)
      .offset(offset);

    return {
      programmers,
      pagination: {
        page,
        limit,
        total: Number(total),
        pages: Math.ceil(Number(total) / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching programmers:", error);
    return {
      programmers: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        pages: 0,
      },
    };
  }
}

// Programmer details interfaces and functions
export interface ProgrammerDetails {
  id: string;
  name: string;
  email: string;
  username: string;
  image: string | null;
  gender: string | null;
  phone: string | null;
  codeforcesHandle: string | null;
  atcoderHandle: string | null;
  vjudgeHandle: string | null;
  startingSemester: string | null;
  department: string | null;
  studentId: string | null;
  maxCfRating: number | null;
  createdAt: Date | null;
}

export interface ContestParticipation {
  contest: {
    id: number;
    name: string;
    contestType: string;
    location: string | null;
    date: Date | null;
    description: string | null;
    standingsUrl: string | null;
    gallery: {
      id: number;
      title: string;
      slug: string;
      media: {
        id: number;
        url: string;
        title: string | null;
        width: number;
        height: number;
        fileSize: number;
        mimeType: string;
      }[];
    } | null;
  };
  team: {
    id: number;
    name: string;
    rank: number | null;
    solveCount: number | null;
    members: {
      id: string;
      user: {
        id: string;
        name: string;
        image: string | null;
        studentId: string | null;
        username: string;
      };
    }[];
  };
}

export interface GetProgrammerDetailsResponse {
  programmer: ProgrammerDetails | null;
  contestParticipations: ContestParticipation[];
}

export async function getProgrammerDetails(username: string): Promise<GetProgrammerDetailsResponse> {
  try {
    // Get programmer details by username
    const [programmer] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        username: users.username,
        image: users.image,
        gender: users.gender,
        phone: users.phone,
        codeforcesHandle: users.codeforcesHandle,
        atcoderHandle: users.atcoderHandle,
        vjudgeHandle: users.vjudgeHandle,
        startingSemester: users.startingSemester,
        department: users.department,
        studentId: users.studentId,
        maxCfRating: users.maxCfRating,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.username, username));

    if (!programmer) {
      return {
        programmer: null,
        contestParticipations: [],
      };
    }

    // Get contest participations
    const contestParticipationsQuery = await db
      .select({
        contestId: contests.id,
        contestName: contests.name,
        contestType: contests.contestType,
        contestLocation: contests.location,
        contestDate: contests.date,
        contestDescription: contests.description,
        contestStandingsUrl: contests.standingsUrl,
        teamId: teams.id,
        teamName: teams.name,
        teamRank: teams.rank,
        teamSolveCount: teams.solveCount,
        galleryId: galleries.id,
        galleryTitle: galleries.title,
        gallerySlug: galleries.slug,
      })
      .from(teamUser)
      .innerJoin(teams, eq(teamUser.teamId, teams.id))
      .innerJoin(contests, eq(teams.contestId, contests.id))
      .leftJoin(galleries, eq(contests.galleryId, galleries.id))
      .where(eq(teamUser.userId, programmer.id))
      .orderBy(contests.date);

    // Get team members and gallery media for each unique team
    const uniqueTeamIds = [...new Set(contestParticipationsQuery.map(p => p.teamId))];
    const uniqueGalleryIds = [...new Set(contestParticipationsQuery.map(p => p.galleryId).filter(Boolean))] as number[];

    // Get team members
    const teamMembers = uniqueTeamIds.length > 0 ? await db
      .select({
        teamId: teamUser.teamId,
        userId: teamUser.userId,
        userName: users.name,
        userImage: users.image,
        userStudentId: users.studentId,
        userUsername: users.username,
      })
      .from(teamUser)
      .innerJoin(users, eq(teamUser.userId, users.id))
      .where(inArray(teamUser.teamId, uniqueTeamIds)) : [];

    // Get gallery media
    const galleryMediaQuery = uniqueGalleryIds.length > 0 ? await db
      .select({
        galleryId: media.galleryId,
        mediaId: media.id,
        mediaUrl: media.url,
        mediaTitle: media.title,
        mediaWidth: media.width,
        mediaHeight: media.height,
        mediaFileSize: media.fileSize,
        mediaMimeType: media.mimeType,
      })
      .from(media)
      .where(inArray(media.galleryId, uniqueGalleryIds))
      .orderBy(media.order) : [];

    // Group data by contest
    const contestParticipations: ContestParticipation[] = [];
    const processedContests = new Set<number>();

    for (const participation of contestParticipationsQuery) {
      if (processedContests.has(participation.contestId)) {
        continue;
      }
      processedContests.add(participation.contestId);

      // Get all team members for this team
      const teamMembersList = teamMembers
        .filter(member => member.teamId === participation.teamId)
        .map(member => ({
          id: member.userId,
          user: {
            id: member.userId,
            name: member.userName,
            image: member.userImage,
            studentId: member.userStudentId,
            username: member.userUsername,
          },
        }));

      // Get gallery media for this contest
      const contestMedia = participation.galleryId 
        ? galleryMediaQuery
            .filter(media => media.galleryId === participation.galleryId)
            .map(media => ({
              id: media.mediaId,
              url: media.mediaUrl,
              title: media.mediaTitle,
              width: media.mediaWidth,
              height: media.mediaHeight,
              fileSize: media.mediaFileSize,
              mimeType: media.mediaMimeType,
            }))
        : [];

      contestParticipations.push({
        contest: {
          id: participation.contestId,
          name: participation.contestName,
          contestType: participation.contestType,
          location: participation.contestLocation,
          date: participation.contestDate,
          description: participation.contestDescription,
          standingsUrl: participation.contestStandingsUrl,
          gallery: participation.galleryId ? {
            id: participation.galleryId,
            title: participation.galleryTitle || "",
            slug: participation.gallerySlug || "",
            media: contestMedia,
          } : null,
        },
        team: {
          id: participation.teamId,
          name: participation.teamName,
          rank: participation.teamRank,
          solveCount: participation.teamSolveCount,
          members: teamMembersList,
        },
      });
    }

    return {
      programmer,
      contestParticipations,
    };
  } catch (error) {
    console.error("Error fetching programmer details:", error);
    return {
      programmer: null,
      contestParticipations: [],
    };
  }
}