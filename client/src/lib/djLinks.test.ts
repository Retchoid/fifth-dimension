import { describe, expect, it } from "vitest";
import {
  BOOKING_EMAIL,
  createBookingMailto,
  EXCLUSIVE_RELEASE,
  FACEBOOK_URL,
  FUTURE_MIX_CHANNELS,
  MIXCLOUD_EMBED,
  MIXCLOUD_FEATURED_MIX,
  MIXCLOUD_PROFILE,
  FUTURE_CHANNELS,
  INSTAGRAM_URL,
  SOUND_CLOUD_EMBED,
  SOUND_CLOUD_PROFILE,
} from "./djLinks";

describe("5th Dimension public channel configuration", () => {
  it("keeps the SoundCloud profile and supported player URL aligned", () => {
    expect(SOUND_CLOUD_PROFILE).toBe("https://soundcloud.com/user6777884");
    expect(SOUND_CLOUD_EMBED).toContain("api.soundcloud.com%2Fusers%2F1855303");
    expect(SOUND_CLOUD_EMBED).toContain("visual=false");
    expect(SOUND_CLOUD_EMBED).toContain("show_artwork=true");
  });

  it("retains the supplied Facebook and Instagram destinations", () => {
    expect(FACEBOOK_URL).toContain("facebook.com/share/1YU9Mvk8SQ");
    expect(INSTAGRAM_URL).toContain("instagram.com/5th_dimension_aka_bobbybass");
  });

  it("keeps only unavailable music services visibly marked as future channels", () => {
    expect(FUTURE_CHANNELS.bandcamp).toBe("Link pending");
  });

  it("uses the supplied Mixcloud profile and a supported player for its latest public upload", () => {
    expect(MIXCLOUD_PROFILE).toBe("https://www.mixcloud.com/fingerbanginfaderz/");
    expect(MIXCLOUD_FEATURED_MIX).toBe("https://www.mixcloud.com/fingerbanginfaderz/logikal-grinder/");
    expect(MIXCLOUD_EMBED).toContain("mixcloud.com/widget/iframe");
    expect(decodeURIComponent(MIXCLOUD_EMBED)).toContain("/fingerbanginfaderz/logikal-grinder/");
    expect(MIXCLOUD_EMBED).toContain("mini=0");
    expect(MIXCLOUD_EMBED).not.toContain("mini=1");
  });

  it("creates booking emails with the BOOKING subject prefix", () => {
    const draft = createBookingMailto("Festival set", "Hello from the promoter");
    expect(draft).toContain(`mailto:${BOOKING_EMAIL}`);
    expect(draft).toContain("subject=BOOKING!%20%E2%80%94%20Festival%20set");
    expect(draft).toContain("Hello%20from%20the%20promoter");
  });

  it("includes optional event date and location details in the booking email body", () => {
    const draft = createBookingMailto("Festival set", "Hello from the promoter", "2026-09-12", "Hamilton, ON");
    const decodedDraft = decodeURIComponent(draft);
    expect(decodedDraft).toContain("Proposed event date: 2026-09-12");
    expect(decodedDraft).toContain("Proposed event location: Hamilton, ON");
  });

  it("preserves the requested title, credit, and managed download URL for the exclusive release", () => {
    expect(EXCLUSIVE_RELEASE.title).toBe("Jersh In Case");
    expect(EXCLUSIVE_RELEASE.artist).toBe("5th Dimension, Skavo featuring MC Mestup");
    expect(EXCLUSIVE_RELEASE.url).toBe("/manus-storage/jersh-in-case-5th-dimension_36de0a4f.mp3");
  });

  it("keeps unlinked house and genre mix slots ready for future releases", () => {
    expect(FUTURE_MIX_CHANNELS.map((channel) => channel.title)).toEqual([
      "House Mixes",
      "Other Frequencies",
      "Future Sessions",
    ]);
  });
});
