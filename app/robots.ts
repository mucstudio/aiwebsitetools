import { MetadataRoute } from 'next'
import { getSiteInfo } from "@/lib/settings"

export default async function robots(): Promise<MetadataRoute.Robots> {
  try {
    const siteInfo = await getSiteInfo()
    const siteUrl = siteInfo?.siteUrl || 'http://localhost:3000'

    return {
      rules: {
        userAgent: '*',
        allow: '/',
      },
      sitemap: `${siteUrl}/sitemap.xml`,
    }
  } catch (error) {
    console.error('Failed to generate robots:', error)
    return {
      rules: {
        userAgent: '*',
        allow: '/',
      },
      sitemap: 'http://localhost:3000/sitemap.xml',
    }
  }
}
