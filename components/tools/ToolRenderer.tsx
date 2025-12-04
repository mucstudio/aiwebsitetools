'use client'

/**
 * 🎯 工具渲染器
 *
 * 根据 componentType 动态加载并渲染对应的工具组件
 */

import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'

// 动态导入工具组件
const AuraCheck = dynamic(() => import('./AuraCheck'), {
  loading: () => <LoadingState />,
  ssr: false
})

const CorporateClapback = dynamic(() => import('./CorporateClapback').then(mod => ({ default: mod.CorporateClapback })), {
  loading: () => <LoadingState />,
  ssr: false
})

const DreamStream = dynamic(() => import('./DreamStream'), {
  loading: () => <LoadingState />,
  ssr: false
})

// ============================================
// 类型定义
// ============================================

interface ToolRendererProps {
  toolId: string
  componentType: string
  codeMode?: string | null
  config?: any
}

// ============================================
// 主组件
// ============================================

export function ToolRenderer({
  toolId,
  componentType,
  codeMode,
  config
}: ToolRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (codeMode === 'html' && iframeRef.current) {
      const iframe = iframeRef.current

      const resizeIframe = () => {
        try {
          if (iframe.contentWindow) {
            const height = iframe.contentWindow.document.body.scrollHeight
            iframe.style.height = height + 'px'
          }
        } catch (e) {
          // 跨域限制，使用默认高度
          iframe.style.height = '100vh'
        }
      }

      iframe.addEventListener('load', resizeIframe)

      return () => {
        iframe.removeEventListener('load', resizeIframe)
      }
    }
  }, [codeMode])

  // 如果是 HTML 模式，使用 iframe 渲染
  if (codeMode === 'html') {
    const htmlPath = config?.htmlPath || `/tools/${componentType}.html`
    return (
      <div className="w-screen -ml-[50vw] left-1/2 relative">
        <iframe
          ref={iframeRef}
          src={htmlPath}
          className="w-full border-0"
          style={{
            width: '100vw',
            minHeight: '600px',
            border: 'none',
            display: 'block'
          }}
          title={componentType}
        />
      </div>
    )
  }

  // React 组件模式
  switch (componentType) {
    case 'aura-check':
      return <AuraCheck toolId={toolId} config={config} />

    case 'corporate-clapback':
      return <CorporateClapback toolId={toolId} />

    case 'dream-stream':
      return <DreamStream toolId={toolId} config={config} />

    default:
      return (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">工具组件未找到</p>
              <p className="text-sm">Component type: {componentType}</p>
              <p className="text-xs mt-2">Code mode: {codeMode || 'react'}</p>
            </div>
          </CardContent>
        </Card>
      )
  }
}

// ============================================
// 加载状态组件
// ============================================

function LoadingState() {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">加载工具中...</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// 导出
// ============================================

export default ToolRenderer
