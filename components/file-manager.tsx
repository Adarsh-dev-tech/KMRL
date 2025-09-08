"use client"

import { useState, useEffect } from "react"

interface FileItem {
  fileID: string
  title: string
  file_size: string
  file_type: string
  department: string
  sender: string
  upload_date: string
  status: string
  tags: string[]
}

interface FileManagerProps {
  onFileSelect?: (fileId: string) => void
  selectedFiles?: string[]
  onSelectionChange?: (fileIds: string[]) => void
}

export default function FileManager({ onFileSelect, selectedFiles = [], onSelectionChange }: FileManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [sortBy, setSortBy] = useState<"date" | "name" | "size">("date")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showBulkActions, setShowBulkActions] = useState(false)

  useEffect(() => {
    fetchFiles()
  }, [])

  useEffect(() => {
    setShowBulkActions(selectedFiles.length > 0)
  }, [selectedFiles])

  const fetchFiles = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/updates?limit=50")
      const result = await response.json()

      if (result.success) {
        // Transform updates data to file manager format
        const fileData = result.data.map((item: any) => ({
          fileID: item.fileID,
          title: item.title,
          file_size: "2.4 MB", // Mock size
          file_type: "application/pdf",
          department: item.sender.includes("finance")
            ? "Finance"
            : item.sender.includes("safety")
              ? "Safety"
              : "Engineering",
          sender: item.sender,
          upload_date: item.uploadDate || "2025-01-15",
          status: item.status || "completed",
          tags: ["document", "processed"],
        }))
        setFiles(fileData)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch files:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (fileId: string) => {
    if (onSelectionChange) {
      const newSelection = selectedFiles.includes(fileId)
        ? selectedFiles.filter((id) => id !== fileId)
        : [...selectedFiles, fileId]
      onSelectionChange(newSelection)
    }

    if (onFileSelect) {
      onFileSelect(fileId)
    }
  }

  const handleSelectAll = () => {
    if (onSelectionChange) {
      const allSelected = selectedFiles.length === files.length
      onSelectionChange(allSelected ? [] : files.map((f) => f.fileID))
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedFiles.length === 0) return

    try {
      const response = await fetch("/api/files/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          fileIds: selectedFiles,
          updates: action === "update_status" ? { status: "archived" } : {},
        }),
      })

      const result = await response.json()
      if (result.success) {
        console.log("[v0] Bulk action completed:", action)
        fetchFiles() // Refresh the list
        if (onSelectionChange) onSelectionChange([])
      }
    } catch (error) {
      console.error("[v0] Bulk action failed:", error)
    }
  }

  const handleDownload = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/download/${fileId}`)
      const result = await response.json()

      if (result.success) {
        console.log("[v0] Download initiated:", result.filename)
        // In a real app, this would trigger the actual download
      }
    } catch (error) {
      console.error("[v0] Download failed:", error)
    }
  }

  const filteredFiles = files.filter((file) => filterStatus === "all" || file.status === filterStatus)

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.title.localeCompare(b.title)
      case "size":
        return a.file_size.localeCompare(b.file_size)
      case "date":
      default:
        return new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime()
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <i className="fas fa-spinner fa-spin text-2xl text-teal-500 mr-3"></i>
        <span className="text-gray-600">Loading files...</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-800">File Manager</h3>
            <span className="text-sm text-gray-500">({sortedFiles.length} files)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${viewMode === "list" ? "bg-teal-100 text-teal-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              <i className="fas fa-list"></i>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${viewMode === "grid" ? "bg-teal-100 text-teal-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              <i className="fas fa-th-large"></i>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-teal-500"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
          </select>

          {showBulkActions && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-600">{selectedFiles.length} selected</span>
              <button
                onClick={() => handleBulkAction("delete")}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
              >
                <i className="fas fa-trash mr-1"></i>Delete
              </button>
              <button
                onClick={() => handleBulkAction("update_status")}
                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
              >
                <i className="fas fa-archive mr-1"></i>Archive
              </button>
            </div>
          )}
        </div>
      </div>

      {/* File List */}
      <div className="p-4">
        {viewMode === "list" ? (
          <div className="space-y-2">
            <div className="flex items-center p-2 border-b border-gray-100 text-sm font-medium text-gray-600">
              <div className="w-8">
                <input
                  type="checkbox"
                  checked={selectedFiles.length === files.length && files.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
              </div>
              <div className="flex-1">Name</div>
              <div className="w-24">Size</div>
              <div className="w-32">Department</div>
              <div className="w-24">Status</div>
              <div className="w-32">Date</div>
              <div className="w-24">Actions</div>
            </div>

            {sortedFiles.map((file) => (
              <div
                key={file.fileID}
                className={`flex items-center p-2 rounded hover:bg-gray-50 transition-colors ${
                  selectedFiles.includes(file.fileID) ? "bg-teal-50" : ""
                }`}
              >
                <div className="w-8">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.fileID)}
                    onChange={() => handleFileSelect(file.fileID)}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                </div>
                <div className="flex-1 flex items-center gap-3">
                  <i className="fas fa-file-pdf text-red-500"></i>
                  <span className="font-medium text-gray-800 truncate">{file.title}</span>
                </div>
                <div className="w-24 text-sm text-gray-600">{file.file_size}</div>
                <div className="w-32 text-sm text-gray-600">{file.department}</div>
                <div className="w-24">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      file.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : file.status === "processing"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {file.status}
                  </span>
                </div>
                <div className="w-32 text-sm text-gray-600">{new Date(file.upload_date).toLocaleDateString()}</div>
                <div className="w-24 flex items-center gap-1">
                  <button
                    onClick={() => handleDownload(file.fileID)}
                    className="p-1 text-gray-400 hover:text-teal-600 transition-colors"
                    title="Download"
                  >
                    <i className="fas fa-download"></i>
                  </button>
                  <button
                    onClick={() => console.log("[v0] View file:", file.fileID)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {sortedFiles.map((file) => (
              <div
                key={file.fileID}
                className={`relative p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer ${
                  selectedFiles.includes(file.fileID) ? "border-teal-500 bg-teal-50" : ""
                }`}
                onClick={() => handleFileSelect(file.fileID)}
              >
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.fileID)}
                    onChange={() => handleFileSelect(file.fileID)}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="text-center">
                  <i className="fas fa-file-pdf text-4xl text-red-500 mb-3"></i>
                  <h4 className="font-medium text-sm text-gray-800 truncate mb-2">{file.title}</h4>
                  <p className="text-xs text-gray-500 mb-1">{file.file_size}</p>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      file.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : file.status === "processing"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {file.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {sortedFiles.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-folder-open text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-500">No files found</p>
          </div>
        )}
      </div>
    </div>
  )
}
