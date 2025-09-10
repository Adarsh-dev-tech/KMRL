import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: Request, { params }: { params: { filePath: string } }) {
  try {
    const { filePath } = params
    
    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 })
    }

    // Decode the file path
    const decodedPath = decodeURIComponent(filePath)
    const fullPath = path.join(process.cwd(), decodedPath)

    // Security check - ensure path is within sampleDB
    if (!fullPath.includes(path.join(process.cwd(), 'sampleDB'))) {
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
        break
      case '.png':
        contentType = 'image/png'
        break
      case '.zip':
        contentType = 'application/zip'
        break
    }
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error downloading file:', error)
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
  }
}