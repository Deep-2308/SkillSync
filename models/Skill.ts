import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

/**
 * Skill model — a service offering published by a provider.
 */
const skillSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true, maxlength: 2000 },
    category: { type: String, required: true, index: true },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      default: "intermediate",
    },
    hourlyRate: { type: Number, required: true, min: 0 },
    tags: { type: [String], default: [] },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    isPublished: { type: Boolean, default: true, index: true },
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

// Text index to power full-text search across titles/descriptions/tags.
skillSchema.index({ title: "text", description: "text", tags: "text" });

export type SkillDocument = InferSchemaType<typeof skillSchema>;

export const Skill: Model<SkillDocument> =
  (models.Skill as Model<SkillDocument>) || model("Skill", skillSchema);
