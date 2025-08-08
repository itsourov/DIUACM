import {
  integer,
  timestamp,
  pgTable,
  primaryKey,
  varchar,
  text,
  boolean,
  real,
  pgEnum,
  unique,
  serial,
  uniqueIndex,
  AnyPgColumn,
} from "drizzle-orm/pg-core";
import {
  type InferSelectModel,
  type InferInsertModel,
  SQL,
  sql,
} from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}

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

export const VoteType = {
  UPVOTE: "upvote",
  DOWNVOTE: "downvote",
} as const;

export type VisibilityStatus =
  (typeof VisibilityStatus)[keyof typeof VisibilityStatus];
export type ContestType = (typeof ContestType)[keyof typeof ContestType];
export type EventType = (typeof EventType)[keyof typeof EventType];
export type GenderType = (typeof GenderType)[keyof typeof GenderType];
export type ParticipationScope =
  (typeof ParticipationScope)[keyof typeof ParticipationScope];
export type VoteType = (typeof VoteType)[keyof typeof VoteType];

// PostgreSQL enums
export const visibilityStatusEnum = pgEnum("visibility_status", [
  "published",
  "draft",
]);
export const contestTypeEnum = pgEnum("contest_type", [
  "icpc_regional",
  "icpc_asia_west",
  "iupc",
  "other",
]);
export const eventTypeEnum = pgEnum("event_type", [
  "contest",
  "class",
  "other",
]);
export const genderTypeEnum = pgEnum("gender_type", [
  "male",
  "female",
  "other",
]);
export const participationScopeEnum = pgEnum("participation_scope", [
  "open_for_all",
  "only_girls",
  "junior_programmers",
  "selected_persons",
]);
export const voteTypeEnum = pgEnum("vote_type", ["upvote", "downvote"]);

export const users = pgTable(
  "user",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    username: varchar("username", { length: 255 }).unique().notNull(),
    emailVerified: timestamp("emailVerified", {
      mode: "date",
    }),
    image: varchar("image", { length: 255 }),
    password: varchar("password", { length: 255 }),
    gender: genderTypeEnum("gender"),
    phone: varchar("phone", { length: 255 }),
    codeforcesHandle: varchar("codeforces_handle", { length: 255 }),
    atcoderHandle: varchar("atcoder_handle", { length: 255 }),
    vjudgeHandle: varchar("vjudge_handle", { length: 255 }),
    startingSemester: varchar("starting_semester", { length: 255 }),
    department: varchar("department", { length: 255 }),
    studentId: varchar("student_id", { length: 255 }),
    maxCfRating: integer("max_cf_rating").notNull().default(-1),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("emailUniqueIndex").on(lower(table.email)),
    uniqueIndex("usernameUniqueIndex").on(lower(table.username)),
  ]
);

