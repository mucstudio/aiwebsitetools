'use client'

/**
 * 🎨 通用响应渲染组件
 *
 * 根据响应格式自动渲染不同类型的内容：
 * - text: 纯文本
 * - markdown: Markdown 格式（使用 marked）
 * - json: JSON 对象（格式化显示）
 * - html: HTML 代码（安全渲染）
 * - code: 代码片段（语法高亮）
 * - structured: 结构化数据（自定义布局）
 */

import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type { ResponseFormat, CodeLanguage } from '@/lib/response-formats'

// ============================================
// 类型定义
// ============================================

interface ResponseRendererProps {
  content: any
  format?: ResponseFormat
  language?: CodeLanguage
  className?: string
}

// ============================================
// 主组件
// ============================================

export function ResponseRenderer({
  content,
  format = 'text',
  language,
  className = ''
}: ResponseRendererProps) {
  // 根据格式渲染不同的内容
  switch (format) {
    case 'text':
      return <TextRenderer content={content} className={className} />

    case 'markdown':
      return <MarkdownRenderer content={content} className={className} />

    case 'json':
      return <JsonRenderer content={content} className={className} />

    case 'html':
      return <HtmlRenderer content={content} className={className} />

    case 'code':
      return <CodeRenderer content={content} language={language} className={className} />

    case 'structured':
      return <StructuredRenderer content={content} className={className} />

    default:
      return <TextRenderer content={String(content)} className={className} />
  }
}

// ============================================
// 格式特定渲染器
// ============================================

/**
 * 纯文本渲染器
 */
function TextRenderer({ content, className }: { content: string; className?: string }) {
  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {content}
    </div>
  )
}

/**
 * Markdown 渲染器
 */
function MarkdownRenderer({ content, className }: { content: string; className?: string }) {
  const html = marked.parse(content) as string

  return (
    <div
      className={`prose prose-slate dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/**
 * JSON 渲染器（格式化显示）
 */
function JsonRenderer({ content, className }: { content: any; className?: string }) {
  const formatted = JSON.stringify(content, null, 2)

  return (
    <pre className={`bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto ${className}`}>
      <code className="text-sm">{formatted}</code>
    </pre>
  )
}

/**
 * HTML 渲染器（安全渲染）
 */
function HtmlRenderer({ content, className }: { content: string; className?: string }) {
  // 使用 DOMPurify 清理 HTML，防止 XSS 攻击
  const cleanHtml = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'strong', 'em', 'br', 'hr',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['class', 'href', 'target', 'rel']
  })

  return (
    <div
      className={`html-content ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  )
}

/**
 * 代码渲染器（语法高亮）
 */
function CodeRenderer({
  content,
  language = 'javascript',
  className
}: {
  content: string
  language?: CodeLanguage
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      {/* 语言标签 */}
      <div className="absolute top-2 right-2 text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
        {language}
      </div>

      {/* 代码内容 */}
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
        <code className={`language-${language} text-sm`}>{content}</code>
      </pre>

      {/* 复制按钮 */}
      <button
        onClick={() => {
          navigator.clipboard.writeText(content)
          alert('代码已复制到剪贴板！')
        }}
        className="absolute bottom-2 right-2 text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
      >
        复制代码
      </button>
    </div>
  )
}

/**
 * 结构化数据渲染器
 */
function StructuredRenderer({ content, className }: { content: any; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Object.entries(content).map(([key, value]) => (
        <div key={key} className="border-l-4 border-blue-500 pl-4">
          <h3 className="font-bold text-lg mb-2 capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </h3>
          <div className="text-gray-700 dark:text-gray-300">
            {renderValue(value)}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * 递归渲染值（用于结构化数据）
 */
function renderValue(value: any): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">null</span>
  }

  if (typeof value === 'boolean') {
    return <span className="text-purple-600">{value.toString()}</span>
  }

  if (typeof value === 'number') {
    return <span className="text-green-600">{value}</span>
  }

  if (typeof value === 'string') {
    return <span>{value}</span>
  }

  if (Array.isArray(value)) {
    return (
      <ul className="list-disc list-inside space-y-1">
        {value.map((item, index) => (
          <li key={index}>{renderValue(item)}</li>
        ))}
      </ul>
    )
  }

  if (typeof value === 'object') {
    return (
      <div className="ml-4 space-y-2">
        {Object.entries(value).map(([k, v]) => (
          <div key={k}>
            <span className="font-semibold">{k}: </span>
            {renderValue(v)}
          </div>
        ))}
      </div>
    )
  }

  return <span>{String(value)}</span>
}

// ============================================
// 导出
// ============================================

export default ResponseRenderer
