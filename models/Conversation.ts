import mongoose, { Document, Model, Schema } from "mongoose";

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  contractId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  lastMessageAt: Date;
  unreadCounts: {
    userId: mongoose.Types.ObjectId;
    count: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: true,
      validate: [
        (val: mongoose.Types.ObjectId[]) => val.length === 2,
        "A conversation must have exactly two participants.",
      ],
    },
    contractId: { type: Schema.Types.ObjectId, ref: "Contract" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    lastMessageAt: { type: Date, default: Date.now },
    unreadCounts: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        count: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// To prevent duplicate threads between the same two users unless context explicitly requires it,
// we ensure the participants array is sorted when creating, and use a unique compound index.
// If context is provided, they can have multiple threads (e.g. one for each contract).
// If no context, they share a general thread.
ConversationSchema.index(
  { participants: 1, contractId: 1, projectId: 1 },
  { unique: true }
);

ConversationSchema.index({ lastMessageAt: -1 });

export const Conversation =
  (mongoose.models.Conversation as Model<IConversation>) ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);
