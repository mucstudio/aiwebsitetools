'use client'

/**
 * 🎯 工具渲染器
 *
 * 根据 componentType 动态加载并渲染对应的工具组件
 */

import dynamic from 'next/dynamic'
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
  // 根据 componentType 渲染对应的组件
  switch (componentType) {
    case 'aura-check':
      return <AuraCheck toolId={toolId} config={config} />

    case 'corporate-clapback':
      return <CorporateClapback />

    case 'dream-stream':
      return <DreamStream toolId={toolId} config={config} />

    default:
      return (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">工具组件未找到</p>
              <p className="text-sm">Component type: {componentType}</p>
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
