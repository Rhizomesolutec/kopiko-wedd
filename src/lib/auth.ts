import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function verifyAuth() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("kopiko_token");

  if (!tokenCookie || !tokenCookie.value) {
    throw new Error("Unauthorized");
  }

  try {
    const decoded = jwt.verify(tokenCookie.value, process.env.JWT_SECRET || "kopikoweddingsecret2026jwttoken");
    return decoded;
  } catch (err) {
    throw new Error("Unauthorized");
  }
}
