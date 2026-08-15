export const SOUND_CLOUD_PROFILE = "https://soundcloud.com/user6777884";
export const SOUND_CLOUD_EMBED = "https://w.soundcloud.com/player/?visual=false&url=https%3A%2F%2Fapi.soundcloud.com%2Fusers%2F1855303&show_artwork=true&color=%2300e7ff";
export const MIXCLOUD_PROFILE = "https://www.mixcloud.com/fingerbanginfaderz/";
export const MIXCLOUD_FEATURED_MIX = "https://www.mixcloud.com/fingerbanginfaderz/logikal-grinder/";
export const MIXCLOUD_EMBED = "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=0&light=0&feed=%2Ffingerbanginfaderz%2Flogikal-grinder%2F";
export const FACEBOOK_URL = "https://www.facebook.com/share/1YU9Mvk8SQ/";
export const INSTAGRAM_URL = "https://www.instagram.com/5th_dimension_aka_bobbybass?igsh=eXhpa3V2dmV1YXcy";
export const BOOKING_EMAIL = "bobbyjackets.one@gmail.com";

export function createBookingMailto(
  subject: string,
  message: string,
  eventDate = "",
  eventLocation = "",
) {
  const normalizedSubject = subject.trim();
  const emailSubject = `BOOKING! — ${normalizedSubject || "Inquiry"}`;
  const bodySections = [
    message.trim() || "Hello 5th Dimension,",
    eventDate.trim() ? `Proposed event date: ${eventDate.trim()}` : "",
    eventLocation.trim() ? `Proposed event location: ${eventLocation.trim()}` : "",
  ].filter(Boolean);
  const body = `${bodySections.join("\n\n")}\n\n`;
  return `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(body)}`;
}

export const FUTURE_CHANNELS = {
  bandcamp: "Link pending",
} as const;

export const FUTURE_MIX_CHANNELS = [
  {
    id: "HOUSE / 001",
    title: "House Mixes",
    description: "Deep rooms, loose percussion, and all-night house pressure.",
  },
  {
    id: "GENRE / 002",
    title: "Other Frequencies",
    description: "Specialized selections, guest blends, and unexpected side routes.",
  },
  {
    id: "ARCHIVE / 003",
    title: "Future Sessions",
    description: "New series, live recordings, and genre experiments are coming through.",
  },
] as const;

export const EXCLUSIVE_RELEASE = {
  title: "Jersh In Case",
  artist: "5th Dimension, Skavo featuring MC Mestup",
  duration: "5:01",
  url: "/manus-storage/jersh-in-case-5th-dimension_36de0a4f.mp3",
} as const;
