"use client"

import { useState, useEffect, useCallback } from "react"

interface RealtimeUpdate {
  update_id?: number
  id?: string
  action: "created" | "updated" | "deleted"
  update_time?: string
  created_at?: string
  fileID?: number
  file_location?: string
  source_platform?: string
  sender?: string
  ai_title?: string
  cta?: string
  ai_summary?: string
  images?: string[]
  tables?: string[]
}

interface UseRealtimeUpdatesReturn {
  updates: RealtimeUpdate[]
  totalFiles: number
  isConnected: boolean
  lastUpdate: string | null
}

export function useRealtimeUpdates(intervalMs = 5000): UseRealtimeUpdatesReturn {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([])
  const [totalFiles, setTotalFiles] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [lastCheck, setLastCheck] = useState<string | null>(null)

  const fetchUpdates = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (lastCheck) {
        params.append("lastCheck", lastCheck)
      }

      const response = await fetch(`/api/database/updates?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch updates")
      }

      const data = await response.json()

      if (data.updates.length > 0) {
        setUpdates((prev) => {
          // Merge new updates with existing ones, avoiding duplicates
          const existingIds = new Set(prev.map((u) => u.update_id || u.id))
          const newUpdates = data.updates.filter((u: RealtimeUpdate) => !existingIds.has(u.update_id || u.id))
          return [...newUpdates, ...prev].slice(0, 100) // Keep only latest 100 updates
        })
        setLastUpdate(new Date().toISOString())
      }

      setTotalFiles(data.totalFiles)
      setLastCheck(data.timestamp)
      setIsConnected(true)
    } catch (error) {
      console.error("Error fetching realtime updates:", error)
      setIsConnected(false)
    }
  }, [lastCheck])

  useEffect(() => {
    // Initial fetch
    fetchUpdates()

    // Set up polling interval
    const interval = setInterval(fetchUpdates, intervalMs)

    return () => clearInterval(interval)
  }, [fetchUpdates, intervalMs])

  return {
    updates,
    totalFiles,
    isConnected,
    lastUpdate,
  }
}
