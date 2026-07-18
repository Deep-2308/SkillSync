import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

/**
 * Review model — left by one party of a COMPLETED contract about the other.
 *
 * The compound unique index (contractId + reviewerId) is the hard guarantee
 * that nobody reviews the same contract twice, even under concurrent requests —
 * the route also checks, but the index wins races.
 *
 * Aggregates (averageRating / ratingBreakdown) live denormalized on User and
 * are recalculated by an aggregation pipeline on every review write.
 */
const reviewSchema = new Schema(
  {
    contractId: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
      index: true,
    },
    /** Who wrote the review. */
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    /** Who the review is about. */
    targetId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, minlength: 10, maxlength: 2000 },
    /** Users who flagged this review as helpful (toggle set). */
    helpfulBy: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    helpfulCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        // Voter list is internal — expose only the count.
        delete ret.helpfulBy;
        return ret;
      },
    },
  }
);

// One review per reviewer per contract (race-proof).
reviewSchema.index({ contractId: 1, reviewerId: 1 }, { unique: true });
// Common read path: a user's reviews, newest or most-helpful first.
reviewSchema.index({ targetId: 1, createdAt: -1 });
reviewSchema.index({ targetId: 1, helpfulCount: -1 });

export type ReviewDocument = InferSchemaType<typeof reviewSchema>;

export const Review: Model<ReviewDocument> =
  (models.Review as Model<ReviewDocument>) || model("Review", reviewSchema);
