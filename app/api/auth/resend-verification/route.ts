import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { User } from "@/models/User";
import { sendEmail, verificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    
    await connectToDatabase();
    
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    if (user.emailVerified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 });
    }
    
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);
    
    user.emailVerificationToken = tokenHash;
    user.emailVerificationExpires = expires;
    
    await user.save();
    
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/verify-email?token=${token}`;
    
    sendEmail({
      to: user.email,
      subject: "Verify your email address",
      html: verificationEmail(verifyUrl, user.name),
      category: "system",
    }).catch(console.error);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[resend-verification] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
