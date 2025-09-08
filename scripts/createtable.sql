-- Database schema for KMRL Document Management System
CREATE DATABASE IF NOT EXISTS kmrl_docs;
USE kmrl_docs;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department ENUM('admin', 'finance', 'operations', 'hr') NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Files table for document management
CREATE TABLE IF NOT EXISTS files (
    fileID INT AUTO_INCREMENT PRIMARY KEY,
    file_location VARCHAR(500) NOT NULL,
    images_folder_link VARCHAR(500),
    tables_folder_link VARCHAR(500),
    scanToText_link VARCHAR(500),
    summary_text_link VARCHAR(500) NOT NULL,
    sender VARCHAR(255),
    platform VARCHAR(100),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_date TIMESTAMP NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending'
);
