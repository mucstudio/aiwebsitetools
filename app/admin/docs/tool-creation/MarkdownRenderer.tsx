"use client"

import { useState } from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChevronDown, ChevronRight } from "lucide-react"

function CollapsibleCodeBlock({ children, language }: { children: string; language?: string }) {
  const [isExpanded, setIsExpanded] = useState(false)

  // 计算代码行数
  const lineCount = children.split('\n').length
  // 少于4行的代码直接展示，不折叠
  const shouldCollapse = lineCount >= 4

  if (!shouldCollapse) {
    return (
      <pre className="mb-4 p-4 bg-gray-900 rounded-lg overflow-x-auto">
        <code className="text-sm font-mono text-gray-100 leading-relaxed">{children}</code>
      </pre>
    )
  }

  return (
    <div className="mb-4 border border-gray-300 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">
          {language ? `${language} 代码` : '代码示例'} ({lineCount} 行) {isExpanded ? '(点击收起)' : '(点击展开)'}
        </span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        )}
      </button>
      {isExpanded && (
        <pre className="p-4 bg-gray-900 overflow-x-auto">
          <code className="text-sm font-mono text-gray-100 leading-relaxed">{children}</code>
        </pre>
      )}
    </div>
  )
}

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-slate max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4 border-b pb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3 text-blue-600">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-semibold mt-4 mb-2">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
          li: ({ children }) => <li className="leading-7">{children}</li>,
          code: ({ inline, children, className }: any) => {
            const language = className?.replace('language-', '')
            return inline ? (
              <code className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-sm font-mono border border-blue-200">{children}</code>
            ) : (
              <CollapsibleCodeBlock language={language}>{String(children)}</CollapsibleCodeBlock>
            )
          },
          pre: ({ children, node }: any) => {
            // 检查是否包含代码块
            const hasCode = node?.children?.some((child: any) => child.tagName === 'code')
            if (hasCode) {
              return <>{children}</>
            }
            return <pre className="p-4 bg-gray-900 rounded-lg overflow-x-auto mb-4">{children}</pre>
          },
          p: ({ children, node }: any) => {
            // 检查段落中是否包含代码块或 pre 标签
            const hasCodeBlock = node?.children?.some((child: any) => {
              if (child.type === 'element') {
                // 检查是否是代码块（有 className 的 code）或 pre 标签
                return (child.tagName === 'code' && child.properties?.className) || child.tagName === 'pre'
              }
              return false
            })
            // 如果包含代码块或 pre，使用 div 而不是 p
            if (hasCodeBlock) {
              return <div className="mb-4">{children}</div>
            }
            return <p className="mb-4 leading-7 text-gray-700">{children}</p>
          },
          table: ({ children }) => (
            <div className="overflow-x-auto mb-6 not-prose">
              <table className="min-w-full border-collapse border-2 border-gray-300 bg-white">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-blue-100">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-b border-gray-300">{children}</tr>,
          th: ({ children }) => <th className="border border-gray-300 px-4 py-3 bg-blue-50 font-bold text-left text-gray-800">{children}</th>,
          td: ({ children }) => <td className="border border-gray-300 px-4 py-3 text-gray-700">{children}</td>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-yellow-500 bg-yellow-50 pl-4 py-2 italic my-4 rounded-r">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => <a href={href} className="text-blue-600 hover:underline font-medium">{children}</a>,
          hr: () => <hr className="my-8 border-t-2 border-gray-200" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
