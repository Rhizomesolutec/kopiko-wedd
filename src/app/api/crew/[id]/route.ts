import { NextResponse, after } from "next/server";
import dbConnect from "@/lib/mongodb";
import Crew from "@/models/Crew";
import { verifyAuth } from "@/lib/auth";
import { emitCrewMemberChanged } from "@/lib/automation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth();
    const { id } = await params;
    await dbConnect();
    const body = await request.json();

    const updatedCrew = await Crew.findByIdAndUpdate(id, body, { new: true });
    if (!updatedCrew) {
      return NextResponse.json({ error: "Crew member not found" }, { status: 404 });
    }

    after(() => emitCrewMemberChanged("updated", updatedCrew.toObject()));

    return NextResponse.json({ success: true, data: updatedCrew });
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

    const deletedCrew = await Crew.findByIdAndDelete(id);
    if (!deletedCrew) {
      return NextResponse.json({ error: "Crew member not found" }, { status: 404 });
    }

    after(() => emitCrewMemberChanged("deleted", deletedCrew.toObject()));

    return NextResponse.json({ success: true, message: "Crew member deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
