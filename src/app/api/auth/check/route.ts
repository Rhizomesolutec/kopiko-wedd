import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("kopiko_token");

    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ authenticated: false, error: "Token not found" }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(tokenCookie.value, process.env.JWT_SECRET || "kopikoweddingsecret2026jwttoken") as any;
      return NextResponse.json({ authenticated: true, username: decoded.username });
    } catch (err) {
      return NextResponse.json({ authenticated: false, error: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ authenticated: false, error: "Internal Server Error" }, { status: 500 });
  }
}
