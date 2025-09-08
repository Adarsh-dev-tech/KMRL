import { DatabaseService } from '../lib/local-database'
import path from 'path'

async function insertSampleData() {
  try {
    console.log('Inserting sample data...')
    
    // Insert a sample file record that matches the output.txt format
    const sampleFile = await DatabaseService.createFile({
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
    })

    console.log('Sample file created:', sampleFile)

    // Create a sample user
    const sampleUser = await DatabaseService.createUser(
      'KMRL001',
      'Admin User',
      '$2b$10$hashedpassword',
      'admin',
      'System Administrator'
    )

    console.log('Sample user created:', sampleUser)
    
    console.log('Sample data insertion completed!')
  } catch (error) {
    console.error('Error inserting sample data:', error)
  }
}

if (require.main === module) {
  insertSampleData()
}

export { insertSampleData }