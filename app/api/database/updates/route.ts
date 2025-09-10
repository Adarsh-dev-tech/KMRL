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
    const since = searchParams.get("since") // ISO timestamp
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const connection = await getConnection()

    let query = `
      SELECT 
        du.*,
        fl.file_name,
        fl.original_name,
        fl.department,
        fl.status
      FROM document_updates du
      LEFT JOIN file_links fl ON du.file_link_id = fl.id
      WHERE 1=1
    `
    const params: any[] = []

    if (since) {
      query += " AND du.created_at > ?"
      params.push(since)
    }

    query += " ORDER BY du.created_at DESC LIMIT ?"
    params.push(limit)

    const [rows] = await connection.execute(query, params)

    // Parse JSON fields
    const updates = (rows as any[]).map((row) => ({
      ...row,
      old_data: row.old_data ? JSON.parse(row.old_data) : null,
      new_data: row.new_data ? JSON.parse(row.new_data) : null,
    }))

    return NextResponse.json({ updates }, { status: 200 })
  } catch (error) {
    console.error("Database query error:", error)
    return NextResponse.json({ error: "Failed to fetch updates" }, { status: 500 })
  }
}
