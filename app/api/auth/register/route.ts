import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth"

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

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("kmrl_system")
    const users = db.collection("users")

    // Check if employee ID already exists
    const existingUser = await users.findOne({ employeeId })
    if (existingUser) {
      return NextResponse.json({ error: "Employee ID already registered" }, { status: 400 })
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const newUser = {
      employeeId,
      department,
      password: hashedPassword,
      createdAt: new Date(),
    }

    const result = await users.insertOne(newUser)

    return NextResponse.json(
      {
        message: "User registered successfully",
        userId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
