"use client"

import { useState } from "react"

interface DepartmentFilterProps {
  selectedDepartment: string
  onDepartmentChange: (department: string) => void
}

export default function DepartmentFilter({ selectedDepartment, onDepartmentChange }: DepartmentFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const departments = [
    { id: "all", name: "All Departments" },
    { id: "administration", name: "Administration" },
    { id: "finance", name: "Finance" },
    { id: "operations", name: "Operations" },
    { id: "engineering", name: "Engineering" },
    { id: "safety", name: "Safety & Security" },
    { id: "hr", name: "Human Resources" },
    { id: "maintenance", name: "Maintenance" },
    { id: "planning", name: "Planning & Development" },
  ]

  const selectedDept = departments.find((d) => d.id === selectedDepartment) || departments[0]

  const handleDepartmentSelect = (deptId: string) => {
    onDepartmentChange(deptId)
    setIsOpen(false)
  }

  return (
    <div className="department-filter">
      <button className="department-btn" onClick={() => setIsOpen(!isOpen)}>
        <i className="fas fa-building"></i>
        {selectedDept.name}
        <i className="fas fa-chevron-down"></i>
      </button>

      {isOpen && (
        <div className="department-dropdown active">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => handleDepartmentSelect(dept.id)}
              style={{
                background: "none",
                border: "none",
                width: "100%",
                textAlign: "left",
                display: "block",
                padding: "12px 15px",
                color: "#2c2c2c",
                textDecoration: "none",
                transition: "background 0.3s ease",
                borderBottom: "1px solid rgba(53, 182, 185, 0.1)",
              }}
            >
              {dept.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
