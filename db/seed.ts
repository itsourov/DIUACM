import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { db } from "./drizzle";
import {
  users,
  galleries,
  contests,
  teams,
  events,
  trackers,
  rankLists,
  blogPosts,
  eventRankList,
  teamUser,
  rankListUser,
  eventUserAttendance,
  userSolveStatOnEvents,
  contactFormSubmissions,
  roles,
  permissions,
  userRoles,
  rolePermissions,
  VisibilityStatus,
  ContestType,
  EventType,
  GenderType,
  ParticipationScope,
} from "./schema";

// Helper functions
const getRandomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const getRandomItems = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
};

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

async function seedUsers() {
  console.log("👥 Seeding users...");

  const hashedPassword = await bcrypt.hash("password123", 10);
  const userList = [];

  // Create admin user
  userList.push({
    id: crypto.randomUUID(),
    name: "Admin User",
    email: "admin@diuacm.com",
    username: "admin",
    emailVerified: new Date(),
    password: hashedPassword,
    gender: getRandomItem(Object.values(GenderType)),
    phone: faker.phone.number(),
    codeforcesHandle: "admin_cf",
    atcoderHandle: "admin_ac",
    vjudgeHandle: "admin_vj",
    startingSemester: "Spring 2020",
    department: "Computer Science & Engineering",
    studentId: "CSE-2020-001",
    maxCfRating: faker.number.int({ min: 1200, max: 3000 }),
  });

  // Create 150 regular users
  for (let i = 0; i < 150; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet.username().toLowerCase();

    userList.push({
      id: crypto.randomUUID(),
      name: `${firstName} ${lastName}`,
      email: faker.internet.email().toLowerCase(),
      username: username,
      emailVerified: Math.random() > 0.3 ? new Date() : null,
      image: Math.random() > 0.5 ? faker.image.avatar() : null,
      password: Math.random() > 0.7 ? hashedPassword : null,
      gender: getRandomItem(Object.values(GenderType)),
      phone: Math.random() > 0.4 ? faker.phone.number() : null,
      codeforcesHandle: Math.random() > 0.6 ? faker.internet.username() : null,
      atcoderHandle: Math.random() > 0.8 ? faker.internet.username() : null,
      vjudgeHandle: Math.random() > 0.7 ? faker.internet.username() : null,
      startingSemester: getRandomItem([
        "Spring 2020",
        "Fall 2020",
        "Spring 2021",
        "Fall 2021",
        "Spring 2022",
        "Fall 2022",
        "Spring 2023",
        "Fall 2023",
        "Spring 2024",
        "Fall 2024",
      ]),
      department: getRandomItem([
        "Computer Science & Engineering",
        "Electrical & Electronic Engineering",
        "Software Engineering",
        "Information Technology",
      ]),
      studentId: `${getRandomItem([
        "CSE",
        "EEE",
        "SWE",
        "IT",
      ])}-${faker.number.int({ min: 2020, max: 2024 })}-${faker.number.int({
        min: 100,
        max: 999,
      })}`,
      maxCfRating:
        Math.random() > 0.5 ? faker.number.int({ min: 800, max: 2800 }) : null,
    });
  }

  await db.insert(users).values(userList);
  console.log(`✅ Created ${userList.length} users`);
  return userList;
}

