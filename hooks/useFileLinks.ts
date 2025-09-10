"use client"

import { useState, useEffect, useCallback } from "react"
import type { FileLink } from "@/lib/mysql"

interface UseFileLinksOptions {
  source_platform?: string
  sender?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useFileLinks(options: UseFileLinksOptions = {}) {
  const [fileLinks, setFileLinks] = useState<FileLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  const fetchFileLinks = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (options.source_platform) params.append("source_platform", options.source_platform)
      if (options.sender) params.append("sender", options.sender)

      const response = await fetch(`/api/database/file-links?${params}`)

      if (response.ok) {
        const data = await response.json()
        setFileLinks(data.fileLinks)
        setLastUpdate(new Date().toISOString())
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch file links")
      }
    } catch (error) {
      console.error("Fetch file links error:", error)
      setError("Failed to fetch file links")
    } finally {
      setLoading(false)
    }
  }, [options.source_platform, options.sender])

  const checkForUpdates = useCallback(async () => {
    if (!lastUpdate) return

    try {
      const response = await fetch(`/api/database/realtime?lastCheck=${lastUpdate}`)

      if (response.ok) {
        const data = await response.json()
        if (data.updates && data.updates.length > 0) {
          // Refresh file links if there are updates
          await fetchFileLinks()
        }
      }
    } catch (error) {
      console.error("Check updates error:", error)
    }
  }, [lastUpdate, fetchFileLinks])

  useEffect(() => {
    fetchFileLinks()
  }, [fetchFileLinks])

  useEffect(() => {
    if (options.autoRefresh && options.refreshInterval) {
      const interval = setInterval(checkForUpdates, options.refreshInterval)
      return () => clearInterval(interval)
    }
  }, [options.autoRefresh, options.refreshInterval, checkForUpdates])

  return {
    fileLinks,
    loading,
    error,
    refetch: fetchFileLinks,
    lastUpdate,
  }
}
