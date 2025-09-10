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
    const source_platform = searchParams.get("source_platform")
    const sender = searchParams.get("sender")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Read files from sampleDB directory
    const sampleDBPath = path.join(process.cwd(), "sampleDB")
    
    if (!fs.existsSync(sampleDBPath)) {
      return NextResponse.json({ fileLinks: [] }, { status: 200 })
    }

    const items = fs.readdirSync(sampleDBPath, { withFileTypes: true })
    const fileLinks: any[] = []

    for (const item of items) {
      if (item.name === "README.md") continue

      const itemPath = path.join(sampleDBPath, item.name)
      const stats = fs.statSync(itemPath)
      
      let fileData: any = {
        fileID: item.name,
        file_location: `sampleDB/${item.name}`,
        source_platform: "website",
        sender: "system",
        created_at: stats.birthtime || stats.mtime,
        updated_at: stats.mtime,
      }

      if (item.isDirectory()) {
        // Check for specific files within the directory
        const dirContents = fs.readdirSync(itemPath)
        const mainFile = dirContents.find(f => f.endsWith('.pdf') || f.endsWith('.doc') || f.endsWith('.docx'))
        
        if (mainFile) {
          fileData.file_location = `sampleDB/${item.name}/${mainFile}`
        }

        // Check for additional resources
        if (fs.existsSync(path.join(itemPath, "images"))) {
          fileData.images_folder_link = `sampleDB/${item.name}/images`
        }
        if (fs.existsSync(path.join(itemPath, "summary.txt"))) {
          fileData.summary_text_link = `sampleDB/${item.name}/summary.txt`
        }
        if (fs.existsSync(path.join(itemPath, "scanToText.txt"))) {
          fileData.scanToText_link = `sampleDB/${item.name}/scanToText.txt`
        }
      }

      // Apply filters
      if (source_platform && source_platform !== "all" && fileData.source_platform !== source_platform) {
        continue
      }
      if (sender && fileData.sender !== sender) {
        continue
      }

      fileLinks.push(fileData)
    }

    // Sort by creation date (newest first)
    fileLinks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Apply pagination
    const paginatedFiles = fileLinks.slice(offset, offset + limit)

    return NextResponse.json({ fileLinks: paginatedFiles }, { status: 200 })
  } catch (error) {
    console.error("File system query error:", error)
    return NextResponse.json({ error: "Failed to fetch file links" }, { status: 500 })
  }
}

// POST method removed - files are managed through file system only
