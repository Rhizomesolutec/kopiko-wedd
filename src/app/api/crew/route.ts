import { NextResponse, after } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/mongodb";
import Crew from "@/models/Crew";
import { verifyAuth } from "@/lib/auth";
import { emitCrewMemberChanged } from "@/lib/automation";

const crewSchema = z.object({
  name: z.string().min(1, "Crew name is required"),
  phone: z.string().min(5, "Phone number is required"),
  email: z.string().optional(),
});

export async function GET() {
  try {
    await verifyAuth();
    await dbConnect();
    const crew = await Crew.find({}).sort({ name: 1 });
    return NextResponse.json(crew);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await verifyAuth();
    await dbConnect();
    const body = await request.json();

    const validatedData = crewSchema.parse(body);

    const crew = await Crew.create(validatedData);

    after(() => emitCrewMemberChanged("created", crew.toObject()));

    return NextResponse.json({ success: true, data: crew });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to add crew member" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
