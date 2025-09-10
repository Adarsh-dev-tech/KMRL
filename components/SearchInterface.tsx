"use client"

import { useState } from "react"

interface SearchFilters {
  query: string
  department: string
  fileType: string
  dateFrom: string
  dateTo: string
  contact: string
}

interface SearchInterfaceProps {
  onSearch: (filters: SearchFilters) => void
  results: any[]
  loading: boolean
}

export default function SearchInterface({ onSearch, results, loading }: SearchInterfaceProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    department: "",
    fileType: "",
    dateFrom: "",
    dateTo: "",
    contact: "",
  })

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    // Auto-search when filters change (except main query)
    if (key !== "query") {
      onSearch(newFilters)
    }
  }

  return (
    <div className="search-interface">
      <div className="search-bar-main">
        <input
          type="text"
          value={filters.query}
          onChange={(e) => handleFilterChange("query", e.target.value)}
          placeholder="Search files, documents, contacts..."
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <button className="search-btn-main" onClick={handleSearch}>
          <i className="fas fa-search"></i>
        </button>
      </div>

      <div className="search-filters">
        <div className="filter-group">
          <label>Department:</label>
          <select value={filters.department} onChange={(e) => handleFilterChange("department", e.target.value)}>
            <option value="">All Departments</option>
            <option value="administration">Administration</option>
            <option value="finance">Finance</option>
            <option value="operations">Operations</option>
            <option value="engineering">Engineering</option>
            <option value="safety">Safety & Security</option>
            <option value="hr">Human Resources</option>
            <option value="maintenance">Maintenance</option>
            <option value="planning">Planning & Development</option>
          </select>
        </div>

        <div className="filter-group">
          <label>File Type:</label>
          <select value={filters.fileType} onChange={(e) => handleFilterChange("fileType", e.target.value)}>
            <option value="">All Types</option>
            <option value="pdf">PDF Documents</option>
            <option value="image">Images</option>
            <option value="excel">Spreadsheets</option>
            <option value="word">Documents</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Date Range:</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            placeholder="From"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            placeholder="To"
          />
        </div>

        <div className="filter-group">
          <label>Contact:</label>
          <input
            type="text"
            value={filters.contact}
            onChange={(e) => handleFilterChange("contact", e.target.value)}
            placeholder="Search by contact name"
          />
        </div>
      </div>

      <div className="search-results">
        {loading ? (
          <div className="no-results">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Searching...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="no-results">
            <i className="fas fa-search"></i>
            <p>Enter search terms to find files and documents</p>
          </div>
        ) : (
          <div>
            <div className="search-results-header">
              <h3>Search Results ({results.length} found)</h3>
            </div>
            {results.map((result, index) => (
              <div key={index} className="search-result-item">
                <div className="result-header">
                  <i
                    className={`fas fa-file-${result.type === "pdf" ? "pdf" : result.type === "excel" ? "excel" : result.type === "word" ? "word" : "alt"}`}
                  ></i>
                  <div className="result-info">
                    <strong>{result.title}</strong>
                    <div className="result-meta">
                      <span>
                        <i className="fas fa-building"></i> {result.dept}
                      </span>
                      <span>
                        <i className="fas fa-user"></i> {result.contact}
                      </span>
                      <span>
                        <i className="fas fa-calendar"></i> {result.date}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="result-actions">
                  <button className="btn-download">
                    <i className="fas fa-download"></i> Download
                  </button>
                  <button className="btn-view">
                    <i className="fas fa-eye"></i> View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
