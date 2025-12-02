import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { CategoryCard } from "@/components/admin/CategoryCard"

export default async function AdminCategoriesPage() {
  // Get all categories from database with tool count
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { tools: true },
      },
    },
    orderBy: { order: "asc" },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">分类管理</h1>
          <p className="text-muted-foreground">管理工具分类</p>
        </div>
        <Link href="/admin/categories/new">
          <Button>+ 添加新分类</Button>
        </Link>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">暂无分类</p>
            <Link href="/admin/categories/new">
              <Button>创建第一个分类</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  )
}
