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
import { id } from "date-fns/locale";
import { and, eq } from "drizzle-orm";

async function clearDatabase() {
  console.log("🗑️ Clearing existing data...");

  // Clear junction tables first
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
  await db.delete(galleries);
  await db.delete(permissions);
  await db.delete(roles);
  await db.delete(users);

  console.log("✅ Database cleared");
}
async function importUsers() {
  console.log("📥 Importing users...");
  const res = await fetch("https://diuacm.com/api/users");
  const data = await res.json();
  const usersData = data.data;
  // await clearDatabase();
  usersData.forEach(async (user: any) => {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1);
    if (existingUser.length > 0) {
      console.log(`User with ID ${user.id} already exists, skipping...`);
      return;
    }
    console.log(`Inserting user: ${user.name}`);
    await db.insert(users).values({
      name: user.name,
      email: user.email,
      username: user.username,
      image: user.avatar_url,
      emailVerified: new Date(user.email_verified_at),
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
    });
    console.log(`Inserted user: ${user.name}`);
  });
}

async function importRankLists() {
  console.log("📥 Importing rank lists...");
  const res = await fetch("https://diuacm.com/api/ranklists");
  const data = await res.json();
  const rankListsData = data.data;
  console.log(`Found ${rankListsData.length} rank lists to import`);
  rankListsData.forEach(async (rankList: any) => {
    const existingRankList = await db
      .select()
      .from(rankLists)
      .where(eq(rankLists.keyword, rankList.keyword))
      .limit(1);
    if (existingRankList.length > 0) {
      console.log(
        `Rank list with keyword ${rankList.keyword} already exists, skipping...`
      );
      return;
    }

    const existingTracker = await db
      .select()
      .from(trackers)
      .where(eq(trackers.slug, rankList.tracker.slug))
      .limit(1);
    
    let trackerId;
    if (existingTracker.length > 0) {
      trackerId = existingTracker[0].id;
    } else {
      console.log(`Inserting tracker: ${rankList.tracker.name}`);
      const tracker = await db
        .insert(trackers)
        .values({
          title: rankList.tracker.title,
          slug: rankList.tracker.slug,
          description: rankList.tracker.description,
          status: rankList.tracker.status,
          order: rankList.tracker.order,
          createdAt: new Date(rankList.created_at),
          updatedAt: new Date(rankList.updated_at),
        })
        .returning();
      trackerId = tracker[0].id;
    }
    console.log(`Inserting rank list: ${rankList.keyword}`);
    const newRankList = await db
      .insert(rankLists)
      .values({
        id: rankList.id,
        trackerId: trackerId,
        keyword: rankList.keyword,
        description: rankList.description,
        weightOfUpsolve: rankList.weight_of_upsolve,
        order: rankList.order,
        isActive: rankList.is_active,
        considerStrictAttendance: rankList.consider_strict_attendance,
        createdAt: new Date(rankList.created_at),
        updatedAt: new Date(rankList.updated_at),
      })
      .returning();

    rankList.users.forEach(async (attender) => {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, attender.email))
        .limit(1);
      if (existingUser.length > 0) {
        await db.insert(rankListUser).values({
          userId: existingUser[0].id,
          rankListId: newRankList[0].id,
        });
      } else {
        console.error(
          `User with email ${attender.email} not found, skipping...`
        );
      }
    });
    console.log(`Inserted rank list: ${rankList.name}`);
  });
}

async function importEvents() {
  console.log("📥 Importing events...");
  const res = await fetch("https://diuacm.com/api/events");
  const data = await res.json();
  const eventsData = data.data;
  console.log(`Found ${eventsData.length} events to import`);

  eventsData.forEach(async (event: any) => {
    const existingEvent = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.title, event.title),
          eq(events.eventLink, event.event_link)
        )
      )
      .limit(1);
    if (existingEvent.length > 0) {
      console.log(`Event ${event.title} already exists, skipping...`);
      return;
    }
    console.log(`Inserting event: ${event.title}`);
    const newEvent = await db
      .insert(events)
      .values({
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
      })
      .returning();

    console.log(`Inserted event: ${event.title}`);

    event.attended_users.forEach(async (attender) => {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, attender.email))
        .limit(1);
      if (existingUser.length > 0) {
        await db.insert(eventUserAttendance).values({
          userId: existingUser[0].id,
          eventId: newEvent[0].id,
          createdAt: new Date(attender.pivot.created_at),
          updatedAt: new Date(attender.pivot.updated_at),
        });
      } else {
        console.error(
          `User with email ${attender.email} not found, skipping...`
        );
      }
    });

    event.rank_lists.forEach(async (rankList) => {
      const existingRankList = await db
        .select()
        .from(rankLists)
        .where(eq(rankLists.keyword, rankList.keyword))
        .limit(1);
      if (existingRankList.length > 0) {
        await db.insert(eventRankList).values({
          eventId: newEvent[0].id,
          rankListId: existingRankList[0].id,
          weight: rankList.pivot.weight,
        });
      } else {
        console.error(
          `Rank list with keyword ${rankList.keyword} not found, skipping...`
        );
      }
    });
  });
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
