"use client"

import type React from "react"

interface DocumentModalProps {
  isOpen: boolean
  title: string
  content: string
  fileLink?: string
  onClose: () => void
  onDownload?: (fileLink: string) => void
}

export default function DocumentModal({ isOpen, title, content, fileLink, onClose, onDownload }: DocumentModalProps) {
  if (!isOpen) return null

  const handleDownload = () => {
    if (fileLink && onDownload) {
      onDownload(fileLink)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="document-popup-overlay" onClick={handleOverlayClick}>
      <div className="document-popup">
        <div className="popup-header">
          <h3>{title}</h3>
          <button className="popup-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="popup-content">
          <p>{content}</p>
          {fileLink && (
            <div className="popup-file-link">
              <h4>Original Document:</h4>
              <button
                onClick={handleDownload}
                className="file-download-link"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <i className="fas fa-file"></i> {fileLink}
              </button>
            </div>
          )}
        </div>

        <div className="popup-actions">
          {fileLink && (
            <button className="btn-download" onClick={handleDownload}>
              <i className="fas fa-download"></i> Download
            </button>
          )}
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
