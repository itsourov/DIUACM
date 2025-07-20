import { readFileSync } from "fs";
import { join } from "path";
import { db } from "./db/drizzle";
import {
  users,
  events,
  trackers,
  rankLists,
  blogPosts,
  eventRankList,
  rankListUser,
  eventUserAttendance,
  userSolveStatOnEvents,
  // Clear all other tables
  galleries,
  media,
  contests,
  teams,
  teamUser,
  contactFormSubmissions,
  roles,
  permissions,
  userRoles,
  rolePermissions,
  accounts,
  sessions,
  verificationTokens,
} from "./db/schema";

interface OldUser {
  id: number;
  name: string;
  email: string;
  username: string;
  email_verified_at: string | null;
  password: string;
  gender: string | null;
  phone: string | null;
  codeforces_handle: string | null;
  atcoder_handle: string | null;
  vjudge_handle: string | null;
  starting_semester: string | null;
  department: string | null;
  student_id: string | null;
  max_cf_rating: number | null;
  remember_token: string | null;
  created_at: string;
  updated_at: string;
}

interface OldEvent {
  id: number;
  title: string;
  description: string | null;
  status: string;
  starting_at: string;
  ending_at: string;
  event_link: string | null;
  event_password: string | null;
  open_for_attendance: number;
  strict_attendance: number;
  type: string;
  participation_scope: string;
  created_at: string;
  updated_at: string;
}

interface OldTracker {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  order: number;
  created_at: string;
  updated_at: string;
}

interface OldRankList {
  id: number;
  tracker_id: number;
  keyword: string;
  description: string | null;
  weight_of_upsolve: number;
  order: number;
  is_active: number;
  consider_strict_attendance: number;
  created_at: string;
  updated_at: string;
}

interface OldBlogPost {
  id: number;
  title: string;
  slug: string;
  author: string;
  content: string;
  status: string;
  published_at: string | null;
  is_featured: number;
  created_at: string;
  updated_at: string;
}

interface OldEventRankList {
  event_id: number;
  rank_list_id: number;
  weight: number;
}

interface OldRankListUser {
  rank_list_id: number;
  user_id: number;
  score: number;
  created_at: string;
  updated_at: string;
}

