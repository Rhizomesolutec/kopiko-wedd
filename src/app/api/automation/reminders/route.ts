import { NextResponse } from "next/server";
import { differenceInCalendarDays, parseISO } from "date-fns";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { verifyAutomationSecret } from "@/lib/automationAuth";
import { getErrorMessage, statusForError } from "@/lib/errors";
import type { BookingLike, EventItemLike } from "@/lib/automation";
import {
  renderUpcomingWeddingReminder,
  renderWeddingDayWishes,
  renderOccasionMessage,
  renderPaymentReminder,
} from "@/lib/whatsappTemplates";

// ----------------------------------------------------------------------
// GET /api/automation/reminders?type=wedding|wedding-day|occasion|payment
// ----------------------------------------------------------------------
// Pull-based endpoint for n8n's Schedule Trigger workflows. Each workflow
// runs once a day, calls this with its own `type`, and gets back a ready
// -to-send list of { to, message } - n8n just loops over the array and
// calls the WhatsApp Cloud API HTTP node once per item, then reports the
// result back to POST /api/automation/log.
//
// Reminder offsets follow the spec exactly: 30/15/7/3/1 days before the
// wedding date for the generic reminder, and same-day for wedding wishes.

const WEDDING_REMINDER_OFFSETS = [30, 15, 7, 3, 1];
const OCCASION_REMINDER_OFFSETS = [3, 1, 0]; // 0 = same day (wishes)
const OCCASION_TYPES = ["Engagement", "Pre-Wedding", "Save The Date"] as const;

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  try {
    return differenceInCalendarDays(parseISO(dateStr), parseISO(todayISO()));
  } catch {
    return null;
  }
}

function collectAssignedCrew(ev: EventItemLike): string[] {
  return [
    ...(ev.photographyCrew || []),
    ...(ev.photographyCrewBride || []),
    ...(ev.photographyCrewGroom || []),
    ...(ev.videographyCrew || []),
    ...(ev.videographyCrewBride || []),
    ...(ev.videographyCrewGroom || []),
    ...(ev.droneCrew || []),
    ...(ev.droneCrewBride || []),
    ...(ev.droneCrewGroom || []),
  ].filter(Boolean);
}

export async function GET(request: Request) {
  try {
    verifyAutomationSecret(request);
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "wedding";

    const bookings = (await Booking.find({ status: { $ne: "cancelled" } }).lean()) as unknown as BookingLike[];
    const results: { to?: string; message: string; meta: Record<string, unknown> }[] = [];

    if (type === "wedding" || type === "wedding-day") {
      for (const b of bookings) {
        const daysLeft = daysUntil(b.weddingDate);
        if (daysLeft === null) continue;

        if (type === "wedding-day" && daysLeft === 0) {
          results.push({
            to: b.phone,
            message: renderWeddingDayWishes({
              brideName: b.brideName,
              groomName: b.groomName,
            }),
            meta: { bookingId: b._id, event: "wedding.day_wishes" },
          });
        }

        if (type === "wedding" && WEDDING_REMINDER_OFFSETS.includes(daysLeft)) {
          const assignedTeam = new Set<string>();
          for (const ds of b.dateSchedules || []) {
            for (const ev of ds.events || []) {
              collectAssignedCrew(ev).forEach((name) => assignedTeam.add(name));
            }
          }

          results.push({
            to: b.phone,
            message: renderUpcomingWeddingReminder({
              brideName: b.brideName,
              groomName: b.groomName,
              weddingDate: b.weddingDate,
              weddingTime: b.weddingTime,
              venue: b.venue,
              city: b.city,
              packageName: b.package,
              daysLeft,
              assignedTeam: Array.from(assignedTeam),
            }),
            meta: { bookingId: b._id, daysLeft, event: "wedding.reminder" },
          });
        }
      }
    }

    if (type === "occasion") {
      for (const b of bookings) {
        for (const ds of b.dateSchedules || []) {
          const occasionType = (ds.events || [])
            .map((ev) => ev.eventType)
            .find((t) => OCCASION_TYPES.some((o) => (t || "").toLowerCase().includes(o.toLowerCase())));
          if (!occasionType) continue;

          const daysLeft = daysUntil(ds.date);
          if (daysLeft === null || !OCCASION_REMINDER_OFFSETS.includes(daysLeft)) continue;

          const matchedType = OCCASION_TYPES.find((o) =>
            occasionType.toLowerCase().includes(o.toLowerCase())
          ) as (typeof OCCASION_TYPES)[number];

          results.push({
            to: b.phone,
            message: renderOccasionMessage({
              brideName: b.brideName,
              groomName: b.groomName,
              weddingDate: ds.date,
              venue: b.venue,
              occasionType: matchedType,
              isToday: daysLeft === 0,
            }),
            meta: { bookingId: b._id, occasionType: matchedType, daysLeft, event: "occasion.reminder" },
          });
        }
      }
    }

    if (type === "payment") {
      for (const b of bookings) {
        const remaining = Number(b.remainingAmount) || 0;
        if (b.paymentStatus === "paid" || remaining <= 0) continue;

        results.push({
          to: b.phone,
          message: renderPaymentReminder({
            brideName: b.brideName,
            groomName: b.groomName,
            advancePayment: b.advancePayment,
            remainingAmount: b.remainingAmount,
          }),
          meta: { bookingId: b._id, event: "payment.reminder" },
        });
      }
    }

    return NextResponse.json({ type, count: results.length, results });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    return NextResponse.json({ error: message }, { status: statusForError(message) });
  }
}
