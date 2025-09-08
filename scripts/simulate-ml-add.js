const Database = require('better-sqlite3');
const path = require('path');

// Simulate ML algorithm adding a new completed file
const dbPath = path.resolve(process.cwd(), '../../sql/sampleDB/kmrl.db');
const db = new Database(dbPath);

const insert = db.prepare(`
  INSERT INTO files (
    file_location, images_folder_link, tables_folder_link,
    summary_text_link, scanToText_link, source_platform,
    sender, original_filename, file_size, department,
    file_type, processing_status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const newFile = {
  file_location: path.resolve(process.cwd(), '../../sql/sampleDB/New Report.pdf'),
  images_folder_link: path.resolve(process.cwd(), '../../sql/sampleDB/New Report/images'),
  tables_folder_link: path.resolve(process.cwd(), '../../sql/sampleDB/New Report/tables'),
  summary_text_link: path.resolve(process.cwd(), '../../sql/sampleDB/New Report/summary.txt'),
  scanToText_link: path.resolve(process.cwd(), '../../sql/sampleDB/New Report/scanToText.txt'),
  source_platform: 'Email',
  sender: 'ml.algorithm@kmrl.gov.in',
  original_filename: 'New Report.pdf',
  file_size: 750000,
  department: 'admin',
  file_type: 'application/pdf',
  processing_status: 'completed'
};

const result = insert.run(
  newFile.file_location,
  newFile.images_folder_link,
  newFile.tables_folder_link,
  newFile.summary_text_link,
  newFile.scanToText_link,
  newFile.source_platform,
  newFile.sender,
  newFile.original_filename,
  newFile.file_size,
  newFile.department,
  newFile.file_type,
  newFile.processing_status
);

console.log(`ML Algorithm simulation: Added new file with ID: ${result.lastInsertRowid}`);

db.close();