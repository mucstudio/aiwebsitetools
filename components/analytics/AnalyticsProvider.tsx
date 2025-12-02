import { getSEOSettings, getFeatureSettings } from "@/lib/settings"
import { GoogleAnalytics } from "./GoogleAnalytics"

export async function AnalyticsProvider() {
  const [seoSettings, featureSettings] = await Promise.all([
    getSEOSettings(),
    getFeatureSettings(),
  ])

  // 如果分析功能未启用或没有 GA ID，不加载
  if (!featureSettings.enableAnalytics || !seoSettings.googleAnalyticsId) {
    return null
  }

  return <GoogleAnalytics gaId={seoSettings.googleAnalyticsId} />
}
