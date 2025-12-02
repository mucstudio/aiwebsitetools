import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentSession } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Code, FileCode, Lightbulb } from "lucide-react"

export default async function ToolExamplesPage() {
  const session = await getCurrentSession()

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const examples = [
    {
      title: "字数统计工具",
      file: "word-counter.tsx",
      description: "实时统计文本的字数、字符数、句子数和段落数",
      features: ["useState 状态管理", "useEffect 副作用", "文本处理算法", "多卡片布局"],
      complexity: "简单",
      path: "components/tools/word-counter.tsx"
    },
    {
      title: "大小写转换工具",
      file: "case-converter.tsx",
      description: "支持多种大小写转换模式的文本处理工具",
      features: ["Tabs 标签页", "多种转换模式", "实时预览", "复制功能"],
      complexity: "中等",
      path: "components/tools/case-converter.tsx"
    },
    {
      title: "Base64 编码工具",
      file: "base64-encoder.tsx",
      description: "Base64 编码和解码工具，支持文本和文件",
      features: ["编码/解码切换", "错误处理", "文件上传", "结果展示"],
      complexity: "中等",
      path: "components/tools/base64-encoder.tsx"
    }
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">组件开发示例</h1>
          <p className="text-muted-foreground">学习现有工具的实现方式和最佳实践</p>
        </div>
        <Link href="/admin/docs">
          <Button variant="outline">← 返回文档列表</Button>
        </Link>
      </div>

      {/* 示例列表 */}
      <div className="grid gap-6 mb-8">
        {examples.map((example) => (
          <Card key={example.file}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileCode className="h-5 w-5 text-blue-600" />
                    <CardTitle>{example.title}</CardTitle>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      example.complexity === "简单"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {example.complexity}
                    </span>
                  </div>
                  <CardDescription>{example.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2">📁 文件路径：</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                    {example.path}
                  </code>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">✨ 主要特性：</p>
                  <div className="flex flex-wrap gap-2">
                    {example.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    💡 在项目中打开此文件查看完整源代码和实现细节
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 学习建议 */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            学习建议
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">📚 学习路径：</h4>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
              <li>先阅读 <Link href="/admin/docs/tool-creation" className="text-blue-600 hover:underline">完整开发指南</Link></li>
              <li>查看上面的示例代码，理解组件结构</li>
              <li>复制一个简单的示例，修改成自己的工具</li>
              <li>在后台添加工具配置并测试</li>
              <li>根据需求逐步添加更多功能</li>
            </ol>
          </div>

          <div className="pt-3 border-t border-blue-200">
            <h4 className="font-semibold text-sm mb-2">🎯 最佳实践：</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>使用 TypeScript 定义 Props 接口</li>
              <li>组件必须接收 <code className="px-1 bg-gray-100 rounded text-xs">toolId</code> 和 <code className="px-1 bg-gray-100 rounded text-xs">config</code> 参数</li>
              <li>使用 shadcn/ui 组件保持界面一致性</li>
              <li>添加适当的错误处理和用户提示</li>
              <li>提供清除、复制等常用功能</li>
              <li>使用 "use client" 指令（客户端组件）</li>
            </ul>
          </div>

          <div className="pt-3 border-t border-blue-200">
            <h4 className="font-semibold text-sm mb-2">🛠️ 可用的 UI 组件：</h4>
            <div className="flex flex-wrap gap-2">
              <code className="px-2 py-1 text-xs bg-white rounded border">Button</code>
              <code className="px-2 py-1 text-xs bg-white rounded border">Card</code>
              <code className="px-2 py-1 text-xs bg-white rounded border">Input</code>
              <code className="px-2 py-1 text-xs bg-white rounded border">Textarea</code>
              <code className="px-2 py-1 text-xs bg-white rounded border">Alert</code>
              <code className="px-2 py-1 text-xs bg-white rounded border">Badge</code>
              <code className="px-2 py-1 text-xs bg-white rounded border">Tabs</code>
              <code className="px-2 py-1 text-xs bg-white rounded border">Switch</code>
              <code className="px-2 py-1 text-xs bg-white rounded border">Label</code>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              从 <code className="px-1 bg-gray-100 rounded">@/components/ui/*</code> 导入使用
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 快速链接 */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold mb-2">🚀 准备好了？</h3>
        <div className="space-y-2 text-sm">
          <div>
            <Link href="/admin/tools/new" className="text-green-600 hover:underline font-medium">
              → 立即创建你的第一个工具
            </Link>
          </div>
          <div>
            <Link href="/admin/docs/tool-creation" className="text-green-600 hover:underline">
              → 查看完整开发指南
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
