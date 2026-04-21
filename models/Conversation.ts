import mongoose, { Schema } from "mongoose"

export interface IConversation {
  participants: mongoose.Types.ObjectId[]
  projectId: mongoose.Types.ObjectId
  lastMessage: string
  lastMessageAt: Date
  createdAt: Date
  updatedAt: Date
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

ConversationSchema.index({ participants: 1 })
ConversationSchema.index({ lastMessageAt: -1 })

export default mongoose.models.Conversation || mongoose.model<IConversation>("Conversation", ConversationSchema)
