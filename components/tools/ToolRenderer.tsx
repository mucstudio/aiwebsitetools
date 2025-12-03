"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import { ComponentType, useEffect, useRef } from "react"

interface ToolRendererProps {
  toolId: string
  componentType: string
  codeMode?: string
  config?: any
}

interface ToolComponentProps {
  toolId: string
  config?: any
}

export function ToolRenderer({ toolId, componentType, codeMode = 'react', config }: ToolRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // HTML 模式：使用 iframe 加载 HTML 文件
  useEffect(() => {
    if (codeMode === 'html' && iframeRef.current) {
      const iframe = iframeRef.current

      // 设置 iframe 源为 public/tools/ 目录下的 HTML 文件
      iframe.src = `/tools/${componentType}.html`

      // 监听 iframe 加载完成
      iframe.onload = () => {
        // 可以通过 postMessage 向 iframe 传递 toolId 和 config
        iframe.contentWindow?.postMessage(
          { type: 'TOOL_INIT', toolId, config },
          '*'
        )
      }
    }
  }, [codeMode, componentType, toolId, config])

  // HTML 模式渲染
  if (codeMode === 'html') {
    return (
      <div className="w-full">
        <iframe
          ref={iframeRef}
          className="w-full border-0"
          style={{ minHeight: '600px', height: '100vh' }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          title={componentType}
        />
      </div>
    )
  }

  // React 模式：使用 dynamic 动态导入组件
  const ToolComponent = dynamic<ToolComponentProps>(
    () => import(`@/components/tools/${componentType}`).catch(() => {
      // 如果导入失败，返回一个错误组件
      return {
        default: (() => (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <p className="mb-2">工具组件加载失败</p>
                <p className="text-sm">组件类型: {componentType}</p>
                <p className="text-xs mt-2">请确保组件文件存在于 components/tools/ 目录</p>
              </div>
            </CardContent>
          </Card>
        )) as ComponentType<ToolComponentProps>
      }
    }),
    {
      loading: () => (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ),
      ssr: false
    }
  )

  return <ToolComponent toolId={toolId} config={config} />
}
