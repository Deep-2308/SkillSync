import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

/**
 * Contract model — created when a proposal is accepted.
 * Links a project, a client (project poster), and a freelancer.
 */
const contractSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    proposalId: {
      type: Schema.Types.ObjectId,
      ref: "Proposal",
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    freelancerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    agreedRate: { type: Number, required: true, min: 0 },
    timeline: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "delivered", "completed", "cancelled", "disputed"],
      default: "active",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    disputeReason: { type: String, maxlength: 1000 },
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

export type ContractDocument = InferSchemaType<typeof contractSchema>;

export const Contract: Model<ContractDocument> =
  (models.Contract as Model<ContractDocument>) || model("Contract", contractSchema);
