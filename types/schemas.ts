import { z } from "zod";

/**
 * Zod schemas — the single source of truth for form validation AND runtime
 * validation on the server. `react-hook-form` consumes them via
 * `@hookform/resolvers/zod`; API routes and NextAuth reuse the exact same rules.
 * Types are inferred from the schemas so the two never drift.
 */

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters.").max(80),
    email: z.string().email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Include at least one uppercase letter.")
      .regex(/[a-z]/, "Include at least one lowercase letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type SignUpInput = z.infer<typeof signUpSchema>;

export const skillSchema = z.object({
  title: z.string().min(4, "Title must be at least 4 characters.").max(120),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(2000),
  category: z.string().min(1, "Choose a category."),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  hourlyRate: z.coerce
    .number()
    .min(0, "Rate cannot be negative.")
    .max(10000, "Rate seems too high."),
  tags: z.array(z.string()).max(10, "At most 10 tags.").default([]),
});
export type SkillInput = z.infer<typeof skillSchema>;

export const bookingSchema = z.object({
  skillId: z.string().min(1),
  scheduledFor: z.string().datetime("Choose a valid date and time."),
  durationMinutes: z.coerce.number().int().min(15).max(480),
  notes: z.string().max(1000).optional(),
});
export type BookingInput = z.infer<typeof bookingSchema>;

export const reviewSchema = z.object({
  targetId: z.string().min(1, "Target user is required."),
  contractId: z.string().min(1, "Contract is required."),
  rating: z.coerce.number().int().min(1, "Rating is 1–5.").max(5, "Rating is 1–5."),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters.")
    .max(2000),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

/**
 * Allowed target states for a contract status update. The model's "active" is
 * the brief's "in_progress" — transitions and party rules are enforced in the
 * route (PUT /api/contracts/[id]).
 */
export const contractUpdateSchema = z.object({
  status: z.enum(["completed", "disputed", "cancelled"]),
});
export type ContractUpdateInput = z.infer<typeof contractUpdateSchema>;

export const contactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email("Enter a valid email address."),
  subject: z.string().min(3).max(150),
  message: z.string().min(10, "Message must be at least 10 characters.").max(5000),
});
export type ContactInput = z.infer<typeof contactSchema>;

/** Admin user moderation — at least one field must be present. */
export const adminUserUpdateSchema = z
  .object({
    role: z.enum(["client", "freelancer", "admin"]).optional(),
    banned: z.boolean().optional(),
  })
  .refine((data) => data.role !== undefined || data.banned !== undefined, {
    message: "Provide at least one of: role, banned.",
  });
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;
