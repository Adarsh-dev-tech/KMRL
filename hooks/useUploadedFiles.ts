"use client"

import { useState, useEffect } from "react"

export function useUploadedFiles() {
  const [files, setFiles] = useState<any[]>([])
  const [links, setLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/upload/list")
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files || [])
        setLinks(data.links || [])
      }
    } catch (error) {
      console.error("Error fetching uploads:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const downloadFile = async (fileId: string, fileName: string) => {
    try {
      const file = files.find((f) => f.id === fileId)
      if (file) {
        const link = document.createElement("a")
        link.href = `/api/sampledb/download/${encodeURIComponent(file.path)}`
        link.download = file.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error("Download failed:", error)
      throw error
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return {
    files,
    links,
    loading,
    refetch: fetchFiles,
    downloadFile,
    formatFileSize,
  }
}