async function seedRolesAndPermissions() {
  console.log("🔐 Seeding roles and permissions...");

  // Create permissions
  const permissionList = [
    { name: "manage_users", description: "Can create, edit, and delete users" },
    {
      name: "manage_contests",
      description: "Can create, edit, and delete contests",
    },
    {
      name: "manage_events",
      description: "Can create, edit, and delete events",
    },
    { name: "manage_teams", description: "Can create, edit, and delete teams" },
    {
      name: "manage_galleries",
      description: "Can create, edit, and delete galleries",
    },
    {
      name: "manage_blog_posts",
      description: "Can create, edit, and delete blog posts",
    },
    {
      name: "manage_trackers",
      description: "Can create, edit, and delete trackers",
    },
    { name: "view_admin_panel", description: "Can access admin panel" },
    {
      name: "moderate_content",
      description: "Can moderate user-generated content",
    },
    { name: "view_analytics", description: "Can view analytics and reports" },
  ];

  await db.insert(permissions).values(permissionList);

  // Create roles
  const roleList = [
    { name: "super_admin", description: "Full system access" },
    { name: "admin", description: "Administrative access" },
    { name: "moderator", description: "Content moderation access" },
    { name: "organizer", description: "Event and contest organization" },
    { name: "member", description: "Regular member" },
  ];

  await db.insert(roles).values(roleList);

  // Get created roles and permissions
  const createdPermissions = await db.select().from(permissions);
  const createdRoles = await db.select().from(roles);

  // Assign permissions to roles
  const rolePermissionList = [];

  // Super admin gets all permissions
  const superAdminRole = createdRoles.find((r) => r.name === "super_admin")!;
  for (const permission of createdPermissions) {
    rolePermissionList.push({
      roleId: superAdminRole.id,
      permissionId: permission.id,
    });
  }

  // Admin gets most permissions
  const adminRole = createdRoles.find((r) => r.name === "admin")!;
  const adminPermissions = createdPermissions.filter(
    (p) => !["manage_users"].includes(p.name)
  );
  for (const permission of adminPermissions) {
    rolePermissionList.push({
      roleId: adminRole.id,
      permissionId: permission.id,
    });
  }

  // Moderator gets specific permissions
  const moderatorRole = createdRoles.find((r) => r.name === "moderator")!;
  const moderatorPermissions = createdPermissions.filter((p) =>
    ["moderate_content", "view_admin_panel", "manage_blog_posts"].includes(
      p.name
    )
  );
  for (const permission of moderatorPermissions) {
    rolePermissionList.push({
      roleId: moderatorRole.id,
      permissionId: permission.id,
    });
  }

  // Organizer gets event/contest permissions
  const organizerRole = createdRoles.find((r) => r.name === "organizer")!;
  const organizerPermissions = createdPermissions.filter((p) =>
    [
      "manage_contests",
      "manage_events",
      "manage_teams",
      "view_admin_panel",
    ].includes(p.name)
  );
  for (const permission of organizerPermissions) {
    rolePermissionList.push({
      roleId: organizerRole.id,
      permissionId: permission.id,
    });
  }

  await db.insert(rolePermissions).values(rolePermissionList);

  console.log(
    `✅ Created ${createdRoles.length} roles and ${createdPermissions.length} permissions`
  );
  return { createdRoles, createdPermissions };
}

async function seedUserRoles(userList: any[], rolesList: any[]) {
  console.log("👤 Assigning roles to users...");

  const userRoleList = [];

  // Assign super_admin role to admin user
  const adminUser = userList.find((u) => u.email === "admin@diuacm.com")!;
  const superAdminRole = rolesList.find((r) => r.name === "super_admin")!;
  userRoleList.push({
    userId: adminUser.id,
    roleId: superAdminRole.id,
  });

  // Assign random roles to other users
  const otherRoles = rolesList.filter((r) => r.name !== "super_admin");
  const regularUsers = userList.filter((u) => u.email !== "admin@diuacm.com");

  for (const user of regularUsers) {
    // 10% chance of being admin, 15% moderator, 20% organizer, rest members
    const rand = Math.random();
    let role;
    if (rand < 0.1) {
      role = otherRoles.find((r) => r.name === "admin");
    } else if (rand < 0.25) {
      role = otherRoles.find((r) => r.name === "moderator");
    } else if (rand < 0.45) {
      role = otherRoles.find((r) => r.name === "organizer");
    } else {
      role = otherRoles.find((r) => r.name === "member");
    }

    if (role) {
      userRoleList.push({
        userId: user.id,
        roleId: role.id,
      });
    }
  }

  await db.insert(userRoles).values(userRoleList);
  console.log(`✅ Assigned roles to ${userRoleList.length} users`);
}

async function seedGalleries() {
  console.log("🖼️ Seeding galleries...");

  const galleryList = [];
  for (let i = 0; i < 25; i++) {
    const title = faker.lorem.words(3);
    galleryList.push({
      title: title,
      slug: faker.helpers.slugify(title).toLowerCase(),
      description: faker.lorem.paragraph(),
      status: getRandomItem(Object.values(VisibilityStatus)),
      order: i + 1,
    });
  }

  await db.insert(galleries).values(galleryList);
  console.log(`✅ Created ${galleryList.length} galleries`);
  return galleryList;
}

