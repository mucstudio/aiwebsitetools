import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentSession } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { FileText, Book, Code, Zap, Layers } from "lucide-react"

export default async function DocsPage() {
  const session = await getCurrentSession()

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const docCategories = [
    {
      title: "系统集成指南",
      icon: "🔗",
      description: "新工具开发时的系统集成完整指南",
      docs: [
        {
          title: "AI模型与使用限制集成",
          href: "/admin/docs/tool-integration",
          icon: <Layers className="h-5 w-5" />,
          description: "添加新工具时如何集成AI模型和使用限制系统的完整指南"
        }
      ]
    },
    {
      title: "小工具添加系统",
      icon: "🛠️",
      description: "工具组件开发、添加配置、发布管理",
      docs: [
        {
          title: "完整开发指南",
          href: "/admin/docs/tool-creation",
          icon: <Book className="h-5 w-5" />,
          description: "从零开始创建和发布小工具的完整教程"
        },
        {
          title: "组件开发示例",
          href: "/admin/docs/tool-examples",
          icon: <Code className="h-5 w-5" />,
          description: "各种类型工具的代码示例和最佳实践"
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
          <Card key={category.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{category.icon}</span>
                <div>
                  <CardTitle>{category.title}</CardTitle>
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
                    className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <div className="p-2 bg-primary/10 rounded-md">
                      {doc.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{doc.title}</h3>
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

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-semibold mb-2">💡 提示</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 文档包含完整的配置说明和代码示例</li>
          <li>• 可以直接复制示例代码到项目中使用</li>
          <li>• 遇到问题请先查看文档中的"常见问题"部分</li>
        </ul>
      </div>
    </div>
  )
}
