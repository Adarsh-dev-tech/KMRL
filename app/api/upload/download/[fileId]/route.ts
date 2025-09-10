import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { verifyToken } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { fileId: string } }) {
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

    const { fileId } = params

    // Get file metadata from database
    const client = await clientPromise
    const db = client.db("kmrl_system")
    const filesCollection = db.collection("uploaded_files")

    const fileDoc = await filesCollection.findOne({ _id: new ObjectId(fileId) })
    if (!fileDoc) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Check if user has access to this file (same department or admin)
    if (fileDoc.uploadedBy !== decoded.employeeId && decoded.department !== "administration") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Check if file exists on disk
    const filePath = path.join(process.cwd(), fileDoc.filePath)
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found on disk" }, { status: 404 })
    }

    // Read and return file
    const fileBuffer = await readFile(filePath)

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": fileDoc.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileDoc.originalName}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("File download error:", error)
    return NextResponse.json({ error: "File download failed" }, { status: 500 })
  }
}
