-- Creating files table to match ML algorithm output structure
CREATE TABLE IF NOT EXISTS files (
    fileID SERIAL PRIMARY KEY,
    file_location TEXT NOT NULL,
    images_folder_link TEXT,
    tables_folder_link TEXT,
    summary_text_link TEXT,
    scanToText_link TEXT,
    source_platform VARCHAR(50),
    sender VARCHAR(255),
    original_filename VARCHAR(255),
    file_size BIGINT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processing_status VARCHAR(20) DEFAULT 'pending',
    department VARCHAR(100),
    file_type VARCHAR(50)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_files_upload_date ON files(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_files_status ON files(processing_status);
CREATE INDEX IF NOT EXISTS idx_files_department ON files(department);
