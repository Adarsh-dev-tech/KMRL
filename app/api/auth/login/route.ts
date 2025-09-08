import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { userId, password } = await request.json()

    if (!userId || !password) {
      return NextResponse.json({ error: "User ID and password are required" }, { status: 400 })
    }

    const user = await DatabaseService.getUserByEmployeeId(userId)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Return user data (excluding password)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        userId: user.employee_id,
        name: user.name,
        department: user.department,
        position: user.position,
      },
    })
  } catch (error) {
    console.error("[v0] Login API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
