import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const terminalStyles = readFileSync(resolve(process.cwd(), "client/src/booking-frequency-terminal.css"), "utf8");

describe("Booking frequency terminal", () => {
  it("preserves the booking form and outbound contact path", () => {
    expect(homeSource).toContain('id="booking"');
    expect(homeSource).toContain('id="booking-title"');
    expect(homeSource).toContain("BOOKING_EMAIL");
    expect(homeSource).toContain("openBookingEmail");
    expect(homeSource).toContain('id="booking-subject"');
    expect(homeSource).toContain('id="booking-event-date"');
    expect(homeSource).toContain('id="booking-event-location"');
    expect(homeSource).toContain('id="booking-message"');
    expect(homeSource).toContain("booking-submit");
  });

  it("protects the hard-edged terminal hierarchy and mobile form stack", () => {
    expect(terminalStyles).toContain("LOCK INTO THE FREQUENCY // OUTGOING CHANNEL");
    expect(terminalStyles).toContain("box-shadow: 9px 9px 0 #00D4FF");
    expect(terminalStyles).toContain("background: #111322 !important");
    expect(terminalStyles).toContain('font: 900 .8rem/1.35 "Courier New" !important');
    expect(terminalStyles).toContain("@media (max-width: 650px)");
    expect(terminalStyles).toContain("grid-template-columns: 1fr");
  });
});
