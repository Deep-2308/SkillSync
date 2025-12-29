"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"

// Types
export type UserRole = "learner" | "expert"

export interface User {
    name: string
    role: UserRole
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    login: (userData: User) => void
    signup: (userData: User) => void
    logout: () => void
}

// Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)

    // Initialize state from local storage
    useEffect(() => {
        const storedUser = localStorage.getItem("skillSyncUser")
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser))
            } catch (error) {
                console.error("Failed to parse user data", error)
                localStorage.removeItem("skillSyncUser")
            }
        }
    }, [])

    const login = (userData: User) => {
        setUser(userData)
        localStorage.setItem("skillSyncUser", JSON.stringify(userData))
    }

    const signup = (userData: User) => {
        // In a real backend, this would create a user. For now, it's same as login.
        login(userData)
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("skillSyncUser")
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
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
