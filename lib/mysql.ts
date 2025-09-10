import mysql from "mysql2/promise"

const connectionConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "kmrl_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

let pool: mysql.Pool | null = null

export async function getConnection() {
  if (!pool) {
    pool = mysql.createPool(connectionConfig)
  }
  return pool
}

export async function initializeDatabase() {
  try {
    const connection = await getConnection()

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${connectionConfig.database}`)

    // Create file_links table for storing file metadata and links
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS file_links (
        fileID INT AUTO_INCREMENT PRIMARY KEY,
        file_location VARCHAR(500) NOT NULL,
        images_folder_link VARCHAR(500),
        tables_folder_link VARCHAR(500),
        summary_text_link VARCHAR(500),
        scanToText_link VARCHAR(500),
        source_platform VARCHAR(100),
        sender VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_source_platform (source_platform),
        INDEX idx_sender (sender),
        INDEX idx_created_at (created_at)
      )
    `)

    // Create document_updates table for tracking changes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS document_updates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        file_link_id INT,
        action ENUM('created', 'updated', 'deleted') NOT NULL,
        old_data JSON,
        new_data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (file_link_id) REFERENCES file_links(fileID) ON DELETE CASCADE,
        INDEX idx_created_at (created_at)
      )
    `)

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Database initialization error:", error)
    throw error
  }
}

export interface FileLink {
  fileID: number
  file_location: string
  images_folder_link?: string
  tables_folder_link?: string
  summary_text_link?: string
  scanToText_link?: string
  source_platform?: string
  sender?: string
  created_at: Date
  updated_at: Date
}
