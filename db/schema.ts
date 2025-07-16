import {
  int,
  timestamp,
  mysqlTable,
  primaryKey,
  varchar,
  text,
  longtext,
  datetime,
  boolean,
  float,
  mysqlEnum,
  unique,
} from "drizzle-orm/mysql-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

export const VisibilityStatus = {
  PUBLISHED: "published",
  DRAFT: "draft",
} as const;

export const ContestType = {
  ICPC_REGIONAL: "icpc_regional",
  ICPC_ASIA_WEST: "icpc_asia_west",
  IUPC: "iupc",
  OTHER: "other",
} as const;

export const EventType = {
  CONTEST: "contest",
  CLASS: "class",
  OTHER: "other",
} as const;

export const GenderType = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
} as const;
export const ParticipationScope = {
  OPEN_FOR_ALL: "open_for_all",
  ONLY_GIRLS: "only_girls",
  JUNIOR_PROGRAMMERS: "junior_programmers",
  SELECTED_PERSONS: "selected_persons",
} as const;

export type VisibilityStatus =
  (typeof VisibilityStatus)[keyof typeof VisibilityStatus];
export type ContestType = (typeof ContestType)[keyof typeof ContestType];
export type EventType = (typeof EventType)[keyof typeof EventType];
export type GenderType = (typeof GenderType)[keyof typeof GenderType];
export type ParticipationScope =
  (typeof ParticipationScope)[keyof typeof ParticipationScope];

export const users = mysqlTable("user", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  username: varchar("username", { length: 255 }).unique(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }),
  image: varchar("image", { length: 255 }),
  password: varchar("password", { length: 255 }),
  gender: mysqlEnum("gender", GenderType),
  phone: varchar("phone", { length: 255 }),
  codeforcesHandle: varchar("codeforces_handle", { length: 255 }),
  atcoderHandle: varchar("atcoder_handle", { length: 255 }),
  vjudgeHandle: varchar("vjudge_handle", { length: 255 }),
  startingSemester: varchar("starting_semester", { length: 255 }),
  department: varchar("department", { length: 255 }),
  studentId: varchar("student_id", { length: 255 }),
  maxCfRating: int("max_cf_rating"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .onUpdateNow(),
});

export const accounts = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccountType>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: varchar("refresh_token", { length: 255 }),
    access_token: varchar("access_token", { length: 255 }),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: varchar("id_token", { length: 2048 }),
    session_state: varchar("session_state", { length: 255 }),
  },
  (table) => [
    primaryKey({
      columns: [table.provider, table.providerAccountId],
    }),
  ]
);

export const sessions = mysqlTable("session", {
  sessionToken: varchar("sessionToken", { length: 255 }).primaryKey(),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = mysqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.identifier, table.token],
    }),
  ]
);

// Galleries table
export const galleries = mysqlTable("galleries", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),
  status: mysqlEnum("status", VisibilityStatus)
    .default(VisibilityStatus.DRAFT)
    .notNull(),
  order: int("order").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .onUpdateNow(),
});

// Media table
export const media = mysqlTable("media", {
  id: int("id").primaryKey().autoincrement(),
  galleryId: int("gallery_id")
    .notNull()
    .references(() => galleries.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }),
  url: varchar("url", { length: 500 }).notNull(),
  key: varchar("key", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: int("file_size").notNull(),
  width: int("width").notNull(),
  height: int("height").notNull(),
  order: int("order").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .onUpdateNow(),
});

// Contests table
export const contests = mysqlTable("contests", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).unique().notNull(),
  galleryId: int("gallery_id").references(() => galleries.id),
  contestType: mysqlEnum("contest_type", ContestType).notNull(),
  location: varchar("location", { length: 255 }),
  date: datetime("date"),
  description: text("description"),
  standingsUrl: varchar("standings_url", { length: 255 }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .onUpdateNow(),
});

// Teams table
export const teams = mysqlTable(
  "teams",
  {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull(),
    contestId: int("contest_id")
      .notNull()
      .references(() => contests.id, { onDelete: "cascade" }),
    rank: int("rank"),
    solveCount: int("solveCount"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => [unique().on(table.name, table.contestId)]
);

// Events table
export const events = mysqlTable("events", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", VisibilityStatus)
    .default(VisibilityStatus.DRAFT)
    .notNull(),
  startingAt: datetime("starting_at").notNull(),
  endingAt: varchar("ending_at", { length: 255 }).notNull(),
  eventLink: varchar("event_link", { length: 255 }).unique(),
  eventPassword: varchar("event_password", { length: 255 }),
  openForAttendance: boolean("open_for_attendance").notNull(),
  strictAttendance: boolean("strict_attendance").notNull(),
  type: mysqlEnum("type", EventType).default(EventType.CONTEST).notNull(),
  participationScope: mysqlEnum("participation_scope", ParticipationScope)
    .default(ParticipationScope.OPEN_FOR_ALL)
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .onUpdateNow(),
});

// Trackers table
export const trackers = mysqlTable("trackers", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),
  status: mysqlEnum("status", VisibilityStatus)
    .default(VisibilityStatus.DRAFT)
    .notNull(),
  order: int("order").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .onUpdateNow(),
});

// Rank Lists table
export const rankLists = mysqlTable(
  "rank_lists",
  {
    id: int("id").primaryKey().autoincrement(),
    trackerId: int("tracker_id")
      .notNull()
      .references(() => trackers.id, { onDelete: "cascade" }),
    keyword: varchar("keyword", { length: 255 }).notNull(),
    description: text("description"),
    weightOfUpsolve: float("weight_of_upsolve").notNull(),
    order: int("order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    considerStrictAttendance: boolean("consider_strict_attendance")
      .default(true)
      .notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => [unique().on(table.keyword, table.trackerId)]
);

// Blog Posts table
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  content: longtext("content").notNull(),
  status: mysqlEnum("status", VisibilityStatus)
    .default(VisibilityStatus.DRAFT)
    .notNull(),
  publishedAt: datetime("published_at"),
  isFeatured: boolean("is_featured").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .onUpdateNow(),
});

