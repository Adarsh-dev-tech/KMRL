import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { comparePassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { employeeId, password } = await request.json()

    // Validation
    if (!employeeId || !password) {
      return NextResponse.json({ error: "Employee ID and password are required" }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("kmrl_system")
    const users = db.collection("users")

    // Find user by employee ID
    const user = await users.findOne({ employeeId })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const token = generateToken({
      _id: user._id.toString(),
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
