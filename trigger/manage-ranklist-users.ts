// import { logger, schedules } from "@trigger.dev/sdk/v3";
// import { db } from "../db/drizzle";
// import {
//   users as usersTable,
//   events as eventsTable,
//   rankLists,
//   rankListUser,
//   eventRankList,
//   eventUserAttendance,
//   userSolveStatOnEvents,
// } from "../db/schema";
// import { eq, and, inArray, sql, asc } from "drizzle-orm";

// interface EventData {
//   id: number;
//   startingAt: Date;
//   hasAttendanceData: boolean;
//   hasSolveData: boolean;
// }

// interface NewUserToAdd {
//   userId: string;
//   rankListId: number;
// }

// /**
//  * Main scheduled task for managing ranklist users
//  */
// export const manageRanklistUsers = schedules.task({
//   id: "manage-ranklist-users",
//   description:
//     "Manages ranklist users by removing inactive users (no handles OR 12+ consecutive absences from start) and adding active users who attended events in the last 24 hours",
//   // Run every 24 hours at 2 AM
//   cron: "0 2 * * *",
//   // Set a maximum duration to prevent tasks from running indefinitely
//   maxDuration: 1800, // 30 minutes
//   run: async (payload) => {
//     try {
//       const startTime = new Date();
//       logger.info("🔧 Starting Ranklist User Management", {
//         timestamp: payload.timestamp,
//         lastRun: payload.lastTimestamp
//           ? new Date(payload.lastTimestamp).toISOString()
//           : "First run",
//       });

//       // Get all active ranklists
//       const activeRankLists = await db
//         .select({
//           id: rankLists.id,
//           keyword: rankLists.keyword,
//           trackerId: rankLists.trackerId,
//         })
//         .from(rankLists)
//         .where(eq(rankLists.isActive, true));

//       if (activeRankLists.length === 0) {
//         logger.info("No active ranklists found");
//         return { status: "complete", rankListsProcessed: 0 };
//       }

//       logger.info(
//         `Found ${activeRankLists.length} active ranklists to process`
//       );

//       let totalUsersRemoved = 0;
//       let totalUsersAdded = 0;
//       const results = [];

//       // Process each active ranklist
//       for (const rankList of activeRankLists) {
//         logger.info(`Processing ranklist: ${rankList.keyword}`, {
//           rankListId: rankList.id,
//           trackerId: rankList.trackerId,
//         });

//         try {
//           // Get events for this ranklist ordered by starting date
//           const events = await getEventsForRankList(rankList.id);

//           if (events.length === 0) {
//             logger.warn(`No events found for ranklist ${rankList.keyword}`);
//             results.push({
//               rankListId: rankList.id,
//               keyword: rankList.keyword,
//               usersRemoved: 0,
//               usersAdded: 0,
//               status: "skipped",
//               reason: "no-events",
//             });
//             continue;
//           }

//           // Step 1: Remove inactive users (12+ consecutive absences from start)
//           const usersToRemove = await findUsersToRemove(rankList.id, events);
//           const removedCount = await removeUsersFromRankList(
//             rankList.id,
//             usersToRemove
//           );
//           totalUsersRemoved += removedCount;

//           // Step 2: Add new active users (attended events in last 24 hours)
//           const usersToAdd = await findUsersToAdd(rankList.id, events);
//           const addedCount = await addUsersToRankList(usersToAdd);
//           totalUsersAdded += addedCount;

//           results.push({
//             rankListId: rankList.id,
//             keyword: rankList.keyword,
//             usersRemoved: removedCount,
//             usersAdded: addedCount,
//             status: "success",
//             totalEvents: events.length,
//           });

//           logger.info(`Completed processing ranklist ${rankList.keyword}`, {
//             usersRemoved: removedCount,
//             usersAdded: addedCount,
//             totalEvents: events.length,
//           });
//         } catch (error) {
//           const errorMessage =
//             error instanceof Error ? error.message : String(error);
//           logger.error(`Error processing ranklist ${rankList.keyword}`, {
//             rankListId: rankList.id,
//             error: errorMessage,
//           });

//           results.push({
//             rankListId: rankList.id,
//             keyword: rankList.keyword,
//             usersRemoved: 0,
//             usersAdded: 0,
//             status: "failed",
//             error: errorMessage,
//           });
//         }
//       }

//       const endTime = new Date();
//       const duration = (endTime.getTime() - startTime.getTime()) / 1000;

//       // Log final summary
//       logger.info("🎯 Ranklist User Management Complete", {
//         duration: `${duration.toFixed(2)}s`,
//         totalRankLists: activeRankLists.length,
//         totalUsersRemoved,
//         totalUsersAdded,
//       });

//       return {
//         status: "complete",
//         rankListsProcessed: activeRankLists.length,
//         totalUsersRemoved,
//         totalUsersAdded,
//         duration: `${duration.toFixed(2)}s`,
//         results,
//       };
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : String(error);
//       logger.error("❌ Error in Ranklist User Management task", {
//         error: errorMessage,
//       });
//       return { status: "error", message: errorMessage };
//     }
//   },
// });

