import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const since = searchParams.get("since") // ISO timestamp
    const department = searchParams.get("department") ?? undefined

    // Get recent files since the provided timestamp
    const files = await DatabaseService.getRecentFiles(since || undefined)
    
    // Filter by department if specified
    const filteredFiles = department && department !== "all" 
      ? files.filter(file => file.department === department)
      : files

    return NextResponse.json({
      success: true,
      data: filteredFiles,
      timestamp: new Date().toISOString(),
      count: filteredFiles.length
    })
  } catch (error) {
    console.error("[v0] Poll API error:", error)
    return NextResponse.json({ error: "Polling failed" }, { status: 500 })
  }
}