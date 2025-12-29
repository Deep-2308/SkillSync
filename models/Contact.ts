import mongoose, { Schema } from "mongoose"

export interface IContact {
    firstName: string
    lastName: string
    email: string
    message: string
    createdAt: Date
}

const ContactSchema = new Schema<IContact>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
)

// Note: Using 'Contact' as the model name
export default mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema)