interface OldEventUserAttendance {
  event_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface OldUserSolveStatOnEvents {
  id: number;
  user_id: number;
  event_id: number;
  solve_count: number;
  upsolve_count: number;
  participation: number;
  created_at: string;
  updated_at: string;
}

function readBackupFile<T>(filename: string): T[] {
  try {
    const filePath = join(process.cwd(), "old-db-backup", filename);
    const fileContent = readFileSync(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

function convertDate(dateString: string | null): Date | null {
  if (!dateString) return null;
  // The backup dates are in format "YYYY-MM-DD HH:MM:SS" and are in UTC
  // We need to append 'Z' to indicate UTC timezone
  const utcDateString = dateString.replace(" ", "T") + "Z";
  return new Date(utcDateString);
}

function convertGender(
  gender: string | null
): "male" | "female" | "other" | null {
  if (!gender) return null;
  const lowerGender = gender.toLowerCase();
  if (
    lowerGender === "male" ||
    lowerGender === "female" ||
    lowerGender === "other"
  ) {
    return lowerGender as "male" | "female" | "other";
  }
  return null;
}

function convertVisibilityStatus(status: string): "published" | "draft" {
  return status === "published" ? "published" : "draft";
}

function convertEventType(type: string): "contest" | "class" | "other" {
  if (type === "contest" || type === "class" || type === "other") {
    return type;
  }
  return "contest";
}

function convertParticipationScope(
  scope: string
): "open_for_all" | "only_girls" | "junior_programmers" | "selected_persons" {
  if (
    scope === "open_for_all" ||
    scope === "only_girls" ||
    scope === "junior_programmers" ||
    scope === "selected_persons"
  ) {
    return scope;
  }
  return "open_for_all";
}

async function clearAllTables() {
  console.log("🗑️ Clearing all tables...");

  // Clear junction tables first (order matters due to foreign key constraints)
  await db.delete(rolePermissions);
  await db.delete(userRoles);
  await db.delete(eventUserAttendance);
  await db.delete(userSolveStatOnEvents);
  await db.delete(rankListUser);
  await db.delete(teamUser);
  await db.delete(eventRankList);

  // Clear main tables
  await db.delete(contactFormSubmissions);
  await db.delete(blogPosts);
  await db.delete(rankLists);
  await db.delete(trackers);
  await db.delete(events);
  await db.delete(teams);
  await db.delete(contests);
  await db.delete(media);
  await db.delete(galleries);
  await db.delete(permissions);
  await db.delete(roles);
  await db.delete(verificationTokens);
  await db.delete(sessions);
  await db.delete(accounts);
  await db.delete(users);

  console.log("✅ All tables cleared");
}

async function restoreUsers() {
  console.log("👥 Restoring users...");
  const oldUsers: OldUser[] = readBackupFile("users.json");

  if (oldUsers.length === 0) {
    console.log("No users found in backup");
    return;
  }

  const convertedUsers = oldUsers.map((user) => ({
    id: user.id.toString(), // Convert numeric ID to string
    name: user.name,
    email: user.email,
    username: user.username,
    emailVerified: convertDate(user.email_verified_at),
    password: user.password,
    gender: convertGender(user.gender),
    phone: user.phone,
    codeforcesHandle: user.codeforces_handle,
    atcoderHandle: user.atcoder_handle,
    vjudgeHandle: user.vjudge_handle,
    startingSemester: user.starting_semester,
    department: user.department,
    studentId: user.student_id,
    maxCfRating: user.max_cf_rating,
    createdAt: convertDate(user.created_at),
    updatedAt: convertDate(user.updated_at),
  }));

  // Insert in batches to avoid potential issues
  const batchSize = 100;
  for (let i = 0; i < convertedUsers.length; i += batchSize) {
    const batch = convertedUsers.slice(i, i + batchSize);
    await db.insert(users).values(batch);
    console.log(
      `Inserted users batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        convertedUsers.length / batchSize
      )}`
    );
  }

  console.log(`✅ Restored ${convertedUsers.length} users`);
}

async function restoreEvents() {
  console.log("📅 Restoring events...");
  const oldEvents: OldEvent[] = readBackupFile("events.json");

  if (oldEvents.length === 0) {
    console.log("No events found in backup");
    return;
  }

  const convertedEvents = oldEvents.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    status: convertVisibilityStatus(event.status),
    startingAt: convertDate(event.starting_at)!,
    endingAt: convertDate(event.ending_at)!,
    eventLink: event.event_link,
    eventPassword: event.event_password,
    openForAttendance: Boolean(event.open_for_attendance),
    strictAttendance: Boolean(event.strict_attendance),
    type: convertEventType(event.type),
    participationScope: convertParticipationScope(event.participation_scope),
    createdAt: convertDate(event.created_at),
    updatedAt: convertDate(event.updated_at),
  }));

  await db.insert(events).values(convertedEvents);
  console.log(`✅ Restored ${convertedEvents.length} events`);
}

async function restoreTrackers() {
  console.log("📊 Restoring trackers...");
  const oldTrackers: OldTracker[] = readBackupFile("trackers.json");

  if (oldTrackers.length === 0) {
    console.log("No trackers found in backup");
    return;
  }

  const convertedTrackers = oldTrackers.map((tracker) => ({
    id: tracker.id,
    title: tracker.title,
    slug: tracker.slug,
    description: tracker.description,
    status: convertVisibilityStatus(tracker.status),
    order: tracker.order,
    createdAt: convertDate(tracker.created_at),
    updatedAt: convertDate(tracker.updated_at),
  }));

  await db.insert(trackers).values(convertedTrackers);
  console.log(`✅ Restored ${convertedTrackers.length} trackers`);
}

async function restoreRankLists() {
  console.log("🏆 Restoring rank lists...");
  const oldRankLists: OldRankList[] = readBackupFile("rank_lists.json");

  if (oldRankLists.length === 0) {
    console.log("No rank lists found in backup");
    return;
  }

  const convertedRankLists = oldRankLists.map((rankList) => ({
    id: rankList.id,
    trackerId: rankList.tracker_id,
    keyword: rankList.keyword,
    description: rankList.description,
    weightOfUpsolve: rankList.weight_of_upsolve,
    order: rankList.order,
    isActive: Boolean(rankList.is_active),
    considerStrictAttendance: Boolean(rankList.consider_strict_attendance),
    createdAt: convertDate(rankList.created_at),
    updatedAt: convertDate(rankList.updated_at),
  }));

  await db.insert(rankLists).values(convertedRankLists);
  console.log(`✅ Restored ${convertedRankLists.length} rank lists`);
}

async function restoreBlogPosts() {
  console.log("📝 Restoring blog posts...");
  const oldBlogPosts: OldBlogPost[] = readBackupFile("blog_posts.json");

  if (oldBlogPosts.length === 0) {
    console.log("No blog posts found in backup");
    return;
  }

  const convertedBlogPosts = oldBlogPosts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    author: post.author,
    content: post.content,
    status: convertVisibilityStatus(post.status),
    publishedAt: convertDate(post.published_at),
    isFeatured: Boolean(post.is_featured),
    createdAt: convertDate(post.created_at),
    updatedAt: convertDate(post.updated_at),
  }));

  await db.insert(blogPosts).values(convertedBlogPosts);
  console.log(`✅ Restored ${convertedBlogPosts.length} blog posts`);
}