export const accounts = pgTable(
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
    expires_at: integer("expires_at"),
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

export const sessions = pgTable("session", {
  sessionToken: varchar("sessionToken", { length: 255 }).primaryKey(),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
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
export const galleries = pgTable("galleries", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),
  status: visibilityStatusEnum("status").default("draft").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

// Media table
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  galleryId: integer("gallery_id")
    .notNull()
    .references(() => galleries.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }),
  url: varchar("url", { length: 500 }).notNull(),
  key: varchar("key", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

// Contests table
export const contests = pgTable("contests", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).unique().notNull(),
  galleryId: integer("gallery_id").references(() => galleries.id),
  contestType: contestTypeEnum("contest_type").notNull(),
  location: varchar("location", { length: 255 }),
  date: timestamp("date", { mode: "date" }),
  description: text("description"),
  standingsUrl: varchar("standings_url", { length: 255 }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

// Intra Contests table
export const intraContests = pgTable("intra_contests", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).unique().notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),
  // Optional banner image (stored as full URL)
  bannerImage: varchar("banner_image", { length: 255 }),
  registrationFee: integer("registration_fee").notNull(),
  registrationStartTime: timestamp("registration_start_time", {
    mode: "date",
  }).notNull(),
  registrationEndTime: timestamp("registration_end_time", {
    mode: "date",
  }).notNull(),
  mainEventDateTime: timestamp("main_event_datetime", {
    mode: "date",
  }).notNull(),
  status: visibilityStatusEnum("status").default("draft").notNull(),
  registrationLimit: integer("registration_limit"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

// Teams table
export const teams = pgTable(
  "teams",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    contestId: integer("contest_id")
      .notNull()
      .references(() => contests.id, { onDelete: "cascade" }),
    rank: integer("rank"),
    solveCount: integer("solveCount"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [unique().on(table.name, table.contestId)]
);

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: visibilityStatusEnum("status").default("draft").notNull(),
  startingAt: timestamp("starting_at", { mode: "date" }).notNull(),
  endingAt: timestamp("ending_at", { mode: "date" }).notNull(),
  eventLink: varchar("event_link", { length: 255 }).unique(),
  eventPassword: varchar("event_password", { length: 255 }),
  openForAttendance: boolean("open_for_attendance").notNull(),
  strictAttendance: boolean("strict_attendance").notNull(),
  type: eventTypeEnum("type").default("contest").notNull(),
  participationScope: participationScopeEnum("participation_scope")
    .default("open_for_all")
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

// Trackers table
export const trackers = pgTable("trackers", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),
  status: visibilityStatusEnum("status").default("draft").notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

// Rank Lists table
export const rankLists = pgTable(
  "rank_lists",
  {
    id: serial("id").primaryKey(),
    trackerId: integer("tracker_id")
      .notNull()
      .references(() => trackers.id, { onDelete: "cascade" }),
    keyword: varchar("keyword", { length: 255 }).notNull(),
    description: text("description"),
    weightOfUpsolve: real("weight_of_upsolve").notNull(),
    order: integer("order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    considerStrictAttendance: boolean("consider_strict_attendance")
      .default(true)
      .notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [unique().on(table.keyword, table.trackerId)]
);

// Blog Posts table
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  content: text("content").notNull(),
  status: visibilityStatusEnum("status").default("draft").notNull(),
  featuredImage: varchar("featured_image", { length: 255 }),
  publishedAt: timestamp("published_at", { mode: "date" }),
  isFeatured: boolean("is_featured").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

// Junction tables
export const eventRankList = pgTable(
  "event_rank_list",
  {
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    rankListId: integer("rank_list_id")
      .notNull()
      .references(() => rankLists.id, { onDelete: "cascade" }),
    weight: real("weight").notNull(),
  },
  (table) => [unique().on(table.eventId, table.rankListId)]
);

export const teamUser = pgTable(
  "team_user",
  {
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [unique().on(table.teamId, table.userId)]
);

export const rankListUser = pgTable(
  "rank_list_user",
  {
    rankListId: integer("rank_list_id")
      .notNull()
      .references(() => rankLists.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    score: real("score").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [unique().on(table.rankListId, table.userId)]
);

export const eventUserAttendance = pgTable(
  "event_user_attendance",
  {
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [unique().on(table.eventId, table.userId)]
);

export const userSolveStatOnEvents = pgTable(
  "user_solve_stat_on_events",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    solveCount: integer("solve_count").notNull(),
    upsolveCount: integer("upsolve_count").notNull(),
    participation: boolean("participation").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [unique().on(table.userId, table.eventId)]
);

export const contactFormSubmissions = pgTable("contactFormSubmission", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  message: varchar("message", { length: 2000 }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

// Roles table
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).unique().notNull(),
  description: text("description"),
});

// Permissions table
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).unique().notNull(),
  description: text("description"),
});

// Junction table for user-role many-to-many relationship
export const userRoles = pgTable(
  "user_roles",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [unique().on(table.userId, table.roleId)]
);

// Junction table for role-permission many-to-many relationship
export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: integer("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (table) => [unique().on(table.roleId, table.permissionId)]
);

// Forum Categories table
export const forumCategories = pgTable("forum_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).unique().notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  color: varchar("color", { length: 7 }).default("#6B7280"), // hex color for category
  order: integer("order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

// Forum Posts table
export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  authorId: varchar("author_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => forumCategories.id, { onDelete: "cascade" }),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  status: visibilityStatusEnum("status").default("published").notNull(),
  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  commentCount: integer("comment_count").default(0).notNull(),
  lastActivityAt: timestamp("last_activity_at", { mode: "date" }).defaultNow(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

// Forum Comments table
export const forumComments = pgTable("forum_comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorId: varchar("author_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  postId: integer("post_id")
    .notNull()
    .references(() => forumPosts.id, { onDelete: "cascade" }),
  parentId: integer("parent_id"), // self-reference for nested comments/replies
  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

// Forum Post Votes table
export const forumPostVotes = pgTable(
  "forum_post_votes",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    postId: integer("post_id")
      .notNull()
      .references(() => forumPosts.id, { onDelete: "cascade" }),
    voteType: voteTypeEnum("vote_type").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [unique().on(table.userId, table.postId)]
);

// Forum Comment Votes table
export const forumCommentVotes = pgTable(
  "forum_comment_votes",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    commentId: integer("comment_id")
      .notNull()
      .references(() => forumComments.id, { onDelete: "cascade" }),
    voteType: voteTypeEnum("vote_type").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [unique().on(table.userId, table.commentId)]
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
export type IntraContest = InferSelectModel<typeof intraContests>;
export type NewIntraContest = InferInsertModel<typeof intraContests>;
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

// Forum-related types
export type ForumCategory = InferSelectModel<typeof forumCategories>;
export type NewForumCategory = InferInsertModel<typeof forumCategories>;
export type ForumPost = InferSelectModel<typeof forumPosts>;
export type NewForumPost = InferInsertModel<typeof forumPosts>;
export type ForumComment = InferSelectModel<typeof forumComments>;
export type NewForumComment = InferInsertModel<typeof forumComments>;
export type ForumPostVote = InferSelectModel<typeof forumPostVotes>;
export type NewForumPostVote = InferInsertModel<typeof forumPostVotes>;
export type ForumCommentVote = InferSelectModel<typeof forumCommentVotes>;
export type NewForumCommentVote = InferInsertModel<typeof forumCommentVotes>;

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

// Forum-related composite types
export type ForumPostWithAuthor = ForumPost & {
  author: Pick<User, "id" | "name" | "username" | "image">;
  category: Pick<ForumCategory, "id" | "name" | "slug" | "color">;
  userVote?: Pick<ForumPostVote, "voteType"> | null;
};

export type ForumPostWithDetails = ForumPost & {
  author: Pick<User, "id" | "name" | "username" | "image">;
  category: Pick<ForumCategory, "id" | "name" | "slug" | "color">;
  userVote?: Pick<ForumPostVote, "voteType"> | null;
  _count: {
    comments: number;
  };
};

export type ForumCommentWithAuthor = ForumComment & {
  author: Pick<User, "id" | "name" | "username" | "image">;
  userVote?: Pick<ForumCommentVote, "voteType"> | null;
  replies?: ForumCommentWithAuthor[];
};

export type ForumCategoryWithStats = ForumCategory & {
  _count: {
    posts: number;
  };
  lastPost?: {
    id: number;
    title: string;
    createdAt: Date;
    author: Pick<User, "id" | "name" | "username">;
  } | null;
};
