import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const output = new URL("../validation/selectah-showdown-code-export.txt", import.meta.url);
const files = [
  "client/src/components/DjMiniGame.tsx",
  "client/src/gameplay-clarity.css",
  "client/src/miami-arcade-stage.css",
  "client/src/reward-callout.css",
  "client/src/detailed-arcade-scenes.css",
];

const lines = [
  "SELECTAH SHOWDOWN — CONSOLIDATED GAME CODE EXPORT",
  "",
  "Generated from the current project source. Includes the gameplay component and every arcade stylesheet directly imported by that component.",
  `Generated at: ${new Date().toISOString()}`,
  "",
];

for (const relativePath of files) {
  const source = await readFile(new URL(relativePath, root), "utf8");
  lines.push("=".repeat(80));
  lines.push(`FILE: ${relativePath}`);
  lines.push("=".repeat(80));
  lines.push(source.replace(/\s+$/, ""));
  lines.push("");
}

await writeFile(output, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote ${output.pathname}`);
