import mongoose, { Schema } from "mongoose";

const SettingsSchema = new Schema(
  {
    heroTitle: { type: String, default: "Documenting Love with Poetic Elegance & Unspoken Depth" },
    heroSubtitle: { type: String, default: "Fine Art Wedding Photographers" },
    heroVideo: { type: String, default: "" },
    logo: { type: String, default: "/showcase/kopiko.png" },
    instagramUrl: { type: String, default: "https://www.instagram.com/kopiko_wedd/" },
    whatsappNumber: { type: String, default: "+919544636566" },
    contactEmail: { type: String, default: "" },
  },
  { timestamps: true }
);

const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);

export default Settings;
