"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import { ComponentType } from "react"

interface ToolRendererProps {
  toolId: string
  componentType: string
  config?: any
}

interface ToolComponentProps {
  toolId: string
  config?: any
}

export function ToolRenderer({ toolId, componentType, config }: ToolRendererProps) {
  // 使用 dynamic 动态导入组件
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
