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
    <div className="department-filter" style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        className="department-btn" 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          backgroundColor: '#35b6b9',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 4px rgba(53, 182, 185, 0.2)',
          minWidth: '180px',
          justifyContent: 'space-between'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#2da4a7'
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(53, 182, 185, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#35b6b9'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(53, 182, 185, 0.2)'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-building"></i>
          {selectedDept.name}
        </span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ transition: 'transform 0.3s ease' }}></i>
      </button>

      {isOpen && (
        <div 
          className="department-dropdown active"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            marginTop: '4px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          {departments.map((dept, index) => (
            <button
              key={dept.id}
              onClick={() => handleDepartmentSelect(dept.id)}
              style={{
                background: selectedDept.id === dept.id ? 'rgba(53, 182, 185, 0.1)' : 'none',
                border: "none",
                width: "100%",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 16px",
                color: selectedDept.id === dept.id ? '#35b6b9' : '#2c2c2c',
                textDecoration: "none",
                transition: "all 0.2s ease",
                borderBottom: index < departments.length - 1 ? "1px solid rgba(53, 182, 185, 0.1)" : 'none',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: selectedDept.id === dept.id ? '500' : '400'
              }}
              onMouseEnter={(e) => {
                if (selectedDept.id !== dept.id) {
                  e.currentTarget.style.backgroundColor = 'rgba(53, 182, 185, 0.05)'
                  e.currentTarget.style.color = '#35b6b9'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedDept.id !== dept.id) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#2c2c2c'
                }
              }}
            >
              <i className="fas fa-building" style={{ opacity: 0.7, fontSize: '12px' }}></i>
              {dept.name}
              {selectedDept.id === dept.id && (
                <i className="fas fa-check" style={{ marginLeft: 'auto', color: '#35b6b9', fontSize: '12px' }}></i>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
