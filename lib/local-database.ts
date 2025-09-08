import Database from 'better-sqlite3'
import path from 'path'
import { mkdir } from 'fs/promises'

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
  processing_status?: string
}

class LocalDatabaseService {
  private static db: Database.Database | null = null

  private static getDatabase(): Database.Database {
    if (!this.db) {
      // Create sql directory structure to match requirements
      const sqlDir = path.resolve(process.cwd(), '../../sql')
      const sampleDbDir = path.resolve(sqlDir, 'sampleDB')
      const funnelDir = path.resolve(sampleDbDir, 'funnel')
      
      // Ensure directories exist
      try {
        mkdir(sqlDir, { recursive: true }).catch(() => {})
        mkdir(sampleDbDir, { recursive: true }).catch(() => {})
        mkdir(funnelDir, { recursive: true }).catch(() => {})
      } catch (err) {
        console.warn('Could not create directory structure:', err)
      }

      const dbPath = path.resolve(sampleDbDir, 'kmrl.db')
      this.db = new Database(dbPath)
      this.initializeTables()
    }
    return this.db
  }

  private static initializeTables(): void {
    const db = this.getDatabase()

    // Create files table matching the output.txt structure
    db.exec(`
      CREATE TABLE IF NOT EXISTS files (
        fileID INTEGER PRIMARY KEY AUTOINCREMENT,
        file_location TEXT NOT NULL,
        images_folder_link TEXT,
        tables_folder_link TEXT,
        summary_text_link TEXT,
        scanToText_link TEXT,
        source_platform TEXT,
        sender TEXT,
        original_filename TEXT,
        file_size INTEGER,
        upload_date TEXT DEFAULT (datetime('now')),
        department TEXT,
        file_type TEXT,
        processing_status TEXT DEFAULT 'pending'
      )
    `)

    // Create users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users_sync (
        id TEXT PRIMARY KEY,
        employee_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        department TEXT,
        position TEXT,
        raw_json TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        deleted_at TEXT NULL
      )
    `)

    // Create indexes for performance
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_files_upload_date ON files(upload_date DESC);
      CREATE INDEX IF NOT EXISTS idx_files_status ON files(processing_status);
      CREATE INDEX IF NOT EXISTS idx_files_department ON files(department);
    `)
  }

  // File operations
  static async createFile(fileData: Omit<FileRecord, "fileID" | "upload_date"> & { processing_status: string }): Promise<FileRecord> {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      INSERT INTO files (
        file_location, images_folder_link, tables_folder_link, 
        summary_text_link, scanToText_link, source_platform, 
        sender, original_filename, file_size, processing_status, 
        department, file_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const result = stmt.run(
      fileData.file_location,
      fileData.images_folder_link,
      fileData.tables_folder_link,
      fileData.summary_text_link,
      fileData.scanToText_link,
      fileData.source_platform,
      fileData.sender,
      fileData.original_filename,
      fileData.file_size,
      fileData.processing_status,
      fileData.department,
      fileData.file_type
    )

    const getStmt = db.prepare('SELECT * FROM files WHERE fileID = ?')
    return getStmt.get(result.lastInsertRowid) as FileRecord
  }

  static async getAllFiles(): Promise<FileRecord[]> {
    const db = this.getDatabase()
    const stmt = db.prepare('SELECT * FROM files ORDER BY upload_date DESC')
    return stmt.all() as FileRecord[]
  }

  static async getCompletedFiles(options?: {
    department?: string
    limit?: number
    offset?: number
  }): Promise<FileRecord[]> {
    const { department, limit = 10, offset = 0 } = options || {}
    const db = this.getDatabase()
    
    let query = "SELECT * FROM files WHERE processing_status = 'completed'"
    const params: any[] = []

    if (department && department !== "all") {
      query += ' AND department = ?'
      params.push(department)
    }

    query += ' ORDER BY upload_date DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const stmt = db.prepare(query)
    return stmt.all(...params) as FileRecord[]
  }

  static async getCompletedFilesCount(department?: string): Promise<number> {
    const db = this.getDatabase()
    
    let query = "SELECT COUNT(*) as count FROM files WHERE processing_status = 'completed'"
    const params: any[] = []

    if (department && department !== "all") {
      query += ' AND department = ?'
      params.push(department)
    }

    const stmt = db.prepare(query)
    const result = stmt.get(...params) as { count: number }
    return result.count
  }

  static async getFilesByDepartment(department?: string): Promise<FileRecord[]> {
    if (!department || department === "all") {
      return this.getAllFiles()
    }

    const db = this.getDatabase()
    const stmt = db.prepare('SELECT * FROM files WHERE department = ? ORDER BY upload_date DESC')
    return stmt.all(department) as FileRecord[]
  }

  static async searchFiles(query: string, department?: string): Promise<FileRecord[]> {
    const db = this.getDatabase()
    
    let sqlQuery = `
      SELECT * FROM files 
      WHERE (original_filename LIKE ? OR sender LIKE ? OR source_platform LIKE ?)
    `
    const params = [`%${query}%`, `%${query}%`, `%${query}%`]

    if (department && department !== "all") {
      sqlQuery += ' AND department = ?'
      params.push(department)
    }

    sqlQuery += ' ORDER BY upload_date DESC'

    const stmt = db.prepare(sqlQuery)
    return stmt.all(...params) as FileRecord[]
  }

  // User operations
  static async createUser(
    employee_id: string,
    name: string,
    hashedPassword: string,
    department?: string,
    position?: string,
  ): Promise<User> {
    const db = this.getDatabase()
    const id = crypto.randomUUID()
    
    const stmt = db.prepare(`
      INSERT INTO users_sync (id, employee_id, name, department, position, raw_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run(id, employee_id, name, department, position, JSON.stringify({ password: hashedPassword }))

    const getStmt = db.prepare(`
      SELECT id, employee_id, name, department, position, created_at, updated_at
      FROM users_sync WHERE id = ?
    `)
    return getStmt.get(id) as User
  }

  static async getUserByEmployeeId(employee_id: string): Promise<(User & { password: string }) | null> {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      SELECT id, employee_id, name, department, position, created_at, updated_at, raw_json
      FROM users_sync 
      WHERE employee_id = ? AND deleted_at IS NULL
    `)

    const user = stmt.get(employee_id) as any
    if (!user) return null

    const rawJson = user.raw_json ? JSON.parse(user.raw_json) : {}
    return {
      ...user,
      password: rawJson.password || "",
    } as User & { password: string }
  }

  static async getUserById(id: string): Promise<User | null> {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      SELECT id, employee_id, name, department, position, created_at, updated_at
      FROM users_sync 
      WHERE id = ? AND deleted_at IS NULL
    `)

    return stmt.get(id) as User | null
  }

  // New method to poll for database changes
  static async getRecentFiles(since?: string): Promise<FileRecord[]> {
    const db = this.getDatabase()
    
    let query = "SELECT * FROM files WHERE processing_status = 'completed'"
    const params: any[] = []

    if (since) {
      query += ' AND upload_date > ?'
      params.push(since)
    }

    query += ' ORDER BY upload_date DESC'

    const stmt = db.prepare(query)
    return stmt.all(...params) as FileRecord[]
  }
}

export { LocalDatabaseService as DatabaseService }