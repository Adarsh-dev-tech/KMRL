import { type NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import { verifyToken } from "@/lib/auth"

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

    const { searchParams } = new URL(request.url)
    const lastCheck = searchParams.get("lastCheck")

    const connection = await getConnection()

    // Get recent updates since last check
    let query = `
      SELECT 
        du.id as update_id,
        du.action,
        du.created_at as update_time,
        fl.*
      FROM document_updates du
      LEFT JOIN file_links fl ON du.file_link_id = fl.fileID
      WHERE 1=1
    `
    const params: any[] = []

    if (lastCheck) {
      query += " AND du.created_at > ?"
      params.push(new Date(lastCheck))
    }

    query += " ORDER BY du.created_at DESC LIMIT 100"

    const [updates] = await connection.execute(query, params)

    // Get total count of files
    const [countResult] = await connection.execute("SELECT COUNT(*) as total FROM file_links")
    const totalFiles = (countResult as any[])[0].total

    return NextResponse.json(
      {
        updates: updates as any[],
        totalFiles,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Realtime updates error:", error)
    return NextResponse.json({ error: "Failed to fetch updates" }, { status: 500 })
  }
}
