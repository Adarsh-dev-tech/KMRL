"use client"

import type React from "react"

import { useState, useRef } from "react"

interface UploadAreaProps {
  onFilesSelected: (files: FileList) => void
  onLinkAdded: (link: string) => void
}

export default function UploadArea({ onFilesSelected, onLinkAdded }: UploadAreaProps) {
  const [dragActive, setDragActive] = useState(false)
  const [linkInput, setLinkInput] = useState("")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(e.target.files)
    }
  }

  const uploadFiles = async (files: FileList) => {
    setUploading(true)

    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch("/api/upload/files", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        onFilesSelected(files)
      } else {
        alert(`Upload failed: ${result.error}`)
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleAreaClick = () => {
    if (!uploading) {
      fileInputRef.current?.click()
    }
  }

  const handleAddLink = async () => {
    if (linkInput.trim() && isValidURL(linkInput.trim())) {
      setUploading(true)

      try {
        const response = await fetch("/api/upload/links", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ link: linkInput.trim() }),
        })

        const result = await response.json()

        if (response.ok) {
          onLinkAdded(linkInput.trim())
          setLinkInput("")
        } else {
          alert(`Link upload failed: ${result.error}`)
        }
      } catch (error) {
        console.error("Link upload error:", error)
        alert("Link upload failed. Please try again.")
      } finally {
        setUploading(false)
      }
    } else {
      alert("Please enter a valid URL")
    }
  }

  const isValidURL = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  return (
    <div className="upload-section">
      <div
        className={`upload-area ${dragActive ? "drag-active" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleAreaClick}
        style={{
          borderColor: dragActive ? "#35b6b9" : "rgba(53, 182, 185, 0.5)",
          background: dragActive ? "rgba(53, 182, 185, 0.1)" : "#f8f9fa",
          cursor: uploading ? "not-allowed" : "pointer",
          opacity: uploading ? 0.7 : 1,
        }}
      >
        <div className="upload-content">
          {uploading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              <h3>Uploading...</h3>
              <p>Please wait while files are being uploaded</p>
            </>
          ) : (
            <>
              <i className="fas fa-cloud-upload-alt"></i>
              <h3>Drag & Drop Files Here</h3>
              <p>or click to browse</p>
            </>
          )}
          <input ref={fileInputRef} type="file" multiple hidden onChange={handleFileInput} disabled={uploading} />
        </div>
      </div>

      <div className="link-section">
        <h3>Or Add Links</h3>
        <div className="link-input-group">
          <input
            type="url"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="Paste link here..."
            onKeyPress={(e) => e.key === "Enter" && !uploading && handleAddLink()}
            disabled={uploading}
          />
          <button
            className="add-link-btn"
            onClick={handleAddLink}
            disabled={uploading}
            style={{
              opacity: uploading ? 0.7 : 1,
              cursor: uploading ? "not-allowed" : "pointer",
            }}
          >
            {uploading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-plus"></i>}
          </button>
        </div>
      </div>
    </div>
  )
}
