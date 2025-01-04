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

export const tradingChallenges = pgTable("trading_challenges", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  initialBalance: numeric("initial_balance").notNull(),
  maxLeverage: numeric("max_leverage").default("1"),
  allowedInstruments: json("allowed_instruments").notNull(),
  minParticipants: integer("min_participants").default(2),
  maxParticipants: integer("max_participants"),
  status: text("status").notNull().default("upcoming"), // upcoming, active, completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const challengeParticipants = pgTable("challenge_participants", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").references(() => tradingChallenges.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  currentBalance: numeric("current_balance").notNull(),
  pnl: numeric("pnl").default("0"),
  rank: integer("rank"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const challengeTrades = pgTable("challenge_trades", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id").references(() => challengeParticipants.id).notNull(),
  symbol: text("symbol").notNull(),
  type: text("type").notNull(), // buy, sell
  amount: numeric("amount").notNull(),
  entryPrice: numeric("entry_price").notNull(),
  exitPrice: numeric("exit_price"),
  pnl: numeric("pnl"),
  status: text("status").notNull(), // open, closed
  openedAt: timestamp("opened_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  createdChallenges: many(tradingChallenges),
  challengeParticipations: many(challengeParticipants),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));

export const tradingChallengesRelations = relations(tradingChallenges, ({ one, many }) => ({
  creator: one(users, {
    fields: [tradingChallenges.creatorId],
    references: [users.id],
  }),
  participants: many(challengeParticipants),
}));

export const challengeParticipantsRelations = relations(challengeParticipants, ({ one, many }) => ({
  challenge: one(tradingChallenges, {
    fields: [challengeParticipants.challengeId],
    references: [tradingChallenges.id],
  }),
  user: one(users, {
    fields: [challengeParticipants.userId],
    references: [users.id],
  }),
  trades: many(challengeTrades),
}));

export const challengeTradesRelations = relations(challengeTrades, ({ one }) => ({
  participant: one(challengeParticipants, {
    fields: [challengeTrades.participantId],
    references: [challengeParticipants.id],
  }),
}));


export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export const insertChallengeSchema = createInsertSchema(tradingChallenges);
export const selectChallengeSchema = createSelectSchema(tradingChallenges);
export type InsertChallenge = typeof tradingChallenges.$inferInsert;
export type SelectChallenge = typeof tradingChallenges.$inferSelect;