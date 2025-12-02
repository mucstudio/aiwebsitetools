import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { CategoryRow } from "@/components/admin/CategoryRow"

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
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {parentCategories.map((parentCategory) => (
                <div key={parentCategory.id}>
                  <CategoryRow category={parentCategory} level={0} />
                  {categories
                    .filter((cat) => cat.parentId === parentCategory.id)
                    .map((childCategory) => (
                      <CategoryRow key={childCategory.id} category={childCategory} level={1} />
                    ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
