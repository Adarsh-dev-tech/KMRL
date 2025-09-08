import { type NextRequest, NextResponse } from "next/server"
import path from "path"
import { stat, readdir } from "fs/promises"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get("department") ?? undefined
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const fileRecords = await DatabaseService.getCompletedFiles({
      department,
      limit,
      offset,
    })

    const totalCount = await DatabaseService.getCompletedFilesCount(department)

    // Process each record to create the expected JSON structure
    const processedFiles = await Promise.all(
      fileRecords.map(async (record) => {
        const filePath = path.resolve(record.file_location)
        let filesList: string[] = []
        try {
          const stats = await stat(filePath)
          if (stats.isDirectory()) {
            const files = await readdir(filePath)
            filesList = files.map((f) => path.join(filePath, f))
          } else if (stats.isFile()) {
            filesList = [filePath]
          }
        } catch (e) {
          filesList = []
        }
        return {
          ...record,
          filesList,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      data: processedFiles,
      pagination: {
        total: totalCount,
        limit: limit,
        offset: offset,
        hasMore: offset + limit < totalCount,
      },
    })
  } catch (error) {
    console.error("[v0] Updates API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
