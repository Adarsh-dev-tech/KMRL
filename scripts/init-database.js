require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");

async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
  });

  try {
    // Create database
    await connection.execute("CREATE DATABASE IF NOT EXISTS kmrl_system");
    await connection.query("USE kmrl_system"); // <-- change this line

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
    `);

    // Create document_updates table
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
    `);

    await connection.execute(`
      INSERT IGNORE INTO file_links (
        fileID, file_location, images_folder_link, tables_folder_link, 
        summary_text_link, scanToText_link, source_platform, sender
      ) VALUES 
      (111, 'C:\\Users\\adars\\OneDrive\\Desktop\\sql\\sampleDB\\Moulding Sand\\Moulding Sand.pdf', 
       'C:\\Users\\adars\\OneDrive\\Desktop\\sql\\sampleDB\\Moulding Sand\\images', 
       'C:\\Users\\adars\\OneDrive\\Desktop\\sql\\sampleDB\\Moulding Sand\\tables',
       'C:\\Users\\adars\\OneDrive\\Desktop\\sql\\sampleDB\\Moulding Sand\\summary.txt',
       'C:\\Users\\adars\\OneDrive\\Desktop\\sql\\sampleDB\\Moulding Sand\\scanToText.txt',
       'WhatsApp', 'MinistryOfEducation@gov.in'),
      (112, 'sampleDB/TimeTable.pdf', 
       'sampleDB/TimeTable/images', 
       'sampleDB/TimeTable/tables',
       'sampleDB/TimeTable/summary.txt',
       'sampleDB/TimeTable/scanToText.txt',
       'Email', 'operations@kmrl.co.in'),
      (113, 'sampleDB/Invoice02.jpeg', 
       'sampleDB/Invoice02/images', 
       'sampleDB/Invoice02/tables',
       'sampleDB/Invoice02/summary.txt',
       'sampleDB/Invoice02/scanToText.txt',
       'WhatsApp', 'finance@kmrl.co.in'),
      (114, 'sampleDB/Incovice01.pdf', 
       'sampleDB/Incovice01/images', 
       'sampleDB/Incovice01/tables',
       'sampleDB/Incovice01/summary.txt',
       'sampleDB/Incovice01/scanToText.txt',
       'Email', 'accounts@kmrl.co.in')
    `);

    const fs = require("fs").promises;
    const path = require("path");

    // Create sample content for the files
    const sampleContents = [
      {
        folder: "TimeTable",
        summary:
          "Metro train timetable for all lines with updated schedules for peak and off-peak hours. Includes frequency adjustments and special service timings.",
        content:
          "Comprehensive timetable covering all metro lines with detailed departure and arrival times. Updated schedules reflect increased frequency during peak hours (7-10 AM, 5-8 PM) and reduced intervals during off-peak periods.",
      },
      {
        folder: "Invoice02",
        summary:
          "Invoice for electrical equipment procurement including LED lighting systems and power distribution units for new stations.",
        content:
          "Detailed invoice for electrical infrastructure components: LED lighting systems (₹45,00,000), power distribution units (₹32,00,000), emergency backup systems (₹18,00,000). Total amount: ₹95,00,000 including taxes.",
      },
      {
        folder: "Incovice01",
        summary:
          "Service invoice for maintenance and repair work conducted on escalators and elevators across multiple stations.",
        content:
          "Monthly maintenance invoice covering escalator servicing at 12 stations (₹8,50,000), elevator repairs at 8 stations (₹6,20,000), and emergency call-out services (₹2,30,000). Total: ₹17,00,000.",
      },
    ];

    for (const item of sampleContents) {
      try {
        const folderPath = path.join(process.cwd(), "sampleDB", item.folder);
        await fs.mkdir(folderPath, { recursive: true });

        await fs.writeFile(path.join(folderPath, "summary.txt"), item.summary);
        await fs.writeFile(
          path.join(folderPath, "scanToText.txt"),
          item.content
        );

        console.log(`Created sample files for ${item.folder}`);
      } catch (error) {
        console.log(
          `Note: Could not create sample files for ${item.folder} - ${error.message}`
        );
      }
    }

    console.log(
      "Database initialized successfully with sample data matching output.txt format"
    );
  } catch (error) {
    console.error("Database initialization error:", error);
  } finally {
    await connection.end();
  }
}

initializeDatabase();
