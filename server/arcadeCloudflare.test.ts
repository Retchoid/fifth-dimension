import { createTRPCUntypedClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { describe, expect, it } from "vitest";
import { onRequest } from "../functions/api/trpc/[[trpc]]";

type TestEntry = {
  id: number;
  playerTag: string;
  score: number;
  completedLevel: "level1" | "level2";
  hasBonusCrown: number;
  createdAt: string;
};

function createTestDatabase() {
  const entries: TestEntry[] = [];
  let nextId = 1;

  const db = {
    prepare(sql: string) {
      let values: Array<string | number | boolean | null> = [];
      return {
        bind(...bound: Array<string | number | boolean | null>) {
          values = bound;
          return this;
        },
        async all<T>() {
          const limit = Number(values[0] ?? 10);
          return {
            results: [...entries]
              .sort((a, b) => b.score - a.score || b.createdAt.localeCompare(a.createdAt))
              .slice(0, limit) as T[],
          };
        },
        async first<T>() {
          if (!sql.includes("INSERT INTO arcade_leaderboard_entries")) return null;
          const [playerTag, score, completedLevel, hasBonusCrown] = values;
          const row: TestEntry = {
            id: nextId++,
            playerTag: String(playerTag),
            score: Number(score),
            completedLevel: String(completedLevel) as TestEntry["completedLevel"],
            hasBonusCrown: Number(hasBonusCrown),
            createdAt: "2026-11-10 12:30:00",
          };
          entries.push(row);
          return row as T;
        },
      };
    },
  };

  return { DB: db };
}

function createClient(env: ReturnType<typeof createTestDatabase>) {
  return createTRPCUntypedClient({
    links: [httpBatchLink({
      url: "https://selectah-showdown.test/api/trpc",
      transformer: superjson,
      fetch: (input, init) => onRequest({ request: new Request(input, init), env }),
    })],
  });
}

describe("Cloudflare Selectah Showdown leaderboard", () => {
  it("accepts a validated score and returns it in the public board", async () => {
    const client = createClient(createTestDatabase());
    const saved = await client.mutation("arcade.submitScore", {
      playerTag: "BASS 5D",
      score: 4200,
      completedLevel: "level2",
      hasBonusCrown: true,
    }) as TestEntry;
    const board = await client.query("arcade.leaderboard") as TestEntry[];

    expect(saved.playerTag).toBe("BASS 5D");
    expect(saved.hasBonusCrown).toBe(true);
    expect(board).toHaveLength(1);
    expect(board[0].score).toBe(4200);
    expect(board[0].createdAt).toBeInstanceOf(Date);
  });

  it("rejects malformed player tags and crown claims without a Level 2 finish", async () => {
    const client = createClient(createTestDatabase());

    await expect(client.mutation("arcade.submitScore", {
      playerTag: "THIS TAG IS TOO LONG",
      score: 100,
      completedLevel: "level1",
    })).rejects.toThrow();
    await expect(client.mutation("arcade.submitScore", {
      playerTag: "SELECTA",
      score: 100,
      completedLevel: "level1",
      hasBonusCrown: true,
    })).rejects.toThrow();
  });
});
