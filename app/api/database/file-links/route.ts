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
    const source_platform = searchParams.get("source_platform")
    const sender = searchParams.get("sender")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const connection = await getConnection()

    let query = "SELECT * FROM file_links WHERE 1=1"
    const params: any[] = []

    if (source_platform && source_platform !== "all") {
      query += " AND source_platform = ?"
      params.push(source_platform)
    }

    if (sender) {
      query += " AND sender = ?"
      params.push(sender)
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.push(limit, offset)

    const [rows] = await connection.execute(query, params)

    const fileLinks = (rows as any[]).map((row) => ({
      ...row,
    }))

    return NextResponse.json({ fileLinks }, { status: 200 })
  } catch (error) {
    console.error("Database query error:", error)
    return NextResponse.json({ error: "Failed to fetch file links" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const {
      file_location,
      images_folder_link,
      tables_folder_link,
      summary_text_link,
      scanToText_link,
      source_platform,
      sender,
    } = await request.json()

    if (!file_location) {
      return NextResponse.json({ error: "Missing required field: file_location" }, { status: 400 })
    }

    const connection = await getConnection()

    const [result] = await connection.execute(
      `
      INSERT INTO file_links (
        file_location, images_folder_link, tables_folder_link, 
        summary_text_link, scanToText_link, source_platform, sender
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        file_location,
        images_folder_link,
        tables_folder_link,
        summary_text_link,
        scanToText_link,
        source_platform,
        sender,
      ],
    )

    const insertId = (result as any).insertId

    // Log the update
    await connection.execute(
      `
      INSERT INTO document_updates (file_link_id, action, new_data)
      VALUES (?, 'created', ?)
    `,
      [insertId, JSON.stringify({ file_location, source_platform, sender })],
    )

    return NextResponse.json(
      {
        message: "File link created successfully",
        fileID: insertId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Database insert error:", error)
    return NextResponse.json({ error: "Failed to create file link" }, { status: 500 })
  }
}
