"use client"

import { useState, useEffect } from "react"
// Interface for sampleDB files
interface ExtendedFileLink {
  fileID?: string
  file_location?: string
  created_at?: string
  sender?: string
  source_platform?: string
  departments?: string[] // Department tags from dept.txt
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
  ai_title?: string
  cta?: string
  ai_summary?: string
  tables?: string[]
  // Legacy database fields
  summary_text_link?: string
  scanToText_link?: string
  images_folder_link?: string
  tables_folder_link?: string
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

  // Use AI title if available, otherwise fallback to file name
  const displayTitle = fileLink.ai_title || fileLink.file_location?.split("/").pop() || fileLink.fileID || "Unknown File"

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
          <h3 className="document-title-perplexity" style={{fontWeight: 'bold'}}>{displayTitle}</h3>
          <div className="document-meta">
            {fileLink.departments && fileLink.departments.length > 0 && (
              <div className="document-departments">
                <i className="fas fa-building"></i>
                {fileLink.departments.map((dept, index) => (
                  <span 
                    key={index} 
                    className="department-tag" 
                    style={{
                      backgroundColor: '#35b6b9',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      marginLeft: '4px',
                      display: 'inline-block'
                    }}
                  >
                    {dept}
                  </span>
                ))}
              </div>
            )}
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
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
            Expand
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
                {fileLink.images.map((image: { name: string; path: string; size: number; type: string }, index: number) => (
                  <img
                    key={index}
                    src={`/api/sampledb/download/${encodeURIComponent(image.path)}`}
                    alt={`Image ${index + 1}: ${image.name}`}
                    className="perplexity-image"
                    title={`${image.name} (${formatFileSize(image.size)})`}
                    style={{ width: '150px', height: '100px', objectFit: 'cover', margin: '5px', borderRadius: '4px' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Show tables if available */}
          {fileLink.tables && fileLink.tables.length > 0 && (
            <div className="tables-section" style={{ margin: '15px 0' }}>
              <div className="tables-title">
                <i className="fas fa-table"></i>
                Tables ({fileLink.tables.length})
              </div>
              <div className="tables-list">
                {fileLink.tables.map((table: string, index: number) => (
                  <a
                    key={index}
                    href={table}
                    className="table-link"
                    style={{ 
                      display: 'block', 
                      color: '#35b6b9',
                      textDecoration: 'none',
                      margin: '5px 0',
                      padding: '5px 10px',
                      border: '1px solid #35b6b9',
                      borderRadius: '4px'
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fas fa-download"></i> Table {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Show CTA if available */}
          {fileLink.cta && fileLink.cta.trim() && (
            <div className="cta-section" style={{ margin: '15px 0' }}>
              <h4 style={{ color: '#35b6b9', fontWeight: 'bold', marginBottom: '8px' }}>CTA:</h4>
              <div style={{ 
                backgroundColor: '#e0f7f7', 
                padding: '10px', 
                borderRadius: '4px',
                borderLeft: '4px solid #35b6b9',
                fontSize: '14px'
              }}>
                {fileLink.cta}
              </div>
            </div>
          )}

          {/* Show AI summary if available */}
          {fileLink.ai_summary && fileLink.ai_summary.trim() && (
            <div className="summary-section" style={{ margin: '15px 0' }}>
              <h4 style={{ color: '#35b6b9', fontWeight: 'bold', marginBottom: '8px' }}>Summary:</h4>
              <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '15px', 
                borderRadius: '4px',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                {fileLink.ai_summary}
              </div>
            </div>
          )}

          {/* Legacy content - only show if no AI content available */}
          {(!fileLink.ai_summary || !fileLink.ai_summary.trim()) && (
            <>
              {/* Summary Section */}
              {(loading || summary || fileLink.summary) && (
                <div className="summary-section">
                  <div className="summary-title">
                    <i className="fas fa-file-text"></i>
                    Summary
                  </div>
                  <div className="summary-content">
                    {loading ? "Loading..." : (summary || fileLink.summary || "No summary available")}
                  </div>
                </div>
              )}

              {/* Content Section */}
              {(content || fileLink.content) && (
                <div className="content-section">
                  <div className="content-title">
                    <i className="fas fa-align-left"></i>
                    Content
                  </div>
                  <div className="content-text" style={{ fontSize: '14px', lineHeight: '1.6', color: '#666' }}>
                    {content || fileLink.content}
                  </div>
                </div>
              )}

              {/* Show legacy files if available */}
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
                          <i className="fas fa-file"></i>
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
                          <i className="fas fa-download"></i>
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* References/Links Section */}
          {references.length > 0 && (
            <div className="references-section">
              <div className="references-title">
                <i className="fas fa-link"></i>
                References ({references.length})
              </div>
              <div className="references-list">
                {references.map((ref, index: number) => (
                  <a key={index} href={`/api/sampledb/download/${encodeURIComponent(ref.url)}`} className="reference-link">
                    <i className={`fas fa-${ref.type === 'folder' ? 'folder' : 'file'}`}></i>
                    {ref.title}
                  </a>
                ))}
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
