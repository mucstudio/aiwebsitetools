import { Card, CardContent } from "@/components/ui/card"
import { getCurrentSession } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { promises as fs } from 'fs'
import path from 'path'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import MarkdownRenderer from "@/components/admin/MarkdownRenderer"

export default async function FactoryEnhancedDocPage() {
  const session = await getCurrentSession()

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  // 读取增强功能文档
  const docPath = path.join(process.cwd(), 'ENHANCED_FEATURES.md')
  const content = await fs.readFile(docPath, 'utf8')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">✨ 工具工厂模式 - 增强功能</h1>
          <p className="text-muted-foreground">类型安全、自定义安全配置、多种返回格式</p>
        </div>
        <Link href="/admin/docs">
          <Button variant="outline">← 返回文档列表</Button>
        </Link>
      </div>

      {/* 功能亮点 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-semibold text-blue-900">自定义安全</h3>
            <p className="text-xs text-blue-700 mt-1">每个工具独立配置安全策略</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl mb-2">📝</div>
            <h3 className="font-semibold text-green-900">类型安全</h3>
            <p className="text-xs text-green-700 mt-1">TypeScript 泛型支持</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl mb-2">🎨</div>
            <h3 className="font-semibold text-purple-900">多种格式</h3>
            <p className="text-xs text-purple-700 mt-1">文本、JSON、图片等</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-semibold text-orange-900">增强错误</h3>
            <p className="text-xs text-orange-700 mt-1">详细的错误信息</p>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Card>
        <CardContent className="pt-6">
          <MarkdownRenderer content={content} />
        </CardContent>
      </Card>

      {/* 快速链接 */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-2">💡 快速链接</h3>
        <div className="space-y-2 text-sm">
          <div>
            <Link href="/admin/docs/factory-pattern" className="text-blue-600 hover:underline">
              → 返回工厂模式基础指南
            </Link>
          </div>
          <div>
            <Link href="/admin/docs/factory-quickstart" className="text-blue-600 hover:underline">
              → 查看快速启动指南
            </Link>
          </div>
          <div>
            <Link href="/admin/tools/new" className="text-blue-600 hover:underline">
              → 立即创建新工具
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
