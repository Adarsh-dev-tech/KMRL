import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const department = formData.get("department") as string
    const sender = formData.get("sender") as string

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const uploadResults = []

    for (const file of files) {
      if (file.size === 0) continue

      // Save to funnel folder at the root level as per requirements
      // The folder structure should be: sql/sampleDB/funnel/{department}/
      const funnelDir = path.resolve(process.cwd(), "../../sql/sampleDB/funnel", department || "general")
      await mkdir(funnelDir, { recursive: true })

      const timestamp = Date.now()
      const filename = `${timestamp}_${file.name}`
      const filepath = path.join(funnelDir, filename)

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filepath, buffer)

      // Save file record in DB
      const fileRecord = await DatabaseService.createFile({
        file_location: filepath,
        sender: sender || "unknown",
        source_platform: "Upload",
        original_filename: file.name,
        file_size: file.size,
        department: department || "general",
        file_type: file.type,
        processing_status: "pending", // or whatever default you want
      })

      // ML processing is handled independently, so we skip it here

      uploadResults.push({
        filename: file.name,
        size: file.size,
        fileID: fileRecord.fileID,
        status: "uploaded",
      })

      console.log("[v0] File uploaded:", {
        filename: file.name,
        size: file.size,
        path: filepath,
        department,
        sender,
      })
    }

    return NextResponse.json({
      success: true,
      message: `${uploadResults.length} file(s) uploaded successfully`,
      files: uploadResults,
    })
  } catch (error) {
    console.error("[v0] File upload API error:", error)
    return NextResponse.json({ error: "File upload failed" }, { status: 500 })
  }
}
