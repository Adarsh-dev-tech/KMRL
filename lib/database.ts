// Switch to local database for KMRL requirements
export { DatabaseService, type User, type FileRecord } from './local-database'

// Keep the old implementation commented for reference
/*
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface User {
  id: string
  employee_id: string
  name: string
  department?: string
  position?: string
  created_at: string
  updated_at: string
}

export interface FileRecord {
  fileID: number
  file_location: string
  images_folder_link?: string
  tables_folder_link?: string
  summary_text_link?: string
  scanToText_link?: string
  source_platform?: string
  sender?: string
  original_filename?: string
  file_size?: number
  upload_date: string
  department?: string
  file_type?: string
}

export class DatabaseService {
  // User operations
  static async createUser(
    employee_id: string,
    name: string,
    hashedPassword: string,
    department?: string,
    position?: string,
  ): Promise<User> {
    const result = await sql`
      INSERT INTO users_sync (id, employee_id, name, department, position, raw_json, created_at, updated_at)
      VALUES (gen_random_uuid(), ${employee_id}, ${name}, ${department}, ${position}, ${JSON.stringify({ password: hashedPassword })}, NOW(), NOW())
      RETURNING id, employee_id, name, department, position, created_at, updated_at
    `
    return result[0] as User
  }

  static async getUserByEmployeeId(employee_id: string): Promise<(User & { password: string }) | null> {
    const result = await sql`
      SELECT id, employee_id, name, department, position, created_at, updated_at, raw_json
      FROM users_sync 
      WHERE employee_id = ${employee_id} AND deleted_at IS NULL
    `

    if (result.length === 0) return null

    const user = result[0]
    return {
      ...user,
      password: user.raw_json?.password || "",
    } as User & { password: string }
  }

  static async getUserById(id: string): Promise<User | null> {
    const result = await sql`
      SELECT id, employee_id, name, department, position, created_at, updated_at
      FROM users_sync 
      WHERE id = ${id} AND deleted_at IS NULL
    `

    return result.length > 0 ? (result[0] as User) : null
  }

  // File operations
  static async createFile(fileData: Omit<FileRecord, "fileID" | "upload_date"> & { processing_status: string }): Promise<FileRecord> {
    const result = await sql`
      INSERT INTO files (
        file_location, images_folder_link, tables_folder_link, 
        summary_text_link, scanToText_link, source_platform, 
        sender, original_filename, file_size, processing_status, 
        department, file_type
      )
      VALUES (
        ${fileData.file_location}, ${fileData.images_folder_link}, ${fileData.tables_folder_link},
        ${fileData.summary_text_link}, ${fileData.scanToText_link}, ${fileData.source_platform},
        ${fileData.sender}, ${fileData.original_filename}, ${fileData.file_size},
        ${fileData.processing_status}, ${fileData.department}, ${fileData.file_type}
      )
      RETURNING *
    `
    return result[0] as FileRecord
  }

  static async updateFileProcessingData(
    fileID: number,
    processingData: {
      images_folder_link?: string
      tables_folder_link?: string
      summary_text_link?: string
      scanToText_link?: string
      processing_status: string
    },
  ): Promise<FileRecord> {
    const result = await sql`
      UPDATE files 
      SET 
        images_folder_link = ${processingData.images_folder_link},
        tables_folder_link = ${processingData.tables_folder_link},
        summary_text_link = ${processingData.summary_text_link},
        scanToText_link = ${processingData.scanToText_link},
        processing_status = ${processingData.processing_status}
      WHERE fileID = ${fileID}
      RETURNING *
    `
    return result[0] as FileRecord
  }

  static async getAllFiles(): Promise<FileRecord[]> {
    const result = await sql`
      SELECT * FROM files 
      ORDER BY upload_date DESC
    `
    return result as FileRecord[]
  }

  static async getFilesByDepartment(department?: string): Promise<FileRecord[]> {
    if (!department || department === "all") {
      return this.getAllFiles()
    }

    const result = await sql`
      SELECT * FROM files 
      WHERE department = ${department}
      ORDER BY upload_date DESC
    `
    return result as FileRecord[]
  }

  static async searchFiles(query: string, department?: string): Promise<FileRecord[]> {
    let sqlQuery

    if (!department || department === "all") {
      sqlQuery = sql`
        SELECT * FROM files 
        WHERE original_filename ILIKE ${`%${query}%`} 
           OR sender ILIKE ${`%${query}%`}
           OR source_platform ILIKE ${`%${query}%`}
        ORDER BY upload_date DESC
      `
    } else {
      sqlQuery = sql`
        SELECT * FROM files 
        WHERE (original_filename ILIKE ${`%${query}%`} 
           OR sender ILIKE ${`%${query}%`}
           OR source_platform ILIKE ${`%${query}%`})
           AND department = ${department}
        ORDER BY upload_date DESC
      `
    }

    const result = await sqlQuery
    return result as FileRecord[]
  }

  static async getCompletedFiles(options?: {
    department?: string
    limit?: number
    offset?: number
  }): Promise<FileRecord[]> {
    const { department, limit = 10, offset = 0 } = options || {}
    let result
    if (department && department !== "all") {
      result = await sql`
        SELECT * FROM files
        WHERE processing_status = 'completed' AND department = ${department}
        ORDER BY upload_date DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      result = await sql`
        SELECT * FROM files
        WHERE processing_status = 'completed'
        ORDER BY upload_date DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }
    return result as FileRecord[]
  }

  static async getCompletedFilesCount(department?: string): Promise<number> {
    let result
    if (department && department !== "all") {
      result = await sql`
        SELECT COUNT(*)::int AS count FROM files
        WHERE processing_status = 'completed' AND department = ${department}
      `
    } else {
      result = await sql`
        SELECT COUNT(*)::int AS count FROM files
        WHERE processing_status = 'completed'
      `
    }
    return result[0]?.count ?? 0
  }
}
*/
