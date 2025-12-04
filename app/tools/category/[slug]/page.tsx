import { notFound } from "next/navigation"
import { Footer } from "@/components/layout/Footer"
import { prisma } from "@/lib/prisma"
import { ToolCard } from "@/components/tools/ToolCard"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

// 页面需要动态渲染以访问数据库
export const dynamic = 'force-dynamic'

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = await prisma.category.findUnique({
    where: { slug },
  })

  if (!category) {
    return {
      title: "Category Not Found",
    }
  }

  return {
    title: `${category.name} - AI Website Tools`,
    description: category.description || `Explore our collection of ${category.name} tools.`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params

  const category = await prisma.category.findUnique({
    where: { slug },
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
  })

  if (!category) {
    notFound()
  }

  return (
    <>
      <div className="flex-1">
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
          
          <div className="container relative z-10 mx-auto px-4 text-center">
            <div className="mb-8 flex justify-center">
              <Link href="/tools" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Categories
              </Link>
            </div>

            <div className="flex items-center justify-center gap-4 mb-6">
              {category.icon && (
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl text-primary">
                  {category.icon}
                </div>
              )}
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
                {category.name}
              </h1>
            </div>
            
            {category.description && (
              <p className="mx-auto max-w-2xl text-xl text-muted-foreground mb-10">
                {category.description}
              </p>
            )}
          </div>
        </section>

        <section className="container py-12 px-4 mx-auto">
          {category.tools.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-muted-foreground/25">
              <p className="text-xl text-muted-foreground mb-2">No tools available in this category yet.</p>
              <p className="text-sm text-muted-foreground">Check back soon!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {category.tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer showLinks={false} />
    </>
  )
}