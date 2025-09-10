import { type NextRequest, NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth"
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { employeeId, department, password, confirmPassword } = await request.json()

    // Validation
    if (!employeeId || !department || !password || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Use file-based storage for users
    const usersDir = path.join(process.cwd(), "sampleDB", "users")
    const userFilePath = path.join(usersDir, `${employeeId}.json`)

    // Create users directory if it doesn't exist
    if (!fs.existsSync(usersDir)) {
      fs.mkdirSync(usersDir, { recursive: true })
    }

    // Check if employee ID already exists
    if (fs.existsSync(userFilePath)) {
      return NextResponse.json({ error: "Employee ID already registered" }, { status: 400 })
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const newUser = {
      employeeId,
      department,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    }

    // Write user data to file
    fs.writeFileSync(userFilePath, JSON.stringify(newUser, null, 2))

    return NextResponse.json(
      {
        message: "User registered successfully",
        userId: employeeId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
