import dbConnect from "@/lib/mongodb";
import Crew from "@/models/Crew";
import { dispatchAutomationEvent } from "@/services/n8n";
import { renderCrewAssignment } from "@/lib/whatsappTemplates";

// ----------------------------------------------------------------------
// Minimal server-side types (deliberately NOT imported from the client
// BookingManager component - keeps this module framework/UI agnostic and
// safe to use from any API route or future script).
// ----------------------------------------------------------------------
export interface EventItemLike {
  eventType?: string;
  customEventType?: string;
  location?: string;

  photographyEventType?: string;
  photographyLocation?: string;
  photographyLead?: string;
  photographyCrew?: string[];
  photographyCrewBride?: string[];
  photographyCrewGroom?: string[];

  videographyEventType?: string;
  videographyLocation?: string;
  videographyLead?: string;
  videographyCrew?: string[];
  videographyCrewBride?: string[];
  videographyCrewGroom?: string[];

  droneEventType?: string;
  droneLocation?: string;
  droneLead?: string;
  droneCrew?: string[];
  droneCrewBride?: string[];
  droneCrewGroom?: string[];
}

export interface DateScheduleLike {
  date: string;
  events?: EventItemLike[];
}

export interface BookingLike {
  _id?: unknown;
  brideName?: string;
  groomName?: string;
  phone?: string;
  email?: string;
  weddingDate?: string;
  weddingTime?: string;
  venue?: string;
  city?: string;
  state?: string;
  country?: string;
  package?: string;
  status?: string;
  paymentStatus?: string;
  advancePayment?: string | number;
  remainingAmount?: string | number;
  notes?: string;
  internalNotes?: string;
  dateSchedules?: DateScheduleLike[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CrewLike {
  _id?: unknown;
  name?: string;
  phone?: string;
  email?: string;
}

// ----------------------------------------------------------------------
// 1. Booking payload builder (spec: "Booking Payload" section)
// ----------------------------------------------------------------------
export function buildBookingPayload(booking: BookingLike) {
  return {
    bookingId: booking._id,
    brideName: booking.brideName,
    groomName: booking.groomName,
    phone: booking.phone,
    email: booking.email,
    package: booking.package,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    advancePayment: booking.advancePayment,
    remainingAmount: booking.remainingAmount,
    weddingDate: booking.weddingDate,
    weddingTime: booking.weddingTime,
    venue: booking.venue,
    location: [booking.city, booking.state, booking.country].filter(Boolean).join(", "),
    notes: booking.notes,
    dateSchedules: (booking.dateSchedules || []).map((ds) => ({
      date: ds.date,
      events: (ds.events || []).map((ev) => ({
        occasion: ev.eventType,
        customOccasion: ev.customEventType,
        photography: {
          eventType: ev.photographyEventType,
          location: ev.photographyLocation,
          lead: ev.photographyLead || "",
          crew: ev.photographyCrew || [],
          crewBride: ev.photographyCrewBride || [],
          crewGroom: ev.photographyCrewGroom || [],
        },
        videography: {
          eventType: ev.videographyEventType,
          location: ev.videographyLocation,
          lead: ev.videographyLead || "",
          crew: ev.videographyCrew || [],
          crewBride: ev.videographyCrewBride || [],
          crewGroom: ev.videographyCrewGroom || [],
        },
        drone: {
          eventType: ev.droneEventType,
          location: ev.droneLocation,
          lead: ev.droneLead || "",
          crew: ev.droneCrew || [],
          crewBride: ev.droneCrewBride || [],
          crewGroom: ev.droneCrewGroom || [],
        },
      })),
    })),
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}

// ----------------------------------------------------------------------
// 2. Crew assignment diffing
// ----------------------------------------------------------------------
export interface FlatAssignment {
  key: string;
  crewName: string;
  department: "Photography" | "Videography" | "Drone";
  side: "bride" | "groom" | null;
  date: string;
  location?: string;
  occasion?: string;
}

export function flattenAssignments(booking: BookingLike): FlatAssignment[] {
  const out: FlatAssignment[] = [];
  for (const ds of booking.dateSchedules || []) {
    for (const ev of ds.events || []) {
      const occasion = ev.customEventType || ev.eventType || "Wedding";

      const push = (
        names: string[] | undefined,
        department: FlatAssignment["department"],
        side: FlatAssignment["side"],
        location?: string
      ) => {
        for (const name of names || []) {
          if (!name) continue;
          out.push({
            key: `${ds.date}|${department}|${side || "main"}|${name}`,
            crewName: name,
            department,
            side,
            date: ds.date,
            location,
            occasion,
          });
        }
      };

      push(ev.photographyCrew, "Photography", null, ev.photographyLocation);
      push(ev.photographyCrewBride, "Photography", "bride", ev.photographyLocation);
      push(ev.photographyCrewGroom, "Photography", "groom", ev.photographyLocation);

      push(ev.videographyCrew, "Videography", null, ev.videographyLocation);
      push(ev.videographyCrewBride, "Videography", "bride", ev.videographyLocation);
      push(ev.videographyCrewGroom, "Videography", "groom", ev.videographyLocation);

      push(ev.droneCrew, "Drone", null, ev.droneLocation);
      push(ev.droneCrewBride, "Drone", "bride", ev.droneLocation);
      push(ev.droneCrewGroom, "Drone", "groom", ev.droneLocation);
    }
  }
  return out;
}

/** Returns only the assignments that exist in `next` but not in `prev`. */
export function diffNewCrewAssignments(prev: BookingLike | null, next: BookingLike): FlatAssignment[] {
  const prevKeys = new Set(prev ? flattenAssignments(prev).map((a) => a.key) : []);
  return flattenAssignments(next).filter((a) => !prevKeys.has(a.key));
}

export async function resolveCrewPhones(names: string[]): Promise<Map<string, CrewLike>> {
  const unique = Array.from(new Set(names.filter(Boolean)));
  if (unique.length === 0) return new Map();
  await dbConnect();
  const crewDocs = (await Crew.find({ name: { $in: unique } }).lean()) as CrewLike[];
  const map = new Map<string, CrewLike>();
  for (const doc of crewDocs) {
    if (doc.name) map.set(doc.name, { _id: doc._id, name: doc.name, phone: doc.phone, email: doc.email });
  }
  return map;
}

// ----------------------------------------------------------------------
// 3. Public emitters - one per booking lifecycle event
// ----------------------------------------------------------------------
async function emitCrewAssignments(booking: BookingLike, assignments: FlatAssignment[]) {
  if (assignments.length === 0) return;
  const phoneMap = await resolveCrewPhones(assignments.map((a) => a.crewName));

  await Promise.all(
    assignments.map(async (a) => {
      const crewContact = phoneMap.get(a.crewName);
      const message = renderCrewAssignment({
        crewName: a.crewName,
        department: a.department,
        date: a.date,
        location: a.location,
        side: a.side,
        occasion: a.occasion,
        brideName: booking.brideName,
        groomName: booking.groomName,
      });

      await dispatchAutomationEvent({
        event: "crew.assigned",
        workflow: "crew",
        recipient: crewContact?.phone,
        data: {
          crewName: a.crewName,
          crewPhone: crewContact?.phone || null,
          crewEmail: crewContact?.email || null,
          department: a.department,
          side: a.side,
          date: a.date,
          location: a.location,
          occasion: a.occasion,
          booking: buildBookingPayload(booking),
          message,
        },
      });
    })
  );
}

export async function emitBookingCreated(booking: BookingLike) {
  await dispatchAutomationEvent({
    event: "booking.created",
    workflow: "booking",
    data: buildBookingPayload(booking),
  });

  if (booking.status === "confirmed") {
    await dispatchAutomationEvent({
      event: "booking.confirmed",
      workflow: "booking",
      recipient: booking.phone,
      data: buildBookingPayload(booking),
    });
  }

  await emitCrewAssignments(booking, flattenAssignments(booking));
}

export async function emitBookingUpdated(prevBooking: BookingLike, nextBooking: BookingLike) {
  await dispatchAutomationEvent({
    event: "booking.updated",
    workflow: "booking",
    data: buildBookingPayload(nextBooking),
  });

  if (prevBooking.status !== nextBooking.status) {
    await dispatchAutomationEvent({
      event: "booking.status_changed",
      workflow: "booking",
      recipient: nextBooking.phone,
      data: {
        previousStatus: prevBooking.status,
        newStatus: nextBooking.status,
        booking: buildBookingPayload(nextBooking),
      },
    });

    if (nextBooking.status === "confirmed") {
      await dispatchAutomationEvent({
        event: "booking.confirmed",
        workflow: "booking",
        recipient: nextBooking.phone,
        data: buildBookingPayload(nextBooking),
      });
    }
    if (nextBooking.status === "all_delivered") {
      await dispatchAutomationEvent({
        event: "booking.gallery_delivered",
        workflow: "delivery",
        recipient: nextBooking.phone,
        data: buildBookingPayload(nextBooking),
      });
    }
    if (nextBooking.status === "cancelled") {
      await dispatchAutomationEvent({
        event: "booking.cancelled",
        workflow: "booking",
        data: buildBookingPayload(nextBooking),
      });
    }
  }

  if (prevBooking.paymentStatus !== nextBooking.paymentStatus) {
    await dispatchAutomationEvent({
      event: "booking.payment_status_changed",
      workflow: "payment",
      recipient: nextBooking.phone,
      data: {
        previousPaymentStatus: prevBooking.paymentStatus,
        newPaymentStatus: nextBooking.paymentStatus,
        booking: buildBookingPayload(nextBooking),
      },
    });
  }

  if (prevBooking.weddingDate !== nextBooking.weddingDate) {
    await dispatchAutomationEvent({
      event: "booking.wedding_date_changed",
      workflow: "booking",
      recipient: nextBooking.phone,
      data: {
        previousWeddingDate: prevBooking.weddingDate,
        newWeddingDate: nextBooking.weddingDate,
        booking: buildBookingPayload(nextBooking),
      },
    });
  }

  const newAssignments = diffNewCrewAssignments(prevBooking, nextBooking);
  await emitCrewAssignments(nextBooking, newAssignments);
}

export async function emitBookingDeleted(booking: BookingLike) {
  await dispatchAutomationEvent({
    event: "booking.deleted",
    workflow: "booking",
    data: buildBookingPayload(booking),
  });
}

export async function emitCrewMemberChanged(
  action: "created" | "updated" | "deleted",
  crew: CrewLike
) {
  await dispatchAutomationEvent({
    event: `crew.${action}`,
    workflow: "crew",
    recipient: crew.phone,
    data: crew,
  });
}

export async function emitReviewApproved(review: {
  _id?: unknown;
  names?: string;
  venue?: string;
  quote?: string;
  rating?: number;
}) {
  await dispatchAutomationEvent({
    event: "review.approved",
    workflow: "delivery",
    data: review,
  });
}
