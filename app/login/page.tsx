"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        localStorage.setItem("kmrl_user", JSON.stringify(result.user))
        router.push("/dashboard")
      } else {
        setError(result.error || "Login failed")
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        {/* Banner Section */}
        <div className="relative h-48 mb-8 rounded-lg overflow-hidden">
          <Image src=" /JAP_7896.jpg" alt="KMRL Banner" fill className="object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-white text-4xl font-bold text-center">Welcome Back!</h1>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex justify-center items-center py-8">
          <div className="bg-white border border-teal-200 rounded-2xl p-10 w-full max-w-md shadow-lg">
            <h2 className="text-center text-3xl font-semibold text-teal-600 mb-8">User Login</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  id="userId"
                  placeholder="User ID"
                  value={formData.userId}
                  onChange={handleChange}
                  required
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-200 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>

              <div className="text-center space-x-2">
                <Link href="#forgot" className="text-teal-600 hover:text-teal-700 text-sm transition-colors">
                  Forgot Password?
                </Link>
                <span className="text-gray-400">|</span>
                <Link href="/register" className="text-teal-600 hover:text-teal-700 text-sm transition-colors">
                  Don't have account? Register
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
