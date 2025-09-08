import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { fileId: string } }) {
  try {
    const fileId = params.fileId

    // TODO: Replace with actual database query when integration is available
    // const sql = neon(process.env.DATABASE_URL)
    // const fileRecord = await sql`
    //   SELECT file_location, title FROM files WHERE fileID = ${fileId}
    // `

    // Mock file data for now
    const mockFiles: Record<string, { location: string; title: string }> = {
      "111": { location: "/mock/path/Moulding Sand.pdf", title: "Moulding Sand.pdf" },
      "112": { location: "/mock/path/Annual_Budget_2025.pdf", title: "Annual Budget Report 2025.pdf" },
      "113": { location: "/mock/path/Safety_Protocol_Manual.pdf", title: "Safety Protocol Manual.pdf" },
    }

    const fileInfo = mockFiles[fileId]

    if (!fileInfo) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // TODO: In production, read and stream the actual file
    // const fileBuffer = await fs.readFile(fileInfo.location)
    // return new NextResponse(fileBuffer, {
    //   headers: {
    //     'Content-Type': 'application/pdf',
    //     'Content-Disposition': `attachment; filename="${fileInfo.title}"`
    //   }
    // })

    // For now, return a mock download response
    return NextResponse.json({
      success: true,
      message: "File download initiated",
      downloadUrl: `/mock-download/${fileInfo.title}`,
      filename: fileInfo.title,
    })
  } catch (error) {
    console.error("[v0] File download API error:", error)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
