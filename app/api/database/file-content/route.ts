import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { verifyToken } from "@/lib/auth"
import path from "path"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get("path")

    if (!filePath) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 })
    }

    try {
      // Security check - ensure the path is within allowed directories
      const normalizedPath = path.normalize(filePath)
      if (normalizedPath.includes("..") || !normalizedPath.includes("sampleDB")) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }

      // Read the file content
      const content = await readFile(filePath, "utf-8")

      return new Response(content, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      })
    } catch (fileError) {
      console.error("File read error:", fileError)
      return NextResponse.json({ error: "File not found or cannot be read" }, { status: 404 })
    }
  } catch (error) {
    console.error("File content API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
