import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { PUBLIC_LEADERBOARD_LIMIT, arcadeScoreInput } from "../../../server/arcadeLeaderboard";

type LeaderboardRow = {
  id: number;
  playerTag: string;
  score: number;
  completedLevel: "level1" | "level2";
  hasBonusCrown: number | boolean;
  createdAt: string;
};

interface D1Statement {
  bind(...values: Array<string | number | boolean | null>): D1Statement;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
}

interface D1Database {
  prepare(sql: string): D1Statement;
}

interface Env { DB: D1Database }
interface RequestContext { request: Request; env: Env }

const t = initTRPC.context<{ env: Env }>().create({ transformer: superjson });

const appRouter = t.router({
  arcade: t.router({
    leaderboard: t.procedure.query(async ({ ctx }) => {
      const result = await ctx.env.DB.prepare(
        `SELECT id, playerTag, score, completedLevel, hasBonusCrown, createdAt
         FROM arcade_leaderboard_entries
         ORDER BY score DESC, createdAt DESC
         LIMIT ?`,
      ).bind(PUBLIC_LEADERBOARD_LIMIT).all<LeaderboardRow>();

      return result.results.map((row) => ({
        ...row,
        hasBonusCrown: Boolean(row.hasBonusCrown),
        createdAt: new Date(`${row.createdAt.replace(" ", "T")}Z`),
      }));
    }),
    submitScore: t.procedure.input(arcadeScoreInput).mutation(async ({ ctx, input }) => {
      const saved = await ctx.env.DB.prepare(
        `INSERT INTO arcade_leaderboard_entries
          (playerTag, score, completedLevel, hasBonusCrown)
         VALUES (?, ?, ?, ?)
         RETURNING id, playerTag, score, completedLevel, hasBonusCrown, createdAt`,
      ).bind(input.playerTag, input.score, input.completedLevel, input.hasBonusCrown ? 1 : 0).first<LeaderboardRow>();

      if (!saved) throw new Error("Leaderboard entry was not saved");
      return {
        ...saved,
        hasBonusCrown: Boolean(saved.hasBonusCrown),
        createdAt: new Date(`${saved.createdAt.replace(" ", "T")}Z`),
      };
    }),
  }),
});

export type CloudflareArcadeRouter = typeof appRouter;

export const onRequest = ({ request, env }: RequestContext) => fetchRequestHandler({
  endpoint: "/api/trpc",
  req: request,
  router: appRouter,
  createContext: () => ({ env }),
});
