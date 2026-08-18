import mongoose, { Schema } from "mongoose";

const WeddingFilmSchema = new Schema(
  {
    couple: { type: String, required: true },
    location: { type: String, required: true },
    duration: { type: String, required: true },
    thumbnail: { type: String, required: true },
    videoUrl: { type: String, required: true },
    description: { type: String, required: true },
    featured: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const WeddingFilm = mongoose.models.WeddingFilm || mongoose.model("WeddingFilm", WeddingFilmSchema);

export default WeddingFilm;
