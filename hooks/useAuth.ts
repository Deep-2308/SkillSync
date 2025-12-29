"use client"

import { useContext } from "react"
import { AuthContext } from "@/context/AuthContext"

// Re-export types for convenience
export type { UserRole, User } from "@/context/AuthContext"

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
