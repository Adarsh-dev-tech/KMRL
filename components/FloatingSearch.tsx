"use client"

interface FloatingSearchProps {
  isVisible: boolean
  onSearchClick: () => void
}

export default function FloatingSearch({ isVisible, onSearchClick }: FloatingSearchProps) {
  if (!isVisible) return null

  return (
    <div className="floating-search">
      <button className="search-toggle" onClick={onSearchClick}>
        <i className="fas fa-search"></i>
      </button>
    </div>
  )
}
