import { NextResponse, after } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { verifyAuth } from "@/lib/auth";
import { emitBookingUpdated, emitBookingDeleted } from "@/lib/automation";
import type { BookingLike } from "@/lib/automation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth();
    const { id } = await params;
    await dbConnect();
    const body = await request.json();

    // Snapshot the pre-update doc so automation can diff status/payment/
    // wedding date/crew changes and only notify on what actually changed.
    const previousBooking = await Booking.findById(id).lean();

    const updatedBooking = await Booking.findByIdAndUpdate(id, body, { new: true });
    if (!updatedBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (previousBooking) {
      after(() => emitBookingUpdated(previousBooking as unknown as BookingLike, updatedBooking.toObject()));
    }

    return NextResponse.json({ success: true, data: updatedBooking });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth();
    const { id } = await params;
    await dbConnect();

    const deletedBooking = await Booking.findByIdAndDelete(id);
    if (!deletedBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    after(() => emitBookingDeleted(deletedBooking.toObject()));

    return NextResponse.json({ success: true, message: "Booking deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
