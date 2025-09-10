"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import StatCard from "@/components/StatCard"
import DocumentItem from "@/components/DocumentItem"
import UploadArea from "@/components/UploadArea"
import SearchInterface from "@/components/SearchInterface"
import DepartmentFilter from "@/components/DepartmentFilter"
import DocumentModal from "@/components/DocumentModal"
import FloatingSearch from "@/components/FloatingSearch"
import Notification from "@/components/Notification"
import { RealtimeUpdates } from "@/components/RealtimeUpdates"
import { PerplexityStyleDocument } from "@/components/PerplexityStyleDocument"
import { useNotification } from "@/hooks/useNotification"
import { useUploadedFiles } from "@/hooks/useUploadedFiles"
import { useFileLinks } from "@/hooks/useFileLinks"
// Remove mysql import - using local interface instead

interface NotificationData {
  id: string
  message: string
  type: "success" | "error" | "info"
}

interface FileLink {
  id?: string
  fileID?: string
  title?: string
  url?: string
  created_at?: string
  file_location?: string
  departments?: string[]
}

// Mock data for documents
const mockDocuments = {
  all: [
    {
      title: "Annual Budget Report 2025",
      icon: "fas fa-file-pdf",
      date: "Jan 15, 2025",
      summary:
        "FY 2025 budget allocates ₹2,847 crores for metro expansion with Phase III construction and new train procurement.",
      content:
        "The FY 2025 budget allocates ₹2,847 crores for metro expansion, including ₹1,200 crores for Phase III construction, ₹650 crores for rolling stock procurement, ₹400 crores for station infrastructure upgrades, and ₹597 crores for operational expenses. Key highlights include funding for 3 new lines covering 45 km, procurement of 24 additional train sets, implementation of advanced signaling systems, and establishment of integrated transport hubs.",
      fileLink: "annual_budget_2025.pdf",
      deadline: "Jan 31, 2025",
      isImportant: true,
      department: "finance",
    },
    {
      title: "Safety Protocol Manual",
      icon: "fas fa-file-pdf",
      date: "Jan 10, 2025",
      summary:
        "Updated safety manual with emergency procedures, COVID-19 protocols, and mandatory staff training by Jan 20.",
      content:
        "Comprehensive safety manual covering emergency evacuation procedures, fire safety protocols, platform safety measures, train operation safety standards, and passenger security guidelines. Updated protocols include new COVID-19 safety measures, enhanced CCTV surveillance procedures, improved crowd management strategies during peak hours, emergency communication systems, and coordination protocols with local emergency services.",
      fileLink: "safety_protocol_2025.pdf",
      deadline: "Jan 20, 2025",
      isImportant: true,
      department: "safety",
    },
    {
      title: "Station Infrastructure Assessment Photos",
      icon: "fas fa-file-image",
      date: "Jan 12, 2025",
      summary:
        "Infrastructure assessment photos of all 34 stations documenting structural integrity and safety compliance.",
      content:
        "Critical infrastructure assessment photos documenting structural integrity, platform conditions, escalator functionality, lighting systems, and accessibility features across all 34 operational stations. Photos include before/after renovation comparisons, safety compliance documentation, and areas requiring immediate attention.",
      fileLink: "station_photos_2025.zip",
      deadline: "Jan 25, 2025",
      isImportant: true,
      department: "operations",
    },
    {
      title: "Monthly Newsletter December 2024",
      icon: "fas fa-file-pdf",
      date: "Dec 28, 2024",
      summary: "December newsletter with year-end achievements, 15% ridership growth, and employee recognition awards.",
      content:
        "December newsletter featuring year-end achievements, employee recognition awards, upcoming training programs, policy updates, and New Year celebration plans. Includes ridership statistics showing 15% growth, infrastructure milestones, and community outreach initiatives.",
      fileLink: "newsletter_dec_2024.pdf",
      isImportant: false,
      department: "hr",
    },
    {
      title: "Kakkanad Extension Station Blueprint",
      icon: "fas fa-drafting-compass",
      date: "Jan 08, 2025",
      summary:
        "Architectural blueprints for Kakkanad Extension stations including InfoPark, Rajagiri, and Civil Station.",
      content:
        "Critical architectural blueprints for the new Kakkanad Extension stations including InfoPark, Rajagiri, and Kakkanad Civil Station. Drawings include platform layouts, concourse designs, entry/exit configurations, parking facilities, and integration with existing infrastructure.",
      fileLink: "station_blueprint_v2.dwg",
      deadline: "Jan 30, 2025",
      isImportant: true,
      department: "engineering",
    },
  ],
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [fileLinks, setFileLinks] = useState<FileLink[]>([])
  const [realtimeUpdates, setRealtimeUpdates] = useState<any[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments")
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [sampleDbFiles, setSampleDbFiles] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchForm, setSearchForm] = useState({
    query: '',
    department: '',
    fileType: '',
    dateFrom: '',
    dateTo: '',
    contact: ''
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [modalData, setModalData] = useState({ title: "", content: "", fileLink: "" })
  const { notifications: notificationList, showNotification, removeNotification } = useNotification()

  const {
    files: uploadedFiles,
    links: uploadedLinks,
    refetch: refetchUploads,
    downloadFile,
    deleteFile,
    formatFileSize,
  } = useUploadedFiles()

  const { fileLinks: fileLinksFromHook, loading: fileLinksLoading, refetch: refetchFileLinks } = useFileLinks()

  // Load files from sampleDB folder with real-time monitoring
  useEffect(() => {
    const loadSampleDbFiles = async () => {
      try {
        const response = await fetch('/api/sampledb/files')
        if (response.ok) {
          const files = await response.json()
          setSampleDbFiles(files)
          console.log('Loaded sampleDB files:', files)
        } else {
          console.error('Failed to load sampleDB files:', response.statusText)
        }
      } catch (error) {
        console.error('Error loading sampleDB files:', error)
      }
    }

    // Load immediately
    loadSampleDbFiles()

    // Check for updates every 5 seconds for real-time monitoring
    const interval = setInterval(loadSampleDbFiles, 5000)

    return () => clearInterval(interval) // Cleanup on unmount
  }, [])

  // Auto-search when sampleDB files are loaded or when search tab is active
  useEffect(() => {
    if (activeTab === "search" && sampleDbFiles.length > 0 && searchResults.length === 0) {
      // Show all files by default when search tab is opened
      const allDocuments = sampleDbFiles.map(file => ({
        title: file.ai_title || file.folder_name || file.file_location.split("/").pop(),
        type: "document",
        date: new Date(file.created_at).toLocaleDateString(),
        contact: file.sender || "KMRL System",
        dept: "SampleDB",
        departments: file.departments || [], // Include departments array from API
        content: file.content || "",
        summary: file.summary || "",
        source: "sampleDB",
        fileLocation: file.file_location
      }))
      setSearchResults(allDocuments)
    }
  }, [activeTab, sampleDbFiles, searchResults.length])

  const handleFilesSelected = async (files: FileList) => {
    const formData = new FormData()
    
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }

    try {
      const response = await fetch('/api/upload/files', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        showNotification(result.message, "success")
        await refetchUploads()
      } else {
        showNotification(result.error || 'Upload failed', "error")
      }
    } catch (error) {
      showNotification('Upload failed. Please try again.', "error")
    }
  }

  const handleLinkAdded = async (url: string, title?: string) => {
    try {
      const response = await fetch('/api/upload/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url, title })
      })

      const result = await response.json()

      if (response.ok) {
        showNotification(result.message, "success")
        await refetchUploads()
      } else {
        showNotification(result.error || 'Failed to add link', "error")
      }
    } catch (error) {
      showNotification('Failed to add link. Please try again.', "error")
    }
  }

  const handleSearch = async () => {
    setSearchLoading(true)

    // Simulate API call
    setTimeout(() => {
      // Search through sampleDB files
      const allDocuments = sampleDbFiles.map(file => ({
        title: file.ai_title || file.folder_name || file.file_location.split("/").pop(),
        type: "document",
        date: new Date(file.created_at).toLocaleDateString(),
        contact: file.sender || "KMRL System",
        dept: "SampleDB",
        departments: file.departments || [], // Include departments array from API
        content: file.content || "",
        summary: file.summary || "",
        source: "sampleDB",
        fileLocation: file.file_location
      }))

      const results = allDocuments.filter((doc) => {
        // Query filter - if empty, show all
        const matchesQuery = !searchForm.query || 
          doc.title.toLowerCase().includes(searchForm.query.toLowerCase()) ||
          doc.content.toLowerCase().includes(searchForm.query.toLowerCase()) ||
          doc.summary.toLowerCase().includes(searchForm.query.toLowerCase())

        // Department filter - handle both regular departments and special cases
        const matchesDepartment = !searchForm.department || 
          searchForm.department === '' ||
          searchForm.department.toLowerCase() === 'all departments' ||
          // Handle special "SampleDB" case
          (searchForm.department.toLowerCase() === 'sampledb' && doc.dept.toLowerCase().includes('sampledb')) ||
          // Handle regular department matching from dept.txt files
          (doc.departments && doc.departments.length > 0 && doc.departments.some((dept: string) => 
            dept.toLowerCase() === searchForm.department.toLowerCase()
          ))

        // File type filter - if "All Types" or empty, show all  
        const matchesFileType = !searchForm.fileType || 
          searchForm.fileType === '' ||
          searchForm.fileType.toLowerCase() === 'all types'

        // Contact filter - if empty, show all
        const matchesContact = !searchForm.contact ||
          doc.contact.toLowerCase().includes(searchForm.contact.toLowerCase())

        return matchesQuery && matchesDepartment && matchesFileType && matchesContact
      })

      // Always use filtered results - don't override with allDocuments
      setSearchResults(results)
      
      setSearchLoading(false)
    }, 800)
  }

  const handleSearchInputChange = (field: string, value: string) => {
    setSearchForm(prev => ({ ...prev, [field]: value }))
  }

  const handleDownload = async (fileLink: string) => {
    try {
      if (fileLink.includes("_")) {
        // This is an uploaded file ID from funnel
        const fileId = fileLink.split("_")[0]
        const fileName = fileLink
        await downloadFile(fileId, fileName)
        showNotification(`${fileName} downloaded successfully!`, "success")
      } else if (fileLink.startsWith("sampleDB/")) {
        // This is a sampleDB file or folder
        const encodedPath = encodeURIComponent(fileLink)
        const link = document.createElement('a')
        link.href = `/api/sampledb/download/${encodedPath}`
        
        // Extract filename for download
        const pathParts = fileLink.split("/")
        const filename = pathParts[pathParts.length - 1] || "download"
        link.download = filename
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        showNotification(`Downloading ${filename}...`, "info")
        setTimeout(() => {
          showNotification(`${filename} downloaded successfully!`, "success")
        }, 1500)
      } else {
        // Mock download for demo files
        showNotification(`Downloading ${fileLink}...`, "info")
        setTimeout(() => {
          showNotification(`${fileLink} downloaded successfully!`, "success")
        }, 1500)
      }
    } catch (error) {
      console.error('Download error:', error)
      showNotification("Download failed. Please try again.", "error")
    }
  }

  const handleViewAll = (title: string, content: string, fileLink?: string) => {
    setModalData({ title, content, fileLink: fileLink || "" })
    setModalOpen(true)
  }

  const handleFloatingSearchClick = () => {
    setActiveTab("search")
  }

  return (
    <div className="dashboard-container">
      <Header isDashboard={true} />

      <div className="banner-section dashboard-banner">
        <Image src="/img/2nd.jpg" alt="Inbox Banner" fill className="banner-image" style={{ objectFit: "cover" }} />
        <div className="banner-overlay">
          <h1>Inbox</h1>
        </div>
      </div>

      <div className="main-content">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="content-area">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="page-content">
              <h2>Dashboard</h2>
              <div className="dashboard-stats">
                <StatCard icon="fas fa-file-alt" title="Total Files" value="245" />
                <StatCard icon="fas fa-clock" title="Pending Reviews" value="12" />
                <StatCard icon="fas fa-check-circle" title="Completed" value="198" />
                <StatCard icon="fas fa-exclamation-triangle" title="Urgent" value="5" />
              </div>

              <div style={{ marginTop: "30px" }}>
                <RealtimeUpdates />
              </div>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === "upload" && (
            <div className="page-content">
              <div className="upload-area">
                <h2 style={{ marginBottom: '32px', fontSize: '2rem', fontWeight: '700' }}>Upload Files</h2>
                
                <div className="upload-section">
                  <h3><i className="fas fa-cloud-upload-alt"></i> File Upload</h3>
                  <div 
                    className="file-drop-zone"
                    onDrop={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.remove('drag-over')
                      const files = e.dataTransfer.files
                      if (files.length > 0) {
                        handleFilesSelected(files)
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.add('drag-over')
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.remove('drag-over')
                    }}
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.multiple = true
                      input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.zip,.txt'
                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement
                        if (target.files && target.files.length > 0) {
                          handleFilesSelected(target.files)
                        }
                      }
                      input.click()
                    }}
                  >
                    <i className="fas fa-cloud-upload-alt file-drop-icon"></i>
                    <div className="file-drop-text">Drag & Drop Files Here</div>
                    <div className="file-drop-subtext">or click to browse</div>
                    <button 
                      className="browse-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.multiple = true
                        input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.zip,.txt'
                        input.onchange = (e) => {
                          const target = e.target as HTMLInputElement
                          if (target.files && target.files.length > 0) {
                            handleFilesSelected(target.files)
                          }
                        }
                        input.click()
                      }}
                    >
                      <i className="fas fa-folder-open"></i>
                      Choose Files
                    </button>
                    <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
                      Supported formats: PDF, DOC, DOCX, Images, ZIP (Max: 10MB)
                    </div>
                  </div>
                </div>

                <div className="upload-section">
                  <h3><i className="fas fa-link"></i> Add Links</h3>
                  <div className="link-input-section">
                    <div className="link-input-group">
                      <div style={{ flex: 1 }}>
                        <label htmlFor="link-url" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                          URL or Link
                        </label>
                        <input
                          id="link-url"
                          type="url"
                          placeholder="https://example.com/document.pdf"
                        />
                      </div>
                      <button 
                        className="add-link-button"
                        onClick={() => {
                          const input = document.getElementById('link-url') as HTMLInputElement
                          if (input && input.value.trim()) {
                            handleLinkAdded(input.value.trim())
                            input.value = ''
                          } else {
                            showNotification('Please enter a valid URL', 'error')
                          }
                        }}
                      >
                        <i className="fas fa-plus"></i>
                        Add Link
                      </button>
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
                      Add external document links for easy access
                    </div>
                  </div>
                </div>
              </div>

              {(uploadedFiles.length > 0 || uploadedLinks.length > 0) && (
                <div className="uploaded-files">
                  <h3><i className="fas fa-check-circle"></i> Your Uploads</h3>

                  {/* Display uploaded files */}
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="uploaded-item">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <i className="fas fa-file" style={{ color: "#35b6b9", fontSize: "1.2rem" }}></i>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "600", marginBottom: "4px" }}>{file.name}</div>
                          <div style={{ fontSize: "0.9rem", color: "#666" }}>
                            {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => downloadFile(file.id, file.name)}>
                          <i className="fas fa-download"></i> Download
                        </button>
                        <button 
                          style={{ background: "#dc3545" }}
                          onClick={async () => {
                            try {
                              await deleteFile(file.id, "file")
                              showNotification("File deleted successfully", "success")
                            } catch (error) {
                              console.error("Delete failed:", error)
                              showNotification("Failed to delete file", "error")
                            }
                          }}
                        >
                          <i className="fas fa-trash"></i>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Display uploaded links */}
                  {uploadedLinks.map((link) => (
                    <div key={link.id} className="uploaded-item">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <i className="fas fa-link" style={{ color: "#35b6b9", fontSize: "1.2rem" }}></i>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "600", marginBottom: "4px" }}>{link.title}</div>
                          <div style={{ fontSize: "0.9rem", color: "#666" }}>
                            {new Date(link.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "none" }}
                        >
                          <i className="fas fa-external-link-alt"></i> Open
                        </a>
                        <button 
                          style={{ background: "#dc3545" }}
                          onClick={async () => {
                            try {
                              await deleteFile(link.id, "link")
                              showNotification("Link deleted successfully", "success")
                            } catch (error) {
                              console.error("Delete failed:", error)
                              showNotification("Failed to delete link", "error")
                            }
                          }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search Tab */}
          {activeTab === "search" && (
            <div className="page-content">
              <div className="search-interface">
                <h2 style={{ marginBottom: '32px', fontSize: '2rem', fontWeight: '700' }}>Search Files</h2>
                
                <div className="search-form">
                  <div className="search-input-group">
                    <label htmlFor="search-query">Search Query</label>
                    <input
                      id="search-query"
                      type="text"
                      placeholder="Search files, documents, content..."
                      style={{ fontSize: '1rem' }}
                      value={searchForm.query}
                      onChange={(e) => handleSearchInputChange('query', e.target.value)}
                    />
                  </div>
                  
                  <div className="search-filters-row">
                    <div className="search-input-group">
                      <label htmlFor="department">Department</label>
                      <select 
                        id="department"
                        value={searchForm.department}
                        onChange={(e) => handleSearchInputChange('department', e.target.value)}
                      >
                        <option value="">All Departments</option>
                        <option value="sampledb">SampleDB</option>
                        {/* Dynamic departments from sampleDB files */}
                        {Array.from(new Set(
                          sampleDbFiles.flatMap(file => file.departments || [])
                        )).map(dept => (
                          <option key={dept} value={dept}>{dept.charAt(0).toUpperCase() + dept.slice(1)}</option>
                        ))}
                        {/* Static common departments */}
                        <option value="finance">Finance</option>
                        <option value="hr">Human Resources</option>
                        <option value="operations">Operations</option>
                      </select>
                    </div>
                    
                    <div className="search-input-group">
                      <label htmlFor="file-type">File Type</label>
                      <select 
                        id="file-type"
                        value={searchForm.fileType}
                        onChange={(e) => handleSearchInputChange('fileType', e.target.value)}
                      >
                        <option value="">All Types</option>
                        <option value="pdf">PDF</option>
                        <option value="doc">Document</option>
                        <option value="image">Image</option>
                        <option value="text">Text</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="search-input-group">
                    <label>Date Range</label>
                    <div className="search-date-range">
                      <input 
                        type="date" 
                        placeholder="From date"
                        value={searchForm.dateFrom}
                        onChange={(e) => handleSearchInputChange('dateFrom', e.target.value)}
                      />
                      <input 
                        type="date" 
                        placeholder="To date"
                        value={searchForm.dateTo}
                        onChange={(e) => handleSearchInputChange('dateTo', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="search-input-group">
                    <label htmlFor="contact">Contact</label>
                    <input
                      id="contact"
                      type="text"
                      placeholder="Search by contact name"
                      value={searchForm.contact}
                      onChange={(e) => handleSearchInputChange('contact', e.target.value)}
                    />
                  </div>
                  
                  <button 
                    className="search-button" 
                    onClick={handleSearch}
                    disabled={searchLoading}
                  >
                    {searchLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Searching...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-search"></i>
                        Search Files
                      </>
                    )}
                  </button>
                </div>
              </div>

              {searchLoading && (
                <div className="search-results">
                  <div className="search-loading">
                    <i className="fas fa-spinner fa-spin"></i>
                    Searching through files...
                  </div>
                </div>
              )}

              {!searchLoading && searchResults.length > 0 && (
                <div className="search-results">
                  <div className="search-results-header">
                    <i className="fas fa-search"></i>
                    Search Results ({searchResults.length} found)
                  </div>
                  
                  {searchResults.map((result, index) => (
                    <div key={index} className="search-result-item">
                      <div className="search-result-header">
                        <div>
                          <div className="search-result-title">{result.title}</div>
                          <div className="search-result-meta">
                            <span><i className="fas fa-calendar"></i> {result.date}</span>
                            <span><i className="fas fa-user"></i> {result.contact}</span>
                            <span><i className="fas fa-building"></i> {result.dept}</span>
                            <span><i className="fas fa-file"></i> {result.type}</span>
                          </div>
                        </div>
                        <div className="search-result-actions">
                          <button 
                            className="search-result-btn"
                            onClick={() => handleViewAll(result.title, result.content || result.summary, result.fileLocation)}
                          >
                            <i className="fas fa-eye"></i> View
                          </button>
                          <button 
                            className="search-result-btn"
                            onClick={() => handleDownload(result.fileLocation || result.title)}
                          >
                            <i className="fas fa-download"></i> Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!searchLoading && searchResults.length === 0 && (
                <div className="search-results">
                  <div className="search-no-results">
                    <i className="fas fa-search"></i>
                    <h3>No results found</h3>
                    <p>Try adjusting your search criteria or keywords</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Updates Tab */}
          {activeTab === "updates" && (
            <div className="page-content">
              <div className="updates-header">
                <h2>Updates</h2>
                <DepartmentFilter selectedDepartment={selectedDepartment} onDepartmentChange={setSelectedDepartment} />
              </div>

              {fileLinks.length > 0 && (
                <div className="document-category" style={{ marginBottom: "30px" }}>
                  <h4 className="category-title">
                    <i className="fas fa-database" style={{ color: "#35b6b9", marginRight: "8px" }}></i>
                    Database Files
                  </h4>
                  <div className="category-documents">
                    {fileLinks.map((fileLink) => (
                      <PerplexityStyleDocument key={fileLink.fileID} fileLink={fileLink} onDownload={handleDownload} />
                    ))}
                  </div>
                </div>
              )}

              <div className="document-sections">
                {/* SampleDB Files - Filtered by Department */}
                {(() => {
                  const filteredSampleDbFiles = selectedDepartment === "All Departments" || selectedDepartment === "all"
                    ? sampleDbFiles
                    : sampleDbFiles.filter(file => 
                        file.departments && file.departments.length > 0 && 
                        file.departments.some((dept: string) => dept.toLowerCase() === selectedDepartment.toLowerCase())
                      )
                  
                  if (filteredSampleDbFiles.length > 0) {
                    return (
                      <div className="document-category">
                        <h4 className="category-title important">
                          <i className="fas fa-folder-open important-star"></i> Sample Documents
                        </h4>
                        <div className="category-documents">
                          {filteredSampleDbFiles.map((file) => (
                            <PerplexityStyleDocument
                              key={file.fileID}
                              fileLink={file}
                              onDownload={handleDownload}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  } else if (selectedDepartment !== "All Departments" && selectedDepartment !== "all" && sampleDbFiles.length > 0) {
                    return (
                      <div className="document-category">
                        <h4 className="category-title important">
                          <i className="fas fa-folder-open important-star"></i> Sample Documents
                        </h4>
                        <div className="no-results" style={{ textAlign: "center", padding: "50px", color: "#666" }}>
                          <i className="fas fa-filter" style={{ fontSize: "3rem", color: "#35b6b9", marginBottom: "20px" }}></i>
                          <h3>No results found</h3>
                          <p>No documents found for the selected department: <strong>{selectedDepartment}</strong></p>
                          <p style={{ fontSize: "14px", marginTop: "10px", color: "#888" }}>
                            Try selecting "All Departments" to see all documents
                          </p>
                        </div>
                      </div>
                    )
                  } else {
                    return null
                  }
                })()}

                {sampleDbFiles.length === 0 && fileLinks.length === 0 && (
                  <div className="no-results" style={{ textAlign: "center", padding: "50px", color: "#666" }}>
                    <i
                      className="fas fa-folder-open"
                      style={{ fontSize: "3rem", color: "#35b6b9", marginBottom: "20px" }}
                    ></i>
                    <p>No documents found. Check if sampleDB folder exists.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Search Button - Only visible on updates page */}
      {/* <FloatingSearch isVisible={activeTab === "updates"} onSearchClick={handleFloatingSearchClick} /> */}

      {/* Document Modal */}
      <DocumentModal
        isOpen={modalOpen}
        title={modalData.title}
        content={modalData.content}
        fileLink={modalData.fileLink}
        onClose={() => setModalOpen(false)}
        onDownload={handleDownload}
      />

      {/* Notifications */}
      {notificationList.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}
