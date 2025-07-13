import {
  int,
  timestamp,
  mysqlTable,
  primaryKey,
  varchar,
} from "drizzle-orm/mysql-core";
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
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }),
  image: varchar("image", { length: 255 }),
  username: varchar("username", { length: 100 }),
  studentId: varchar("studentId", { length: 50 }),
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

export const contactFormSubmissions = mysqlTable("contactFormSubmission", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  message: varchar("message", { length: 2000 }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});
