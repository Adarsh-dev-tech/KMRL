import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { employee_id, name, password, department, position } = await request.json()

    if (!employee_id || !name || !password || !department) {
      return NextResponse.json({ error: "Employee ID, name, password, and department are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    const existingUser = await DatabaseService.getUserByEmployeeId(employee_id)

    if (existingUser) {
      return NextResponse.json({ error: "Employee ID already registered" }, { status: 409 })
    }

    // Hash password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const newUser = await DatabaseService.createUser(employee_id, name, passwordHash, department, position)

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser.id,
        employee_id: newUser.employee_id,
        name: newUser.name,
        department: newUser.department,
        position: newUser.position,
      },
    })
  } catch (error) {
    console.error("[v0] Registration API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
