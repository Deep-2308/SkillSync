import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Contact from "@/models/Contact"

export async function POST(request: Request) {
    try {
        await dbConnect()
        const body = await request.json()
        const { firstName, lastName, email, message } = body

        // Validation
        if (!firstName || !lastName) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            )
        }

        if (!email || !email.includes("@")) {
            return NextResponse.json(
                { error: "Valid email is required" },
                { status: 400 }
            )
        }

        if (!message || message.length < 10) {
            return NextResponse.json(
                { error: "Message must be at least 10 characters long" },
                { status: 400 }
            )
        }

        // Create new Contact
        const contact = await Contact.create({
            firstName,
            lastName,
            email,
            message,
        })

        return NextResponse.json(
            { message: "Message sent successfully!", data: contact },
            { status: 200 }
        )

    } catch (error) {
        console.error("Error processing contact request:", error)
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        )
    }
}
