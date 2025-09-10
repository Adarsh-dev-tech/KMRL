import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import fs from "fs"
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
    const since = searchParams.get("since") // ISO timestamp
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // Read files from sampleDB directory and simulate updates based on file modification times
    const sampleDBPath = path.join(process.cwd(), "sampleDB")
    
    if (!fs.existsSync(sampleDBPath)) {
      return NextResponse.json({ updates: [] }, { status: 200 })
    }

    const items = fs.readdirSync(sampleDBPath, { withFileTypes: true })
    const updates: any[] = []

    for (const item of items) {
      if (item.name === "README.md") continue

      const itemPath = path.join(sampleDBPath, item.name)
      const stats = fs.statSync(itemPath)
      
      // Create update record based on file modification time
      const updateTime = stats.mtime
      
      // Filter by since date if provided
      if (since && updateTime <= new Date(since)) {
        continue
      }

      const update = {
        id: `update_${item.name}_${stats.mtime.getTime()}`,
        action: "updated",
        created_at: updateTime,
        file_name: item.name,
        original_name: item.name,
        department: "general",
        status: "processed",
        file_link_id: item.name,
        old_data: null,
        new_data: {
          file_location: `sampleDB/${item.name}`,
          updated_at: updateTime
        }
      }

      updates.push(update)
    }

    // Sort by update time (newest first) and apply limit
    updates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const limitedUpdates = updates.slice(0, limit)

    return NextResponse.json({ updates: limitedUpdates }, { status: 200 })
  } catch (error) {
    console.error("File system query error:", error)
    return NextResponse.json({ error: "Failed to fetch updates" }, { status: 500 })
  }
}
