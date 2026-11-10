# Selectah Showdown standalone hosting

This build publishes only the arcade experience and the media it references. It
does not copy the DJ homepage or the rest of `client/public/assets` into the
Cloudflare Pages output. The existing Render service continues to build from its
configured `main2` branch; this standalone build uses its own entry, output
directory, Pages Function, and D1 schema.

## Build locally

```sh
pnpm build:game
```

Output: `dist/selectah-showdown/`. The asset preparation script copies only
`/assets/*` referenced by the game component, its game styles, and the unlocked
release card.

## Cloudflare Pages project

- Repository: `Retchoid/fifth-dimension`
- Production branch: `feat/selectah-showdown-cloudflare-standalone`
- Root directory: repository root
- Build command: `git lfs install --local && git lfs pull && pnpm install --frozen-lockfile && pnpm build:game`
- Build output directory: `dist/selectah-showdown`
- Pages Function: `functions/api/trpc/[[trpc]].ts`
- Add a D1 database binding named `DB` to the Pages project.
- Apply `cloudflare/migrations/0001_arcade_leaderboard.sql` to that database.
- Set `NODE_VERSION=22` and `PNPM_VERSION=10.4.1` for the build environment.

The game uses three audio files stored through Git LFS. The asset-preparation
step fails instead of silently publishing Git LFS pointer text if the build
environment does not fetch those objects.

The Pages Function exposes the same `arcade.leaderboard` and
`arcade.submitScore` tRPC operations used by the current component. It validates
score submissions with the existing Zod schema and stores only the selector tag,
score, completed level, bonus crown flag, and timestamp.

## Before public launch

1. Build the game output and confirm it contains no DJ-site HTML or unrelated
   media.
2. Preview the Pages Function with a local or Cloudflare D1 binding and verify
   leaderboard reads and score writes.
3. Check the game on desktop and a real phone, including pointer/touch movement,
   audio start, release unlock, and the three-level route.
4. Connect the Cloudflare account, create the Pages project and D1 binding, then
   publish the standalone branch as its own preview.

The leaderboard remains a public, self-reported score board as it is today; it
does not claim to prove a score was achieved through a completed run.
