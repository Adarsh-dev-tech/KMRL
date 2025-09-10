import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: Request, { params }: { params: { filePath: string } }) {
  try {
    const { filePath } = await params
    
    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 })
    }

    // Decode the file path (handle array of path segments)
    const pathSegments = Array.isArray(filePath) ? filePath : [filePath]
    const decodedPath = pathSegments.map(segment => decodeURIComponent(segment)).join('/')
    const fullPath = path.resolve(process.cwd(), decodedPath)
    const sampleDbPath = path.resolve(process.cwd(), 'sampleDB')

    // Security check - ensure path is within sampleDB
    if (!fullPath.startsWith(sampleDbPath)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const fileBuffer = fs.readFileSync(fullPath)
    const fileName = path.basename(fullPath)
    
    // Determine content type based on file extension
    const ext = path.extname(fileName).toLowerCase()
    let contentType = 'application/octet-stream'
    let isImage = false
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf'
        break
      case '.txt':
        contentType = 'text/plain'
        break
      case '.doc':
        contentType = 'application/msword'
        break
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        break
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg'
        isImage = true
        break
      case '.png':
        contentType = 'image/png'
        isImage = true
        break
      case '.gif':
        contentType = 'image/gif'
        isImage = true
        break
      case '.webp':
        contentType = 'image/webp'
        isImage = true
        break
      case '.bmp':
        contentType = 'image/bmp'
        isImage = true
        break
      case '.svg':
        contentType = 'image/svg+xml'
        isImage = true
        break
      case '.zip':
        contentType = 'application/zip'
        break
    }
    
    // Use inline disposition for images so they display in browser, attachment for downloads
    const disposition = isImage ? 'inline' : `attachment; filename="${fileName}"`
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'Content-Length': fileBuffer.length.toString(),
        // Add cache headers for images to improve performance
        ...(isImage && {
          'Cache-Control': 'public, max-age=3600, immutable'
        })
      },
    })
  } catch (error) {
    console.error('Error downloading file:', error)
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
  }
}