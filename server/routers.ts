import { COOKIE_NAME } from "@shared/const";
import { PUBLIC_LEADERBOARD_LIMIT, arcadeScoreInput } from "./arcadeLeaderboard";
import { listArcadeLeaderboard, saveArcadeLeaderboardEntry } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  arcade: router({
    leaderboard: publicProcedure.query(() => listArcadeLeaderboard(PUBLIC_LEADERBOARD_LIMIT)),
    submitScore: publicProcedure
      .input(arcadeScoreInput)
      .mutation(({ input }) => saveArcadeLeaderboardEntry(input)),
  }),
});

export type AppRouter = typeof appRouter;
