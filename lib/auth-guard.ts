import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  isVerified: boolean
}

/**
 * Validates the JWT cookie and returns the authenticated user.
 * Throws an object with { status, error } if not authenticated.
 */
export async function requireAuth(): Promise<AuthUser> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value || cookieStore.get("token")?.value

  if (!token) {
    throw { status: 401, error: "Not authenticated. Please log in." }
  }

  const payload = await verifyToken(token)
  if (!payload) {
    throw { status: 401, error: "Invalid or expired session. Please log in again." }
  }

  await dbConnect()
  const userId = payload.userId || payload.id
  const user = await User.findById(userId).select("name email role isVerified")

  if (!user) {
    throw { status: 401, error: "User not found." }
  }

  if (user.isDeactivated) {
    throw { status: 403, error: "Account is deactivated. Contact support to reactivate." }
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified ?? false,
  }
}

/**
 * Validates auth + checks role. Throws 403 if role doesn't match.
 */
export async function requireRole(allowedRoles: string | string[]): Promise<AuthUser> {
  const user = await requireAuth()
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

  if (!roles.includes(user.role)) {
    throw { status: 403, error: `Access denied. Required role: ${roles.join(" or ")}` }
  }

  return user
}
