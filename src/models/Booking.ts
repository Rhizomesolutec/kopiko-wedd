import mongoose, { Schema } from "mongoose";

const EventItemSchema = new Schema({
  eventType: { type: String, default: "Wedding" },
  customEventType: { type: String, default: "" },
  location: { type: String, default: "" },

  // Photography Department
  photographyEventType: { type: String, default: "Bride" },
  photographySubEventType: { type: String, default: "" },
  photographyCustomEventType: { type: String, default: "" },
  photographyLocation: { type: String, default: "" },
  photographyLead: { type: String, default: "" },
  photographyCrew: { type: [String], default: [] },
  photographyCrewBride: { type: [String], default: [] },
  photographyCrewGroom: { type: [String], default: [] },

  // Videography Department
  videographyEventType: { type: String, default: "Groom" },
  videographySubEventType: { type: String, default: "" },
  videographyCustomEventType: { type: String, default: "" },
  videographyLocation: { type: String, default: "" },
  videographyLead: { type: String, default: "" },
  videographyCrew: { type: [String], default: [] },
  videographyCrewBride: { type: [String], default: [] },
  videographyCrewGroom: { type: [String], default: [] },

  // Drone Department
  droneEventType: { type: String, default: "Both" },
  droneSubEventType: { type: String, default: "" },
  droneCustomEventType: { type: String, default: "" },
  droneLocation: { type: String, default: "" },
  droneLead: { type: String, default: "" },
  droneCrew: { type: [String], default: [] },
  droneCrewBride: { type: [String], default: [] },
  droneCrewGroom: { type: [String], default: [] },

  // Backward compatibility fields
  assignedLead: { type: String, default: "" },
  crewMembers: { type: [String], default: [] },
});

const DateScheduleSchema = new Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  events: [EventItemSchema],
});

const BookingSchema = new Schema(
  {
    brideName: { type: String, required: true },
    groomName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    weddingDate: { type: String, required: true, index: true },
    weddingTime: { type: String, default: "10:00 AM" },
    venue: { type: String, required: true },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },
    package: { type: String, default: "Standard" },
    budget: { type: String, default: "" },
    services: { type: [String], default: [] },
    photographer: { type: String, default: "" },
    videographer: { type: String, default: "" },
    paymentStatus: {
      type: String,
      default: "unpaid",
    },
    advancePayment: { type: String, default: "0" },
    remainingAmount: { type: String, default: "0" },
    pdfUrl: { type: String, default: "" },
    pdfName: { type: String, default: "" },
    notes: { type: String, default: "" },
    internalNotes: { type: String, default: "" },
    status: {
      type: String,
      default: "confirmed",
    },
    archived: { type: Boolean, default: false },
    dateSchedules: [DateScheduleSchema],
  },
  { timestamps: true }
);

// Index weddingDate and dateSchedules.date for fast calendar query performance
BookingSchema.index({ weddingDate: 1 });
BookingSchema.index({ "dateSchedules.date": 1 });

// Delete model cache in development to prevent stale schema validation errors
if (mongoose.models && mongoose.models.Booking) {
  delete (mongoose.models as any).Booking;
}

const Booking = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);

export default Booking;
