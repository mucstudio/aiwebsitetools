import { Metadata } from "next"
import { getSEOSettings, getSiteInfo } from "@/lib/settings"

/**
 * 生成页面的 metadata
 */
export async function generateMetadata(options?: {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  noIndex?: boolean
}): Promise<Metadata> {
  const seoSettings = await getSEOSettings()
  const siteInfo = await getSiteInfo()

  const title = options?.title
    ? `${options.title} | ${siteInfo.siteName}`
    : seoSettings.title || siteInfo.siteName

  const description = options?.description || seoSettings.description
  const keywords = options?.keywords || seoSettings.keywords
  const ogImage = options?.ogImage || seoSettings.ogImage

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.split(",").map((k: string) => k.trim()),
    authors: [{ name: siteInfo.companyName }],
    creator: siteInfo.companyName,
    publisher: siteInfo.companyName,
    metadataBase: new URL(siteInfo.siteUrl),
    alternates: {
      canonical: siteInfo.siteUrl,
    },
    openGraph: {
      type: "website",
      locale: "zh_CN",
      url: siteInfo.siteUrl,
      title: seoSettings.ogTitle || title,
      description: seoSettings.ogDescription || description,
      siteName: siteInfo.siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: siteInfo.siteName,
        },
      ],
    },
    twitter: {
      card: seoSettings.twitterCard as any,
      title: seoSettings.ogTitle || title,
      description: seoSettings.ogDescription || description,
      images: [ogImage],
      site: seoSettings.twitterSite,
      creator: seoSettings.twitterCreator,
    },
    robots: {
      index: !options?.noIndex,
      follow: !options?.noIndex,
      googleBot: {
        index: !options?.noIndex,
        follow: !options?.noIndex,
      },
    },
    icons: siteInfo.siteFavicon ? {
      icon: siteInfo.siteFavicon,
      shortcut: siteInfo.siteFavicon,
      apple: siteInfo.siteFavicon,
    } : undefined,
  }

  // 添加 Google Site Verification
  if (seoSettings.googleSiteVerification) {
    metadata.verification = {
      google: seoSettings.googleSiteVerification,
    }
  }

  return metadata
}

/**
 * 生成 robots.txt 内容
 */
export async function generateRobotsTxt(): Promise<string> {
  try {
    const settings = await getSEOSettings()
    const siteInfo = await getSiteInfo()

    // 如果有自定义的 robots.txt，使用自定义的
    if (settings?.robotsTxt) {
      return settings.robotsTxt
    }

    // 否则使用默认的
    const siteUrl = siteInfo?.siteUrl || 'http://localhost:3000'
    return `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml`
  } catch (error) {
    console.error('Failed to generate robots.txt:', error)
    // 返回默认的 robots.txt
    return `User-agent: *
Allow: /

Sitemap: http://localhost:3000/sitemap.xml`
  }
}
