import { db } from "@/db/drizzle";
import {
  contests,
  galleries,
  media,
  teams,
  teamUser,
  users,
} from "@/db/schema";
import type { Contest, Gallery, Media, Team, User } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// Define the return type using schema types
export type PublicContestWithRelations = Contest & {
  gallery?:
    | (Pick<Gallery, "id" | "title" | "slug"> & {
        media?: Pick<
          Media,
          "id" | "url" | "title" | "width" | "height" | "fileSize" | "mimeType"
        >[];
      })
    | null;
  teams: (Pick<Team, "id" | "name" | "rank" | "solveCount"> & {
    members: {
      id: string;
      user: Pick<User, "id" | "name" | "image">;
    }[];
  })[];
};

/**
 * Get all published contests with optimized field selection
 */
export const getPublicContests = async (): Promise<
  PublicContestWithRelations[]
> => {
  try {
    const contestsData = await db
      .select({
        id: contests.id,
        name: contests.name,
        contestType: contests.contestType,
        location: contests.location,
        date: contests.date,
        description: contests.description,
        standingsUrl: contests.standingsUrl,
        galleryId: contests.galleryId,
        createdAt: contests.createdAt,
        updatedAt: contests.updatedAt,
        gallery: {
          id: galleries.id,
          title: galleries.title,
          slug: galleries.slug,
        },
      })
      .from(contests)
      .leftJoin(galleries, eq(contests.galleryId, galleries.id))
      .orderBy(desc(contests.date));

    // For each contest, get media and teams separately to handle the complex relations
    const contestsWithDetails = await Promise.all(
      contestsData.map(async (contest) => {
        // Get media for gallery (limit to 9)
        const galleryMedia = contest.gallery?.id
          ? await db
              .select({
                id: media.id,
                url: media.url,
                title: media.title,
                width: media.width,
                height: media.height,
                fileSize: media.fileSize,
                mimeType: media.mimeType,
              })
              .from(media)
              .where(eq(media.galleryId, contest.gallery.id))
              .limit(9)
          : [];

        // Get teams with members
        const contestTeams = await db
          .select({
            teamId: teams.id,
            teamName: teams.name,
            teamRank: teams.rank,
            teamSolveCount: teams.solveCount,
            userId: users.id,
            userName: users.name,
            userImage: users.image,
          })
          .from(teams)
          .leftJoin(teamUser, eq(teamUser.teamId, teams.id))
          .leftJoin(users, eq(teamUser.userId, users.id))
          .where(eq(teams.contestId, contest.id));

        // Group teams with their members
        const teamsMap = new Map();
        contestTeams.forEach((row) => {
          if (!teamsMap.has(row.teamId)) {
            teamsMap.set(row.teamId, {
              id: row.teamId,
              name: row.teamName,
              rank: row.teamRank,
              solveCount: row.teamSolveCount,
              members: [],
            });
          }

          if (row.userId) {
            teamsMap.get(row.teamId).members.push({
              id: row.userId,
              user: {
                id: row.userId,
                name: row.userName,
                image: row.userImage,
              },
            });
          }
        });

        return {
          ...contest,
          gallery: contest.gallery
            ? {
                ...contest.gallery,
                media: galleryMedia,
              }
            : null,
          teams: Array.from(teamsMap.values()),
        };
      })
    );

    return contestsWithDetails;
  } catch (error) {
    console.error("Failed to fetch contests:", error);
    return [];
  }
};
