"use client"

import { useState, useCallback } from "react"

interface NotificationState {
  message: string
  type: "success" | "error" | "info" | "warning"
  id: number
}

export function useNotification() {
  const [notifications, setNotifications] = useState<NotificationState[]>([])

  const showNotification = useCallback((message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { message, type, id }])
  }, [])

  const removeNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  return {
    notifications,
    showNotification,
    removeNotification,
  }
}
