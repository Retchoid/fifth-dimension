import { z } from "zod";

export const PUBLIC_LEADERBOARD_LIMIT = 10;

/** Only a short entered selector tag is retained on the public board. */
export const arcadeScoreInput = z.object({
  playerTag: z.string().trim().toUpperCase().regex(/^[A-Z0-9 _-]{1,12}$/),
  score: z.number().int().min(0).max(100_000),
  completedLevel: z.enum(["level1", "level2"]),
  hasBonusCrown: z.boolean().optional().default(false),
}).superRefine((value, ctx) => {
  if (value.hasBonusCrown && value.completedLevel !== "level2") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["hasBonusCrown"], message: "After Party crowns require a Level 2 completion." });
  }
});

export type ArcadeScoreInput = z.infer<typeof arcadeScoreInput>;
