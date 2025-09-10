import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { url, title } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Ensure funnel folder exists
    const funnelPath = path.join(process.cwd(), 'sampleDB', 'funnel')
    if (!fs.existsSync(funnelPath)) {
      fs.mkdirSync(funnelPath, { recursive: true })
    }

    // Create link file
    const timestamp = Date.now()
    const linkTitle = title || url.split('/').pop() || 'external-link'
    const filename = `${timestamp}_${linkTitle.replace(/[^a-zA-Z0-9.-]/g, '_')}.link`
    const filepath = path.join(funnelPath, filename)

    const linkData = {
      url,
      title: linkTitle,
      uploadedAt: new Date().toISOString(),
      type: 'external-link'
    }

    fs.writeFileSync(filepath, JSON.stringify(linkData, null, 2))

    return NextResponse.json({
      success: true,
      link: {
        id: timestamp.toString(),
        title: linkTitle,
        url,
        filename,
        path: `sampleDB/funnel/${filename}`,
        uploadedAt: linkData.uploadedAt
      },
      message: 'Link added successfully'
    })

  } catch (error) {
    console.error('Link upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to add link' 
    }, { status: 500 })
  }
}
