"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react"

// Types
export type UserRole = "learner" | "expert"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  username?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  signup: (data: { name: string; email: string; password: string; role: UserRole }) => Promise<{ error?: string }>
  logout: () => Promise<void>
}

// Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check existing session on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me")
      const data = await res.json()
      setUser(data.user || null)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        return { error: data.error || "Login failed" }
      }

      setUser(data.user)
      return {}
    } catch {
      return { error: "Network error. Please try again." }
    }
  }, [])

  const signup = useCallback(async (data: { name: string; email: string; password: string; role: UserRole }): Promise<{ error?: string }> => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const resData = await res.json()

      if (!res.ok) {
        return { error: resData.error || "Signup failed" }
      }

      setUser(resData.user)
      return {}
    } catch {
      return { error: "Network error. Please try again." }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // Logout locally even if API fails
    }
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
