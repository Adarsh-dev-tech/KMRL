"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function RegisterForm() {
  const [employeeId, setEmployeeId] = useState("")
  const [department, setDepartment] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { register, loading, error } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (employeeId && department && password && confirmPassword) {
      const success = await register(employeeId, department, password, confirmPassword)
      if (success) {
        // Show success message and redirect to login
        alert("Registration successful! Please login with your credentials.")
        router.push("/")
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <select value={department} onChange={(e) => setDepartment(e.target.value)} required>
          <option value="">Choose Department</option>
          <option value="administration">Administration</option>
          <option value="finance">Finance</option>
          <option value="operations">Operations</option>
          <option value="engineering">Engineering</option>
          <option value="safety">Safety & Security</option>
          <option value="hr">Human Resources</option>
          <option value="maintenance">Maintenance</option>
          <option value="planning">Planning & Development</option>
        </select>
      </div>
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
      <div className="input-group">
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          required
        />
      </div>
      {error && (
        <div className="error-message" style={{ color: "#d32f2f", marginBottom: "15px", textAlign: "center" }}>
          {error}
        </div>
      )}
      <button type="submit" className="register-btn" disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  )
}
