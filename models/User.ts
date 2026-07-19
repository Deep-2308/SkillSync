import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

/**
 * User model.
 *
 * `passwordHash` uses `select: false` so it is never returned by default
 * queries — you must opt in with `.select("+passwordHash")` (as auth.ts does).
 * OAuth-only users won't have a passwordHash at all.
 */
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, select: false },
    /** Hashed reset token — stored as SHA-256 hex, never the raw token. */
    passwordResetToken: { type: String, select: false },
    /** Expiry timestamp for the reset token (1 hour from generation). */
    passwordResetExpires: { type: Date, select: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    image: { type: String, default: null },
    role: {
      type: String,
      enum: ["client", "freelancer", "admin"],
    },
    categories: { type: [String], default: [] },
    notificationPreferences: {
      type: {
        proposals: { type: Boolean, default: true },
        contracts: { type: Boolean, default: true },
        payments: { type: Boolean, default: true },
        reviews: { type: Boolean, default: true },
      },
      default: () => ({ proposals: true, contracts: true, payments: true, reviews: true }),
    },
    headline: { type: String, maxlength: 120, default: "" },
    bio: { type: String, maxlength: 2000, default: "" },
    location: { type: String, maxlength: 120, default: "" },
    hourlyRate: { type: Number, min: 0 },
    skills: { type: [String], default: [] },
    emailVerified: { type: Date, default: null },

    /* --- Review aggregates (denormalized; recalculated on every review WRITE,
           never on read — see POST /api/reviews) --- */
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0, min: 0 },
    /** Count of reviews per star value, keys "1".."5". */
    ratingBreakdown: {
      type: Map,
      of: Number,
      default: () => new Map([["1", 0], ["2", 0], ["3", 0], ["4", 0], ["5", 0]]),
    },

    /* --- Moderation & engagement --- */
    banned: { type: Boolean, default: false, index: true },
    profileViews: { type: Number, default: 0, min: 0 },
    savedFreelancers: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    embedding: { type: [Number], default: [] },
  },
  {
    timestamps: true, // adds createdAt / updatedAt
    toJSON: {
      virtuals: true,
      // Strip Mongo internals when serializing to the client.
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

export type UserDocument = InferSchemaType<typeof userSchema>;

// Full-text index powering GET /api/search (type=freelancers). Weights bias
// name matches over bio prose. $text queries FAIL without this index.
userSchema.index(
  { name: "text", headline: "text", bio: "text", skills: "text" },
  { weights: { name: 10, skills: 5, headline: 3, bio: 1 }, name: "user_text_search" }
);

// Guard against model re-compilation during Next.js hot reload.
export const User: Model<UserDocument> =
  (models.User as Model<UserDocument>) || model("User", userSchema);
