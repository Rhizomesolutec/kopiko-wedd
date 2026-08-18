import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Settings from "@/models/Settings";
import { verifyAuth } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    let settings = await Settings.findOne({});
    if (!settings) {
      // Seed dynamically if missing
      settings = await Settings.create({
        heroTitle: "Documenting Love with Poetic Elegance & Unspoken Depth",
        heroSubtitle: "Fine Art Wedding Photographers",
        heroVideo: "",
        logo: "/showcase/kopiko.png",
        instagramUrl: "https://www.instagram.com/kopiko_wedd/",
        whatsappNumber: "+919544636566",
        contactEmail: "",
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await verifyAuth();
    await dbConnect();
    const body = await request.json();

    let settings = await Settings.findOne({});
    if (!settings) {
      settings = await Settings.create(body);
    } else {
      settings = await Settings.findByIdAndUpdate(settings._id, body, { new: true });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
