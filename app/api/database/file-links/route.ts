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
      if (item.name === "README.md" || item.name === "funnel" || item.name === "users") continue

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
        // Read summary.txt if it exists to get AI title, CTA, and summary
        const summaryPath = path.join(itemPath, "summary.txt")
        if (fs.existsSync(summaryPath)) {
          try {
            const summaryContent = fs.readFileSync(summaryPath, 'utf8').trim()
            const lines = summaryContent.split('\n').filter(line => line.trim() !== '')
            
            if (lines.length >= 1) fileData.ai_title = lines[0].trim()
            if (lines.length >= 2) fileData.cta = lines[1].trim()
            if (lines.length >= 3) fileData.ai_summary = lines.slice(2).join(' ').trim()
          } catch (error) {
            console.log(`Error reading summary.txt for ${item.name}:`, error)
          }
        }

        // Check for specific files within the directory
        const dirContents = fs.readdirSync(itemPath)
        const mainFile = dirContents.find(f => f.endsWith('.pdf') || f.endsWith('.doc') || f.endsWith('.docx'))
        
        if (mainFile) {
          fileData.file_location = `sampleDB/${item.name}/${mainFile}`
        }

        // Find images in both the main folder and images subfolder
        let images: string[] = []
        try {
          for (const dirItem of dirContents) {
            if (/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(dirItem)) {
              images.push(`/api/sampledb/download/${encodeURIComponent(item.name)}/${encodeURIComponent(dirItem)}`)
            }
          }
          
          // Also check images subfolder
          const imagesPath = path.join(itemPath, "images")
          if (fs.existsSync(imagesPath) && fs.statSync(imagesPath).isDirectory()) {
            const imageFiles = fs.readdirSync(imagesPath)
            for (const imageFile of imageFiles) {
              if (/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(imageFile)) {
                images.push(`/api/sampledb/download/${encodeURIComponent(item.name)}/images/${encodeURIComponent(imageFile)}`)
              }
            }
          }
          fileData.images = images
        } catch (error) {
          console.log(`Error reading images for ${item.name}:`, error)
        }

        // Find tables in both the main folder and tables subfolder
        let tables: string[] = []
        try {
          for (const dirItem of dirContents) {
            if (/\.(csv|xlsx|xls)$/i.test(dirItem)) {
              tables.push(`/api/sampledb/download/${encodeURIComponent(item.name)}/${encodeURIComponent(dirItem)}`)
            }
          }
          
          // Also check tables subfolder
          const tablesPath = path.join(itemPath, "tables")
          if (fs.existsSync(tablesPath) && fs.statSync(tablesPath).isDirectory()) {
            const tableFiles = fs.readdirSync(tablesPath)
            for (const tableFile of tableFiles) {
              if (/\.(csv|xlsx|xls)$/i.test(tableFile)) {
                tables.push(`/api/sampledb/download/${encodeURIComponent(item.name)}/tables/${encodeURIComponent(tableFile)}`)
              }
            }
          }
          fileData.tables = tables
        } catch (error) {
          console.log(`Error reading tables for ${item.name}:`, error)
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
