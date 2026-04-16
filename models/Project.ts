import mongoose, { Schema } from "mongoose"

export interface IProject {
  title: string
  description: string
  category: string
  skills: string[]
  budget: number
  duration: number
  expertiseLevel: string
  clientId: mongoose.Types.ObjectId
  freelancerId?: mongoose.Types.ObjectId
  status: "open" | "in-progress" | "completed" | "cancelled"
  email: string
  createdAt: Date
  updatedAt: Date
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    skills: [{ type: String }],
    budget: { type: Number, default: 0 },
    duration: { type: Number, default: 20 },
    expertiseLevel: { type: String, default: "mid" },
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    freelancerId: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["open", "in-progress", "completed", "cancelled"],
      default: "open",
    },
    email: { type: String },
  },
  { timestamps: true }
)

ProjectSchema.index({ status: 1, createdAt: -1 })
ProjectSchema.index({ clientId: 1 })

export default mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema)
