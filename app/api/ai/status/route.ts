import { NextResponse } from "next/server";
import { aiEnabled } from "@/lib/ai";

export async function GET() {
  return NextResponse.json({ enabled: aiEnabled() });
}
