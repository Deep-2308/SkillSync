import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { cookies } from "next/headers"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

// POST /api/users/portfolio — Add a portfolio item
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    await dbConnect()

    const body = await req.json()
    const { title, description, link, image } = body

    if (!title || title.trim().length < 2) {
      return NextResponse.json({ error: "Title is required (min 2 chars)" }, { status: 400 })
    }

    const user = await User.findByIdAndUpdate(
      payload.userId,
      {
        $push: {
          portfolio: {
            title: title.trim(),
            description: description?.trim() || "",
            link: link?.trim() || "",
            image: image?.trim() || "",
          },
        },
      },
      { new: true }
    ).select("-hashedPassword -resetToken -resetTokenExpiry")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ portfolio: user.portfolio })
  } catch (error) {
    console.error("Portfolio add error:", error)
    return NextResponse.json({ error: "Failed to add portfolio item" }, { status: 500 })
  }
}

// DELETE /api/users/portfolio — Remove a portfolio item
export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(req.url)
    const itemId = searchParams.get("id")

    if (!itemId) {
      return NextResponse.json({ error: "Portfolio item ID is required" }, { status: 400 })
    }

    const user = await User.findByIdAndUpdate(
      payload.userId,
      { $pull: { portfolio: { _id: itemId } } },
      { new: true }
    ).select("-hashedPassword -resetToken -resetTokenExpiry")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ portfolio: user.portfolio })
  } catch (error) {
    console.error("Portfolio delete error:", error)
    return NextResponse.json({ error: "Failed to delete portfolio item" }, { status: 500 })
  }
}
