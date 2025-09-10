"use client"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navItems = [
    { id: "dashboard", icon: "fas fa-tachometer-alt", label: "Dashboard" },
    { id: "upload", icon: "fas fa-upload", label: "Upload File" },
    { id: "search", icon: "fas fa-search", label: "Search File" },
    { id: "updates", icon: "fas fa-bell", label: "Updates" },
  ]

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => onTabChange(item.id)}
            style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
          >
            <i className={item.icon}></i>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
