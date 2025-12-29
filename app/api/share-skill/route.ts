import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Skill from "@/models/Skill"

export async function POST(request: Request) {
    try {
        await dbConnect()
        const body = await request.json()
        const { title, category, experience, rate, description, portfolioUrl } = body

        // Validation
        if (!title || title.length < 3) {
            return NextResponse.json(
                { error: "Title must be at least 3 characters long" },
                { status: 400 }
            )
        }

        if (!category) {
            return NextResponse.json(
                { error: "Category is required" },
                { status: 400 }
            )
        }

        if (!experience) {
            return NextResponse.json(
                { error: "Experience level is required" },
                { status: 400 }
            )
        }

        if (!rate || isNaN(Number(rate)) || Number(rate) <= 0) {
            return NextResponse.json(
                { error: "Hourly rate must be a positive number" },
                { status: 400 }
            )
        }

        if (!description || description.length < 10) {
            return NextResponse.json(
                { error: "Description must be at least 10 characters long" },
                { status: 400 }
            )
        }

        // Create new Skill
        const skill = await Skill.create({
            title,
            category,
            experience,
            rate: Number(rate),
            description,
            portfolioUrl,
        })

        return NextResponse.json(
            { message: "Skill shared successfully!", data: skill },
            { status: 200 }
        )

    } catch (error) {
        console.error("Error processing share skill request:", error)
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        )
    }
}
