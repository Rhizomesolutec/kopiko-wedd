import { NextResponse } from "next/server";
import { addDays, format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { verifyAutomationSecret } from "@/lib/automationAuth";
import { getErrorMessage, statusForError } from "@/lib/errors";
import { flattenAssignments, resolveCrewPhones } from "@/lib/automation";
import type { BookingLike, EventItemLike } from "@/lib/automation";
import {
  renderTodayCrewAssignment,
  renderDailyProductionSummary,
  renderPeriodSchedule,
} from "@/lib/whatsappTemplates";

// ----------------------------------------------------------------------
// GET /api/automation/reports?range=today-crew|today-summary|tomorrow|weekly|monthly
// ----------------------------------------------------------------------
// Pull-based endpoint for n8n's daily/weekly/monthly Schedule Trigger
// workflows aimed at CREW and the STUDIO ADMIN (as opposed to
// /api/automation/reminders, which is aimed at the CLIENT couple).

function ymd(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function occasionLabel(ev: EventItemLike) {
  return ev.customEventType || ev.eventType || "Wedding";
}

export async function GET(request: Request) {
  try {
    verifyAutomationSecret(request);
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "today-crew";
    const monthParam = searchParams.get("month"); // YYYY-MM, defaults to current month

    const bookings = (await Booking.find({ status: { $ne: "cancelled" } }).lean()) as unknown as BookingLike[];

    if (range === "today-crew") {
      const today = ymd(new Date());
      const assignments: (ReturnType<typeof flattenAssignments>[number] & {
        brideName?: string;
        groomName?: string;
      })[] = [];

      for (const b of bookings) {
        for (const a of flattenAssignments(b)) {
          if (a.date === today) {
            assignments.push({ ...a, brideName: b.brideName, groomName: b.groomName });
          }
        }
      }

      const phoneMap = await resolveCrewPhones(assignments.map((a) => a.crewName));
      const results = assignments.map((a) => {
        const contact = phoneMap.get(a.crewName);
        return {
          to: contact?.phone || null,
          crewName: a.crewName,
          message: renderTodayCrewAssignment(a),
          meta: { department: a.department, side: a.side, occasion: a.occasion },
        };
      });

      return NextResponse.json({ range, date: today, count: results.length, results });
    }

    if (range === "today-summary" || range === "tomorrow" || range === "weekly") {
      let targetDates: string[];
      let label: "Tomorrow" | "This Week" | "This Month";

      if (range === "today-summary") {
        targetDates = [ymd(new Date())];
        label = "Tomorrow"; // unused for today-summary but keeps TS happy
      } else if (range === "tomorrow") {
        targetDates = [ymd(addDays(new Date(), 1))];
        label = "Tomorrow";
      } else {
        targetDates = Array.from({ length: 7 }, (_, i) => ymd(addDays(new Date(), i + 1)));
        label = "This Week";
      }

      const entries: {
        date: string;
        brideName?: string;
        groomName?: string;
        venue?: string;
        occasion?: string;
      }[] = [];
      const occasionCounts: Record<string, number> = {};
      const crewToday = new Set<string>();

      for (const b of bookings) {
        for (const ds of b.dateSchedules || []) {
          if (!targetDates.includes(ds.date)) continue;
          for (const ev of ds.events || []) {
            const occ = occasionLabel(ev);
            entries.push({ date: ds.date, brideName: b.brideName, groomName: b.groomName, venue: b.venue, occasion: occ });
            occasionCounts[occ] = (occasionCounts[occ] || 0) + 1;

            if (range === "today-summary") {
              [
                ...(ev.photographyCrew || []),
                ...(ev.photographyCrewBride || []),
                ...(ev.photographyCrewGroom || []),
                ...(ev.videographyCrew || []),
                ...(ev.videographyCrewBride || []),
                ...(ev.videographyCrewGroom || []),
                ...(ev.droneCrew || []),
                ...(ev.droneCrewBride || []),
                ...(ev.droneCrewGroom || []),
              ].forEach((name) => name && crewToday.add(name));
            }
          }
        }
      }

      if (range === "today-summary") {
        const message = renderDailyProductionSummary({
          date: targetDates[0],
          occasionCounts,
          totalCrew: crewToday.size,
        });
        return NextResponse.json({ range, date: targetDates[0], message, occasionCounts, totalCrew: crewToday.size });
      }

      const message = renderPeriodSchedule({ label, entries });
      return NextResponse.json({ range, dates: targetDates, message, count: entries.length, entries });
    }

    if (range === "monthly") {
      const monthDate = monthParam ? parseISO(`${monthParam}-01`) : new Date();
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);

      const entries: {
        date: string;
        brideName?: string;
        groomName?: string;
        venue?: string;
        occasion?: string;
      }[] = [];

      for (const b of bookings) {
        for (const ds of b.dateSchedules || []) {
          let dsDate: Date;
          try {
            dsDate = parseISO(ds.date);
          } catch {
            continue;
          }
          if (!isWithinInterval(dsDate, { start, end })) continue;

          for (const ev of ds.events || []) {
            entries.push({
              date: ds.date,
              brideName: b.brideName,
              groomName: b.groomName,
              venue: b.venue,
              occasion: occasionLabel(ev),
            });
          }
        }
      }

      entries.sort((a, b) => a.date.localeCompare(b.date));
      const message = renderPeriodSchedule({ label: "This Month", entries });
      return NextResponse.json({
        range,
        month: format(monthDate, "yyyy-MM"),
        message,
        count: entries.length,
        entries,
      });
    }

    return NextResponse.json({ error: `Unknown range "${range}"` }, { status: 400 });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    return NextResponse.json({ error: message }, { status: statusForError(message) });
  }
}
