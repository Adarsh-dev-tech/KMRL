import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const sampleDbPath = path.join(process.cwd(), 'sampleDB')
    
    if (!fs.existsSync(sampleDbPath)) {
      return NextResponse.json([])
    }

    const allFiles: any[] = []
    
    const folders = fs.readdirSync(sampleDbPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name !== 'funnel' && dirent.name !== 'users') // Exclude funnel and users folders
      .map(dirent => dirent.name)

    for (const folder of folders) {
      const folderPath = path.join(sampleDbPath, folder)
      const files = fs.readdirSync(folderPath, { withFileTypes: true })
      
      // Get folder stats for creation date
      const folderStats = fs.statSync(folderPath)
      
      // Process all files in the folder
      const folderFiles = []
      const images = []
      let textContent = ''
      
      for (const file of files) {
        if (file.isFile()) {
          const filePath = path.join(folderPath, file.name)
          const fileStats = fs.statSync(filePath)
          const ext = path.extname(file.name).toLowerCase()
          
          // Categorize files
          if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)) {
            images.push({
              name: file.name,
              path: `sampleDB/${folder}/${file.name}`,
              size: fileStats.size,
              type: 'image'
            })
          } else if (['.txt', '.md'].includes(ext)) {
            try {
              const content = fs.readFileSync(filePath, 'utf-8')
              textContent += content + '\n'
            } catch (error) {
              console.error(`Error reading text file ${file.name}:`, error)
            }
          }
          
          folderFiles.push({
            name: file.name,
            path: `sampleDB/${folder}/${file.name}`,
            size: fileStats.size,
            type: ext.substring(1) || 'unknown',
            modified: fileStats.mtime
          })
        }
      }

      allFiles.push({
        fileID: folder,
        folder_name: folder,
        file_location: `sampleDB/${folder}`,
        sender: 'KMRL System',
        created_at: folderStats.birthtime,
        content: textContent || `Folder containing ${folderFiles.length} files`,
        summary: `${folder} folder with ${folderFiles.length} files${images.length > 0 ? ` (${images.length} images)` : ''}`,
        files: folderFiles,
        images: images,
        hasImages: images.length > 0
      })
    }

    // Sort by creation date (newest first)
    allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json(allFiles)

  } catch (error) {
    console.error('Error reading sampleDB:', error)
    return NextResponse.json({ error: 'Failed to read sampleDB folder' }, { status: 500 })
  }
}