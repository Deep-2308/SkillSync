"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

interface ProtectedRouteProps {
    children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login")
        }
    }, [isAuthenticated, router])

    // While checking or if redirected, we might show nothing or a loader
    // But since we have local state initialized to false, specific logic might be needed
    // to avoid flash. For simplicity in this requirements set, if not auth, we render nothing.
    if (!isAuthenticated) {
        return null
    }

    return <>{children}</>
}
