import mongoose, { Schema } from "mongoose"

export type UserRole = "learner" | "expert"

export interface IPortfolioItem {
  _id?: string
  title: string
  description: string
  link?: string
  image?: string
}

export interface IUser {
  _id?: string
  name: string
  email: string
  hashedPassword: string
  role: UserRole
  username?: string
  image?: string
  bio?: string
  skills?: string[]
  hourlyRate?: number
  location?: string
  portfolio?: IPortfolioItem[]
  rating: number
  reviewCount: number
  resetToken?: string
  resetTokenExpiry?: Date
  createdAt: Date
  updatedAt: Date
}

const PortfolioItemSchema = new Schema<IPortfolioItem>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    link: { type: String },
    image: { type: String },
  },
  { _id: true }
)

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    hashedPassword: { type: String, required: true },
    role: { type: String, enum: ["learner", "expert"], default: "learner" },
    username: { type: String, unique: true, sparse: true, lowercase: true },
    image: { type: String },
    bio: { type: String },
    skills: [{ type: String }],
    hourlyRate: { type: Number },
    location: { type: String },
    portfolio: [PortfolioItemSchema],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  { timestamps: true }
)

// Index for fast lookups
UserSchema.index({ role: 1, rating: -1 })
UserSchema.index({ skills: 1 })
UserSchema.index({ username: 1 })

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
