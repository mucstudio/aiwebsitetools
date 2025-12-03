import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"

// 页面需要动态渲染以访问数据库
export const dynamic = 'force-dynamic'

export default async function ToolsPage() {
  // Get all categories with their published tools
  const categories = await prisma.category.findMany({
    include: {
      tools: {
        where: {
          isPublished: true,
        },
        orderBy: {
          name: "asc",
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  })

  // Filter out categories with no published tools
  const categoriesWithTools = categories.filter(cat => cat.tools.length > 0)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="container py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">All Tools</h1>
            <p className="text-xl text-muted-foreground">
              Browse our complete collection of online tools
            </p>
          </div>

          {categoriesWithTools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No tools available at the moment.</p>
              <p className="text-sm text-muted-foreground">Check back soon for new tools!</p>
            </div>
          ) : (
            <div className="space-y-12">
              {categoriesWithTools.map((category) => (
                <div key={category.id}>
                  <div className="flex items-center gap-3 mb-6">
                    {category.icon && <span className="text-3xl">{category.icon}</span>}
                    <div>
                      <h2 className="text-2xl font-bold">{category.name}</h2>
                      {category.description && (
                        <p className="text-muted-foreground">{category.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {category.tools.map((tool) => (
                      <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{tool.name}</CardTitle>
                              <CardDescription className="mt-2">{tool.description}</CardDescription>
                            </div>
                            {tool.isPremium && (
                              <span className="ml-2 px-2 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded">
                                PRO
                              </span>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Link href={`/tools/${tool.slug}`}>
                            <Button variant="outline" className="w-full">
                              Use Tool
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
