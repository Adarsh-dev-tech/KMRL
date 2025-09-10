import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import fs from "fs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 })
    }

    const uploadedFiles = []

    // Ensure funnel folder exists
    const funnelPath = path.join(process.cwd(), "sampleDB", "funnel")
    if (!fs.existsSync(funnelPath)) {
      await mkdir(funnelPath, { recursive: true })
    }

    for (const file of files) {
      if (file.size === 0) continue

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          {
            error: `File ${file.name} is too large. Maximum size is 10MB.`,
          },
          { status: 400 },
        )
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/zip",
        "text/plain",
      ]

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `File type ${file.type} is not supported.` },
          { status: 400 },
        )
      }

      // Generate unique filename
      const timestamp = Date.now()
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
      const filename = `${timestamp}_${sanitizedName}`
      const filepath = path.join(funnelPath, filename)

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filepath, buffer)

      uploadedFiles.push({
        id: timestamp.toString(),
        name: file.name,
        originalName: file.name,
        filename: filename,
        size: file.size,
        type: file.type,
        path: `sampleDB/funnel/${filename}`,
        uploadedAt: new Date().toISOString(),
      })
    }

    return NextResponse.json(
      {
        success: true,
        files: uploadedFiles,
        message: `${uploadedFiles.length} file(s) uploaded successfully`,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 },
    )
  }
}
