import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentSession } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function AdminDashboard() {
  const session = await getCurrentSession()

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  // 获取统计数据
  const [
    totalUsers,
    totalTools,
    publishedTools,
    activeSubscriptions,
    recentUsers,
    popularTools,
    totalUsageRecords,
  ] = await Promise.all([
    // 总用户数
    prisma.user.count(),

    // 总工具数
    prisma.tool.count(),

    // 已发布工具数
    prisma.tool.count({ where: { isPublished: true } }),

    // 付费用户数（有活跃订阅的用户）
    prisma.subscription.count({
      where: {
        status: 'ACTIVE'
      }
    }),

    // 最近注册的5位用户
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    }),

    // 热门工具（按使用次数排序）
    prisma.tool.findMany({
      take: 5,
      orderBy: { usageCount: 'desc' },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            usageRecords: true,
          },
        },
      },
    }),

    // 总使用记录数
    prisma.usageRecord.count(),
  ])

  const premiumUsers = activeSubscriptions

  // 计算付费用户转化率
  const conversionRate = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : '0.0'

  // 格式化时间
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / 60000)
    const diffInHours = Math.floor(diffInMs / 3600000)
    const diffInDays = Math.floor(diffInMs / 86400000)

    if (diffInMinutes < 60) {
      return `${diffInMinutes}分钟前`
    } else if (diffInHours < 24) {
      return `${diffInHours}小时前`
    } else {
      return `${diffInDays}天前`
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">欢迎来到管理后台</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>总用户数</CardDescription>
            <CardTitle className="text-3xl">{totalUsers.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {premiumUsers} 位付费用户
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>总工具数</CardDescription>
            <CardTitle className="text-3xl">{totalTools}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {publishedTools} 个已发布
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>付费用户</CardDescription>
            <CardTitle className="text-3xl">{premiumUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {conversionRate}% 转化率
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>总使用次数</CardDescription>
            <CardTitle className="text-3xl">{totalUsageRecords.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              所有工具累计使用
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 详细数据 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最近注册用户</CardTitle>
            <CardDescription>最新的 5 位用户</CardDescription>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无用户</p>
            ) : (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.name || '未设置名称'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(user.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>热门工具</CardTitle>
            <CardDescription>使用次数最多的工具</CardDescription>
          </CardHeader>
          <CardContent>
            {popularTools.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无工具</p>
            ) : (
              <div className="space-y-4">
                {popularTools.map((tool) => (
                  <div key={tool.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {tool.icon && <span className="text-lg">{tool.icon}</span>}
                      <div>
                        <p className="font-medium">{tool.name}</p>
                        <p className="text-sm text-muted-foreground">{tool.category.name}</p>
                      </div>
                    </div>
                    <span className="font-semibold">{tool._count.usageRecords.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
