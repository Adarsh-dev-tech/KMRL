import { type NextRequest, NextResponse } from "next/server"

// Mock search data
const mockSearchResults = [
  {
    fileID: "111",
    title: "Moulding Sand.pdf",
    department: "Engineering",
    fileType: "pdf",
    uploadDate: "2025-01-15",
    sender: "MinistryOfEducation@gov.in",
    summary: "Technical document about molding sand properties and casting processes.",
  },
  {
    fileID: "112",
    title: "Annual Budget Report 2025.pdf",
    department: "Finance",
    fileType: "pdf",
    uploadDate: "2025-01-14",
    sender: "finance@kmrl.gov.in",
    summary: "Comprehensive budget allocation for FY 2025 metro expansion projects.",
  },
  {
    fileID: "113",
    title: "Safety Protocol Manual.pdf",
    department: "Safety",
    fileType: "pdf",
    uploadDate: "2025-01-13",
    sender: "safety@kmrl.gov.in",
    summary: "Updated safety procedures and emergency protocols for metro operations.",
  },
  {
    fileID: "114",
    title: "Employee Training Schedule.xlsx",
    department: "HR",
    fileType: "excel",
    uploadDate: "2025-01-12",
    sender: "hr@kmrl.gov.in",
    summary: "Quarterly training schedule for all departments and skill development programs.",
  },
  {
    fileID: "115",
    title: "Station Infrastructure Photos.zip",
    department: "Operations",
    fileType: "image",
    uploadDate: "2025-01-11",
    sender: "operations@kmrl.gov.in",
    summary: "Photo documentation of station infrastructure and maintenance requirements.",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const department = searchParams.get("department") || ""
    const fileType = searchParams.get("fileType") || ""
    const dateFrom = searchParams.get("dateFrom") || ""
    const dateTo = searchParams.get("dateTo") || ""
    const contact = searchParams.get("contact") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // TODO: Replace with actual database search when integration is available
    // const sql = neon(process.env.DATABASE_URL)
    // let searchQuery = `
    //   SELECT f.fileID, f.file_location, f.sender, f.platform, f.upload_date, f.status
    //   FROM files f
    //   WHERE f.status = 'completed'
    // `
    // const params = []

    // Filter mock results based on search parameters
    let results = [...mockSearchResults]

    // Text search
    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      results = results.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm) ||
          item.summary.toLowerCase().includes(searchTerm) ||
          item.sender.toLowerCase().includes(searchTerm),
      )
    }

    // Department filter
    if (department && department !== "") {
      results = results.filter((item) => item.department.toLowerCase() === department.toLowerCase())
    }

    // File type filter
    if (fileType && fileType !== "") {
      results = results.filter((item) => item.fileType === fileType)
    }

    // Date range filter
    if (dateFrom) {
      results = results.filter((item) => item.uploadDate >= dateFrom)
    }
    if (dateTo) {
      results = results.filter((item) => item.uploadDate <= dateTo)
    }

    // Contact filter
    if (contact.trim()) {
      const contactTerm = contact.toLowerCase()
      results = results.filter((item) => item.sender.toLowerCase().includes(contactTerm))
    }

    // Apply pagination
    const paginatedResults = results.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: paginatedResults,
      pagination: {
        total: results.length,
        limit: limit,
        offset: offset,
        hasMore: offset + limit < results.length,
      },
      searchParams: {
        query,
        department,
        fileType,
        dateFrom,
        dateTo,
        contact,
      },
    })
  } catch (error) {
    console.error("[v0] Search API error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