async function seedContests(galleryList: any[]) {
  console.log("🏆 Seeding contests...");

  const contestList = [];
  for (let i = 0; i < 40; i++) {
    const contestName = `${faker.company.name()} Programming Contest ${faker.number.int(
      { min: 2020, max: 2024 }
    )}`;
    contestList.push({
      name: contestName,
      galleryId: Math.random() > 0.3 ? getRandomItem(galleryList).id : null,
      contestType: getRandomItem(Object.values(ContestType)),
      location: faker.location.city(),
      date: faker.date.between({ from: "2020-01-01", to: "2024-12-31" }),
      description: faker.lorem.paragraphs(2),
      standingsUrl: Math.random() > 0.4 ? faker.internet.url() : null,
    });
  }

  await db.insert(contests).values(contestList);
  console.log(`✅ Created ${contestList.length} contests`);
  return contestList;
}

async function seedTeams(contestList: any[], userList: any[]) {
  console.log("👥 Seeding teams...");

  // Get the contest data with IDs from database
  const createdContests = await db.select().from(contests);
  const teamList = [];
  const teamUserList = [];

  for (const contest of createdContests) {
    const teamCount = faker.number.int({ min: 5, max: 25 });
    const usedNames = new Set<string>();

    for (let i = 0; i < teamCount; i++) {
      let teamName;
      let attempts = 0;

      // Ensure unique team name for this contest
      do {
        teamName = `${faker.hacker.noun()} ${faker.hacker.adjective()}s`;
        attempts++;
        if (attempts > 50) {
          // Fallback to numbered team name if we can't generate unique names
          teamName = `Team ${i + 1}`;
          break;
        }
      } while (usedNames.has(teamName));

      usedNames.add(teamName);

      const team = {
        name: teamName,
        contestId: contest.id,
        rank:
          Math.random() > 0.5
            ? faker.number.int({ min: 1, max: teamCount })
            : null,
        solveCount:
          Math.random() > 0.5 ? faker.number.int({ min: 0, max: 12 }) : null,
      };
      teamList.push(team);
    }
  }

  // Insert teams in batches to avoid large queries
  const batchSize = 100;
  const createdTeams = [];

  for (let i = 0; i < teamList.length; i += batchSize) {
    const batch = teamList.slice(i, i + batchSize);
    await db.insert(teams).values(batch);
  }

  // Get all created teams
  const allCreatedTeams = await db.select().from(teams);

  // Create team memberships
  for (const team of allCreatedTeams) {
    const memberCount = faker.number.int({ min: 1, max: 3 });
    const selectedUsers = getRandomItems(userList, memberCount);

    for (const user of selectedUsers) {
      teamUserList.push({
        teamId: team.id,
        userId: user.id,
      });
    }
  }

  // Insert team memberships in batches
  if (teamUserList.length > 0) {
    for (let i = 0; i < teamUserList.length; i += batchSize) {
      const batch = teamUserList.slice(i, i + batchSize);
      await db.insert(teamUser).values(batch);
    }
  }

  console.log(
    `✅ Created ${teamList.length} teams with ${teamUserList.length} team memberships`
  );
  return allCreatedTeams;
}

async function seedEvents() {
  console.log("📅 Seeding events...");

  const eventList = [];
  for (let i = 0; i < 50; i++) {
    const startingAt = faker.date.between({
      from: "2020-01-01",
      to: "2024-12-31",
    });
    const endingAt = new Date(startingAt);
    endingAt.setHours(
      endingAt.getHours() + faker.number.int({ min: 2, max: 8 })
    );

    eventList.push({
      title: faker.lorem.words(faker.number.int({ min: 2, max: 5 })),
      description: faker.lorem.paragraphs(2),
      status: getRandomItem(Object.values(VisibilityStatus)),
      startingAt: startingAt,
      endingAt: endingAt,
      eventLink: Math.random() > 0.3 ? faker.internet.url() : null,
      eventPassword: Math.random() > 0.7 ? faker.internet.password() : null,
      openForAttendance: faker.datatype.boolean(),
      strictAttendance: faker.datatype.boolean(),
      type: getRandomItem(Object.values(EventType)),
      participationScope: getRandomItem(Object.values(ParticipationScope)),
    });
  }

  await db.insert(events).values(eventList);
  console.log(`✅ Created ${eventList.length} events`);
  return eventList;
}

