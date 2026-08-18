import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/** Returns true only when real Cloudinary credentials are configured */
function hasCloudinaryConfig(): boolean {
  const name = process.env.CLOUDINARY_CLOUD_NAME || "";
  const key = process.env.CLOUDINARY_API_KEY || "";
  const secret = process.env.CLOUDINARY_API_SECRET || "";
  return (
    name !== "" &&
    name !== "placeholder" &&
    key !== "" &&
    key !== "placeholder" &&
    secret !== "" &&
    secret !== "placeholder"
  );
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("kopiko_token");

    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      jwt.verify(tokenCookie.value, process.env.JWT_SECRET || "kopikoweddingsecret2026jwttoken");
    } catch (err) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "kopiko";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const resourceType = file.type.startsWith("video/")
      ? "video"
      : file.type === "application/pdf" || file.name.endsWith(".pdf")
      ? "raw"
      : "image";

    // Use Cloudinary when real credentials are configured; otherwise save locally
    if (hasCloudinaryConfig()) {
      const result = await uploadToCloudinary(buffer, folder, resourceType);
      return NextResponse.json({
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        name: file.name,
      });
    }

    // ── Local fallback: save to public/uploads/<folder>/ ──────────────────────
    const ext = file.name.split(".").pop() || "pdf";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, safeName), buffer);
    const publicUrl = `/uploads/${folder}/${safeName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      public_id: publicUrl,
      name: file.name,
    });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
