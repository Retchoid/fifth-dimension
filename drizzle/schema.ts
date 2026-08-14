import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/** Core user table backing the optional Manus OAuth flow. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * Public, intentionally minimal arcade board. No email, account ID, or other
 * personally identifying data is stored—only the selector tag a player enters.
 */
export const arcadeLeaderboardEntries = mysqlTable(
  "arcade_leaderboard_entries",
  {
    id: int("id").autoincrement().primaryKey(),
    playerTag: varchar("playerTag", { length: 12 }).notNull(),
    score: int("score").notNull(),
    completedLevel: mysqlEnum("completedLevel", ["level1", "level2"]).notNull(),
    hasBonusCrown: boolean("hasBonusCrown").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("arcade_leaderboard_score_idx").on(table.score),
    index("arcade_leaderboard_created_idx").on(table.createdAt),
  ],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type ArcadeLeaderboardEntry = typeof arcadeLeaderboardEntries.$inferSelect;
export type InsertArcadeLeaderboardEntry = typeof arcadeLeaderboardEntries.$inferInsert;
