import dbConnect from "@/lib/mongodb";
import AutomationLog from "@/models/AutomationLog";
import { getAutomationEnv, isAutomationConfigured } from "@/lib/env";

export interface N8nEventPayload {
  /** Dot-namespaced event name, e.g. "booking.created", "crew.assigned" */
  event: string;
  /** Which n8n workflow this maps to - purely informational, used for logging */
  workflow: string;
  /** Arbitrary structured data for the event (booking payload, crew info, etc.) */
  data: unknown;
  /** Optional recipient phone number this specific event concerns (for logging) */
  recipient?: string;
}

const MAX_ATTEMPTS = 2; // keep total worst-case latency bounded for API routes
const ATTEMPT_TIMEOUT_MS = 5000;
const RETRY_DELAY_MS = 800;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postWithTimeout(url: string, body: string, headers: Record<string, string>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

async function writeLog(entry: {
  workflow: string;
  event: string;
  status: "success" | "failed" | "skipped";
  recipient?: string;
  error?: string;
  retryCount?: number;
  payload?: unknown;
}) {
  try {
    await dbConnect();
    await AutomationLog.create({
      direction: "outgoing",
      ...entry,
    });
  } catch (err) {
    // Never let logging failures affect the caller - just surface in server logs.
    console.error("AutomationLog write failed:", err);
  }
}

/**
 * Sends a single structured event to the configured n8n webhook.
 *
 * Design notes:
 *  - NEVER throws. Every failure path is caught, logged to AutomationLog,
 *    and resolved so callers (booking/crew API routes) never break because
 *    n8n or WhatsApp is misconfigured or temporarily down.
 *  - Retries once on network failure/non-2xx with a short backoff, then
 *    gives up - n8n itself can be configured with its own retry/error
 *    workflow for anything that needs stronger guarantees.
 *  - Skips entirely (status "skipped") when N8N_WEBHOOK_URL isn't set, so
 *    local development without n8n configured stays silent and fast.
 */
export async function dispatchAutomationEvent(input: N8nEventPayload): Promise<boolean> {
  const env = getAutomationEnv();

  if (!isAutomationConfigured()) {
    await writeLog({
      workflow: input.workflow,
      event: input.event,
      status: "skipped",
      recipient: input.recipient,
      error: "N8N_WEBHOOK_URL not configured",
      payload: input.data,
    });
    return false;
  }

  const body = JSON.stringify({
    event: input.event,
    workflow: input.workflow,
    timestamp: new Date().toISOString(),
    data: input.data,
  });

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (env.AUTOMATION_API_SECRET) {
    headers["x-automation-secret"] = env.AUTOMATION_API_SECRET;
  }

  let lastError = "";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await postWithTimeout(env.N8N_WEBHOOK_URL as string, body, headers);
      if (res.ok) {
        await writeLog({
          workflow: input.workflow,
          event: input.event,
          status: "success",
          recipient: input.recipient,
          retryCount: attempt - 1,
          payload: input.data,
        });
        return true;
      }
      lastError = `n8n responded with HTTP ${res.status}`;
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      lastError = e?.name === "AbortError" ? "Request timed out" : e?.message || "Network error";
    }

    if (attempt < MAX_ATTEMPTS) {
      await sleep(RETRY_DELAY_MS);
    }
  }

  console.error(`n8n dispatch failed for event "${input.event}":`, lastError);
  await writeLog({
    workflow: input.workflow,
    event: input.event,
    status: "failed",
    recipient: input.recipient,
    error: lastError,
    retryCount: MAX_ATTEMPTS - 1,
    payload: input.data,
  });
  return false;
}

/**
 * Fire-and-forget wrapper for use inside API routes: kicks off the
 * dispatch but never awaits/blocks the HTTP response, and swallows any
 * unexpected error so a slow/broken n8n instance can never delay or break
 * booking/crew CRUD operations.
 */
export function dispatchAutomationEventAsync(input: N8nEventPayload): void {
  dispatchAutomationEvent(input).catch((err) => {
    console.error("Unexpected automation dispatch error:", err);
  });
}
