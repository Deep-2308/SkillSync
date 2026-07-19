import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

/**
 * Project model — a job/project posted by any authenticated user.
 */
const projectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 5000 },
    category: { type: String, required: true, index: true },
    skills: { type: [String], default: [] },
    budgetType: {
      type: String,
      enum: ["fixed", "hourly"],
      default: "fixed",
    },
    budgetMin: { type: Number, min: 0, default: 0 },
    budgetMax: { type: Number, min: 0, default: 0 },
    hourlyRate: { type: Number, min: 0, default: 0 },
    estimatedHours: { type: Number, min: 0, default: 0 },
    timeline: { type: String, default: "" },
    experienceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "expert"],
      default: "intermediate",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "completed", "cancelled"],
      default: "open",
      index: true,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    attachments: { type: [String], default: [] },
    embedding: { type: [Number], default: [] },
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

projectSchema.index({ title: "text", description: "text", skills: "text" });

export type ProjectDocument = InferSchemaType<typeof projectSchema>;

export const Project: Model<ProjectDocument> =
  (models.Project as Model<ProjectDocument>) || model("Project", projectSchema);
