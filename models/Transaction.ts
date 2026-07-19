import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITransaction extends Document {
  contractId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  freelancerId: mongoose.Types.ObjectId;
  amount: number; // Stored in dollars
  type: "funding" | "release" | "refund";
  stripePaymentIntentId: string;
  metadata?: Record<string, any>; // Stores card details, receipt URLs, etc.
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    contractId: { type: Schema.Types.ObjectId, ref: "Contract", required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    freelancerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["funding", "release", "refund"], required: true },
    stripePaymentIntentId: { type: String, required: true, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate transaction types per payment intent (e.g. only one funding, one refund per intent)
TransactionSchema.index({ stripePaymentIntentId: 1, type: 1 }, { unique: true });

export const Transaction =
  (mongoose.models.Transaction as Model<ITransaction>) ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
