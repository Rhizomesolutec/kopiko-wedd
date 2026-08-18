import mongoose, { Schema } from "mongoose";

const ReviewSchema = new Schema(
  {
    names: { type: String, required: true },
    venue: { type: String, required: true },
    quote: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    approved: { type: Boolean, default: true },
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);

export default Review;
