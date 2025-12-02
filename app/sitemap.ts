import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { getSiteInfo } from "@/lib/settings"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteInfo = await getSiteInfo()
  const baseUrl = siteInfo.siteUrl

  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ]

  // 获取所有工具
  try {
    const tools = await prisma.tool.findMany({
      where: {
        published: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const toolPages: MetadataRoute.Sitemap = tools.map((tool) => ({
      url: `${baseUrl}/tools/${tool.slug}`,
      lastModified: tool.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }))

    return [...staticPages, ...toolPages]
  } catch (error) {
    console.error("Failed to generate sitemap:", error)
    return staticPages
  }
}
