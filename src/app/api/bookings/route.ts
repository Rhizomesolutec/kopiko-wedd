import { NextResponse, after } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { verifyAuth } from "@/lib/auth";
import { emitBookingCreated } from "@/lib/automation";

const eventItemSchema = z.object({
  eventType: z.string().optional(),
  customEventType: z.string().optional(),
  location: z.string().optional(),

  photographyEventType: z.string().optional(),
  photographySubEventType: z.string().optional(),
  photographyCustomEventType: z.string().optional(),
  photographyLocation: z.string().optional(),
  photographyLead: z.string().optional(),
  photographyCrew: z.array(z.string()).optional(),
  photographyCrewBride: z.array(z.string()).optional(),
  photographyCrewGroom: z.array(z.string()).optional(),

  videographyEventType: z.string().optional(),
  videographySubEventType: z.string().optional(),
  videographyCustomEventType: z.string().optional(),
  videographyLocation: z.string().optional(),
  videographyLead: z.string().optional(),
  videographyCrew: z.array(z.string()).optional(),
  videographyCrewBride: z.array(z.string()).optional(),
  videographyCrewGroom: z.array(z.string()).optional(),

  droneEventType: z.string().optional(),
  droneSubEventType: z.string().optional(),
  droneCustomEventType: z.string().optional(),
  droneLocation: z.string().optional(),
  droneLead: z.string().optional(),
  droneCrew: z.array(z.string()).optional(),
  droneCrewBride: z.array(z.string()).optional(),
  droneCrewGroom: z.array(z.string()).optional(),

  assignedLead: z.string().optional(),
  crewMembers: z.array(z.string()).optional(),
});

const dateScheduleSchema = z.object({
  date: z.string(),
  events: z.array(eventItemSchema).optional(),
});

const bookingSchema = z.object({
  brideName: z.string().min(1, "Bride name is required"),
  groomName: z.string().min(1, "Groom name is required"),
  phone: z.string().min(5, "Phone number is required"),
  email: z.string().email("Invalid email format"),
  weddingDate: z.string().min(1, "Wedding date is required"),
  weddingTime: z.string().optional(),
  venue: z.string().min(1, "Venue is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  package: z.string().optional(),
  budget: z.string().optional(),
  services: z.array(z.string()).optional(),
  photographer: z.string().optional(),
  videographer: z.string().optional(),
  paymentStatus: z.string().optional(),
  advancePayment: z.union([z.string(), z.number()]).optional(),
  remainingAmount: z.union([z.string(), z.number()]).optional(),
  pdfUrl: z.string().optional(),
  pdfName: z.string().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  status: z.string().optional(),
  archived: z.boolean().optional(),
  dateSchedules: z.array(dateScheduleSchema).optional(),
});

export async function GET(request: Request) {
  try {
    await verifyAuth();
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const month = searchParams.get("month"); // YYYY-MM

    let query: any = {};

    if (date) {
      query = {
        $or: [{ weddingDate: date }, { "dateSchedules.date": date }],
      };
    } else if (month) {
      query = {
        $or: [
          { weddingDate: { $regex: `^${month}` } },
          { "dateSchedules.date": { $regex: `^${month}` } },
        ],
      };
    }

    const bookings = await Booking.find(query).sort({ weddingDate: 1, createdAt: -1 });
    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error("GET /api/bookings Error:", error);
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Validate with Zod
    const validatedData = bookingSchema.parse(body);

    const booking = await Booking.create(validatedData);

    // Notify n8n (booking created + confirmation + any crew assignments)
    // after the response is sent - never blocks/slows this API call down.
    after(() => emitBookingCreated(booking.toObject()));

    return NextResponse.json({ success: true, data: booking });
  } catch (error: any) {
    console.error("POST /api/bookings Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to submit booking" }, { status: 500 });
  }
}