async function seedTrackers() {
  console.log("📊 Seeding trackers...");

  const trackerList = [];
  for (let i = 0; i < 8; i++) {
    const title = faker.lorem.words(2);
    trackerList.push({
      title: title,
      slug: faker.helpers.slugify(title).toLowerCase(),
      description: faker.lorem.paragraph(),
      status: getRandomItem(Object.values(VisibilityStatus)),
      order: i + 1,
    });
  }

  await db.insert(trackers).values(trackerList);
  console.log(`✅ Created ${trackerList.length} trackers`);
  return trackerList;
}

async function seedRankLists(trackerList: any[]) {
  console.log("📈 Seeding rank lists...");

  // Get the tracker data with IDs from database
  const createdTrackers = await db.select().from(trackers);
  const rankListList = [];

  for (const tracker of createdTrackers) {
    const rankListCount = faker.number.int({ min: 2, max: 6 });
    const usedKeywords = new Set<string>();

    for (let i = 0; i < rankListCount; i++) {
      let keyword;
      let attempts = 0;

      // Ensure unique keyword for this tracker
      do {
        keyword = faker.hacker.abbreviation().toLowerCase();
        attempts++;
        if (attempts > 50) {
          // Fallback to numbered keyword if we can't generate unique ones
          keyword = `rl${i + 1}`;
          break;
        }
      } while (usedKeywords.has(keyword));

      usedKeywords.add(keyword);

      rankListList.push({
        trackerId: tracker.id,
        keyword: keyword,
        description: faker.lorem.sentence(),
        weightOfUpsolve: faker.number.float({
          min: 0.1,
          max: 1.0,
          fractionDigits: 2,
        }),
        order: i + 1,
        isActive: Math.random() > 0.2,
        considerStrictAttendance: faker.datatype.boolean(),
      });
    }
  }

  await db.insert(rankLists).values(rankListList);
  console.log(`✅ Created ${rankListList.length} rank lists`);
  return rankListList;
}

async function seedBlogPosts() {
  console.log("📝 Seeding blog posts...");

  const blogPostList = [];
  for (let i = 0; i < 30; i++) {
    const title = faker.lorem.sentence();
    const publishedAt = Math.random() > 0.3 ? faker.date.past() : null;

    blogPostList.push({
      title: title,
      slug: faker.helpers.slugify(title).toLowerCase(),
      author: faker.person.fullName(),
      content: faker.lorem.paragraphs(faker.number.int({ min: 5, max: 15 })),
      status: getRandomItem(Object.values(VisibilityStatus)),
      publishedAt: publishedAt,
      isFeatured: Math.random() > 0.8,
    });
  }

  await db.insert(blogPosts).values(blogPostList);
  console.log(`✅ Created ${blogPostList.length} blog posts`);
}

async function seedContactFormSubmissions() {
  console.log("💬 Seeding contact form submissions...");

  const submissionList = [];
  for (let i = 0; i < 75; i++) {
    submissionList.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      message: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
      createdAt: faker.date.past(),
    });
  }

  await db.insert(contactFormSubmissions).values(submissionList);
  console.log(`✅ Created ${submissionList.length} contact form submissions`);
}

