/**
 * Shared application-level TypeScript interfaces.
 *
 * These describe the *plain-object* shape of our domain entities as they cross
 * the client/server boundary (e.g. serialized from Mongoose docs, returned by
 * API routes). They intentionally use `string` for ids and ISO dates so they
 * are safe to pass to Client Components.
 */

export type UserRole = "member" | "provider" | "admin";

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type ProjectStatus = "open" | "in_progress" | "completed" | "cancelled";

export type ProposalStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export type ContractStatus = "active" | "completed" | "cancelled" | "disputed";

export type PaymentStatus = "pending" | "paid" | "refunded";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
  bio?: string;
  headline?: string;
  location?: string;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  level: SkillLevel;
  /** Hourly rate in USD. */
  hourlyRate: number;
  tags: string[];
  /** Owning provider's user id. */
  providerId: string;
  provider?: Pick<User, "id" | "name" | "image" | "headline">;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  skillId: string;
  skill?: Pick<Skill, "id" | "title" | "hourlyRate">;
  clientId: string;
  providerId: string;
  status: BookingStatus;
  /** ISO 8601 datetime of the scheduled session. */
  scheduledFor: string;
  durationMinutes: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  budgetType: "fixed" | "hourly";
  budgetMin: number;
  budgetMax: number;
  hourlyRate: number;
  estimatedHours: number;
  timeline: string;
  experienceLevel: "beginner" | "intermediate" | "expert";
  status: ProjectStatus;
  postedBy: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  projectId: string;
  freelancerId: string;
  message: string;
  proposedRate: number;
  timeline: string;
  status: ProposalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: string;
  projectId: string;
  proposalId: string;
  clientId: string;
  freelancerId: string;
  agreedRate: number;
  timeline: string;
  status: ContractStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

/** Standard shape for API route responses. */
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
