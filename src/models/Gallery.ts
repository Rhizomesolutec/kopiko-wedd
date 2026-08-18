import mongoose, { Schema } from "mongoose";

const GallerySchema = new Schema(
  {
    couple: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: String, required: true },
    quote: { type: String, required: true },
    storySnippet: { type: String, required: true },
    heroImage: { type: String, required: true },
    images: { type: [String], required: true },
    galleryPreview: { type: [String], required: true },
    featured: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Gallery = mongoose.models.Gallery || mongoose.model("Gallery", GallerySchema);

export default Gallery;
