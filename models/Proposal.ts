import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

/**
 * Proposal model — a bid by an expert (provider) on a project.
 */
const proposalSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    freelancerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: { type: String, required: true, maxlength: 3000 },
    proposedRate: { type: Number, required: true, min: 0 },
    timeline: { type: String, required: true, maxlength: 200 },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound unique index: one proposal per freelancer per project.
proposalSchema.index({ projectId: 1, freelancerId: 1 }, { unique: true });

export type ProposalDocument = InferSchemaType<typeof proposalSchema>;

export const Proposal: Model<ProposalDocument> =
  (models.Proposal as Model<ProposalDocument>) || model("Proposal", proposalSchema);
