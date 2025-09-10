import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import fs from 'fs'
import path from 'path'

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

    const client = await clientPromise
    const db = client.db("kmrl_system")

    // Get uploaded files
    const filesCollection = db.collection("uploaded_files")
    const files = await filesCollection
      .find({ uploadedBy: decoded.employeeId })
      .sort({ uploadedAt: -1 })
      .limit(50)
      .toArray()

    // Get uploaded links
    const linksCollection = db.collection("uploaded_links")
    const links = await linksCollection
      .find({ uploadedBy: decoded.employeeId })
      .sort({ uploadedAt: -1 })
      .limit(50)
      .toArray()

    const funnelPath = path.join(process.cwd(), 'sampleDB', 'funnel')
    
    if (!fs.existsSync(funnelPath)) {
      return NextResponse.json({ files: [], links: [] })
    }

    const filesInFunnel = fs.readdirSync(funnelPath)
    const uploadedFiles: any[] = []
    const uploadedLinks: any[] = []

    for (const file of filesInFunnel) {
      const filePath = path.join(funnelPath, file)
      const stats = fs.statSync(filePath)
      
      if (file.endsWith('.link')) {
        // This is a link file
        try {
          const linkData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
          uploadedLinks.push({
            id: file.replace('.link', ''),
            title: linkData.title,
            url: linkData.url,
            uploadedAt: linkData.uploadedAt,
            filename: file
          })
        } catch (error) {
          console.error('Error parsing link file:', error)
        }
      } else {
        // This is a regular file
        const timestamp = file.split('_')[0]
        const originalName = file.substring(timestamp.length + 1)
        
        uploadedFiles.push({
          id: timestamp,
          name: originalName,
          filename: file,
          size: stats.size,
          uploadedAt: stats.birthtime.toISOString(),
          path: `sampleDB/funnel/${file}`
        })
      }
    }

    // Sort by upload date (newest first)
    uploadedFiles.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    uploadedLinks.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    return NextResponse.json(
      {
        files: [...files.map((file) => ({
          id: file._id,
          name: file.originalName,
          fileName: file.fileName,
          size: file.fileSize,
          type: file.mimeType,
          uploadedAt: file.uploadedAt,
          status: file.status,
        })), ...uploadedFiles],
        links: [...links.map((link) => ({
          id: link._id,
          url: link.url,
          title: link.title,
          uploadedAt: link.uploadedAt,
          status: link.status,
        })), ...uploadedLinks],
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("List upload error:", error)
    return NextResponse.json({ error: "Failed to fetch uploads" }, { status: 500 })
  }
}
