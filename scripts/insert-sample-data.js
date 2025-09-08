const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Create database connection
const sqlDir = path.resolve(process.cwd(), '../../sql');
const sampleDbDir = path.resolve(sqlDir, 'sampleDB');

// Create directories if they don't exist
fs.mkdirSync(sqlDir, { recursive: true });
fs.mkdirSync(sampleDbDir, { recursive: true });
fs.mkdirSync(path.resolve(sampleDbDir, 'funnel'), { recursive: true });

const dbPath = path.resolve(sampleDbDir, 'kmrl.db');
console.log('Database path:', dbPath);

const db = new Database(dbPath);

// Create tables if they don't exist
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
`);

// Insert sample data
const insert = db.prepare(`
  INSERT INTO files (
    file_location, images_folder_link, tables_folder_link,
    summary_text_link, scanToText_link, source_platform,
    sender, original_filename, file_size, department,
    file_type, processing_status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const sampleFiles = [
  {
    file_location: path.resolve(process.cwd(), '../../sql/sampleDB/Moulding Sand.pdf'),
    images_folder_link: path.resolve(process.cwd(), '../../sql/sampleDB/Moulding Sand/images'),
    tables_folder_link: path.resolve(process.cwd(), '../../sql/sampleDB/Moulding Sand/tables'),
    summary_text_link: path.resolve(process.cwd(), '../../sql/sampleDB/Moulding Sand/summary.txt'),
    scanToText_link: path.resolve(process.cwd(), '../../sql/sampleDB/Moulding Sand/scanToText.txt'),
    source_platform: 'WhatsApp',
    sender: 'MinistryOfEducation@gov.in',
    original_filename: 'Moulding Sand.pdf',
    file_size: 1024000,
    department: 'engineering',
    file_type: 'application/pdf',
    processing_status: 'completed'
  },
  {
    file_location: path.resolve(process.cwd(), '../../sql/sampleDB/Safety Report.docx'),
    images_folder_link: path.resolve(process.cwd(), '../../sql/sampleDB/Safety Report/images'),
    tables_folder_link: path.resolve(process.cwd(), '../../sql/sampleDB/Safety Report/tables'),
    summary_text_link: path.resolve(process.cwd(), '../../sql/sampleDB/Safety Report/summary.txt'),
    scanToText_link: path.resolve(process.cwd(), '../../sql/sampleDB/Safety Report/scanToText.txt'),
    source_platform: 'Email',
    sender: 'safety@kmrl.gov.in',
    original_filename: 'Safety Report.docx',
    file_size: 512000,
    department: 'operations',
    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    processing_status: 'completed'
  }
];

console.log('Inserting sample data...');

sampleFiles.forEach((file, index) => {
  const result = insert.run(
    file.file_location,
    file.images_folder_link,
    file.tables_folder_link,
    file.summary_text_link,
    file.scanToText_link,
    file.source_platform,
    file.sender,
    file.original_filename,
    file.file_size,
    file.department,
    file.file_type,
    file.processing_status
  );
  console.log(`Inserted file ${index + 1} with ID: ${result.lastInsertRowid}`);
});

console.log('Sample data insertion completed!');

// Verify data
const allFiles = db.prepare('SELECT * FROM files').all();
console.log('Total files in database:', allFiles.length);

db.close();