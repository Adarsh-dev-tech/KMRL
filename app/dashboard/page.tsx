"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

interface User {
  userId: string
  department: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [currentTime, setCurrentTime] = useState("")
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("kmrl_user")
    if (!userData) {
      router.push("/login")
      return
    }

    setUser(JSON.parse(userData))

    // Update time
    const updateTime = () => {
      const now = new Date()
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
      setCurrentTime(now.toLocaleDateString("en-US", options))
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("kmrl_user")
    router.push("/login")
  }

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-teal-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-teal-200 px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/KMRL-logo-300x165.jpg"
              alt="KMRL Logo"
              width={120}
              height={66}
              className="h-12 w-auto"
            />
          </div>

          <div className="flex items-center gap-6">
            <span className="text-teal-600 font-medium">{currentTime}</span>

            <nav className="flex gap-6">
              <Link href="#help" className="text-teal-600 hover:text-teal-700 transition-colors">
                Help
              </Link>
              <Link href="#contact" className="text-teal-600 hover:text-teal-700 transition-colors">
                Contact Us
              </Link>
            </nav>

            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="text-teal-600 hover:text-teal-700 text-2xl transition-colors"
              >
                <i className="fas fa-user-circle"></i>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 bg-teal-50 border-b border-teal-200">
                    <div className="font-semibold text-teal-700">Nandha Kishore</div>
                    <div className="text-sm text-gray-600">{user.userId}</div>
                    <div className="text-sm text-gray-600 capitalize">{user.department}</div>
                  </div>

