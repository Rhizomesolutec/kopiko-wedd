import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import WeddingFilm from "@/models/WeddingFilm";
import { verifyAuth } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const films = await WeddingFilm.find({}).sort({ createdAt: -1 });
    return NextResponse.json(films);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch films" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await verifyAuth();
    await dbConnect();
    const body = await request.json();

    const { couple, location, duration, thumbnail, videoUrl, description, hidden } = body;

    if (!couple || !location || !duration || !thumbnail || !videoUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const film = await WeddingFilm.create({
      couple,
      location,
      duration,
      thumbnail,
      videoUrl,
      description: description || "",
      hidden: hidden === undefined ? false : hidden,
    });

    return NextResponse.json({ success: true, data: film });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
