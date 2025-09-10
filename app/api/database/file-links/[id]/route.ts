import { type NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params
    const connection = await getConnection()

    const [rows] = await connection.execute("SELECT * FROM file_links WHERE id = ?", [id])

    const fileLinks = rows as any[]
    if (fileLinks.length === 0) {
      return NextResponse.json({ error: "File link not found" }, { status: 404 })
    }

    const fileLink = fileLinks[0]
    // Parse JSON fields
    fileLink.links = fileLink.links ? JSON.parse(fileLink.links) : []
    fileLink.references = fileLink.references ? JSON.parse(fileLink.references) : []

    return NextResponse.json({ fileLink }, { status: 200 })
  } catch (error) {
    console.error("Database query error:", error)
    return NextResponse.json({ error: "Failed to fetch file link" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params
    const updateData = await request.json()

    const connection = await getConnection()

    // Get current data for logging
    const [currentRows] = await connection.execute("SELECT * FROM file_links WHERE id = ?", [id])

    if ((currentRows as any[]).length === 0) {
      return NextResponse.json({ error: "File link not found" }, { status: 404 })
    }

    const currentData = (currentRows as any[])[0]

    // Build update query dynamically
    const updateFields = []
    const updateValues = []

    for (const [key, value] of Object.entries(updateData)) {
      if (key === "links" || key === "references") {
        updateFields.push(`${key} = ?`)
        updateValues.push(JSON.stringify(value))
      } else if (key !== "id" && key !== "created_at") {
        updateFields.push(`${key} = ?`)
        updateValues.push(value)
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    updateValues.push(id)

    await connection.execute(
      `
      UPDATE file_links SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      updateValues,
    )

    // Log the update
    await connection.execute(
      `
      INSERT INTO document_updates (file_link_id, action, old_data, new_data)
      VALUES (?, 'updated', ?, ?)
    `,
      [id, JSON.stringify(currentData), JSON.stringify(updateData)],
    )

    return NextResponse.json(
      {
        message: "File link updated successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Database update error:", error)
    return NextResponse.json({ error: "Failed to update file link" }, { status: 500 })
  }
}
