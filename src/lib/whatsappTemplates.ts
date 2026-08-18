// ----------------------------------------------------------------------
// Reusable WhatsApp message templates
// ----------------------------------------------------------------------
// Every function here is a pure string builder: {variables} in -> message
// text out. Next.js renders the final text (this is where all the
// "business copy" lives, in one auditable place) and hands the finished
// string to n8n, which only has to call the WhatsApp Cloud API with it.
//
// Keeping template logic here (instead of inside n8n Function nodes) means:
//  - Non-engineers can tweak copy without touching n8n workflows
//  - Templates are covered by the same TypeScript/ESLint checks as the rest
//    of the app
//  - Adding Email/SMS later is just "render the same variables into a
//    different format" - no automation logic needs to change.
//
// All functions gracefully handle missing optional fields (fallback to
// sensible placeholder text) so a partially-filled booking never produces
// a broken-looking message.

const studioName = "Kopiko Wedding Studio";

const na = (val?: string | number | null, fallback = "TBD") =>
  val === undefined || val === null || val === "" ? fallback : String(val);

export interface CoupleInfo {
  brideName?: string;
  groomName?: string;
  weddingDate?: string;
  weddingTime?: string;
  venue?: string;
  city?: string;
  packageName?: string;
}

export interface CrewAssignmentInfo {
  crewName: string;
  department: "Photography" | "Videography" | "Drone";
  date: string;
  location?: string;
  side?: "bride" | "groom" | null;
  occasion?: string;
  brideName?: string;
  groomName?: string;
  reportingTime?: string;
}

function coupleLine(c: CoupleInfo) {
  return `${na(c.brideName, "Bride")} & ${na(c.groomName, "Groom")}`;
}

// 1. Booking Confirmation -> sent to the CLIENT when status becomes "confirmed"
export function renderBookingConfirmation(c: CoupleInfo) {
  return [
    `Hi ${na(c.brideName)} & ${na(c.groomName)}! 🎉`,
    ``,
    `Your booking with ${studioName} is now *confirmed*.`,
    ``,
    `📅 Date: ${na(c.weddingDate)}`,
    `🕐 Time: ${na(c.weddingTime)}`,
    `📍 Venue: ${na(c.venue)}${c.city ? `, ${c.city}` : ""}`,
    `📦 Package: ${na(c.packageName)}`,
    ``,
    `We can't wait to be part of your big day! If you have any questions, just reply to this message.`,
  ].join("\n");
}

// 2. Crew Assignment -> sent to a crew member when they're assigned to a shoot
export function renderCrewAssignment(a: CrewAssignmentInfo) {
  const sideLabel = a.side ? ` (${a.side === "bride" ? "Bride" : "Groom"} side)` : "";
  return [
    `Hi ${a.crewName}! 📸`,
    ``,
    `You've been assigned to a new ${a.department} shoot${sideLabel}.`,
    ``,
    `👰🤵 Couple: ${coupleLine(a)}`,
    `🎬 Occasion: ${na(a.occasion, "Wedding")}`,
    `📅 Date: ${na(a.date)}`,
    `📍 Location: ${na(a.location)}`,
    a.reportingTime ? `🕐 Reporting Time: ${a.reportingTime}` : undefined,
    ``,
    `Please confirm your availability. Thanks!`,
  ]
    .filter(Boolean)
    .join("\n");
}

// 3. Upcoming Wedding Reminder -> sent to CLIENT at 30/15/7/3/1 days before
export function renderUpcomingWeddingReminder(
  c: CoupleInfo & { daysLeft: number; assignedTeam?: string[] }
) {
  return [
    `Hi ${na(c.brideName)} & ${na(c.groomName)}! ⏳`,
    ``,
    `Just a friendly reminder - your wedding day is in *${c.daysLeft} day${c.daysLeft === 1 ? "" : "s"}*!`,
    ``,
    `📅 Date: ${na(c.weddingDate)}`,
    `🕐 Time: ${na(c.weddingTime)}`,
    `📍 Venue: ${na(c.venue)}${c.city ? `, ${c.city}` : ""}`,
    `📦 Package: ${na(c.packageName)}`,
    c.assignedTeam && c.assignedTeam.length > 0
      ? `👥 Your Team: ${c.assignedTeam.join(", ")}`
      : undefined,
    ``,
    `We're so excited for you! - Team ${studioName}`,
  ]
    .filter(Boolean)
    .join("\n");
}

// 4. Today's Assignment -> sent to CREW every morning for today's shoots
export function renderTodayCrewAssignment(a: CrewAssignmentInfo) {
  const sideLabel = a.side ? ` (${a.side === "bride" ? "Bride" : "Groom"} side)` : "";
  return [
    `Good morning ${a.crewName}! ☀️`,
    ``,
    `*Today's Assignment*`,
    `🎬 Occasion: ${na(a.occasion, "Wedding")}`,
    `👰🤵 Couple: ${coupleLine(a)}`,
    `📍 Venue: ${na(a.location)}`,
    `🎥 Department: ${a.department}${sideLabel}`,
    a.reportingTime ? `🕐 Reporting Time: ${a.reportingTime}` : undefined,
    ``,
    `Have a great shoot!`,
  ]
    .filter(Boolean)
    .join("\n");
}

