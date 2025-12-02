"use client"

import Script from "next/script"
import { useEffect, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"

interface GoogleAnalyticsProps {
  gaId: string
}

function GoogleAnalyticsTracker({ gaId }: GoogleAnalyticsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!gaId) return

    const url = pathname + searchParams.toString()

    // 发送页面浏览事件
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("config", gaId, {
        page_path: url,
      })
    }
  }, [pathname, searchParams, gaId])

  return null
}

export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  if (!gaId) {
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <GoogleAnalyticsTracker gaId={gaId} />
      </Suspense>
    </>
  )
}
