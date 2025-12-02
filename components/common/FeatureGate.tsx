"use client"

import { useFeature } from "@/hooks/useFeatures"
import { ReactNode } from "react"

interface FeatureGateProps {
  feature: string
  children: ReactNode
  fallback?: ReactNode
}

/**
 * 功能开关门控组件
 * 根据功能开关决定是否渲染子组件
 */
export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const isEnabled = useFeature(feature as any)

  if (!isEnabled) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
