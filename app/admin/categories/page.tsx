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
        select: { tools: true, children: true },
      },
      parent: {
        select: { id: true, name: true, slug: true },
      },
      children: {
        select: { id: true, name: true, slug: true, order: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  })

  // Separate parent categories and child categories
  const parentCategories = categories.filter(cat => !cat.parentId)
  const childCategories = categories.filter(cat => cat.parentId)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">分类管理</h1>
          <p className="text-muted-foreground">管理工具分类（支持二级分类）</p>
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
        <div className="space-y-8">
          {/* Parent Categories */}
          <div>
            <h2 className="text-xl font-semibold mb-4">一级分类</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {parentCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>

          {/* Child Categories */}
          {childCategories.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">二级分类</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {childCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
