import { notFound } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { ToolRenderer } from "@/components/tools/ToolRenderer"
import { getCurrentSession } from "@/lib/auth-utils"

interface ToolPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ToolPageProps) {
  const tool = await prisma.tool.findUnique({
    where: { slug: params.slug },
  })

  if (!tool) {
    return {
      title: "Tool Not Found",
    }
  }

  return {
    title: tool.seoTitle || `${tool.name} - AI Website Tools`,
    description: tool.seoDescription || tool.description,
    keywords: tool.tags.join(", "),
  }
}

export default async function ToolPage({ params }: ToolPageProps) {
  const session = await getCurrentSession()

  const tool = await prisma.tool.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
    },
  })

  if (!tool || !tool.isPublished) {
    notFound()
  }

  // 检查是否需要订阅
  const requiresSubscription = tool.isPremium
  const hasAccess = !requiresSubscription || (session?.user && session.user.role !== "USER")

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="container py-12">
          {/* 工具头部 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <a href="/tools" className="hover:text-foreground">All Tools</a>
              <span>/</span>
              <a href={`/tools?category=${tool.category.slug}`} className="hover:text-foreground">
                {tool.category.name}
              </a>
              <span>/</span>
              <span className="text-foreground">{tool.name}</span>
            </div>

            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {tool.icon && <span className="text-4xl">{tool.icon}</span>}
                  <h1 className="text-4xl font-bold">{tool.name}</h1>
                </div>
                <p className="text-xl text-muted-foreground">{tool.description}</p>
              </div>
              {tool.isPremium && (
                <Badge variant="default" className="ml-4">
                  PRO
                </Badge>
              )}
            </div>

            {/* 标签 */}
            {tool.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 工具内容 */}
          {!hasAccess ? (
            <Card>
              <CardHeader>
                <CardTitle>需要订阅</CardTitle>
                <CardDescription>
                  此工具仅对付费订阅用户开放
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    升级到 Pro 计划以使用此工具和所有高级功能
                  </p>
                  <a href="/pricing">
                    <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                      查看订阅计划
                    </button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ) : (
            <ToolRenderer
              toolId={tool.id}
              componentType={tool.componentType}
              config={tool.config as any}
            />
          )}

          {/* 使用统计 */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>已被使用 {tool.usageCount.toLocaleString()} 次</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
