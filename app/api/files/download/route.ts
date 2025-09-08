import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get("fileId")
    const filePath = searchParams.get("path")

    if (!fileId && !filePath) {
      return NextResponse.json({ error: "File ID or path required" }, { status: 400 })
    }

    let actualFilePath = filePath

    // If fileId is provided, get the file path from database
    if (fileId) {
      const files = await DatabaseService.getAllFiles()
      const file = files.find(f => f.fileID.toString() === fileId)
      if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 })
      }
      actualFilePath = file.file_location
    }

    if (!actualFilePath) {
      return NextResponse.json({ error: "File path not found" }, { status: 404 })
    }

    try {
      const fileBuffer = await readFile(actualFilePath)
      const fileName = path.basename(actualFilePath)
      
      // Determine content type based on file extension
      const ext = path.extname(fileName).toLowerCase()
      let contentType = "application/octet-stream"
      
      switch (ext) {
        case ".pdf":
          contentType = "application/pdf"
          break
        case ".txt":
          contentType = "text/plain"
          break
        case ".jpg":
        case ".jpeg":
          contentType = "image/jpeg"
          break
        case ".png":
          contentType = "image/png"
          break
        case ".docx":
          contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          break
        case ".xlsx":
          contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          break
      }

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Content-Length": fileBuffer.length.toString(),
        },
      })
    } catch (fileError) {
      console.error("File read error:", fileError)
      return NextResponse.json({ error: "File not accessible" }, { status: 404 })
    }
  } catch (error) {
    console.error("[v0] File download API error:", error)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}