import { Card, CardContent } from "@/components/ui/card"
import { getCurrentSession } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { promises as fs } from 'fs'
import path from 'path'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import MarkdownRenderer from "@/components/admin/MarkdownRenderer"

export default async function FactoryPatternDocPage() {
  const session = await getCurrentSession()

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  // 读取工厂模式指南
  const guidePath = path.join(process.cwd(), 'TOOL_FACTORY_GUIDE.md')
  const guideContent = await fs.readFile(guidePath, 'utf8')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">🏭 工具工厂模式开发指南</h1>
          <p className="text-muted-foreground">现代化的工具开发框架 - 10分钟创建一个新工具</p>
        </div>
        <Link href="/admin/docs">
          <Button variant="outline">← 返回文档列表</Button>
        </Link>
      </div>

      {/* 快速导航卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2 text-blue-900">📚 基础指南</h3>
            <p className="text-sm text-blue-700 mb-3">了解工厂模式的核心概念和架构</p>
            <Link href="#基础指南">
              <Button variant="link" className="p-0 h-auto text-blue-600">
                查看详情 →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2 text-green-900">🚀 快速开始</h3>
            <p className="text-sm text-green-700 mb-3">5分钟创建你的第一个工具</p>
            <Link href="#快速开始">
              <Button variant="link" className="p-0 h-auto text-green-600">
                立即开始 →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2 text-purple-900">✨ 增强功能</h3>
            <p className="text-sm text-purple-700 mb-3">类型安全、自定义安全配置等</p>
            <Link href="/admin/docs/factory-enhanced">
              <Button variant="link" className="p-0 h-auto text-purple-600">
                了解更多 →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Card>
        <CardContent className="pt-6">
          <MarkdownRenderer content={guideContent} />
        </CardContent>
      </Card>

      {/* 相关资源 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-orange-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">📖 相关文档</h3>
            <div className="space-y-2 text-sm">
              <div>
                <Link href="/admin/docs/factory-enhanced" className="text-blue-600 hover:underline">
                  → 增强功能详解（类型安全、安全配置）
                </Link>
              </div>
              <div>
                <Link href="/admin/docs/factory-quickstart" className="text-blue-600 hover:underline">
                  → 快速启动指南（3步开始）
                </Link>
              </div>
              <div>
                <Link href="/admin/docs/ai-examples" className="text-blue-600 hover:underline">
                  → AI 调用示例
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">💡 示例工具</h3>
            <div className="space-y-2 text-sm">
              <div>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">app/api/tools/aura-check/route.ts</code>
                <span className="text-gray-600 ml-2">- 文本生成</span>
              </div>
              <div>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">app/api/tools/mbti-test/route.ts</code>
                <span className="text-gray-600 ml-2">- JSON 结构化</span>
              </div>
              <div>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">app/api/tools/dream-image/route.ts</code>
                <span className="text-gray-600 ml-2">- 图片生成</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 优势对比 */}
      <Card className="mt-6 border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4 text-yellow-900">⚡ 为什么使用工厂模式？</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2 text-yellow-800">开发效率</h4>
              <ul className="space-y-1 text-yellow-700">
                <li>✅ 新工具只需 10-50 行代码（原来 200+ 行）</li>
                <li>✅ 15 分钟完成开发（原来 2-4 小时）</li>
                <li>✅ 自动处理安全、计费、审核</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-yellow-800">代码质量</h4>
              <ul className="space-y-1 text-yellow-700">
                <li>✅ 统一的错误处理和日志</li>
                <li>✅ 类型安全（TypeScript 泛型）</li>
                <li>✅ 易于测试和维护</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