// 5. Wedding Day Wishes -> sent to CLIENT on the wedding day itself
export function renderWeddingDayWishes(c: CoupleInfo) {
  return [
    `🎊 Congratulations ${na(c.brideName)} & ${na(c.groomName)}! 🎊`,
    ``,
    `Today is your big day and we're honored to be capturing every moment of it.`,
    `Wishing you a lifetime of love and happiness, from all of us at ${studioName}. 💍`,
  ].join("\n");
}

// 6/7/8. Occasion Wishes/Reminders -> Engagement, Pre-Wedding, Save The Date
export function renderOccasionMessage(
  c: CoupleInfo & { occasionType: "Engagement" | "Pre-Wedding" | "Save The Date"; isToday: boolean }
) {
  if (c.occasionType === "Engagement") {
    return c.isToday
      ? [
          `💍 Congratulations ${na(c.brideName)} & ${na(c.groomName)} on your Engagement! 💍`,
          `Wishing you both a beautiful journey ahead. - ${studioName}`,
        ].join("\n")
      : [
          `Hi ${na(c.brideName)} & ${na(c.groomName)}!`,
          `Just a reminder about your upcoming Engagement on ${na(c.weddingDate)} at ${na(c.venue)}.`,
          `We're looking forward to it! - ${studioName}`,
        ].join("\n");
  }

  if (c.occasionType === "Pre-Wedding") {
    return [
      `Hi ${na(c.brideName)} & ${na(c.groomName)}! 📷`,
      c.isToday
        ? `Wishing you an amazing Pre-Wedding shoot today! Our team can't wait to capture your story.`
        : `Just a reminder - your Pre-Wedding shoot is coming up on ${na(c.weddingDate)} at ${na(c.venue)}.`,
      `- ${studioName}`,
    ].join("\n");
  }

  // Save The Date
  return [
    `Hi ${na(c.brideName)} & ${na(c.groomName)}!`,
    `Reminder: your "Save The Date" event is on ${na(c.weddingDate)} at ${na(c.venue)}.`,
    `Looking forward to it! - ${studioName}`,
  ].join("\n");
}

// 9. Payment Reminder -> sent to CLIENT when paymentStatus is pending
export function renderPaymentReminder(
  c: CoupleInfo & { remainingAmount?: string | number; advancePayment?: string | number }
) {
  return [
    `Hi ${na(c.brideName)} & ${na(c.groomName)}! 💳`,
    ``,
    `This is a gentle reminder regarding your booking payment.`,
    `Advance Paid: ₹${na(c.advancePayment, "0")}`,
    `Remaining Amount: ₹${na(c.remainingAmount, "0")}`,
    ``,
    `Please clear the remaining balance at your earliest convenience. Thank you!`,
    `- ${studioName}`,
  ].join("\n");
}

// 10. Gallery Delivery Notification -> sent to CLIENT when status = "all_delivered"
export function renderGalleryDeliveryNotification(c: CoupleInfo, galleryUrl?: string) {
  return [
    `Hi ${na(c.brideName)} & ${na(c.groomName)}! 🎁`,
    ``,
    `Great news - your photos & videos are ready!`,
    galleryUrl ? `View them here: ${galleryUrl}` : `Please contact us to receive your final gallery.`,
    ``,
    `Thank you for choosing ${studioName}. We hope you love them as much as we loved creating them!`,
  ].join("\n");
}

// 11. Internal Admin Notification -> sent to STUDIO ADMIN on important changes
export function renderAdminNotification(params: {
  title: string;
  brideName?: string;
  groomName?: string;
  detail?: string;
}) {
  return [
    `🔔 ${params.title}`,
    ``,
    `Couple: ${na(params.brideName)} & ${na(params.groomName)}`,
    params.detail ? params.detail : undefined,
  ]
    .filter(Boolean)
    .join("\n");
}

// 12. Daily Production Summary -> sent to ADMIN every morning
export function renderDailyProductionSummary(params: {
  date: string;
  occasionCounts: Record<string, number>;
  totalCrew: number;
}) {
  const lines = Object.entries(params.occasionCounts).map(([type, count]) => `${type}: ${count}`);
  return [
    `📊 *Today's Production - ${params.date}*`,
    ``,
    ...(lines.length > 0 ? lines : ["No events scheduled today."]),
    ``,
    `Total Crew Deployed: ${params.totalCrew}`,
  ].join("\n");
}

// 13/14/15. Tomorrow / Weekly / Monthly Schedule -> sent to ADMIN
export function renderPeriodSchedule(params: {
  label: "Tomorrow" | "This Week" | "This Month";
  entries: { date: string; brideName?: string; groomName?: string; venue?: string; occasion?: string }[];
}) {
  if (params.entries.length === 0) {
    return `📅 *${params.label}'s Schedule*\n\nNo bookings scheduled.`;
  }
  const lines = params.entries.map(
    (e) =>
      `• ${e.date} - ${na(e.occasion, "Wedding")} - ${na(e.brideName)} & ${na(e.groomName)} @ ${na(e.venue)}`
  );
  return [`📅 *${params.label}'s Schedule*`, ``, ...lines].join("\n");
}
