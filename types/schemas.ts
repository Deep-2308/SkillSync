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
  status: z.enum(["delivered", "completed", "disputed", "cancelled"]),
  disputeReason: z.string().max(1000).optional(),
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

// Auth
export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required."),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Include at least one uppercase letter.")
    .regex(/[a-z]/, "Include at least one lowercase letter.")
    .regex(/[0-9]/, "Include at least one number."),
});
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

// Projects
export const createProjectSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(20).max(5000),
  budget: z.coerce.number().min(5),
  skills: z.array(z.string()).min(1).max(10),
});
export const updateProjectSchema = z.object({
  title: z.string().min(5).max(120).optional(),
  description: z.string().min(20).max(5000).optional(),
  budget: z.coerce.number().min(5).optional(),
  skills: z.array(z.string()).min(1).max(10).optional(),
  status: z.enum(["open", "in_progress", "completed", "cancelled"]).optional(),
});

// Proposals
export const createProposalSchema = z.object({
  projectId: z.string().min(1, "Project ID is required."),
  coverLetter: z.string().min(20).max(3000),
  proposedRate: z.coerce.number().min(5),
  estimatedDays: z.coerce.number().int().min(1),
});
export const updateProposalSchema = z.object({
  status: z.enum(["accepted", "rejected", "withdrawn"]),
});

// Users
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  headline: z.string().max(120).optional(),
  bio: z.string().max(2000).optional(),
  skills: z.array(z.string()).max(15).optional(),
  portfolioUrls: z.array(z.string().url()).max(5).optional(),
  notificationPreferences: z.object({
    email: z.boolean().optional(),
    inApp: z.boolean().optional(),
  }).optional(),
});
export const setRoleSchema = z.object({
  role: z.enum(["client", "freelancer"]),
});

// Messages
export const createConversationSchema = z.object({
  participantId: z.string().min(1, "Participant ID is required."),
});
export const sendMessageSchema = z.object({
  body: z.string().min(1, "Message cannot be empty.").max(4000, "Message is too long"),
  attachmentUrl: z.string().url().optional().or(z.literal("")),
});

// Payments & Withdrawals
export const createIntentSchema = z.object({
  contractId: z.string().min(1, "Contract ID is required."),
});
export const withdrawalSchema = z.object({
  amount: z.coerce.number().min(10, "Minimum withdrawal is $10."),
});

// AI
export const aiProfileSchema = z.object({
  headline: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
});
export const aiProjectSchema = z.object({
  brief: z.string().min(10).max(2000),
});
export const aiProposalSchema = z.object({
  projectContext: z.object({
    title: z.string(),
    description: z.string(),
    skills: z.array(z.string()),
    budgetType: z.string(),
    budgetMin: z.number().optional(),
    budgetMax: z.number().optional(),
    hourlyRate: z.number().optional(),
  }),
  freelancerContext: z.object({
    name: z.string(),
    headline: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),
    skills: z.array(z.string()),
  }),
});
export const aiPricingSchema = z.object({
  contextType: z.enum(["project", "proposal"]),
  // For project context
  category: z.string().optional(),
  skills: z.array(z.string()).optional(),
  // For proposal context
  projectBudget: z.string().optional(),
  freelancerRate: z.number().optional(),
});
