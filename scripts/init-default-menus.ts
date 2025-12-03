import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("开始初始化默认菜单...")

  // 检查是否已有菜单
  const existingMenus = await prisma.menuItem.findMany()

  if (existingMenus.length > 0) {
    console.log(`已存在 ${existingMenus.length} 个菜单项，跳过初始化`)
    return
  }

  // 创建默认菜单
  const defaultMenus = [
    {
      label: "Tools",
      url: "/tools",
      order: 1,
      isActive: true,
      openInNewTab: false,
    },
    {
      label: "Pricing",
      url: "/pricing",
      order: 2,
      isActive: true,
      openInNewTab: false,
    },
    {
      label: "About",
      url: "/about",
      order: 3,
      isActive: true,
      openInNewTab: false,
    },
  ]

  for (const menu of defaultMenus) {
    await prisma.menuItem.create({
      data: menu,
    })
    console.log(`✓ 创建菜单: ${menu.label}`)
  }

  console.log("默认菜单初始化完成！")
}

main()
  .catch((e) => {
    console.error("初始化失败:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
