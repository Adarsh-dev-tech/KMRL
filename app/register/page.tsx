"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    department: "",
    employee_id: "",
    name: "",
    position: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        return
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: formData.employee_id,
          name: formData.name,
          password: formData.password,
          department: formData.department,
          position: formData.position,
        }),
      })

      const result = await response.json()

      if (result.success) {
        router.push("/login?message=Registration successful! Please login.")
      } else {
        setError(result.error || "Registration failed")
      }
    } catch (error) {
      console.error("[v0] Registration error:", error)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <header className="flex justify-between items-center py-4 px-8">
          <div className="flex items-center">
            <Image
              src=" /KMRL-logo-300x165.jpg"
              alt="KMRL Logo"
              width={120}
              height={66}
              className="h-16 w-auto"
            />
          </div>
          <nav className="flex gap-6">
            <Link href="#help" className="text-teal-600 hover:text-teal-700 transition-colors">
              Help
            </Link>
            <Link href="#contact" className="text-teal-600 hover:text-teal-700 transition-colors">
              Contact Us
            </Link>
          </nav>
        </header>

        {/* Registration Form */}
        <div className="flex justify-center items-center py-8">
          <div className="bg-white border border-teal-200 rounded-2xl p-10 w-full max-w-md shadow-lg">
            <h2 className="text-center text-3xl font-semibold text-teal-600 mb-4">Register User</h2>
            <h3 className="text-center text-xl font-medium text-gray-700 mb-8">New Employee</h3>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  id="employee_id"
                  placeholder="Employee ID (e.g., KMRL001)"
                  value={formData.employee_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-teal-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                />
              </div>

              <div>
                <input
                  type="text"
                  id="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-teal-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                />
              </div>

              <div>
                <select
                  id="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-teal-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                >
                  <option value="">Choose Department</option>
                  <option value="Administration">Administration</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Security">Security</option>
                </select>
              </div>

              <div>
                <input
                  type="text"
                  id="position"
                  placeholder="Position/Designation"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-teal-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                />
              </div>

              <div>
                <input
                  type="password"
                  id="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-teal-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                />
              </div>

              <div>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-teal-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-200 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Registering..." : "Register"}
              </button>

              <div className="text-center">
                <Link href="/login" className="text-teal-600 hover:text-teal-700 text-sm transition-colors">
                  Already have an account? Login here
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