// /**
//  * Get all events for a ranklist ordered by starting date
//  */
// async function getEventsForRankList(rankListId: number): Promise<EventData[]> {
//   const events = await db
//     .select({
//       id: eventsTable.id,
//       startingAt: eventsTable.startingAt,
//     })
//     .from(eventsTable)
//     .innerJoin(eventRankList, eq(eventRankList.eventId, eventsTable.id))
//     .where(eq(eventRankList.rankListId, rankListId))
//     .orderBy(asc(eventsTable.startingAt));

//   // Check which events have attendance or solve data
//   const eventData: EventData[] = [];

//   for (const event of events) {
//     // Check if event has attendance data
//     const attendanceCount = await db
//       .select({ count: sql<number>`count(*)` })
//       .from(eventUserAttendance)
//       .where(eq(eventUserAttendance.eventId, event.id));

//     // Check if event has solve stat data
//     const solveStatCount = await db
//       .select({ count: sql<number>`count(*)` })
//       .from(userSolveStatOnEvents)
//       .where(eq(userSolveStatOnEvents.eventId, event.id));

//     eventData.push({
//       id: event.id,
//       startingAt: event.startingAt,
//       hasAttendanceData: attendanceCount[0].count > 0,
//       hasSolveData: solveStatCount[0].count > 0,
//     });
//   }

//   return eventData;
// }

// /**
//  * Find users to remove from ranklist (12+ consecutive absences from start OR no handles)
//  */
// async function findUsersToRemove(
//   rankListId: number,
//   events: EventData[]
// ): Promise<string[]> {
//   // Get all users currently in this ranklist with their handle information
//   const currentUsers = await db
//     .select({
//       userId: rankListUser.userId,
//       codeforcesHandle: usersTable.codeforcesHandle,
//       atcoderHandle: usersTable.atcoderHandle,
//       vjudgeHandle: usersTable.vjudgeHandle,
//     })
//     .from(rankListUser)
//     .innerJoin(usersTable, eq(usersTable.id, rankListUser.userId))
//     .where(eq(rankListUser.rankListId, rankListId));

//   if (currentUsers.length === 0) {
//     return [];
//   }

//   const usersToRemove: string[] = [];

//   for (const user of currentUsers) {
//     const userId = user.userId;

//     // Check if user has any of the required handles
//     const hasAnyHandle = !!(
//       user.codeforcesHandle ||
//       user.atcoderHandle ||
//       user.vjudgeHandle
//     );

//     if (!hasAnyHandle) {
//       // User doesn't have any handle, mark for removal immediately
//       usersToRemove.push(userId);
//       logger.info(`Marking user ${userId} for removal (no handles)`, {
//         rankListId,
//         reason: "no-handles",
//         codeforcesHandle: user.codeforcesHandle,
//         atcoderHandle: user.atcoderHandle,
//         vjudgeHandle: user.vjudgeHandle,
//       });
//       continue; // Skip absence check for this user
//     }

//     // Only consider events that have some form of data (attendance or solve stats)
//     const eventsWithData = events.filter(
//       (event) => event.hasAttendanceData || event.hasSolveData
//     );

//     if (eventsWithData.length < 12) {
//       // Not enough events to check for consecutive absences, but we still remove users without handles
//       continue;
//     }

//     // Check consecutive absences from the start for users who have handles
//     let consecutiveAbsences = 0;

//     for (const event of eventsWithData) {
//       const hasData = await checkUserHasDataForEvent(userId, event.id);

//       if (hasData) {
//         // User has data for this event, break the consecutive absence streak
//         break;
//       } else {
//         // User is absent for this event
//         consecutiveAbsences++;
//       }
//     }

//     // If user has 12 or more consecutive absences from start, mark for removal
//     if (consecutiveAbsences >= 12) {
//       usersToRemove.push(userId);
//       logger.info(`Marking user ${userId} for removal (consecutive absences)`, {
//         rankListId,
//         reason: "consecutive-absences",
//         consecutiveAbsences,
//         totalEventsChecked: Math.min(
//           consecutiveAbsences,
//           eventsWithData.length
//         ),
//       });
//     }
//   }

//   logger.info(
//     `Found ${usersToRemove.length} users to remove from ranklist ${rankListId}`,
//     {
//       totalUsers: currentUsers.length,
//       usersToRemove: usersToRemove.length,
//     }
//   );

//   return usersToRemove;
// }

// /**
//  * Check if user has any data (attendance or solve stats) for an event
//  */
// async function checkUserHasDataForEvent(
//   userId: string,
//   eventId: number
// ): Promise<boolean> {
//   // Check attendance
//   const attendance = await db
//     .select({ count: sql<number>`count(*)` })
//     .from(eventUserAttendance)
//     .where(
//       and(
//         eq(eventUserAttendance.userId, userId),
//         eq(eventUserAttendance.eventId, eventId)
//       )
//     );

