import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "client", "public");
const outputRoot = path.join(root, "client", "game-public");
const initialSources = [
  path.join(root, "client", "game", "GameStandalone.tsx"),
  path.join(root, "client", "src", "components", "DjMiniGame.tsx"),
  path.join(root, "client", "src", "index.css"),
  path.join(root, "client", "src", "lib", "djLinks.ts"),
];

const sourceFiles = new Set(initialSources);
const pending = [...initialSources];
const assets = new Set();
const assetPattern = /["'(]\/assets\/([^"')?#]+)["')?]/g;
const cssAliasPattern = /@\/(\S+?\.css)/g;
const cssRelativePattern = /@import\s+(?:url\()?\s*["']([^"']+\.css)["']/g;

while (pending.length) {
  const file = pending.pop();
  const source = await fs.readFile(file, "utf8");
  for (const match of source.matchAll(assetPattern)) assets.add(match[1]);

  if (file.endsWith(".tsx") || file.endsWith(".ts")) {
    for (const match of source.matchAll(cssAliasPattern)) {
      const dependency = path.join(root, "client", "src", match[1]);
      if (!sourceFiles.has(dependency)) {
        sourceFiles.add(dependency);
        pending.push(dependency);
      }
    }
  }

  if (file.endsWith(".css")) {
    for (const match of source.matchAll(cssRelativePattern)) {
      const dependency = path.resolve(path.dirname(file), match[1]);
      if (!sourceFiles.has(dependency)) {
        sourceFiles.add(dependency);
        pending.push(dependency);
      }
    }
  }
}

await fs.rm(outputRoot, { recursive: true, force: true });
for (const asset of [...assets].sort()) {
  const source = path.join(publicRoot, "assets", asset);
  const target = path.join(outputRoot, "assets", asset);
  await fs.access(source);
  const handle = await fs.open(source, "r");
  const header = Buffer.alloc(128);
  const { bytesRead } = await handle.read(header, 0, header.length, 0);
  await handle.close();
  if (header.subarray(0, bytesRead).toString("utf8").startsWith("version https://git-lfs.github.com/spec/v1")) {
    throw new Error(`Git LFS pointer found for ${asset}; run git lfs pull before building.`);
  }
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(source, target);
}

const maskSource = path.join(root, "rEU3ZkO01.svg");
if (await fs.access(maskSource).then(() => true).catch(() => false)) {
  await fs.mkdir(path.join(outputRoot, "assets"), { recursive: true });
  await fs.copyFile(maskSource, path.join(outputRoot, "assets", "level1-checkerboard-mask.svg"));
}

console.log(`Prepared ${assets.size} game assets in client/game-public; no DJ-site media copied.`);