async function seedJunctionTables(
  eventList: any[],
  rankListList: any[],
  userList: any[]
) {
  console.log("🔗 Seeding junction tables...");

  // Get fresh data from database with actual IDs
  const createdEvents = await db.select().from(events);
  const createdRankLists = await db.select().from(rankLists);
  const createdUsers = await db.select().from(users);

  // Event-RankList relationships
  const eventRankListList = [];
  for (const event of createdEvents) {
    const selectedRankLists = getRandomItems(
      createdRankLists,
      faker.number.int({ min: 1, max: 3 })
    );
    for (const rankList of selectedRankLists) {
      eventRankListList.push({
        eventId: event.id,
        rankListId: rankList.id,
        weight: faker.number.float({ min: 0.5, max: 2.0, fractionDigits: 2 }),
      });
    }
  }

  if (eventRankListList.length > 0) {
    await db.insert(eventRankList).values(eventRankListList);
  }

  // RankList-User relationships
  const rankListUserList = [];
  for (const rankList of createdRankLists) {
    const selectedUsers = getRandomItems(
      createdUsers,
      faker.number.int({ min: 10, max: 50 })
    );
    for (const user of selectedUsers) {
      rankListUserList.push({
        rankListId: rankList.id,
        userId: user.id,
        score: faker.number.float({ min: 0, max: 1000, fractionDigits: 2 }),
      });
    }
  }

  if (rankListUserList.length > 0) {
    // Insert in batches to handle large datasets
    const batchSize = 100;
    for (let i = 0; i < rankListUserList.length; i += batchSize) {
      const batch = rankListUserList.slice(i, i + batchSize);
      await db.insert(rankListUser).values(batch);
    }
  }

  // Event-User attendance
  const eventUserAttendanceList = [];
  for (const event of createdEvents) {
    const selectedUsers = getRandomItems(
      createdUsers,
      faker.number.int({ min: 5, max: 30 })
    );
    for (const user of selectedUsers) {
      eventUserAttendanceList.push({
        eventId: event.id,
        userId: user.id,
        createdAt: faker.date.recent(),
      });
    }
  }

  if (eventUserAttendanceList.length > 0) {
    // Insert in batches
    const batchSize = 100;
    for (let i = 0; i < eventUserAttendanceList.length; i += batchSize) {
      const batch = eventUserAttendanceList.slice(i, i + batchSize);
      await db.insert(eventUserAttendance).values(batch);
    }
  }

  // User solve stats on events
  const userSolveStatList = [];
  for (const event of createdEvents) {
    const selectedUsers = getRandomItems(
      createdUsers,
      faker.number.int({ min: 5, max: 25 })
    );
    for (const user of selectedUsers) {
      userSolveStatList.push({
        userId: user.id,
        eventId: event.id,
        solveCount: faker.number.int({ min: 0, max: 10 }),
        upsolveCount: faker.number.int({ min: 0, max: 15 }),
        participation: faker.datatype.boolean(),
      });
    }
  }

  if (userSolveStatList.length > 0) {
    // Insert in batches
    const batchSize = 100;
    for (let i = 0; i < userSolveStatList.length; i += batchSize) {
      const batch = userSolveStatList.slice(i, i + batchSize);
      await db.insert(userSolveStatOnEvents).values(batch);
    }
  }

  console.log(
    `✅ Created junction table entries: ${eventRankListList.length} event-ranklist, ${rankListUserList.length} ranklist-user, ${eventUserAttendanceList.length} event-attendance, ${userSolveStatList.length} user-solve-stats`
  );
}

async function main() {
  console.log("🚀 Starting database seeding...");

  try {
    await clearDatabase();

    const userList = await seedUsers();
    const { createdRoles } = await seedRolesAndPermissions();
    await seedUserRoles(userList, createdRoles);
    const galleryList = await seedGalleries();
    const contestList = await seedContests(galleryList);
    await seedTeams(contestList, userList);
    const eventList = await seedEvents();
    const trackerList = await seedTrackers();
    const rankListList = await seedRankLists(trackerList);
    await seedBlogPosts();
    await seedContactFormSubmissions();
    await seedJunctionTables(eventList, rankListList, userList);

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`👥 Users: ${userList.length}`);
    console.log(`🖼️ Galleries: ${galleryList.length}`);
    console.log(`🏆 Contests: ${contestList.length}`);
    console.log(`📅 Events: ${eventList.length}`);
    console.log(`📊 Trackers: ${trackerList.length}`);
    console.log(`📈 Rank Lists: ${rankListList.length}`);
    console.log(`🔐 Roles: ${createdRoles.length}`);
    console.log("\n🔑 Test Login:");
    console.log("Email: admin@diuacm.com");
    console.log("Password: password123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