//   if (attendance[0].count > 0) {
//     return true;
//   }

//   // Check solve stats
//   const solveStats = await db
//     .select({ count: sql<number>`count(*)` })
//     .from(userSolveStatOnEvents)
//     .where(
//       and(
//         eq(userSolveStatOnEvents.userId, userId),
//         eq(userSolveStatOnEvents.eventId, eventId)
//       )
//     );

//   return solveStats[0].count > 0;
// }

// /**
//  * Find users to add to ranklist (attended events in last 24 hours but not in ranklist)
//  */
// async function findUsersToAdd(
//   rankListId: number,
//   events: EventData[]
// ): Promise<NewUserToAdd[]> {
//   const last24Hours = new Date();
//   last24Hours.setHours(last24Hours.getHours() - 24);

//   // Get events from last 24 hours
//   const recentEvents = events.filter(
//     (event) =>
//       event.startingAt >= last24Hours &&
//       (event.hasAttendanceData || event.hasSolveData)
//   );

//   if (recentEvents.length === 0) {
//     logger.info(`No recent events with data found for ranklist ${rankListId}`);
//     return [];
//   }

//   const recentEventIds = recentEvents.map((event) => event.id);

//   // Get users currently in this ranklist
//   const currentUsers = await db
//     .select({ userId: rankListUser.userId })
//     .from(rankListUser)
//     .where(eq(rankListUser.rankListId, rankListId));

//   const currentUserIds = currentUsers.map((user) => user.userId);

//   // Find users who attended recent events but are not in ranklist
//   const candidateUsers = new Set<string>();

//   // Check attendance data
//   if (recentEventIds.length > 0) {
//     const attendees = await db
//       .select({ userId: eventUserAttendance.userId })
//       .from(eventUserAttendance)
//       .where(inArray(eventUserAttendance.eventId, recentEventIds));

//     attendees.forEach((attendee) => candidateUsers.add(attendee.userId));

//     // Check solve stats data
//     const solvers = await db
//       .select({ userId: userSolveStatOnEvents.userId })
//       .from(userSolveStatOnEvents)
//       .where(inArray(userSolveStatOnEvents.eventId, recentEventIds));

//     solvers.forEach((solver) => candidateUsers.add(solver.userId));
//   }

//   // Filter out users already in ranklist
//   const usersToAdd: NewUserToAdd[] = [];
//   for (const userId of candidateUsers) {
//     if (!currentUserIds.includes(userId)) {
//       usersToAdd.push({
//         userId,
//         rankListId,
//       });
//     }
//   }

//   logger.info(
//     `Found ${usersToAdd.length} new users to add to ranklist ${rankListId}`,
//     {
//       recentEvents: recentEvents.length,
//       candidateUsers: candidateUsers.size,
//       currentUsers: currentUserIds.length,
//     }
//   );

//   return usersToAdd;
// }

// /**
//  * Remove users from ranklist
//  */
// async function removeUsersFromRankList(
//   rankListId: number,
//   userIds: string[]
// ): Promise<number> {
//   if (userIds.length === 0) {
//     return 0;
//   }

//   logger.info(`Removing ${userIds.length} users from ranklist ${rankListId}`, {
//     userIds,
//   });

//   try {
//     await db
//       .delete(rankListUser)
//       .where(
//         and(
//           eq(rankListUser.rankListId, rankListId),
//           inArray(rankListUser.userId, userIds)
//         )
//       );

//     logger.info(
//       `Successfully removed ${userIds.length} users from ranklist ${rankListId}`
//     );
//     return userIds.length;
//   } catch (error) {
//     logger.error(`Failed to remove users from ranklist ${rankListId}`, {
//       error: error instanceof Error ? error.message : String(error),
//       userIds,
//     });
//     throw error;
//   }
// }

// /**
//  * Add users to ranklist
//  */
// async function addUsersToRankList(usersToAdd: NewUserToAdd[]): Promise<number> {
//   if (usersToAdd.length === 0) {
//     return 0;
//   }

//   logger.info(`Adding ${usersToAdd.length} users to ranklists`);

//   try {
//     const values = usersToAdd.map((user) => ({
//       rankListId: user.rankListId,
//       userId: user.userId,
//       score: 0, // Default score
//     }));

//     await db.insert(rankListUser).values(values).onConflictDoNothing(); // Ignore if user is already in ranklist

//     logger.info(`Successfully added ${usersToAdd.length} users to ranklists`);
//     return usersToAdd.length;
//   } catch (error) {
//     logger.error(`Failed to add users to ranklists`, {
//       error: error instanceof Error ? error.message : String(error),
//       usersToAdd: usersToAdd.length,
//     });
//     throw error;
//   }
// }
