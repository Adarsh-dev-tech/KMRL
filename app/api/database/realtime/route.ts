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
    const lastCheck = searchParams.get("lastCheck")

    // Read files from sampleDB directory
    const sampleDBPath = path.join(process.cwd(), "sampleDB")
    
    if (!fs.existsSync(sampleDBPath)) {
      return NextResponse.json({ 
        updates: [], 
        totalFiles: 0, 
        timestamp: new Date().toISOString() 
      }, { status: 200 })
    }

    const items = fs.readdirSync(sampleDBPath, { withFileTypes: true })
    const updates: any[] = []
    let totalFiles = 0

    for (const item of items) {
      if (item.name === "README.md") continue

      totalFiles++
      const itemPath = path.join(sampleDBPath, item.name)
      const stats = fs.statSync(itemPath)
      
      // Create update record based on file modification time
      const updateTime = stats.mtime
      
      // Filter by lastCheck date if provided
      if (lastCheck && updateTime <= new Date(lastCheck)) {
        continue
      }

      const update = {
        update_id: `realtime_${item.name}_${stats.mtime.getTime()}`,
        action: "updated",
        update_time: updateTime,
        fileID: item.name,
        file_location: `sampleDB/${item.name}`,
        source_platform: "website",
        sender: "system",
        created_at: stats.birthtime || stats.mtime,
        updated_at: stats.mtime
      }

      if (item.isDirectory()) {
        const dirContents = fs.readdirSync(itemPath)
        const mainFile = dirContents.find(f => f.endsWith('.pdf') || f.endsWith('.doc') || f.endsWith('.docx'))
        
        if (mainFile) {
          update.file_location = `sampleDB/${item.name}/${mainFile}`
        }

        // Check for additional resources
        if (fs.existsSync(path.join(itemPath, "images"))) {
          update.images_folder_link = `sampleDB/${item.name}/images`
        }
        if (fs.existsSync(path.join(itemPath, "summary.txt"))) {
          update.summary_text_link = `sampleDB/${item.name}/summary.txt`
        }
        if (fs.existsSync(path.join(itemPath, "scanToText.txt"))) {
          update.scanToText_link = `sampleDB/${item.name}/scanToText.txt`
        }
      }

      updates.push(update)
    }

    // Sort by update time (newest first) and limit to 100
    updates.sort((a, b) => new Date(b.update_time).getTime() - new Date(a.update_time).getTime())
    const limitedUpdates = updates.slice(0, 100)

    return NextResponse.json(
      {
        updates: limitedUpdates,
        totalFiles,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Realtime updates error:", error)
    return NextResponse.json({ error: "Failed to fetch updates" }, { status: 500 })
  }
}
