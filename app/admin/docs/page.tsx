import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentSession } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { FileText, Book, Code, Zap, Layers, Rocket, Zap as Lightning } from "lucide-react"

export default async function DocsPage() {
  const session = await getCurrentSession()

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const docCategories = [
    {
      title: "🏭 工具工厂模式（推荐）",
      icon: "🚀",
      description: "现代化的工具开发框架 - 15分钟创建一个新工具",
      highlight: true,
      docs: [
        {
          title: "工厂模式完整指南",
          href: "/admin/docs/factory-pattern",
          icon: <Book className="h-5 w-5" />,
          description: "了解工厂模式的核心概念、架构和最佳实践",
          badge: "推荐"
        },
        {
          title: "快速启动（3步开始）",
          href: "/admin/docs/factory-quickstart",
          icon: <Rocket className="h-5 w-5" />,
          description: "5分钟创建你的第一个工具，包含完整示例",
          badge: "新手友好"
        },
        {
          title: "增强功能详解",
          href: "/admin/docs/factory-enhanced",
          icon: <Zap className="h-5 w-5" />,
          description: "类型安全、自定义安全配置、多种返回格式等高级功能"
        }
      ]
    },
    {
      title: "AI 模型系统",
      icon: "🤖",
      description: "AI 模型管理、供应商配置、调用示例",
      docs: [
        {
          title: "完整使用指南",
          href: "/admin/docs/ai-models",
          icon: <Book className="h-5 w-5" />,
          description: "AI 模型系统的完整使用文档"
        },
        {
          title: "API 调用示例",
          href: "/admin/docs/ai-examples",
          icon: <Code className="h-5 w-5" />,
          description: "各种场景下的 AI API 调用示例"
        }
      ]
    },
    {
      title: "使用限制系统",
      icon: "⏱️",
      description: "使用次数限制、游客管理、配额控制",
      docs: [
        {
          title: "使用限制指南",
          href: "/admin/docs/usage-limits",
          icon: <FileText className="h-5 w-5" />,
          description: "使用限制系统的配置和使用文档"
        },
        {
          title: "集成示例",
          href: "/admin/docs/usage-examples",
          icon: <Zap className="h-5 w-5" />,
          description: "如何在工具中集成使用限制"
        }
      ]
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">系统文档</h1>
        <p className="text-muted-foreground">查看各个系统的使用文档和示例代码</p>
      </div>

      <div className="grid gap-6">
        {docCategories.map((category) => (
          <Card
            key={category.title}
            className={
              category.highlight
                ? "border-green-300 bg-gradient-to-br from-green-50 to-blue-50"
                : category.deprecated
                ? "border-gray-300 bg-gray-50"
                : ""
            }
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{category.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>{category.title}</CardTitle>
                    {category.highlight && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-green-600 text-white rounded-full">
                        推荐
                      </span>
                    )}
                    {category.deprecated && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-gray-400 text-white rounded-full">
                        旧版本
                      </span>
                    )}
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {category.docs.map((doc) => (
                  <Link
                    key={doc.href}
                    href={doc.href}
                    className={`flex items-start gap-3 p-4 rounded-lg border hover:bg-muted transition-colors ${
                      category.deprecated ? 'opacity-75' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-md ${
                      category.highlight
                        ? 'bg-green-100'
                        : category.deprecated
                        ? 'bg-gray-200'
                        : 'bg-primary/10'
                    }`}>
                      {doc.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{doc.title}</h3>
                        {doc.badge && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            doc.badge === '推荐'
                              ? 'bg-green-100 text-green-700'
                              : doc.badge === '新手友好'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {doc.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                    </div>
                    <span className="text-muted-foreground">→</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="font-semibold mb-2 text-green-900">🚀 新项目推荐</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• 使用<strong>工具工厂模式</strong>开发新工具</li>
            <li>• 开发效率提升 89%，代码量减少 85%</li>
            <li>• 自动处理安全、计费、审核等通用逻辑</li>
            <li>• 完整的类型安全和 IDE 自动补全支持</li>
          </ul>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-semibold mb-2">💡 使用提示</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 文档包含完整的配置说明和代码示例</li>
            <li>• 可以直接复制示例代码到项目中使用</li>
            <li>• 遇到问题请先查看文档中的"常见问题"部分</li>
            <li>• 旧模式文档仅供维护现有工具时参考</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
