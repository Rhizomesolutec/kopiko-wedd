import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Slide from "@/models/Slide";
import { verifyAuth } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const slides = await Slide.find({}).sort({ createdAt: 1 });
    return NextResponse.json(slides);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch slides" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await verifyAuth();
    await dbConnect();
    const body = await request.json();

    const { image, tag, title, layoutClass, tagClass, positionClass } = body;

    if (!image || !tag || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slide = await Slide.create({
      image,
      tag,
      title,
      layoutClass: layoutClass || "items-start justify-start text-left",
      tagClass: tagClass || "justify-start",
      positionClass: positionClass || "object-center",
    });

    return NextResponse.json({ success: true, data: slide });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
