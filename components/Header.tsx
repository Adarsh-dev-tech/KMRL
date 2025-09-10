"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

interface HeaderProps {
  isDashboard?: boolean
}

export default function Header({ isDashboard = false }: HeaderProps) {
  const [currentDateTime, setCurrentDateTime] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
      setCurrentDateTime(now.toLocaleDateString("en-US", options))
    }

    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <header className={isDashboard ? "dashboard-header" : "header"}>
      <div className="logo-section">
        <Image src="img/KMRL-logo-300x165.jpg" alt="KMRL Logo" width={165} height={60} className="logo" />
      </div>

      {isDashboard && (
        <div className="header-info">
          <span className="date-time">{currentDateTime}</span>
        </div>
      )}

      <nav className="nav-links">
        <Link href="#help">Help</Link>
        <Link href="#contact">Contact Us</Link>

        {isDashboard && user && (
          <div className="dropdown">
            <button className="profile-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <i className="fas fa-user-circle"></i>
            </button>
            {dropdownOpen && (
              <div className="dropdown-content" style={{ display: "block" }}>
                <div className="profile-info">
                  <strong>{user.employeeId}</strong>
                  <span>{user.employeeId}</span>
                  <span>{user.department}</span>
                </div>
                <div className="dropdown-divider"></div>
                <Link href="#profile">
                  <i className="fas fa-user"></i> Profile
                </Link>
                <Link href="#settings">
                  <i className="fas fa-cog"></i> Settings
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "none",
                    border: "none",
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 15px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