async function restoreEventRankList() {
  console.log("🔗 Restoring event rank list relations...");
  const oldEventRankLists: OldEventRankList[] = readBackupFile(
    "event_rank_list.json"
  );

  if (oldEventRankLists.length === 0) {
    console.log("No event rank list relations found in backup");
    return;
  }

  const convertedEventRankLists = oldEventRankLists.map((erl) => ({
    eventId: erl.event_id,
    rankListId: erl.rank_list_id,
    weight: erl.weight,
  }));

  await db.insert(eventRankList).values(convertedEventRankLists);
  console.log(
    `✅ Restored ${convertedEventRankLists.length} event rank list relations`
  );
}

async function restoreRankListUser() {
  console.log("👤 Restoring rank list user relations...");
  const oldRankListUsers: OldRankListUser[] = readBackupFile(
    "rank_list_user.json"
  );

  if (oldRankListUsers.length === 0) {
    console.log("No rank list user relations found in backup");
    return;
  }

  const convertedRankListUsers = oldRankListUsers.map((rlu) => ({
    rankListId: rlu.rank_list_id,
    userId: rlu.user_id.toString(), // Convert to string to match new schema
    score: rlu.score,
    createdAt: convertDate(rlu.created_at),
    updatedAt: convertDate(rlu.updated_at),
  }));

  // Insert in batches
  const batchSize = 500;
  for (let i = 0; i < convertedRankListUsers.length; i += batchSize) {
    const batch = convertedRankListUsers.slice(i, i + batchSize);
    await db.insert(rankListUser).values(batch);
    console.log(
      `Inserted rank list users batch ${
        Math.floor(i / batchSize) + 1
      }/${Math.ceil(convertedRankListUsers.length / batchSize)}`
    );
  }

  console.log(
    `✅ Restored ${convertedRankListUsers.length} rank list user relations`
  );
}

async function restoreEventUserAttendance() {
  console.log("✅ Restoring event user attendance...");
  const oldEventUserAttendances: OldEventUserAttendance[] = readBackupFile(
    "event_user_attendance.json"
  );

  if (oldEventUserAttendances.length === 0) {
    console.log("No event user attendance found in backup");
    return;
  }

  const convertedEventUserAttendances = oldEventUserAttendances.map((eua) => ({
    eventId: eua.event_id,
    userId: eua.user_id.toString(), // Convert to string to match new schema
    createdAt: convertDate(eua.created_at),
    updatedAt: convertDate(eua.updated_at),
  }));

  // Insert in batches
  const batchSize = 500;
  for (let i = 0; i < convertedEventUserAttendances.length; i += batchSize) {
    const batch = convertedEventUserAttendances.slice(i, i + batchSize);
    await db.insert(eventUserAttendance).values(batch);
    console.log(
      `Inserted event user attendance batch ${
        Math.floor(i / batchSize) + 1
      }/${Math.ceil(convertedEventUserAttendances.length / batchSize)}`
    );
  }

  console.log(
    `✅ Restored ${convertedEventUserAttendances.length} event user attendance records`
  );
}

async function restoreUserSolveStatOnEvents() {
  console.log("📊 Restoring user solve stat on events...");
  const oldUserSolveStats: OldUserSolveStatOnEvents[] = readBackupFile(
    "user_solve_stat_on_events.json"
  );

  if (oldUserSolveStats.length === 0) {
    console.log("No user solve stats found in backup");
    return;
  }

  const convertedUserSolveStats = oldUserSolveStats.map((stat) => ({
    id: stat.id,
    userId: stat.user_id.toString(), // Convert to string to match new schema
    eventId: stat.event_id,
    solveCount: stat.solve_count,
    upsolveCount: stat.upsolve_count,
    participation: Boolean(stat.participation),
    createdAt: convertDate(stat.created_at),
    updatedAt: convertDate(stat.updated_at),
  }));

  // Insert in batches
  const batchSize = 500;
  for (let i = 0; i < convertedUserSolveStats.length; i += batchSize) {
    const batch = convertedUserSolveStats.slice(i, i + batchSize);
    await db.insert(userSolveStatOnEvents).values(batch);
    console.log(
      `Inserted user solve stats batch ${
        Math.floor(i / batchSize) + 1
      }/${Math.ceil(convertedUserSolveStats.length / batchSize)}`
    );
  }

  console.log(
    `✅ Restored ${convertedUserSolveStats.length} user solve stat records`
  );
}

async function main() {
  try {
    console.log("🚀 Starting database restoration from backup...");

    // Clear all existing data
    await clearAllTables();

    // Restore data in the correct order (respecting foreign key constraints)
    await restoreUsers();
    await restoreEvents();
    await restoreTrackers();
    await restoreRankLists();
    await restoreBlogPosts();

    // Restore junction tables
    await restoreEventRankList();
    await restoreRankListUser();
    await restoreEventUserAttendance();
    await restoreUserSolveStatOnEvents();

    console.log("🎉 Database restoration completed successfully!");
  } catch (error) {
    console.error("❌ Error during restoration:", error);
    process.exit(1);
  }
}

// Run the restoration
main().catch(console.error);
