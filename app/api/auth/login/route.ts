import { type NextRequest, NextResponse } from "next/server"
import { comparePassword, generateToken } from "@/lib/auth"
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { employeeId, password } = await request.json()

    // Validation
    if (!employeeId || !password) {
      return NextResponse.json({ error: "Employee ID and password are required" }, { status: 400 })
    }

    // Use file-based storage for users
    const usersDir = path.join(process.cwd(), "sampleDB", "users")
    const userFilePath = path.join(usersDir, `${employeeId}.json`)

    // Check if user file exists
    if (!fs.existsSync(userFilePath)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Read user data from file
    const userData = fs.readFileSync(userFilePath, 'utf8')
    const user = JSON.parse(userData)

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const token = generateToken({
      _id: user.employeeId,
      employeeId: user.employeeId,
      department: user.department,
      createdAt: user.createdAt,
    })

    // Create response with token in cookie
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          employeeId: user.employeeId,
          department: user.department,
        },
      },
      { status: 200 },
    )

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
