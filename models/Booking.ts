import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

/**
 * Booking model — a scheduled session between a client and a provider for a
 * given skill. `totalPrice` is denormalized at creation time so historical
 * bookings are unaffected by later rate changes.
 */
const bookingSchema = new Schema(
  {
    skillId: {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    scheduledFor: { type: Date, required: true },
    durationMinutes: { type: Number, required: true, min: 15, max: 480 },
    totalPrice: { type: Number, required: true, min: 0 },
    notes: { type: String, maxlength: 1000, default: "" },
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

export type BookingDocument = InferSchemaType<typeof bookingSchema>;

export const Booking: Model<BookingDocument> =
  (models.Booking as Model<BookingDocument>) || model("Booking", bookingSchema);
