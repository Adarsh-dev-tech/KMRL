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
      // Skip individual files and the funnel folder
      if (!item.isDirectory() || item.name === "README.md" || item.name === "funnel" || item.name === "users") continue

      const itemPath = path.join(sampleDBPath, item.name)
      const stats = fs.statSync(itemPath)
      
      // Create update record based on file modification time
      const updateTime = stats.mtime
      
      // Filter by since date if provided
      if (since && updateTime <= new Date(since)) {
        continue
      }

      // Read summary.txt if it exists
      const summaryPath = path.join(itemPath, "summary.txt")
      let aiTitle = item.name
      let cta = ""
      let aiSummary = ""
      let images: string[] = []
      let tables: string[] = []

      if (fs.existsSync(summaryPath)) {
        try {
          const summaryContent = fs.readFileSync(summaryPath, 'utf8').trim()
          const lines = summaryContent.split('\n').filter(line => line.trim() !== '')
          
          if (lines.length >= 1) aiTitle = lines[0].trim()
          if (lines.length >= 2) cta = lines[1].trim()
          if (lines.length >= 3) aiSummary = lines.slice(2).join(' ').trim()
        } catch (error) {
          console.log(`Error reading summary.txt for ${item.name}:`, error)
        }
      }

      // Find images in the folder
      try {
        const folderItems = fs.readdirSync(itemPath, { withFileTypes: true })
        for (const folderItem of folderItems) {
          if (folderItem.isFile() && /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(folderItem.name)) {
            images.push(`/api/sampledb/download/${encodeURIComponent(item.name)}/${encodeURIComponent(folderItem.name)}`)
          }
          // Check for tables (you can add logic here to detect table files like .csv, .xlsx etc)
          if (folderItem.isFile() && /\.(csv|xlsx|xls)$/i.test(folderItem.name)) {
            tables.push(`/api/sampledb/download/${encodeURIComponent(item.name)}/${encodeURIComponent(folderItem.name)}`)
          }
        }
        
        // Also check images subfolder
        const imagesPath = path.join(itemPath, "images")
        if (fs.existsSync(imagesPath) && fs.statSync(imagesPath).isDirectory()) {
          const imageFiles = fs.readdirSync(imagesPath, { withFileTypes: true })
          for (const imageFile of imageFiles) {
            if (imageFile.isFile() && /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(imageFile.name)) {
              images.push(`/api/sampledb/download/${encodeURIComponent(item.name)}/images/${encodeURIComponent(imageFile.name)}`)
            }
          }
        }
      } catch (error) {
        console.log(`Error reading folder contents for ${item.name}:`, error)
      }

      const update = {
        id: `update_${item.name}_${stats.mtime.getTime()}`,
        action: "updated",
        created_at: updateTime,
        file_name: item.name,
        original_name: item.name,
        ai_title: aiTitle,
        cta: cta,
        ai_summary: aiSummary,
        images: images,
        tables: tables,
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

    // Count total files for compatibility with hook
    const totalFiles = items.filter(item => item.isDirectory() && item.name !== "README.md" && item.name !== "funnel" && item.name !== "users").length

    return NextResponse.json({ 
      updates: limitedUpdates, 
      totalFiles: totalFiles,
      timestamp: new Date().toISOString()
    }, { status: 200 })
  } catch (error) {
    console.error("File system query error:", error)
    return NextResponse.json({ error: "Failed to fetch updates" }, { status: 500 })
  }
}
