import { getFeatureSettings, getSiteInfo } from "@/lib/settings"
import { Wrench } from "lucide-react"

export default async function MaintenancePage() {
  const [features, siteInfo] = await Promise.all([
    getFeatureSettings(),
    getSiteInfo(),
  ])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
            <div className="relative bg-white dark:bg-gray-800 p-6 rounded-full shadow-xl">
              <Wrench className="h-16 w-16 text-primary animate-pulse" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          网站维护中
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
            {features.maintenanceMessage || "我们正在进行系统维护和升级，以提供更好的服务。"}
          </p>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              如有紧急问题，请联系我们：
            </p>
            <a
              href={`mailto:${siteInfo.supportEmail}`}
              className="text-primary hover:underline font-medium mt-2 inline-block"
            >
              {siteInfo.supportEmail}
            </a>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
          <span>预计很快恢复</span>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-8">
          {siteInfo.siteName} © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
