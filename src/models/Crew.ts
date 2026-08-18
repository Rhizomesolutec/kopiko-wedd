import mongoose, { Schema } from "mongoose";

const CrewSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
  },
  { timestamps: true }
);

const Crew = mongoose.models.Crew || mongoose.model("Crew", CrewSchema);

export default Crew;
