import { Card, CardContent } from "@/components/ui/card"
import { getCurrentSession } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { promises as fs } from 'fs'
import path from 'path'
import ReactMarkdown from 'react-markdown'
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AIModelsDocPage() {
  const session = await getCurrentSession()

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  // 读取 Markdown 文档
  const docPath = path.join(process.cwd(), 'lib', 'ai', 'docs', 'README.md')
  const content = await fs.readFile(docPath, 'utf8')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">AI 模型系统文档</h1>
          <p className="text-muted-foreground">完整的使用指南和配置说明</p>
        </div>
        <Link href="/admin/docs">
          <Button variant="outline">← 返回文档列表</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-slate max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-semibold mt-4 mb-2">{children}</h3>,
                p: ({ children }) => <p className="mb-4 leading-7">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                li: ({ children }) => <li className="leading-7">{children}</li>,
                code: ({ inline, children }: any) =>
                  inline ? (
                    <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono">{children}</code>
                  ) : (
                    <code className="block p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm font-mono mb-4">{children}</code>
                  ),
                pre: ({ children }) => <pre className="mb-4">{children}</pre>,
                table: ({ children }) => <table className="w-full border-collapse mb-4">{children}</table>,
                th: ({ children }) => <th className="border border-gray-300 px-4 py-2 bg-gray-50 font-semibold text-left">{children}</th>,
                td: ({ children }) => <td className="border border-gray-300 px-4 py-2">{children}</td>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4">{children}</blockquote>,
                a: ({ href, children }) => <a href={href} className="text-blue-600 hover:underline">{children}</a>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
