import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import { verifyAuth } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const galleries = await Gallery.find({}).sort({ createdAt: 1 });
    return NextResponse.json(galleries);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch galleries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await verifyAuth();
    await dbConnect();
    const body = await request.json();

    const { couple, location, date, quote, storySnippet, heroImage, images, galleryPreview, hidden } = body;

    if (!couple || !location || !date || !heroImage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const gallery = await Gallery.create({
      couple,
      location,
      date,
      quote: quote || "",
      storySnippet: storySnippet || "",
      heroImage,
      images: images || [],
      galleryPreview: galleryPreview || [],
      hidden: hidden === undefined ? false : hidden,
    });

    return NextResponse.json({ success: true, data: gallery });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
