import type { Express } from "express";

/**
 * Keeps pre-existing `/embedded-assets/<filename>` references working after
 * media is moved out of the repository and into managed project storage.
 */
export function managedAssetUrl(assetName: string): string {
  if (assetName === "selectah-dubplate-5d-production-v2.png") {
    return `/manus-storage/selectah-dubplate-5d-production-v2_eaba2713.png`;
  }
  return `/manus-storage/${encodeURIComponent(assetName)}`;
}

export function registerLegacyAssetRedirect(app: Express): void {
  app.get("/embedded-assets/:assetName", (req, res) => {
    res.redirect(302, managedAssetUrl(req.params.assetName));
  });
}
