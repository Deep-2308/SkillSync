import mongoose, { Schema } from "mongoose"

export interface IProposal {
  _id?: string
  projectId: mongoose.Types.ObjectId
  freelancerId: mongoose.Types.ObjectId
  coverLetter: string
  proposedBudget: number
  timeline: number
  status: "pending" | "accepted" | "rejected"
  createdAt: Date
  updatedAt: Date
}

const ProposalSchema = new Schema<IProposal>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    freelancerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    coverLetter: { type: String, required: true },
    proposedBudget: { type: Number, required: true },
    timeline: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
)

ProposalSchema.index({ projectId: 1, createdAt: -1 })
ProposalSchema.index({ freelancerId: 1, createdAt: -1 })
// Prevent duplicate proposals from same freelancer on same project
ProposalSchema.index({ projectId: 1, freelancerId: 1 }, { unique: true })

export default mongoose.models.Proposal || mongoose.model<IProposal>("Proposal", ProposalSchema)
