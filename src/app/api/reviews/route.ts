import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";

const reviewSchema = z.object({
  names: z.string().min(1, "Names are required"),
  venue: z.string().min(1, "Venue/Location is required"),
  quote: z.string().min(1, "Review text is required"),
  rating: z.number().min(1).max(5),
});

export async function GET() {
  try {
    await dbConnect();
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const validatedData = reviewSchema.parse(body);

    const review = await Review.create({
      ...validatedData,
      approved: true, // Auto-approve for now, admin can hide
      hidden: false,
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
