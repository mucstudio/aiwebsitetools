"use client"

import { useEffect, useState } from "react"

interface FeatureSettings {
  enableUserDashboard: boolean
  enableFavorites: boolean
  enableUsageTracking: boolean
  enableApiAccess: boolean
  enableToolRatings: boolean
  enableToolComments: boolean
  enableToolSharing: boolean
  enableDarkMode: boolean
  enableNotifications: boolean
  enableNewsletter: boolean
  enableBlog: boolean
  enableDocumentation: boolean
  enableSupportChat: boolean
  enableAnalytics: boolean
  maintenanceMode: boolean
  maintenanceMessage: string
}

const defaultFeatures: FeatureSettings = {
  enableUserDashboard: true,
  enableFavorites: true,
  enableUsageTracking: true,
  enableApiAccess: false,
  enableToolRatings: true,
  enableToolComments: true,
  enableToolSharing: true,
  enableDarkMode: true,
  enableNotifications: true,
  enableNewsletter: true,
  enableBlog: true,
  enableDocumentation: true,
  enableSupportChat: false,
  enableAnalytics: true,
  maintenanceMode: false,
  maintenanceMessage: "",
}

/**
 * 客户端 Hook 用于获取功能开关状态
 */
export function useFeatures() {
  const [features, setFeatures] = useState<FeatureSettings>(defaultFeatures)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFeatures() {
      try {
        const response = await fetch("/api/features")
        if (response.ok) {
          const data = await response.json()
          setFeatures(data.features || defaultFeatures)
        }
      } catch (error) {
        console.error("Failed to load features:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFeatures()
  }, [])

  return { features, loading }
}

/**
 * 检查单个功能是否启用
 */
export function useFeature(featureName: keyof FeatureSettings): boolean {
  const { features, loading } = useFeatures()

  if (loading) {
    return defaultFeatures[featureName]
  }

  return features[featureName]
}
