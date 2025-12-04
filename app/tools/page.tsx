import Link from "next/link"
import { Footer } from "@/components/layout/Footer"
import { prisma } from "@/lib/prisma"
import { Sparkles, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

// 页面需要动态渲染以访问数据库
export const dynamic = 'force-dynamic'

export default async function ToolsPage() {
  // Get all categories with their published tools count
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          tools: {
            where: {
              isPublished: true,
            },
          },
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  })

  // Filter out categories with no published tools
  const categoriesWithTools = categories.filter(cat => cat._count.tools > 0)

  return (
    <>
      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
          <div className="absolute right-0 top-0 -z-10 h-[400px] w-[400px] rounded-full bg-purple-500/10 opacity-30 blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute left-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-blue-500/10 opacity-30 blur-[120px] -translate-x-1/2 translate-y-1/2"></div>

          <div className="container relative z-10 mx-auto px-4 text-center">
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl mb-6">
              Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Tool Categories</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground mb-10">
              Browse our comprehensive collection of tools organized by category.
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
              <p className="text-xl text-muted-foreground mb-2">No categories available at the moment.</p>
              <p className="text-sm text-muted-foreground">We are working hard to bring you new tools. Check back soon!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categoriesWithTools.map((category) => (
                <Link key={category.id} href={`/tools/category/${category.slug}`} className="group">
                  <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        {category.icon && (
                          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            {category.icon}
                          </div>
                        )}
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        {category._count.tools} tools available
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer showLinks={false} />
    </>
  )
}
