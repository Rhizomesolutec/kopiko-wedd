import mongoose, { Schema } from "mongoose";

const SlideSchema = new Schema(
  {
    image: { type: String, required: true },
    tag: { type: String, required: true },
    title: { type: String, required: true },
    layoutClass: { type: String, default: "items-start justify-start text-left" },
    tagClass: { type: String, default: "justify-start" },
    positionClass: { type: String, default: "object-center" },
  },
  { timestamps: true }
);

const Slide = mongoose.models.Slide || mongoose.model("Slide", SlideSchema);

export default Slide;
