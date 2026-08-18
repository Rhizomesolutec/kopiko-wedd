import { NextResponse, after } from "next/server";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import { verifyAuth } from "@/lib/auth";
import { emitReviewApproved } from "@/lib/automation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth();
    const { id } = await params;
    await dbConnect();
    const body = await request.json();

    const previousReview = body.approved !== undefined
      ? ((await Review.findById(id).lean()) as { approved?: boolean } | null)
      : null;

    const updatedReview = await Review.findByIdAndUpdate(id, body, { new: true });
    if (!updatedReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Only fire when approval actually flips false/undefined -> true.
    if (body.approved === true && !previousReview?.approved) {
      after(() => emitReviewApproved(updatedReview.toObject()));
    }

    return NextResponse.json({ success: true, data: updatedReview });
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

    const deletedReview = await Review.findByIdAndDelete(id);
    if (!deletedReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Review deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
