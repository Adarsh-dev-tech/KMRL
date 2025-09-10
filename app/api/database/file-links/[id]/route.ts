import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params
    const sampleDBPath = path.join(process.cwd(), "sampleDB")
    
    // Prevent path traversal attacks
    const itemPath = path.resolve(sampleDBPath, id)
    if (!itemPath.startsWith(sampleDBPath + path.sep) && itemPath !== sampleDBPath) {
      return NextResponse.json({ error: "File link not found" }, { status: 404 })
    }

    // Check if file/directory exists
    if (!fs.existsSync(itemPath)) {
      return NextResponse.json({ error: "File link not found" }, { status: 404 })
    }

    const stats = fs.statSync(itemPath)
    let fileLink: any = {
      fileID: id,
      file_location: `sampleDB/${id}`,
      source_platform: "website",
      sender: "system",
      created_at: stats.birthtime || stats.mtime,
      updated_at: stats.mtime,
      links: [],
      references: []
    }

    if (stats.isDirectory()) {
      const dirContents = fs.readdirSync(itemPath)
      const mainFile = dirContents.find(f => f.endsWith('.pdf') || f.endsWith('.doc') || f.endsWith('.docx'))
      
      if (mainFile) {
        fileLink.file_location = `sampleDB/${id}/${mainFile}`
      }

      // Check for additional resources
      if (fs.existsSync(path.join(itemPath, "images"))) {
        fileLink.images_folder_link = `sampleDB/${id}/images`
      }
      if (fs.existsSync(path.join(itemPath, "summary.txt"))) {
        fileLink.summary_text_link = `sampleDB/${id}/summary.txt`
      }
      if (fs.existsSync(path.join(itemPath, "scanToText.txt"))) {
        fileLink.scanToText_link = `sampleDB/${id}/scanToText.txt`
      }
    }

    return NextResponse.json({ fileLink }, { status: 200 })
  } catch (error) {
    console.error("File system query error:", error)
    return NextResponse.json({ error: "Failed to fetch file link" }, { status: 500 })
  }
}

// PUT method removed - files are read-only from file system
