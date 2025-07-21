import { db } from "@/db/drizzle";
import {
  blogPosts,
  contactFormSubmissions,
  contests,
  eventRankList,
  events,
  eventUserAttendance,
  galleries,
  permissions,
  rankLists,
  rankListUser,
  rolePermissions,
  roles,
  teams,
  teamUser,
  trackers,
  userRoles,
  users,
  userSolveStatOnEvents,
} from "@/db/schema";

// Types for API data
interface ImportUser {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar_url?: string;
  email_verified_at?: string;
  password?: string;
  gender?: string;
  phone?: string;
  codeforces_handle?: string;
  atcoder_handle?: string;
  vjudge_handle?: string;
  starting_semester?: string;
  department?: string;
  student_id?: string;
  created_at: string;
  updated_at: string;
}

interface ImportRankList {
  id: string;
  keyword: string;
  description?: string;
  weight_of_upsolve?: number;
  order?: number;
  is_active?: boolean;
  consider_strict_attendance?: boolean;
  created_at: string;
  updated_at: string;
  tracker: {
    title: string;
    slug: string;
    description?: string;
    status?: string;
    order?: number;
    name?: string;
  };
  users: Array<{ email: string }>;
}

interface ImportEvent {
  title: string;
  description?: string;
  status?: string;
  starting_at: string;
  ending_at: string;
  event_link: string;
  event_password?: string;
  open_for_attendance?: boolean;
  strict_attendance?: boolean;
  type?: string;
  participation_scope?: string;
  attended_users: Array<{
    email: string;
    pivot: {
      created_at: string;
      updated_at: string;
    };
  }>;
  rank_lists: Array<{
    keyword: string;
    pivot: {
      weight: number;
    };
  }>;
}

