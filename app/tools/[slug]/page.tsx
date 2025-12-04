import { notFound } from "next/navigation"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { ToolRenderer } from "@/components/tools/ToolRenderer"
import { getCurrentSession } from "@/lib/auth-utils"

// 页面需要动态渲染以访问数据库
export const dynamic = 'force-dynamic'

interface ToolPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ToolPageProps) {
  const { slug } = await params
  const tool = await prisma.tool.findUnique({
    where: { slug },
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
  const { slug } = await params

  const tool = await prisma.tool.findUnique({
    where: { slug },
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
    <>
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px] pointer-events-none"></div>
        <div className="absolute right-0 top-0 -z-10 h-[400px] w-[400px] rounded-full bg-purple-500/10 opacity-30 blur-[120px] translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

        <section className="container py-12 relative z-10">
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
                <CardTitle>Subscription Required</CardTitle>
                <CardDescription>
                  This tool is only available to paid subscribers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Upgrade to Pro plan to access this tool and all premium features
                  </p>
                  <a href="/pricing">
                    <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                      View Pricing Plans
                    </button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ) : (
            <ToolRenderer
              toolId={tool.id}
              componentType={tool.componentType}
              codeMode={tool.codeMode}
              config={tool.config as any}
            />
          )}
        </section>
      </div>
      <Footer showLinks={false} />
    </>
  )
}
