import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCurrentSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getCurrentSession()

  if (!session?.user?.id) {
    return null
  }

  // Get user's usage records count
  const usageCount = await prisma.usageRecord.count({
    where: { userId: session.user.id },
  })

  // Get user's favorites count
  const favoritesCount = await prisma.favorite.count({
    where: { userId: session.user.id },
  })

  // Get user's subscription
  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    include: { plan: true },
  })

  // Get today's usage count
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayUsageCount = await prisma.usageRecord.count({
    where: {
      userId: session.user.id,
      createdAt: { gte: today },
    },
  })

  // Get recent activity (last 5 usage records)
  const recentActivity = await prisma.usageRecord.findMany({
    where: { userId: session.user.id },
    include: { tool: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  // Get favorite tools
  const favoriteTools = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      tool: {
        include: { category: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  // Calculate daily limit based on plan
  const dailyLimit = subscription?.plan ?
    (typeof subscription.plan.limits === 'object' && subscription.plan.limits !== null && 'dailyUsage' in subscription.plan.limits
      ? (subscription.plan.limits as any).dailyUsage
      : 10)
    : 10

  return (
    <section className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session.user.name || 'User'}!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tools Used</CardDescription>
            <CardTitle className="text-3xl">{usageCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Total usage count</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Favorites</CardDescription>
            <CardTitle className="text-3xl">{favoritesCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Your saved tools</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Plan</CardDescription>
            <CardTitle className="text-3xl">{subscription?.plan?.name || "Free"}</CardTitle>
          </CardHeader>
          <CardContent>
            {!subscription && (
              <Link href="/pricing">
                <Button variant="outline" size="sm">Upgrade</Button>
              </Link>
            )}
            {subscription && (
              <p className="text-xs text-muted-foreground">
                {subscription.status === "ACTIVE" ? "Active" : subscription.status}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Usage Today</CardDescription>
            <CardTitle className="text-3xl">{todayUsageCount}/{dailyLimit}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Daily limit</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recently used tools</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{activity.tool.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Link href={`/tools/${activity.tool.slug}`}>
                      <Button variant="ghost" size="sm">Use</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity</p>
                <Link href="/tools">
                  <Button variant="outline" size="sm" className="mt-4">Browse Tools</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Favorite Tools</CardTitle>
            <CardDescription>Quick access to your favorites</CardDescription>
          </CardHeader>
          <CardContent>
            {favoriteTools.length > 0 ? (
              <div className="space-y-4">
                {favoriteTools.map((favorite) => (
                  <div key={favorite.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{favorite.tool.name}</p>
                      <p className="text-sm text-muted-foreground">{favorite.tool.category.name}</p>
                    </div>
                    <Link href={`/tools/${favorite.tool.slug}`}>
                      <Button variant="outline" size="sm">Use</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No favorite tools yet</p>
                <Link href="/tools">
                  <Button variant="outline" size="sm" className="mt-4">Browse Tools</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
