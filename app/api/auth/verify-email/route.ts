import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/dashboard?error=MissingVerificationToken", request.url));
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    await connectToDatabase();

    const user = await User.findOne({
      emailVerificationToken: tokenHash,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.redirect(new URL("/dashboard?error=InvalidOrExpiredVerificationToken", request.url));
    }

    user.emailVerified = new Date();
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    
    await user.save();

    return NextResponse.redirect(new URL("/dashboard?verified=true", request.url));
  } catch (error) {
    console.error("[verify-email] Error:", error);
    return NextResponse.redirect(new URL("/dashboard?error=VerificationFailed", request.url));
  }
}
