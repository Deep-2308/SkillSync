import mongoose, { Document, Model, Schema } from "mongoose";

export interface IWithdrawalRequest extends Document {
  freelancerId: mongoose.Types.ObjectId;
  amount: number; // Stored in dollars
  status: "pending" | "processed" | "rejected";
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalRequestSchema = new Schema<IWithdrawalRequest>(
  {
    freelancerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "processed", "rejected"], default: "pending" },
    adminNote: { type: String, maxlength: 1000 },
  },
  {
    timestamps: true,
  }
);

export const WithdrawalRequest =
  (mongoose.models.WithdrawalRequest as Model<IWithdrawalRequest>) ||
  mongoose.model<IWithdrawalRequest>("WithdrawalRequest", WithdrawalRequestSchema);
