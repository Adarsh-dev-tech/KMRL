"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"

interface User {
  employeeId: string
  department: string
}

interface AuthContextType {
  user: User | null
  login: (employeeId: string, password: string) => Promise<boolean>
  register: (employeeId: string, department: string, password: string, confirmPassword: string) => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (employeeId: string, password: string): Promise<boolean> => {
    setError(null)
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeId, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        return true
      } else {
        setError(data.error)
        return false
      }
    } catch (error) {
      setError("Login failed. Please try again.")
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (
    employeeId: string,
    department: string,
    password: string,
    confirmPassword: string,
  ): Promise<boolean> => {
    setError(null)
    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeId, department, password, confirmPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        return true
      } else {
        setError(data.error)
        return false
      }
    } catch (error) {
      setError("Registration failed. Please try again.")
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, error }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
