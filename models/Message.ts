import mongoose, { Schema } from "mongoose"

export interface IMessage {
  conversationId: mongoose.Types.ObjectId
  senderId: mongoose.Types.ObjectId
  content: string
  read: boolean
  createdAt: Date
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
)

MessageSchema.index({ conversationId: 1, createdAt: 1 })

export default mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema)
