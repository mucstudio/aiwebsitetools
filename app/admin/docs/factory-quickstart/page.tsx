import { Card, CardContent } from "@/components/ui/card"
import { getCurrentSession } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { promises as fs } from 'fs'
import path from 'path'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import MarkdownRenderer from "@/components/admin/MarkdownRenderer"

export default async function FactoryQuickstartDocPage() {
  const session = await getCurrentSession()

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  // 读取快速启动文档
  const docPath = path.join(process.cwd(), 'QUICK_START.md')
  const content = await fs.readFile(docPath, 'utf8')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">🚀 工具工厂模式 - 快速启动</h1>
          <p className="text-muted-foreground">3步开始，15分钟创建你的第一个工具</p>
        </div>
        <Link href="/admin/docs">
          <Button variant="outline">← 返回文档列表</Button>
        </Link>
      </div>

      {/* 快速步骤 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-semibold text-green-900">创建 API 路由</h3>
            </div>
            <p className="text-sm text-green-700">
              在 <code className="text-xs bg-green-100 px-1 py-0.5 rounded">app/api/tools/</code> 创建路由文件
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-semibold text-blue-900">创建前端页面</h3>
            </div>
            <p className="text-sm text-blue-700">
              在 <code className="text-xs bg-blue-100 px-1 py-0.5 rounded">app/tools/</code> 创建页面组件
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-semibold text-purple-900">注册到数据库</h3>
            </div>
            <p className="text-sm text-purple-700">
              在数据库中添加工具记录，完成！
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Card>
        <CardContent className="pt-6">
          <MarkdownRenderer content={content} />
        </CardContent>
      </Card>

      {/* 性能对比 */}
      <Card className="mt-6 border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4 text-yellow-900">📊 开发效率对比</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-yellow-300">
                  <th className="text-left py-2 px-4 text-yellow-900">任务</th>
                  <th className="text-right py-2 px-4 text-yellow-900">原有架构</th>
                  <th className="text-right py-2 px-4 text-yellow-900">工厂模式</th>
                  <th className="text-right py-2 px-4 text-yellow-900">节省</th>
                </tr>
              </thead>
              <tbody className="text-yellow-800">
                <tr className="border-b border-yellow-200">
                  <td className="py-2 px-4">创建 API 路由</td>
                  <td className="text-right py-2 px-4">60 分钟</td>
                  <td className="text-right py-2 px-4">5 分钟</td>
                  <td className="text-right py-2 px-4 font-semibold text-green-700">92%</td>
                </tr>
                <tr className="border-b border-yellow-200">
                  <td className="py-2 px-4">创建前端页面</td>
                  <td className="text-right py-2 px-4">90 分钟</td>
                  <td className="text-right py-2 px-4">10 分钟</td>
                  <td className="text-right py-2 px-4 font-semibold text-green-700">89%</td>
                </tr>
                <tr className="border-b border-yellow-200">
                  <td className="py-2 px-4">测试和调试</td>
                  <td className="text-right py-2 px-4">30 分钟</td>
                  <td className="text-right py-2 px-4">5 分钟</td>
                  <td className="text-right py-2 px-4 font-semibold text-green-700">83%</td>
                </tr>
                <tr className="font-bold">
                  <td className="py-2 px-4">总计</td>
                  <td className="text-right py-2 px-4">180 分钟</td>
                  <td className="text-right py-2 px-4">20 分钟</td>
                  <td className="text-right py-2 px-4 text-green-700">89%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 下一步 */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-2">🎯 下一步</h3>
        <div className="space-y-2 text-sm">
          <div>
            <Link href="/admin/docs/factory-pattern" className="text-blue-600 hover:underline">
              → 阅读完整的工厂模式指南
            </Link>
          </div>
          <div>
            <Link href="/admin/docs/factory-enhanced" className="text-blue-600 hover:underline">
              → 了解增强功能（类型安全、安全配置）
            </Link>
          </div>
          <div>
            <Link href="/admin/tools/new" className="text-blue-600 hover:underline">
              → 立即创建你的第一个工具
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
