"use server";

import { db } from "@/db/drizzle";
import {
  users,
  teams,
  teamUser,
  contests,
  galleries,
  media,
  type User,
  type Contest,
  type Team,
  type Gallery,
  type Media,
} from "@/db/schema";
import {
  desc,
  ilike,
  asc,
  sql,
  count,
  and,
  isNotNull,
  eq,
  inArray,
} from "drizzle-orm";

// Enhanced error handling type
type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Define types for team members and media items to avoid 'any' types
type TeamMember = {
  teamId: number;
  userId: string;
  userName: string;
  userImage: string | null;
  userStudentId: string | null;
  userUsername: string;
};

type MediaItem = {
  galleryId: number;
  mediaId: number;
  mediaUrl: string;
  mediaTitle: string | null;
  mediaWidth: number;
  mediaHeight: number;
  mediaFileSize: number;
  mediaMimeType: string;
};

export interface GetProgrammersParams {
  search?: string;
  page?: number;
  limit?: number;
}

// Use specific fields from the User type
export type ProgrammerResult = Pick<
  User,
  | "id"
  | "name"
  | "image"
  | "studentId"
  | "maxCfRating"
  | "codeforcesHandle"
  | "username"
>;

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
}: GetProgrammersParams = {}): Promise<ActionResult<GetProgrammersResponse>> {
  try {
    const offset = (page - 1) * limit;

    // Build the where conditions
    const whereConditions = [isNotNull(users.codeforcesHandle)]; // Base condition: only users with CF handles

    // Add search condition for name or student ID or CF handle
    if (search) {
      whereConditions.push(
        sql`(${ilike(users.name, `%${search}%`)} OR ${ilike(
          users.studentId,
          `%${search}%`
        )} OR ${ilike(users.codeforcesHandle, `%${search}%`)})`
      );
    }

    const whereClause = and(...whereConditions);

    // Use Promise.all to run both queries in parallel for better performance
    const [countResult, programmers] = await Promise.all([
      // Get total count for pagination
      db
        .select({
          total: count(),
        })
        .from(users)
        .where(whereClause),

      // Get programmers with pagination, sorted by maxCfRating (highest first)
      db
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
        .offset(offset),
    ]);

    const [{ total }] = countResult;

    return {
      success: true,
      data: {
        programmers,
        pagination: {
          page,
          limit,
          total: Number(total),
          pages: Math.ceil(Number(total) / limit),
        },
      },
      message: "Programmers fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching programmers:", error);
    return {
      success: false,
      error: "Failed to fetch programmers",
      data: {
        programmers: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          pages: 0,
        },
      },
    };
  }
}

// Programmer details interfaces and functions
export type ProgrammerDetails = Pick<
  User,
  | "id"
  | "name"
  | "email"
  | "username"
  | "image"
  | "gender"
  | "phone"
  | "codeforcesHandle"
  | "atcoderHandle"
  | "vjudgeHandle"
  | "startingSemester"
  | "department"
  | "studentId"
  | "maxCfRating"
  | "createdAt"
>;

export type MediaResult = Pick<
  Media,
  "id" | "url" | "title" | "width" | "height" | "fileSize" | "mimeType"
>;

export type GalleryResult = Pick<Gallery, "id" | "title" | "slug"> & {
  media: MediaResult[];
};

export type ContestResult = Pick<
  Contest,
  | "id"
  | "name"
  | "contestType"
  | "location"
  | "date"
  | "description"
  | "standingsUrl"
> & {
  gallery: GalleryResult | null;
};

export type TeamMemberResult = {
  id: string;
  user: Pick<User, "id" | "name" | "image" | "studentId" | "username">;
};

export type TeamResult = Pick<Team, "id" | "name" | "rank" | "solveCount"> & {
  members: TeamMemberResult[];
};

export interface ContestParticipation {
  contest: ContestResult;
  team: TeamResult;
}

export interface GetProgrammerDetailsResponse {
  programmer: ProgrammerDetails | null;
  contestParticipations: ContestParticipation[];
}

