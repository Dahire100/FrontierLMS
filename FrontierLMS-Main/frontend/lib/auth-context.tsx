"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export type UserRole = "school_admin" | "teacher" | "student" | "parent" | "super_admin"

export interface User {
  id: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
  name: string
  schoolId?: string
  isActive: boolean
  profilePicture?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem("user")
    const token = localStorage.getItem("token")

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log("🔍 Auth Context - Parsed user role:", parsedUser.role)
        // Create full name from firstName and lastName
        const fullName = `${parsedUser.firstName || ''} ${parsedUser.lastName || ''}`.trim() || parsedUser.email
        setUser({
          ...parsedUser,
          name: fullName
        })
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // This is now handled by the OTP flow in login-page.tsx
    // This function is kept for compatibility but shouldn't be used
    throw new Error("Please use OTP login flow")
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}