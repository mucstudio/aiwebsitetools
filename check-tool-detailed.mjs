import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('=== 检查工具详细信息 ===\n')

  // 1. 检查数据库中的工具
  const tool = await prisma.tool.findUnique({
    where: { slug: 'aura-check' },
    include: {
      category: true
    }
  })

  if (!tool) {
    console.log('❌ 工具在数据库中不存在！')
    await prisma.$disconnect()
    return
  }

  console.log('✅ 数据库中的工具信息：')
  console.log('   - ID:', tool.id)
  console.log('   - 名称:', tool.name)
  console.log('   - Slug:', tool.slug)
  console.log('   - 组件类型:', tool.componentType)
  console.log('   - 是否发布:', tool.isPublished ? '✅ 是' : '❌ 否')
  console.log('   - 是否付费:', tool.isPremium ? '是' : '否')
  console.log('   - 分类:', tool.category?.name)
  console.log()

  // 2. 检查组件文件是否存在
  const componentPath = path.join(process.cwd(), 'components', 'tools', `${tool.componentType}.tsx`)
  const componentExists = fs.existsSync(componentPath)

  console.log('📁 组件文件检查：')
  console.log('   - 期望路径:', componentPath)
  console.log('   - 文件存在:', componentExists ? '✅ 是' : '❌ 否')

  if (componentExists) {
    const stats = fs.statSync(componentPath)
    console.log('   - 文件大小:', stats.size, 'bytes')
    console.log('   - 最后修改:', stats.mtime.toLocaleString())
  }
  console.log()

  // 3. 检查 ToolRenderer 映射
  const toolRendererPath = path.join(process.cwd(), 'components', 'tools', 'ToolRenderer.tsx')
  if (fs.existsSync(toolRendererPath)) {
    const content = fs.readFileSync(toolRendererPath, 'utf-8')
    const hasMapping = content.includes(tool.componentType)
    console.log('🔧 ToolRenderer 检查：')
    console.log('   - 文件存在: ✅ 是')
    console.log('   - 包含映射:', hasMapping ? '✅ 是' : '❌ 否')

    if (!hasMapping) {
      console.log('   ⚠️  警告: ToolRenderer 中没有找到', tool.componentType, '的映射')
    }
  } else {
    console.log('❌ ToolRenderer.tsx 文件不存在')
  }
  console.log()

  // 4. 建议
  console.log('💡 诊断建议：')
  if (!tool.isPublished) {
    console.log('   ❌ 工具未发布，需要在管理后台发布')
  }
  if (!componentExists) {
    console.log('   ❌ 组件文件不存在，需要创建组件文件')
  }
  console.log('   - 确保服务器上运行了 npm run build')
  console.log('   - 确保服务器重启了应用')
  console.log('   - 检查服务器日志是否有错误')

  await prisma.$disconnect()
}

main()
