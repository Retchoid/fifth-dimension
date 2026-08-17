import { describe, expect, it } from "vitest";
import { managedAssetUrl } from "./legacyAssetRedirect";

describe("managedAssetUrl", () => {
  it("maps legacy embedded filenames to the managed storage route", () => {
    expect(managedAssetUrl("selectah-splash-art-direction_4d1c250f.png")).toBe(
      "/manus-storage/selectah-splash-art-direction_4d1c250f.png"
    );
  });

  it("encodes filenames before creating the storage path", () => {
    expect(managedAssetUrl("mix cover & edit.mp3")).toBe(
      "/manus-storage/mix%20cover%20%26%20edit.mp3"
    );
  });
});