async function clearDatabase() {
  console.log("🗑️ Clearing existing data...");

  try {
    // Use a transaction for better performance and atomicity
    await db.transaction(async (tx) => {
      // Clear junction tables first
      await Promise.all([
        tx.delete(rolePermissions),
        tx.delete(userRoles),
        tx.delete(eventUserAttendance),
        tx.delete(userSolveStatOnEvents),
        tx.delete(rankListUser),
        tx.delete(teamUser),
        tx.delete(eventRankList),
      ]);

      // Clear main tables
      await Promise.all([
        tx.delete(contactFormSubmissions),
        tx.delete(blogPosts),
        tx.delete(rankLists),
        tx.delete(trackers),
        tx.delete(events),
        tx.delete(teams),
        tx.delete(contests),
        tx.delete(galleries),
        tx.delete(permissions),
        tx.delete(roles),
        tx.delete(users),
      ]);
    });

    console.log("✅ Database cleared");
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
}
async function importUsers() {
  console.log("📥 Importing users...");
  try {
    const res = await fetch("https://diuacm.com/api/users");
    const data = await res.json();
    const usersData = data.data;

    // Get all existing users in one query
    const existingUsers = await db.select({ email: users.email }).from(users);
    const existingEmails = new Set(existingUsers.map((u) => u.email));

    // Filter out users that already exist
    const newUsers = usersData.filter(
      (user: ImportUser) => !existingEmails.has(user.email)
    );

    if (newUsers.length === 0) {
      console.log("No new users to import");
      return;
    }

    console.log(`Importing ${newUsers.length} new users...`);

    // Batch insert all new users
    const userInsertData = newUsers.map((user: ImportUser) => ({
      name: user.name,
      email: user.email,
      username: user.username,
      image: user.avatar_url,
      emailVerified: user.email_verified_at
        ? new Date(user.email_verified_at)
        : null,
      password: user.password,
      gender: user.gender,
      phone: user.phone,
      codeforcesHandle: user.codeforces_handle,
      atcoderHandle: user.atcoder_handle,
      vjudgeHandle: user.vjudge_handle,
      startingSemester: user.starting_semester,
      department: user.department,
      studentId: user.student_id,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    }));

    await db.insert(users).values(userInsertData);
    console.log(`✅ Inserted ${newUsers.length} users in batch`);
  } catch (error) {
    console.error("Error importing users:", error);
    throw error;
  }
}

async function importRankLists() {
  console.log("📥 Importing rank lists...");
  try {
    const res = await fetch("https://diuacm.com/api/ranklists");
    const data = await res.json();
    const rankListsData = data.data;
    console.log(`Found ${rankListsData.length} rank lists to import`);

    // Get all existing rank lists and trackers in bulk
    const [existingRankLists, existingTrackers, allUsers] = await Promise.all([
      db.select({ keyword: rankLists.keyword }).from(rankLists),
      db.select({ id: trackers.id, slug: trackers.slug }).from(trackers),
      db.select({ id: users.id, email: users.email }).from(users),
    ]);

    const existingRankListKeywords = new Set(
      existingRankLists.map((rl) => rl.keyword)
    );
    const trackerMap = new Map(existingTrackers.map((t) => [t.slug, t.id]));
    const userEmailMap = new Map(allUsers.map((u) => [u.email, u.id]));

    // Filter out rank lists that already exist
    const newRankLists = rankListsData.filter(
      (rankList: ImportRankList) =>
        !existingRankListKeywords.has(rankList.keyword)
    );

    if (newRankLists.length === 0) {
      console.log("No new rank lists to import");
      return;
    }

    // Prepare trackers that need to be inserted
    const trackersToInsert = [];
    const newTrackerSlugs = new Set();

    for (const rankList of newRankLists) {
      if (
        !trackerMap.has(rankList.tracker.slug) &&
        !newTrackerSlugs.has(rankList.tracker.slug)
      ) {
        trackersToInsert.push({
          title: rankList.tracker.title,
          slug: rankList.tracker.slug,
          description: rankList.tracker.description,
          status: rankList.tracker.status,
          order: rankList.tracker.order,
          createdAt: new Date(rankList.created_at),
          updatedAt: new Date(rankList.updated_at),
        });
        newTrackerSlugs.add(rankList.tracker.slug);
      }
    }

    // Insert new trackers in batch
    if (trackersToInsert.length > 0) {
      console.log(`Inserting ${trackersToInsert.length} new trackers...`);
      const insertedTrackers = await db
        .insert(trackers)
        .values(trackersToInsert)
        .returning();
      // Update tracker map with new trackers
      insertedTrackers.forEach((tracker) => {
        trackerMap.set(tracker.slug, tracker.id);
      });
    }

    // Prepare rank lists for batch insert
    const rankListInsertData = newRankLists.map((rankList: ImportRankList) => ({
      id: rankList.id,
      trackerId: trackerMap.get(rankList.tracker.slug)!,
      keyword: rankList.keyword,
      description: rankList.description,
      weightOfUpsolve: rankList.weight_of_upsolve,
      order: rankList.order,
      isActive: rankList.is_active,
      considerStrictAttendance: rankList.consider_strict_attendance,
      createdAt: new Date(rankList.created_at),
      updatedAt: new Date(rankList.updated_at),
    }));

    // Insert rank lists in batch
    console.log(`Inserting ${rankListInsertData.length} new rank lists...`);
    const insertedRankLists = await db
      .insert(rankLists)
      .values(rankListInsertData)
      .returning();

    // Prepare rank list user relationships for batch insert
    const rankListUserData = [];
    for (let i = 0; i < newRankLists.length; i++) {
      const rankList = newRankLists[i];
      const insertedRankList = insertedRankLists[i];

      for (const attender of rankList.users) {
        const userId = userEmailMap.get(attender.email);
        if (userId) {
          rankListUserData.push({
            userId: userId,
            rankListId: insertedRankList.id,
          });
        } else {
          console.error(
            `User with email ${attender.email} not found, skipping...`
          );
        }
      }
    }

    // Insert rank list user relationships in batch
    if (rankListUserData.length > 0) {
      console.log(
        `Inserting ${rankListUserData.length} rank list user relationships...`
      );
      await db.insert(rankListUser).values(rankListUserData);
    }

    console.log(`✅ Completed importing ${newRankLists.length} rank lists`);
  } catch (error) {
    console.error("Error importing rank lists:", error);
    throw error;
  }
}

async function importEvents() {
  console.log("📥 Importing events...");
  try {
    const res = await fetch("https://diuacm.com/api/events");
    const data = await res.json();
    const eventsData = data.data;
    console.log(`Found ${eventsData.length} events to import`);

    // Get all existing data in bulk
    const [existingEvents, allUsers, existingRankLists] = await Promise.all([
      db
        .select({ title: events.title, eventLink: events.eventLink })
        .from(events),
      db.select({ id: users.id, email: users.email }).from(users),
      db
        .select({ id: rankLists.id, keyword: rankLists.keyword })
        .from(rankLists),
    ]);

    const existingEventKeys = new Set(
      existingEvents.map((e) => `${e.title}|${e.eventLink}`)
    );
    const userEmailMap = new Map(allUsers.map((u) => [u.email, u.id]));
    const rankListKeywordMap = new Map(
      existingRankLists.map((rl) => [rl.keyword, rl.id])
    );

    // Filter out events that already exist
    const newEvents = eventsData.filter(
      (event: ImportEvent) =>
        !existingEventKeys.has(`${event.title}|${event.event_link}`)
    );

    if (newEvents.length === 0) {
      console.log("No new events to import");
      return;
    }

    // Prepare events for batch insert
    const eventInsertData = newEvents.map((event: ImportEvent) => ({
      title: event.title,
      description: event.description,
      status: event.status,
      startingAt: new Date(event.starting_at),
      endingAt: new Date(event.ending_at),
      eventLink: event.event_link,
      eventPassword: event.event_password,
      openForAttendance: event.open_for_attendance,
      strictAttendance: event.strict_attendance,
      type: event.type,
      participationScope: event.participation_scope,
    }));

    // Insert events in batch
    console.log(`Inserting ${eventInsertData.length} new events...`);
    const insertedEvents = await db
      .insert(events)
      .values(eventInsertData)
      .returning();

    // Prepare event user attendance for batch insert
    const eventUserAttendanceData = [];
    for (let i = 0; i < newEvents.length; i++) {
      const event = newEvents[i];
      const insertedEvent = insertedEvents[i];

      for (const attender of event.attended_users) {
        const userId = userEmailMap.get(attender.email);
        if (userId) {
          eventUserAttendanceData.push({
            userId: userId,
            eventId: insertedEvent.id,
            createdAt: new Date(attender.pivot.created_at),
            updatedAt: new Date(attender.pivot.updated_at),
          });
        } else {
          console.error(
            `User with email ${attender.email} not found, skipping...`
          );
        }
      }
    }

    // Prepare event rank lists for batch insert
    const eventRankListData = [];
    for (let i = 0; i < newEvents.length; i++) {
      const event = newEvents[i];
      const insertedEvent = insertedEvents[i];

      for (const rankList of event.rank_lists) {
        const rankListId = rankListKeywordMap.get(rankList.keyword);
        if (rankListId) {
          eventRankListData.push({
            eventId: insertedEvent.id,
            rankListId: rankListId,
            weight: rankList.pivot.weight,
          });
        } else {
          console.error(
            `Rank list with keyword ${rankList.keyword} not found, skipping...`
          );
        }
      }
    }

    // Insert event user attendance and event rank lists in parallel
    const insertPromises = [];

    if (eventUserAttendanceData.length > 0) {
      console.log(
        `Inserting ${eventUserAttendanceData.length} event user attendance records...`
      );
      insertPromises.push(
        db.insert(eventUserAttendance).values(eventUserAttendanceData)
      );
    }

    if (eventRankListData.length > 0) {
      console.log(
        `Inserting ${eventRankListData.length} event rank list relationships...`
      );
      insertPromises.push(db.insert(eventRankList).values(eventRankListData));
    }

    await Promise.all(insertPromises);
    console.log(`✅ Completed importing ${newEvents.length} events`);
  } catch (error) {
    console.error("Error importing events:", error);
    throw error;
  }
}
export async function GET() {
  try {
    await clearDatabase();
    await importUsers();
    await importRankLists();
    await importEvents();
    return new Response("done", {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error during authorization:", error);
    return new Response("error", {
      headers: { "Content-Type": "application/json" },
    });
  }
}
