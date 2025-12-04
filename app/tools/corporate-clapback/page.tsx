import Link from "next/link"
import { notFound } from "next/navigation"
import { Footer } from "@/components/layout/Footer"
import { CorporateClapback } from "@/components/tools/CorporateClapback"
import { prisma } from "@/lib/prisma"

export default async function CorporateClapbackPage() {
  const tool = await prisma.tool.findUnique({
    where: { slug: 'corporate-clapback' },
    include: {
      category: true,
    },
  })

  if (!tool) {
    notFound()
  }

  return (
    <>
      <div className="flex-1 flex flex-col">
        {/* 顶部信息栏 */}
        <div className="container py-8 pb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/tools" className="hover:text-foreground">All Tools</Link>
            <span>/</span>
            <Link href={`/tools?category=${tool.category.slug}`} className="hover:text-foreground">
              {tool.category.name}
            </Link>
            <span>/</span>
            <span className="text-foreground">{tool.name}</span>
          </div>

          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {tool.icon && <span className="text-4xl">{tool.icon}</span>}
                <h1 className="text-4xl font-bold">{tool.name}</h1>
              </div>
              <p className="text-xl text-muted-foreground">
                {tool.description}
              </p>
            </div>
          </div>
        </div>

        {/* 工具主体 - 会自动填充剩余空间 */}
        <CorporateClapback
          toolName={tool.name}
          toolDescription={tool.description}
          toolIcon={tool.icon}
        />
      </div>
      <Footer />
    </>
  )
}
