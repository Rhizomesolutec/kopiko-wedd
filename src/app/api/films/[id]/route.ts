import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import WeddingFilm from "@/models/WeddingFilm";
import { verifyAuth } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth();
    const { id } = await params;
    await dbConnect();
    const body = await request.json();

    const updatedFilm = await WeddingFilm.findByIdAndUpdate(id, body, { new: true });
    if (!updatedFilm) {
      return NextResponse.json({ error: "Film not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedFilm });
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

    const deletedFilm = await WeddingFilm.findByIdAndDelete(id);
    if (!deletedFilm) {
      return NextResponse.json({ error: "Film not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Film deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
