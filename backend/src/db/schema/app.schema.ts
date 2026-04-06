import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

const createdAt = timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    handle: varchar("handle", { length: 40 }).notNull(),
    avatarUrl: text("avatar_url"),
    coverUrl: text("cover_url"),
    activeSince: varchar("active_since", { length: 8 }).notNull(),
    bio: text("bio"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    createdAt,
    updatedAt
  },
  (table) => [
    uniqueIndex("users_email_unique_idx").on(table.email),
    uniqueIndex("users_handle_unique_idx").on(table.handle),
    index("users_created_at_idx").on(table.createdAt)
  ]
);

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    refreshTokenHash: text("refresh_token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt,
    updatedAt
  },
  (table) => [
    uniqueIndex("auth_sessions_refresh_token_hash_unique_idx").on(table.refreshTokenHash),
    index("auth_sessions_user_id_idx").on(table.userId),
    index("auth_sessions_expires_at_idx").on(table.expiresAt)
  ]
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt
  },
  (table) => [
    uniqueIndex("password_reset_tokens_hash_unique_idx").on(table.tokenHash),
    index("password_reset_tokens_user_id_idx").on(table.userId)
  ]
);

export const emailVerificationTokens = pgTable(
  "email_verification_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt
  },
  (table) => [
    uniqueIndex("email_verification_tokens_hash_unique_idx").on(table.tokenHash),
    index("email_verification_tokens_user_id_idx").on(table.userId)
  ]
);

export const communityComments = pgTable(
  "community_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id").notNull(),
    authorUserId: uuid("author_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    content: text("content").notNull(),
    createdAt,
    updatedAt
  },
  (table) => [
    index("community_comments_post_id_idx").on(table.postId, table.createdAt),
    index("community_comments_author_user_id_idx").on(table.authorUserId)
  ]
);

export const communityReactions = pgTable(
  "community_reactions",
  {
    postId: uuid("post_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    createdAt
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.userId], name: "community_reactions_pk" }),
    index("community_reactions_user_id_idx").on(table.userId)
  ]
);

export const profileFollows = pgTable(
  "profile_follows",
  {
    followerUserId: uuid("follower_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    targetUserId: uuid("target_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    createdAt
  },
  (table) => [
    primaryKey({ columns: [table.followerUserId, table.targetUserId], name: "profile_follows_pk" }),
    index("profile_follows_target_user_id_idx").on(table.targetUserId),
    index("profile_follows_follower_user_id_idx").on(table.followerUserId)
  ]
);

export const flashNewsItems = pgTable(
  "flash_news_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 180 }).notNull(),
    summary: text("summary").notNull(),
    source: varchar("source", { length: 120 }).notNull(),
    imageUrl: text("image_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt,
    updatedAt
  },
  (table) => [
    index("flash_news_items_sort_order_idx").on(table.sortOrder),
    index("flash_news_items_created_at_idx").on(table.createdAt)
  ]
);

export const economicIndicatorRows = pgTable(
  "economic_indicator_rows",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    country: varchar("country", { length: 80 }).notNull(),
    indicator: varchar("indicator", { length: 160 }).notNull(),
    september: varchar("september", { length: 40 }).notNull(),
    october: varchar("october", { length: 40 }).notNull(),
    november: varchar("november", { length: 40 }).notNull(),
    december: varchar("december", { length: 40 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt,
    updatedAt
  },
  (table) => [
    uniqueIndex("economic_indicator_rows_country_indicator_unique_idx").on(table.country, table.indicator),
    index("economic_indicator_rows_sort_order_idx").on(table.sortOrder)
  ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type AuthSession = typeof authSessions.$inferSelect;
export type NewAuthSession = typeof authSessions.$inferInsert;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;

export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type NewEmailVerificationToken = typeof emailVerificationTokens.$inferInsert;

export type CommunityComment = typeof communityComments.$inferSelect;
export type NewCommunityComment = typeof communityComments.$inferInsert;

export type CommunityReaction = typeof communityReactions.$inferSelect;
export type NewCommunityReaction = typeof communityReactions.$inferInsert;

export type ProfileFollow = typeof profileFollows.$inferSelect;
export type NewProfileFollow = typeof profileFollows.$inferInsert;

export type FlashNewsItem = typeof flashNewsItems.$inferSelect;
export type NewFlashNewsItem = typeof flashNewsItems.$inferInsert;

export type EconomicIndicatorRow = typeof economicIndicatorRows.$inferSelect;
export type NewEconomicIndicatorRow = typeof economicIndicatorRows.$inferInsert;
