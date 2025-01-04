import { pgTable, text, serial, integer, timestamp, json, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  bio: text("bio"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
  totalPnl: numeric("total_pnl").default("0"),
  weeklyPnl: numeric("weekly_pnl").default("0"),
  winRate: numeric("win_rate").default("0"),
  tradesCount: integer("trades_count").default(0),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  ticker: text("ticker"),
  analysis: json("analysis"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const optionsFlow = pgTable("options_flow", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull(),
  strike: integer("strike").notNull(),
  expiry: timestamp("expiry").notNull(),
  volume: integer("volume").notNull(),
  openInterest: integer("open_interest").notNull(),
  type: text("type").notNull(), // 'call' or 'put'
  premium: integer("premium").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;