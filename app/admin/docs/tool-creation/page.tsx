import { Card, CardContent } from "@/components/ui/card"
import { getCurrentSession } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { promises as fs } from 'fs'
import path from 'path'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import MarkdownRenderer from "./MarkdownRenderer"

export default async function ToolCreationDocPage() {
  const session = await getCurrentSession()

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  // 读取 Markdown 文档
  const docPath = path.join(process.cwd(), 'TOOL_CREATION_GUIDE.md')
  const content = await fs.readFile(docPath, 'utf8')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">小工具添加系统 - 完整开发指南</h1>
          <p className="text-muted-foreground">从零开始创建和发布小工具的完整教程</p>
        </div>
        <Link href="/admin/docs">
          <Button variant="outline">← 返回文档列表</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <MarkdownRenderer content={content} />
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-2">💡 快速链接</h3>
        <div className="space-y-2 text-sm">
          <div>
            <Link href="/admin/tools/new" className="text-blue-600 hover:underline">
              → 立即创建新工具
            </Link>
          </div>
          <div>
            <Link href="/admin/tools" className="text-blue-600 hover:underline">
              → 查看所有工具
            </Link>
          </div>
          <div>
            <Link href="/admin/docs/tool-examples" className="text-blue-600 hover:underline">
              → 查看组件开发示例
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
