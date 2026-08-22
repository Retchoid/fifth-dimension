import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const clientRoot = resolve(projectRoot, "client");
const publicAssetsRoot = resolve(clientRoot, "public/assets");
const manifestPath = resolve(publicAssetsRoot, "asset-manifest.json");

type ManifestEntry = {
  original_filename: string;
  destination_path: string;
  repository_path: string;
  sha256: string;
  source_sha256: string;
  sha256_match: boolean;
};

type AssetManifest = {
  assets: ManifestEntry[];
  exceptions: Array<{ original_filename: string; migration_status: string }>;
};

function readClientText(path: string) {
  return readFileSync(resolve(clientRoot, path), "utf8");
}

describe("repository-owned public media migration", () => {
  it("keeps active client production source independent from Manus storage and legacy embedded paths", () => {
    const sourceFiles = [
      "index.html",
      "public/share-card.html",
      "src/components/DjMiniGame.tsx",
      "src/pages/Home.tsx",
      "src/index.css",
      "src/detailed-arcade-scenes.css",
      "src/level1-canonical-environment.css",
      "src/level1-approved-sunset-art.css",
      "src/record-visibility-hardfix.css",
      "src/visual-recovery-arcade.css",
    ];

    for (const file of sourceFiles) {
      const source = readClientText(file);
      expect(source).not.toContain("/manus-storage/");
      expect(source).not.toContain("/embedded-assets/");
    }
  });

  it("records all migrated production assets as byte-identical repository-owned files", () => {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as AssetManifest;

    expect(manifest.assets).toHaveLength(70);
    expect(manifest.exceptions).toEqual([
      expect.objectContaining({
        original_filename: "mix%20cover%20%26%20edit.mp3",
        migration_status: "skipped-test-only-legacy-reference",
      }),
    ]);

    for (const asset of manifest.assets) {
      expect(asset.destination_path).toMatch(/^\/assets\//);
      expect(asset.sha256_match).toBe(true);
      expect(asset.sha256).toBe(asset.source_sha256);
      expect(existsSync(resolve(projectRoot, asset.repository_path))).toBe(true);
    }
  });

  it("preserves the four immutable Level 1 masters in the permanent static asset set", () => {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as AssetManifest;
    const filenames = new Set(manifest.assets.map(asset => asset.original_filename));

    for (const master of [
      "1000001169_3204905a.png",
      "1000001162_aa49120d.png",
      "1000001166_e9b75dd0.png",
      "1000001168_c5184bab.png",
    ]) {
      expect(filenames.has(master)).toBe(true);
      expect(existsSync(resolve(publicAssetsRoot, master))).toBe(true);
    }
  });
});
