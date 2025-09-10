"use client"

import { useState, useEffect } from "react"
import type { FileLink } from "@/lib/mysql"

// Extended interface for sampleDB files
interface ExtendedFileLink extends FileLink {
  files?: Array<{
    name: string
    path: string
    size: number
    type: string
    modified: string
  }>
  images?: Array<{
    name: string
    path: string
    size: number
    type: string
  }>
  hasImages?: boolean
  summary?: string
  content?: string
}

interface PerplexityStyleDocumentProps {
  fileLink: ExtendedFileLink
  onDownload?: (fileLocation: string) => void
}

export function PerplexityStyleDocument({ fileLink, onDownload }: PerplexityStyleDocumentProps) {
  const [summary, setSummary] = useState<string>("")
  const [content, setContent] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  // Extract file name from file_location
  const fileName = fileLink.file_location?.split("/").pop() || fileLink.fileID || "Unknown File"

  useEffect(() => {
    const loadFileContent = async () => {
      // Only load content when expanded
      if (!isExpanded) return

      // Check if this is sampleDB data (has summary and content properties)
      if ((fileLink as any).summary) {
        setSummary((fileLink as any).summary)
        setContent((fileLink as any).content)
        return
      }

      // Check if this is mock data (has mockSummary property)
      if ((fileLink as any).mockSummary) {
        setSummary((fileLink as any).mockSummary)
        setContent((fileLink as any).mockContent)
        return
      }

      // Original logic for real database files
      if (!fileLink.summary_text_link && !fileLink.scanToText_link) {
        console.log("No summary or scan links available")
        return
      }

      setLoading(true)
      try {
        // Try to load summary from summary_text_link
        if (fileLink.summary_text_link) {
          try {
            const summaryResponse = await fetch(
              `/api/sampledb/content?path=${encodeURIComponent(fileLink.summary_text_link)}`,
            )
            if (summaryResponse.ok) {
              const summaryText = await summaryResponse.text()
              setSummary(summaryText)
            }
          } catch (error) {
            console.error("Error loading summary:", error)
          }
        }

        // Try to load content from scanToText_link
        if (fileLink.scanToText_link) {
          try {
            const contentResponse = await fetch(
              `/api/sampledb/content?path=${encodeURIComponent(fileLink.scanToText_link)}`,
            )
            if (contentResponse.ok) {
              const contentText = await contentResponse.text()
              setContent(contentText)
            }
          } catch (error) {
            console.error("Error loading content:", error)
          }
        }
      } catch (error) {
        console.error("Error loading file content:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFileContent()
  }, [isExpanded, fileLink.summary_text_link, fileLink.scanToText_link, (fileLink as any).mockSummary, (fileLink as any).summary])

  const references = [
    fileLink.images_folder_link && {
      title: "Images Folder",
      url: fileLink.images_folder_link,
      type: "folder",
    },
    fileLink.tables_folder_link && {
      title: "Tables Folder",
      url: fileLink.tables_folder_link,
      type: "folder",
    },
    fileLink.summary_text_link && {
      title: "Summary Text",
      url: fileLink.summary_text_link,
      type: "file",
    },
    fileLink.scanToText_link && {
      title: "Scan to Text",
      url: fileLink.scanToText_link,
      type: "file",
    },
  ].filter(Boolean) as Array<{ title: string; url: string; type: string }>

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Download the first file in the folder, or the folder itself
    const downloadPath = fileLink.files && fileLink.files.length > 0 
      ? fileLink.files[0].path 
      : fileLink.file_location || ''
    onDownload && onDownload(downloadPath)
  }

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(true)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="perplexity-document">
      {/* Collapsed view - just title and meta */}
      <div 
        className="document-header-perplexity" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <div className="document-title-section">
          <h3 className="document-title-perplexity">{fileName}</h3>
          <div className="document-meta">
            {fileLink.source_platform && (
              <span className="document-source">
                <i className="fas fa-database"></i> {fileLink.source_platform}
              </span>
            )}
            {fileLink.sender && (
              <span className="document-sender">
                <i className="fas fa-user"></i> {fileLink.sender}
              </span>
            )}
            {fileLink.created_at && (
              <span className="document-date">
                <i className="fas fa-calendar"></i> {new Date(fileLink.created_at).toLocaleDateString()}
              </span>
            )}
            {fileLink.hasImages && (
              <div className="document-images">
                <i className="fas fa-image"></i>
                <span>{fileLink.images?.length || 0} images</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="expand-controls">
          <button className="download-btn-perplexity" onClick={handleDownload}>
            <i className="fas fa-download"></i>
            Download
          </button>
          <button className="expand-btn-perplexity" onClick={handleView}>
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}>
              Expand
            </i>
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="expanded-content">
          {/* Show images if available */}
          {fileLink.images && fileLink.images.length > 0 && (
            <div className="images-section">
              <div className="images-title">
                <i className="fas fa-images"></i>
                Images ({fileLink.images.length})
              </div>
              <div className="images-grid">
                {fileLink.images.map((image, index: number) => (
                  <div key={index} className="image-item">
                    <img 
                      src={`/api/sampledb/download/${encodeURIComponent(image.path)}`} 
                      alt={image.name}
                      className="preview-image"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                    <div className="image-info">
                      <span className="image-name">{image.name}</span>
                      <span className="image-size">{formatFileSize(image.size)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show all files in the folder */}
          {fileLink.files && fileLink.files.length > 0 && (
            <div className="files-section">
              <div className="files-title">
                <i className="fas fa-folder-open"></i>
                Files ({fileLink.files.length})
              </div>
              <div className="files-list">
                {fileLink.files.map((file, index: number) => (
                  <div key={index} className="file-item">
                    <div className="file-info">
                      <i className={`fas fa-${getFileIcon(file.type)}`}></i>
                      <div className="file-details">
                        <span className="file-name">{file.name}</span>
                        <span className="file-meta">
                          {formatFileSize(file.size)} • {file.type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <button 
                      className="file-download-btn"
                      onClick={() => onDownload && onDownload(file.path)}
                    >
                      <i className="fas fa-download">
                        Download
                      </i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Section */}
          <div className="summary-section">
            <div className="summary-title">
              <i className="fas fa-file-text"></i>
              Summary
            </div>
            <div className="summary-content">
              {fileLink.summary || summary || "No summary available"}
            </div>
          </div>

          {/* Content Section */}
          {(fileLink.content || content) && (fileLink.content || content).trim() && (
            <div className="content-section">
              <div className="content-title">
                <i className="fas fa-align-left"></i>
                Content
              </div>
              <div className="content-text">
                {fileLink.content || content}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function getFileIcon(fileType: string): string {
  const iconMap: { [key: string]: string } = {
    'pdf': 'file-pdf',
    'doc': 'file-word',
    'docx': 'file-word',
    'txt': 'file-alt',
    'jpg': 'file-image',
    'jpeg': 'file-image',
    'png': 'file-image',
    'gif': 'file-image',
    'zip': 'file-archive',
    'rar': 'file-archive',
    'mp4': 'file-video',
    'avi': 'file-video',
    'mp3': 'file-audio',
    'wav': 'file-audio'
  }
  
  return iconMap[fileType.toLowerCase()] || 'file'
}
