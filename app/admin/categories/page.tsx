import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

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
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {category.icon && <span className="text-2xl">{category.icon}</span>}
                      <CardTitle>{category.name}</CardTitle>
                    </div>
                    <CardDescription>{category.description}</CardDescription>
                    <div className="mt-3 text-sm text-muted-foreground">
                      <p>工具数量: {category._count.tools}</p>
                      <p>URL 标识: {category.slug}</p>
                      <p>排序: {category.order}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Link href={`/admin/categories/${category.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">编辑</Button>
                  </Link>
                  <form action={`/api/admin/categories/${category.id}`} method="POST" className="flex-1">
                    <input type="hidden" name="_method" value="DELETE" />
                    <Button
                      type="submit"
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      disabled={category._count.tools > 0}
                    >
                      删除
                    </Button>
                  </form>
                </div>
                {category._count.tools > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    * 有工具的分类无法删除
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
