import mongoose, { Schema } from "mongoose"

export interface ISkill {
    title: string
    category: string
    experience: string
    rate: number
    description: string
    portfolioUrl?: string
    createdAt: Date
}

const SkillSchema = new Schema<ISkill>(
    {
        title: { type: String, required: true },
        category: { type: String, required: true },
        experience: { type: String, required: true },
        rate: { type: Number, required: true, min: 0 },
        description: { type: String, required: true },
        portfolioUrl: { type: String },
        createdAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
)

export default mongoose.models.Skill || mongoose.model<ISkill>("Skill", SkillSchema)