// Junction tables
export const eventRankList = mysqlTable(
  "event_rank_list",
  {
    eventId: int("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    rankListId: int("rank_list_id")
      .notNull()
      .references(() => rankLists.id, { onDelete: "cascade" }),
    weight: float("weight").notNull(),
  },
  (table) => [unique().on(table.eventId, table.rankListId)]
);

export const teamUser = mysqlTable(
  "team_user",
  {
    teamId: int("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => [unique().on(table.teamId, table.userId)]
);

export const rankListUser = mysqlTable(
  "rank_list_user",
  {
    rankListId: int("rank_list_id")
      .notNull()
      .references(() => rankLists.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    score: float("score").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => [unique().on(table.rankListId, table.userId)]
);

export const eventUserAttendance = mysqlTable(
  "event_user_attendance",
  {
    eventId: int("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => [unique().on(table.eventId, table.userId)]
);

export const userSolveStatOnEvents = mysqlTable(
  "user_solve_stat_on_events",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eventId: int("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    solveCount: int("solve_count").notNull(),
    upsolveCount: int("upsolve_count").notNull(),
    participation: boolean("participation").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => [unique().on(table.userId, table.eventId)]
);

export const contactFormSubmissions = mysqlTable("contactFormSubmission", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  message: varchar("message", { length: 2000 }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

// Roles table
export const roles = mysqlTable("roles", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).unique().notNull(),
  description: text("description"),
});

// Permissions table
export const permissions = mysqlTable("permissions", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).unique().notNull(),
  description: text("description"),
});

// Junction table for user-role many-to-many relationship
export const userRoles = mysqlTable(
  "user_roles",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: int("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => [unique().on(table.userId, table.roleId)]
);

// Junction table for role-permission many-to-many relationship
export const rolePermissions = mysqlTable(
  "role_permissions",
  {
    roleId: int("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: int("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (table) => [unique().on(table.roleId, table.permissionId)]
);

// Type exports for better type safety
export type Event = InferSelectModel<typeof events>;
export type NewEvent = InferInsertModel<typeof events>;
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;
export type Session = InferSelectModel<typeof sessions>;
export type NewSession = InferInsertModel<typeof sessions>;
export type Role = InferSelectModel<typeof roles>;
export type NewRole = InferInsertModel<typeof roles>;
export type Permission = InferSelectModel<typeof permissions>;
export type NewPermission = InferInsertModel<typeof permissions>;
export type UserRole = InferSelectModel<typeof userRoles>;
export type NewUserRole = InferInsertModel<typeof userRoles>;
export type RolePermission = InferSelectModel<typeof rolePermissions>;
export type NewRolePermission = InferInsertModel<typeof rolePermissions>;
export type Gallery = InferSelectModel<typeof galleries>;
export type NewGallery = InferInsertModel<typeof galleries>;
export type Media = InferSelectModel<typeof media>;
export type NewMedia = InferInsertModel<typeof media>;
export type Contest = InferSelectModel<typeof contests>;
export type NewContest = InferInsertModel<typeof contests>;
export type Team = InferSelectModel<typeof teams>;
export type NewTeam = InferInsertModel<typeof teams>;
export type TeamUser = InferSelectModel<typeof teamUser>;
export type NewTeamUser = InferInsertModel<typeof teamUser>;
export type Tracker = InferSelectModel<typeof trackers>;
export type NewTracker = InferInsertModel<typeof trackers>;
export type RankList = InferSelectModel<typeof rankLists>;
export type NewRankList = InferInsertModel<typeof rankLists>;
export type RankListUser = InferSelectModel<typeof rankListUser>;
export type NewRankListUser = InferInsertModel<typeof rankListUser>;
export type BlogPost = InferSelectModel<typeof blogPosts>;
export type NewBlogPost = InferInsertModel<typeof blogPosts>;
export type EventUserAttendance = InferSelectModel<typeof eventUserAttendance>;
export type NewEventUserAttendance = InferInsertModel<
  typeof eventUserAttendance
>;
export type EventRankList = InferSelectModel<typeof eventRankList>;
export type NewEventRankList = InferInsertModel<typeof eventRankList>;
export type UserSolveStatOnEvents = InferSelectModel<
  typeof userSolveStatOnEvents
>;
export type NewUserSolveStatOnEvents = InferInsertModel<
  typeof userSolveStatOnEvents
>;
export type ContactFormSubmission = InferSelectModel<
  typeof contactFormSubmissions
>;
export type NewContactFormSubmission = InferInsertModel<
  typeof contactFormSubmissions
>;

// Commonly used composite and utility types
export type UserSearchResult = Pick<
  User,
  "id" | "name" | "email" | "username" | "image" | "studentId" | "department"
>;
export type UserProfile = Pick<
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
>;
export type UserWithCounts = Omit<User, "password" | "emailVerified"> & {
  _count: {
    eventAttendances: number;
    rankListUsers: number;
  };
};

// Event-related composite types
export type AttendanceWithUser = EventUserAttendance & {
  user: Pick<
    User,
    "id" | "name" | "email" | "username" | "image" | "studentId" | "department"
  >;
};

export type EventRankListWithRankList = EventRankList & {
  rankList: Pick<RankList, "id" | "keyword" | "description" | "trackerId">;
  tracker: {
    title: string;
  } | null;
};
