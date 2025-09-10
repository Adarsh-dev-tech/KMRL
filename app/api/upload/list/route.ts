import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const funnelPath = path.join(process.cwd(), 'sampleDB', 'funnel')
    
    if (!fs.existsSync(funnelPath)) {
      return NextResponse.json({ files: [], links: [] })
    }

    const items = fs.readdirSync(funnelPath, { withFileTypes: true })
    const files: any[] = []
    const links: any[] = []

    for (const item of items) {
      if (item.isFile()) {
        const filePath = path.join(funnelPath, item.name)
        const stats = fs.statSync(filePath)
        
        // Extract timestamp from filename (format: timestamp_originalname)
        const match = item.name.match(/^(\d+)_(.+)$/)
        const timestamp = match ? match[1] : Date.now().toString()
        const originalName = match ? match[2] : item.name

        if (item.name.endsWith('.link')) {
          // Handle link files
          try {
            const linkData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
            links.push({
              id: timestamp,
              title: linkData.title || 'External Link',
              url: linkData.url,
              filename: item.name,
              path: `sampleDB/funnel/${item.name}`,
              uploadedAt: linkData.uploadedAt || stats.mtime.toISOString(),
              type: 'external-link'
            })
          } catch (error) {
            console.error(`Error reading link file ${item.name}:`, error)
          }
        } else {
          // Handle regular files
          files.push({
            id: timestamp,
            name: originalName,
            originalName: originalName,
            filename: item.name,
            size: stats.size,
            type: path.extname(originalName).slice(1) || 'unknown',
            path: `sampleDB/funnel/${item.name}`,
            uploadedAt: stats.mtime.toISOString()
          })
        }
      }
    }

    // Sort by upload date (newest first)
    files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    links.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    return NextResponse.json({ files, links })
  } catch (error) {
    console.error('Error listing uploaded files:', error)
    return NextResponse.json({ error: 'Failed to list uploaded files' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')
    const type = searchParams.get('type') || 'file'

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
    }

    const funnelPath = path.join(process.cwd(), 'sampleDB', 'funnel')
    
    // Find the file by ID (timestamp)
    const items = fs.readdirSync(funnelPath, { withFileTypes: true })
    let targetFile: string | null = null

    for (const item of items) {
      if (item.isFile()) {
        const match = item.name.match(/^(\d+)_(.+)$/)
        const timestamp = match ? match[1] : null
        
        if (timestamp === fileId) {
          targetFile = item.name
          break
        }
      }
    }

    if (!targetFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const filePath = path.join(funnelPath, targetFile)
    
    // Delete the file
    fs.unlinkSync(filePath)

    return NextResponse.json({
      success: true,
      message: `${type === 'link' ? 'Link' : 'File'} deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}