export async function getProgrammerDetails(
  username: string
): Promise<ActionResult<GetProgrammerDetailsResponse>> {
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
        success: false,
        error: "Programmer not found",
        data: {
          programmer: null,
          contestParticipations: [],
        },
      };
    }

    // Get contest participations with a single query
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

    // Optimize: If there are no contests, return early
    if (contestParticipationsQuery.length === 0) {
      return {
        success: true,
        data: {
          programmer,
          contestParticipations: [],
        },
        message: "Programmer details fetched successfully (no contests)",
      };
    }

    // Extract unique IDs for subsequent queries
    const uniqueTeamIds = [
      ...new Set(contestParticipationsQuery.map((p) => p.teamId)),
    ];
    const uniqueGalleryIds = [
      ...new Set(
        contestParticipationsQuery.map((p) => p.galleryId).filter(Boolean)
      ),
    ] as number[];

    // Run team members and gallery media queries in parallel for better performance
    const [teamMembers, galleryMediaResults] = await Promise.all([
      // Get team members for all teams in one query
      uniqueTeamIds.length > 0
        ? db
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
            .where(inArray(teamUser.teamId, uniqueTeamIds))
        : Promise.resolve([]),

      // Get gallery media for all galleries in one query
      uniqueGalleryIds.length > 0
        ? db
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
            .orderBy(media.order)
        : Promise.resolve([]),
    ]);

    // Pre-organize data into maps for O(1) lookup instead of filtering repeatedly
    const teamMembersMap = new Map<number, TeamMember[]>();
    teamMembers.forEach((member: TeamMember) => {
      if (!teamMembersMap.has(member.teamId)) {
        teamMembersMap.set(member.teamId, []);
      }
      teamMembersMap.get(member.teamId)!.push(member);
    });

    const galleryMediaMap = new Map<number, MediaItem[]>();
    galleryMediaResults.forEach((mediaItem: MediaItem) => {
      if (!galleryMediaMap.has(mediaItem.galleryId)) {
        galleryMediaMap.set(mediaItem.galleryId, []);
      }
      galleryMediaMap.get(mediaItem.galleryId)!.push(mediaItem);
    });

    // Group data by contest efficiently
    const contestParticipations: ContestParticipation[] = [];
    const processedContests = new Set<number>();

    for (const participation of contestParticipationsQuery) {
      if (processedContests.has(participation.contestId)) {
        continue;
      }
      processedContests.add(participation.contestId);

      // Get team members for this team using the map
      const teamMembersList = (
        teamMembersMap.get(participation.teamId) || []
      ).map((member: TeamMember) => ({
        id: member.userId,
        user: {
          id: member.userId,
          name: member.userName,
          image: member.userImage,
          studentId: member.userStudentId,
          username: member.userUsername,
        },
      }));

      // Get media for this gallery using the map
      const galleryId = participation.galleryId;
      const mediaItems = galleryId ? galleryMediaMap.get(galleryId) || [] : [];
      const contestMedia = mediaItems.map((media: MediaItem) => ({
        id: media.mediaId,
        url: media.mediaUrl,
        title: media.mediaTitle,
        width: media.mediaWidth,
        height: media.mediaHeight,
        fileSize: media.mediaFileSize,
        mimeType: media.mediaMimeType,
      }));

      contestParticipations.push({
        contest: {
          id: participation.contestId,
          name: participation.contestName,
          contestType: participation.contestType,
          location: participation.contestLocation,
          date: participation.contestDate,
          description: participation.contestDescription,
          standingsUrl: participation.contestStandingsUrl,
          gallery: participation.galleryId
            ? {
                id: participation.galleryId,
                title: participation.galleryTitle || "",
                slug: participation.gallerySlug || "",
                media: contestMedia,
              }
            : null,
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
      success: true,
      data: {
        programmer,
        contestParticipations,
      },
      message: "Programmer details fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching programmer details:", error);
    return {
      success: false,
      error: "Failed to fetch programmer details",
      data: {
        programmer: null,
        contestParticipations: [],
      },
    };
  }
}
