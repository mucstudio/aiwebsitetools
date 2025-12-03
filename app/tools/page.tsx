import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { ArrowRight, Sparkles, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

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
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
          
          <div className="container relative z-10 mx-auto px-4 text-center">
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl mb-6">
              Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Tool Library</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground mb-10">
              A complete collection of powerful utilities designed to boost your productivity.
            </p>
            
            {/* Search Bar Placeholder - Functionality would need client-side logic */}
            <div className="max-w-md mx-auto relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input 
                type="text" 
                placeholder="Search tools..." 
                className="pl-10 h-12 rounded-full border-primary/20 bg-background/50 backdrop-blur-sm focus:border-primary transition-all"
              />
            </div>
          </div>
        </section>

        <section className="container py-12 px-4 mx-auto">
          {categoriesWithTools.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-muted-foreground/25">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-xl text-muted-foreground mb-2">No tools available at the moment.</p>
              <p className="text-sm text-muted-foreground">We are working hard to bring you new tools. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-20">
              {categoriesWithTools.map((category) => (
                <div key={category.id} className="scroll-mt-24" id={category.slug}>
                  <div className="flex items-center gap-4 mb-8 border-b border-border/50 pb-4">
                    {category.icon && (
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl text-primary">
                        {category.icon}
                      </div>
                    )}
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight">{category.name}</h2>
                      {category.description && (
                        <p className="text-muted-foreground mt-1">{category.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {category.tools.map((tool) => (
                      <Card key={tool.id} className="group hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <div className="p-2 rounded-md bg-muted group-hover:bg-primary/10 transition-colors text-muted-foreground group-hover:text-primary">
                              <Sparkles className="h-5 w-5" />
                            </div>
                            {tool.isPremium && (
                              <Badge variant="default" className="bg-gradient-to-r from-primary to-purple-600 border-0">
                                PRO
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {tool.name}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 mt-2">
                            {tool.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Link href={`/tools/${tool.slug}`}>
                            <Button variant="outline" className="w-full group-hover:border-primary/50 group-hover:text-primary transition-all">
                              Launch Tool <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
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
