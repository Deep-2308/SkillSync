import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

/**
 * Contact model — stores contact form submissions.
 */
const contactSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 5000 },
    ip: { type: String, select: false },
    readAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.ip;
        return ret;
      },
    },
  }
);

export type ContactDocument = InferSchemaType<typeof contactSchema>;

export const Contact: Model<ContactDocument> =
  (models.Contact as Model<ContactDocument>) || model("Contact", contactSchema);
