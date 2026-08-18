import { getAutomationEnv } from "./env";

/**
 * Verifies the shared-secret header ("x-automation-secret") that n8n must
 * send on every request into our automation endpoints:
 *   - GET  /api/automation/reminders
 *   - GET  /api/automation/reports
 *   - POST /api/automation/log
 *
 * This is intentionally a simple shared-secret check (not full HMAC
 * signing) to keep the n8n side easy to configure (just one "Header Auth"
 * credential in n8n pointing at the same secret). Throws "Unauthorized" on
 * any mismatch, same convention as verifyAuth() in src/lib/auth.ts.
 */
export function verifyAutomationSecret(request: Request) {
  const env = getAutomationEnv();

  if (!env.AUTOMATION_API_SECRET) {
    // No secret configured yet - allow local/dev testing but make it loud
    // in the server logs so nobody accidentally ships this to production.
    console.warn(
      "⚠️  AUTOMATION_API_SECRET is not set - automation endpoints are UNPROTECTED. Set it in .env.local before going live."
    );
    return;
  }

  const provided = request.headers.get("x-automation-secret");
  if (!provided || provided !== env.AUTOMATION_API_SECRET) {
    throw new Error("Unauthorized");
  }
}
