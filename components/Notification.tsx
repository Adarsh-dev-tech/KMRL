"use client"

import { useEffect } from "react"

interface NotificationProps {
  message: string
  type: "success" | "error" | "info" | "warning"
  onClose: () => void
  duration?: number
}

export default function Notification({ message, type, onClose, duration = 3000 }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const colors = {
    success: "#4CAF50",
    error: "#f44336",
    info: "#35b6b9",
    warning: "#ff9800",
  }

  return (
    <div
      className="notification"
      style={{
        backgroundColor: colors[type],
        color: "white",
      }}
    >
      {message}
    </div>
  )
}
