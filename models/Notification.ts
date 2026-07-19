import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

/**
 * Notification model — in-app notifications fanned out by API mutations
 * (contract status changes, new proposals, review prompts, admin actions).
 */
const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "contract_update",
        "review_prompt",
        "review_received",
        "proposal_received",
        "proposal_update",
        "new_message",
        "system",
      ],
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    body: { type: String, default: "", maxlength: 1000 },
    /** In-app path the notification links to (e.g. /contracts/abc123). */
    link: { type: String, default: "" },
    read: { type: Boolean, default: false },
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

// The two hot paths: unread badge count, and the paginated inbox.
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

export type NotificationDocument = InferSchemaType<typeof notificationSchema>;

export const Notification: Model<NotificationDocument> =
  (models.Notification as Model<NotificationDocument>) ||
  model("Notification", notificationSchema);
