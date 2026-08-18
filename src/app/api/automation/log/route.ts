import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/mongodb";
import AutomationLog from "@/models/AutomationLog";
import { verifyAutomationSecret } from "@/lib/automationAuth";
import { verifyAuth } from "@/lib/auth";
import { getErrorMessage, statusForError } from "@/lib/errors";

// n8n calls this AFTER it attempts to send a WhatsApp message (or after any
// workflow step) to report back what happened. This is what lets the studio
// admin see automation history/failures without needing access to n8n itself.
//
// Accepts either a single log entry or an array of entries (n8n's "Split In
// Batches" + HTTP Request pattern often ends up sending one row at a time,
// but a bulk array is supported too for efficiency).

const logEntrySchema = z.object({
  workflow: z.string().min(1),
  event: z.string().min(1),
  status: z.enum(["success", "failed", "skipped"]).default("success"),
  recipient: z.string().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
  retryCount: z.number().optional(),
  payload: z.unknown().optional(),
});

const bodySchema = z.union([logEntrySchema, z.array(logEntrySchema)]);

export async function POST(request: Request) {
  try {
    verifyAutomationSecret(request);
    await dbConnect();

    const body = await request.json();
    const parsed = bodySchema.parse(body);
    const entries = Array.isArray(parsed) ? parsed : [parsed];

    const docs = await AutomationLog.insertMany(
      entries.map((entry) => ({ ...entry, direction: "incoming" }))
    );

    return NextResponse.json({ success: true, count: docs.length });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    const message = getErrorMessage(error, "Failed to record automation log");
    return NextResponse.json({ error: message }, { status: statusForError(message) });
  }
}

// Lets the studio admin (or a future "Automation Logs" UI panel) fetch
// recent automation activity for debugging. Uses normal admin-cookie auth
// (not the n8n shared secret) since this is meant to be browsed by a
// logged-in human, e.g. from the browser or a future admin panel tab.
export async function GET(request: Request) {
  try {
    await verifyAuth();
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
    const workflow = searchParams.get("workflow");

    const query: Record<string, string> = {};
    if (workflow) query.workflow = workflow;

    const logs = await AutomationLog.find(query).sort({ createdAt: -1 }).limit(limit);
    return NextResponse.json(logs);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    return NextResponse.json({ error: message }, { status: statusForError(message) });
  }
}
