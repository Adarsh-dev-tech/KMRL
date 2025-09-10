"use client"

import type React from "react"

import { useState } from "react"

interface DocumentItemProps {
  title: string
  icon: string
  date: string
  summary: string
  content: string
  fileLink?: string
  deadline?: string
  isImportant?: boolean
  onDownload?: (fileLink: string) => void
  onViewAll?: (title: string, content: string, fileLink?: string) => void
}

export default function DocumentItem({
  title,
  icon,
  date,
  summary,
  content,
  fileLink,
  deadline,
  isImportant = false,
  onDownload,
  onViewAll,
}: DocumentItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (fileLink && onDownload) {
      onDownload(fileLink)
    }
  }

  const handleViewAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onViewAll) {
      onViewAll(title, content, fileLink)
    }
  }

  return (
    <div className={`document-item ${isImportant ? "important-doc" : ""}`}>
      <div className="document-summary" onClick={handleToggle}>
        <div className="document-header">
          <i className={icon}></i>
          <span className="document-title">{title}</span>
          <span className="document-date">{date}</span>
          {deadline && <span className="document-deadline">Deadline: {deadline}</span>}
        </div>
        <p className="document-summary-text" style={{ display: isExpanded ? "none" : "block" }}>
          {summary}
        </p>
      </div>

      {isExpanded && (
        <div className="document-details" style={{ display: "block" }}>
          <div className="document-full-content">
            <p className="document-content">{content}</p>
          </div>
          <div className="document-actions">
            <button className="btn-view-all" onClick={handleViewAll}>
              <i className="fas fa-external-link-alt"></i> View All
            </button>
            {fileLink && (
              <button className="btn-download" onClick={handleDownload}>
                <i className="fas fa-download"></i> Download
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
