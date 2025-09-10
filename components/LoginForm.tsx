"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function LoginForm() {
  const [employeeId, setEmployeeId] = useState("")
  const [password, setPassword] = useState("")
  const { login, loading, error } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (employeeId && password) {
      const success = await login(employeeId, password)
      if (success) {
        router.push("/dashboard")
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <input
          type="text"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="Employee ID"
          required
        />
      </div>
      <div className="input-group">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
      </div>
      {error && (
        <div className="error-message" style={{ color: "#d32f2f", marginBottom: "15px", textAlign: "center" }}>
          {error}
        </div>
      )}
      <button type="submit" className="login-btn" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  )
}