                  <div className="py-2">
                    <Link href="#profile" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700">
                      <i className="fas fa-user"></i>
                      Profile
                    </Link>
                    <Link href="#settings" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700">
                      <i className="fas fa-cog"></i>
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 w-full text-left"
                    >
                      <i className="fas fa-sign-out-alt"></i>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="relative h-48">
        <Image src="/2nd.jpg" alt="Dashboard Banner" fill className="object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-4xl font-bold">Inbox</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-100 border-r border-gray-200 min-h-screen">
          <nav className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => handleSectionChange("dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-r-full transition-all ${
                  activeSection === "dashboard"
                    ? "bg-teal-100 border-l-4 border-teal-500 text-teal-700"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <i className="fas fa-tachometer-alt"></i>
                Dashboard
              </button>

              <button
                onClick={() => handleSectionChange("upload")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-r-full transition-all ${
                  activeSection === "upload"
                    ? "bg-teal-100 border-l-4 border-teal-500 text-teal-700"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <i className="fas fa-upload"></i>
                Upload File
              </button>

              <button
                onClick={() => handleSectionChange("search")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-r-full transition-all ${
                  activeSection === "search"
                    ? "bg-teal-100 border-l-4 border-teal-500 text-teal-700"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <i className="fas fa-search"></i>
                Search File
              </button>

              <button
                onClick={() => handleSectionChange("updates")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-r-full transition-all ${
                  activeSection === "updates"
                    ? "bg-teal-100 border-l-4 border-teal-500 text-teal-700"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <i className="fas fa-bell"></i>
                Updates
              </button>

              <button
                onClick={() => handleSectionChange("files")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-r-full transition-all ${
                  activeSection === "files"
                    ? "bg-teal-100 border-l-4 border-teal-500 text-teal-700"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <i className="fas fa-folder"></i>
                File Manager
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          {activeSection === "dashboard" && <DashboardContent />}
          {activeSection === "upload" && <UploadContent />}
          {activeSection === "search" && <SearchContent />}
          {activeSection === "updates" && <UpdatesContent />}
          {activeSection === "files" && <FileManagerContent />}
        </main>
      </div>

      {activeSection === "updates" && (
        <button className="fixed bottom-6 right-6 bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-full shadow-lg transition-colors">
          <i className="fas fa-search text-xl"></i>
        </button>
      )}
    </div>
  )
}

// Dashboard Content Component
function DashboardContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Files</p>
              <p className="text-2xl font-bold text-teal-600">1,234</p>
            </div>
            <i className="fas fa-file text-3xl text-teal-200"></i>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-orange-600">56</p>
            </div>
            <i className="fas fa-clock text-3xl text-orange-200"></i>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processed</p>
              <p className="text-2xl font-bold text-green-600">1,178</p>
            </div>
            <i className="fas fa-check-circle text-3xl text-green-200"></i>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Storage Used</p>
              <p className="text-2xl font-bold text-blue-600">2.4 GB</p>
            </div>
            <i className="fas fa-hdd text-3xl text-blue-200"></i>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <i className="fas fa-upload text-teal-600"></i>
            <div>
              <p className="font-medium">New file uploaded: Project_Report_2024.pdf</p>
              <p className="text-sm text-gray-600">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <i className="fas fa-check text-green-600"></i>
            <div>
              <p className="font-medium">File processed: Budget_Analysis.xlsx</p>
              <p className="text-sm text-gray-600">15 minutes ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Upload Content Component
function UploadContent() {
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  // Optionally, set department and sender from user/session
  const department = "general" // Replace with actual department if available
  const sender = "unknown"     // Replace with actual sender/email if available

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)
    setUploadError(null)
    setUploadSuccess(null)

    const formData = new FormData()
    selectedFiles.forEach(file => formData.append("files", file))
    formData.append("department", department)
    formData.append("sender", sender)

    try {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/files/upload", true)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(percent)
        }
      }

      xhr.onload = () => {
        setIsUploading(false)
        if (xhr.status === 200) {
          setUploadSuccess("Files uploaded successfully!")
          setSelectedFiles([])
        } else {
          setUploadError("Upload failed. Please try again.")
        }
      }

      xhr.onerror = () => {
        setIsUploading(false)
        setUploadError("Upload failed. Please try again.")
      }

      xhr.send(formData)
    } catch (err) {
      setIsUploading(false)
      setUploadError("Upload failed. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Upload Files</h2>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? "border-teal-500 bg-teal-50" : "border-gray-300"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
          <p className="text-lg text-gray-600 mb-2">Drag and drop files here</p>
          <p className="text-sm text-gray-500 mb-4">or</p>
          <label className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded cursor-pointer transition-colors">
            Choose Files
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
            />
          </label>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800 mb-3">Selected Files:</h3>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-file text-teal-600"></i>
                    <span className="font-medium">{file.name}</span>
                    <span className="text-sm text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button
                    onClick={() => setSelectedFiles((files) => files.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-700"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isUploading && (
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className="bg-teal-600 h-3 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">{uploadProgress}%</p>
          </div>
        )}

        {uploadError && (
          <div className="mt-4 text-red-600 font-semibold">{uploadError}</div>
        )}
        {uploadSuccess && (
          <div className="mt-4 text-green-600 font-semibold">{uploadSuccess}</div>
        )}

        <button
          className="mt-6 bg-teal-600 hover:bg-teal-700 text-white px-8 py-2 rounded font-semibold transition-colors disabled:opacity-60"
          onClick={handleUpload}
          disabled={isUploading || selectedFiles.length === 0}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  )
}

// Search Content Component
function SearchContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [filters, setFilters] = useState({
    department: "",
    fileType: "",
    dateRange: "",
  })

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&department=${filters.department}&fileType=${filters.fileType}&dateRange=${filters.dateRange}`,
      )
      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Search Files</h2>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files, content, or keywords..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.department}
            onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Departments</option>
            <option value="engineering">Engineering</option>
            <option value="finance">Finance</option>
            <option value="operations">Operations</option>
            <option value="hr">Human Resources</option>
          </select>

          <select
            value={filters.fileType}
            onChange={(e) => setFilters((prev) => ({ ...prev, fileType: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All File Types</option>
            <option value="pdf">PDF</option>
            <option value="doc">Word Document</option>
            <option value="xls">Excel</option>
            <option value="img">Images</option>
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Any Date</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Search Results ({searchResults.length})</h3>
          <div className="space-y-4">
            {searchResults.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{result.filename}</h4>
                    <p className="text-sm text-gray-600 mt-1">{result.summary}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Department: {result.department}</span>
                      <span>Type: {result.file_type}</span>
                      <span>Date: {new Date(result.upload_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-teal-600 hover:text-teal-700">
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="text-teal-600 hover:text-teal-700">
                      <i className="fas fa-download"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Updates Content Component (Perplexity-style)
function UpdatesContent() {
  const [updates, setUpdates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState("")

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await fetch(`/api/updates${selectedDepartment ? `?department=${selectedDepartment}` : ""}`)
        const data = await response.json()
        setUpdates(data.updates || [])
      } catch (error) {
        console.error("Error fetching updates:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUpdates()
  }, [selectedDepartment])

  if (isLoading) {
    return (
      <div className="bg-gray-900 min-h-screen text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-6">
                  <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white -m-8 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Document Updates</h1>

          <div className="flex items-center gap-4 mb-6">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Departments</option>
              <option value="engineering">Engineering</option>
              <option value="finance">Finance</option>
              <option value="operations">Operations</option>
              <option value="hr">Human Resources</option>
            </select>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <i className="fas fa-file"></i>
              <span>{updates.length} documents</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {updates.map((update, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-white">{update.filename}</h2>

              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <i className="fas fa-building text-gray-400"></i>
                  <span className="text-gray-300">{update.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-calendar text-gray-400"></i>
                  <span className="text-gray-300">{new Date(update.upload_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-user text-gray-400"></i>
                  <span className="text-gray-300">{update.uploaded_by}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-750 rounded-lg border border-gray-600">
                <span className="text-sm font-medium text-gray-300">Sources</span>
                <div className="flex items-center gap-2">
                  {update.file_type === "pdf" && (
                    <div className="flex items-center gap-1 bg-red-600 px-2 py-1 rounded text-xs">
                      <Image src=" /Icons/PDF.png" alt="PDF" width={16} height={16} />
                      <span>PDF</span>
                    </div>
                  )}
                  {update.file_type === "doc" && (
                    <div className="flex items-center gap-1 bg-blue-600 px-2 py-1 rounded text-xs">
                      <Image src=" /Icons/Word.png" alt="Word" width={16} height={16} />
                      <span>DOC</span>
                    </div>
                  )}
                  {update.file_type === "xls" && (
                    <div className="flex items-center gap-1 bg-green-600 px-2 py-1 rounded text-xs">
                      <Image src=" /Icons/Excel.png" alt="Excel" width={16} height={16} />
                      <span>XLS</span>
                    </div>
                  )}
                  {update.file_type === "img" && (
                    <div className="flex items-center gap-1 bg-purple-600 px-2 py-1 rounded text-xs">
                      <Image src=" /Icons/Image.png" alt="Image" width={16} height={16} />
                      <span>IMG</span>
                    </div>
                  )}
                  <span className="text-xs text-gray-400">1</span>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">{update.summary}</p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>Status: {update.status}</span>
                  <span>Size: {update.file_size}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-teal-400 hover:text-teal-300 transition-colors">
                    <i className="fas fa-eye"></i>
                  </button>
                  <button className="text-teal-400 hover:text-teal-300 transition-colors">
                    <i className="fas fa-download"></i>
                  </button>
                  <button className="text-teal-400 hover:text-teal-300 transition-colors">
                    <i className="fas fa-share"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {updates.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-inbox text-4xl text-gray-600 mb-4"></i>
            <p className="text-gray-400">No updates found for the selected criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function FileManagerContent() {
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [sortBy, setSortBy] = useState("date")
  const [filterStatus, setFilterStatus] = useState("")

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("/api/files")
        const data = await response.json()
        setFiles(data.files || [])
      } catch (error) {
        console.error("Error fetching files:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFiles()
  }, [])

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  const handleBulkAction = async (action: string) => {
    if (selectedFiles.length === 0) return

    try {
      const response = await fetch("/api/files/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, fileIds: selectedFiles }),
      })

      if (response.ok) {
        // Refresh files list
        const updatedResponse = await fetch("/api/files")
        const data = await updatedResponse.json()
        setFiles(data.files || [])
        setSelectedFiles([])
      }
    } catch (error) {
      console.error("Bulk action error:", error)
    }
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return " /Icons/PDF.png"
      case "doc":
        return " /Icons/Word.png"
      case "xls":
        return " /Icons/Excel.png"
      case "img":
        return " /Icons/Image.png"
      default:
        return " /Icons/PDF.png"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100"
      case "processing":
        return "text-yellow-600 bg-yellow-100"
      case "pending":
        return "text-orange-600 bg-orange-100"
      case "failed":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">File Manager</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 rounded">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">File Manager</h2>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${viewMode === "list" ? "bg-teal-100 text-teal-600" : "text-gray-600"}`}
            >
              <i className="fas fa-list"></i>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${viewMode === "grid" ? "bg-teal-100 text-teal-600" : "text-gray-600"}`}
            >
              <i className="fas fa-th"></i>
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
            <option value="status">Sort by Status</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-teal-700 font-medium">
              {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction("download")}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                <i className="fas fa-download mr-2"></i>
                Download
              </button>
              <button
                onClick={() => handleBulkAction("delete")}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                <i className="fas fa-trash mr-2"></i>
                Delete
              </button>
              <button
                onClick={() => setSelectedFiles([])}
                className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded text-sm transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {viewMode === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 p-4">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles(files.map((f) => f.file_id))
                        } else {
                          setSelectedFiles([])
                        }
                      }}
                      checked={selectedFiles.length === files.length && files.length > 0}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Department</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Size</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, index) => (
                  <tr key={file.file_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.file_id)}
                        onChange={() => handleFileSelect(file.file_id)}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={getFileIcon(file.file_type) || "/placeholder.svg"}
                          alt={file.file_type}
                          width={24}
                          height={24}
                        />
                        <div>
                          <div className="font-medium text-gray-800">{file.filename}</div>
                          <div className="text-sm text-gray-500">{file.file_type.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 capitalize">{file.department}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                        {file.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{file.file_size}</td>
                    <td className="p-4 text-gray-600">{new Date(file.upload_date).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="text-teal-600 hover:text-teal-700 p-1">
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="text-teal-600 hover:text-teal-700 p-1">
                          <i className="fas fa-download"></i>
                        </button>
                        <button className="text-red-600 hover:text-red-700 p-1">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
            {files.map((file) => (
              <div
                key={file.file_id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.file_id)}
                    onChange={() => handleFileSelect(file.file_id)}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <div className="flex items-center gap-1">
                    <button className="text-teal-600 hover:text-teal-700 p-1">
                      <i className="fas fa-eye text-sm"></i>
                    </button>
                    <button className="text-teal-600 hover:text-teal-700 p-1">
                      <i className="fas fa-download text-sm"></i>
                    </button>
                  </div>
                </div>

                <div className="text-center mb-3">
                  <Image
                    src={getFileIcon(file.file_type) || "/placeholder.svg"}
                    alt={file.file_type}
                    width={48}
                    height={48}
                    className="mx-auto mb-2"
                  />
                  <h3 className="font-medium text-gray-800 text-sm truncate" title={file.filename}>
                    {file.filename}
                  </h3>
                </div>

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Department:</span>
                    <span className="capitalize">{file.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded-full ${getStatusColor(file.status)}`}>{file.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span>{file.file_size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(file.upload_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {files.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-folder-open text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600">No files found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
