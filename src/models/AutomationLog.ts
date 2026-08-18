import mongoose, { Schema } from "mongoose";

// Stores an audit trail of every automation dispatch, both:
//  - Outgoing: Next.js -> n8n (booking.created, crew.changed, etc.)
//  - Incoming: n8n -> Next.js reporting back a WhatsApp send result
// This is what powers the "Automation Logs" debugging view and lets us
// see failures/retries without needing to dig through n8n's own logs.
const AutomationLogSchema = new Schema(
  {
    workflow: { type: String, required: true }, // e.g. "booking", "crew", "reminder", "daily-summary"
    event: { type: String, required: true }, // e.g. "booking.created", "crew.assigned"
    direction: {
      type: String,
      enum: ["outgoing", "incoming"],
      default: "outgoing",
    },
    status: {
      type: String,
      enum: ["success", "failed", "skipped"],
      default: "success",
    },
    recipient: { type: String, default: "" }, // phone number the message concerned, if any
    message: { type: String, default: "" }, // rendered WhatsApp message text, if any
    error: { type: String, default: "" },
    retryCount: { type: Number, default: 0 },
    payload: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

AutomationLogSchema.index({ createdAt: -1 });
AutomationLogSchema.index({ workflow: 1, event: 1 });

const AutomationLog =
  mongoose.models.AutomationLog || mongoose.model("AutomationLog", AutomationLogSchema);

export default AutomationLog;
