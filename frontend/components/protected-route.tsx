"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, UserRole } from "@/lib/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/"
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      // Check if user exists and has token
      const token = localStorage.getItem("token")

      if (!user || !token) {
        // No user or token, redirect to login
        router.replace(redirectTo)
        return
      }

      // Check if user's role is allowed
      console.log("🔒 ProtectedRoute check - User role:", user.role, "Allowed roles:", allowedRoles)
      if (!allowedRoles.includes(user.role)) {
        // User doesn't have permission, redirect to their dashboard
        console.log("❌ Access denied. Redirecting to user's dashboard...")
        const roleRoutes: Record<UserRole, string> = {
          super_admin: "/dashboard/super-admin",
          school_admin: "/dashboard/admin",
          teacher: "/dashboard/teacher",
          student: "/dashboard/student",
          parent: "/dashboard/parent",
        }
        router.replace(roleRoutes[user.role] || "/")
        return
      }
      console.log("✅ Access granted!")

      // User is authorized
      setIsAuthorized(true)
    }
  }, [user, isLoading, allowedRoles, router, redirectTo])

  // Show loading state while checking authentication
  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
