import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AutomationLog from "@/models/AutomationLog";
import { getAutomationEnv } from "@/lib/env";

// ----------------------------------------------------------------------
// WhatsApp Cloud API webhook (Meta side)
// ----------------------------------------------------------------------
// This endpoint is what you paste into Meta's "WhatsApp > Configuration >
// Webhook" screen. It is NOT used by n8n - n8n calls WhatsApp directly via
// HTTP Request nodes. This endpoint exists so Meta can:
//   1. Verify the webhook URL (GET, one-time handshake)
//   2. Deliver inbound events - message status updates (sent/delivered/
//      read/failed) and any replies clients send back (POST)
//
// For now inbound events are just logged to AutomationLog for visibility.
// This keeps the door open for future features (e.g. auto-replying to
// crew "OK" confirmations, or detecting client replies) without any
// architecture changes.

export async function GET(request: Request) {
  const env = getAutomationEnv();
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && env.WHATSAPP_VERIFY_TOKEN && token === env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge || "", { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    await dbConnect();
    await AutomationLog.create({
      workflow: "whatsapp-inbound",
      event: "whatsapp.webhook_event",
      direction: "incoming",
      status: "success",
      payload: body,
    });

    // Always 200 quickly - Meta disables webhooks that respond slowly or
    // with errors, regardless of what we do with the payload internally.
    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("WhatsApp webhook error:", error);
    // Still 200 so Meta doesn't retry-storm us for a logging failure.
    return NextResponse.json({ received: true });
  }
}
