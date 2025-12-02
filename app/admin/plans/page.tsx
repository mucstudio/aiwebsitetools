import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdminPlansPage() {
  // Get all plans from database with subscriber count
  const plans = await prisma.plan.findMany({
    include: {
      _count: {
        select: { subscriptions: true },
      },
    },
    orderBy: { order: "asc" },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">订阅计划管理</h1>
          <p className="text-muted-foreground">管理所有订阅计划和定价</p>
        </div>
        <Link href="/admin/plans/new">
          <Button>+ 添加新计划</Button>
        </Link>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">暂无订阅计划</p>
            <Link href="/admin/plans/new">
              <Button>创建第一个计划</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const features = Array.isArray(plan.features) ? plan.features : []
            const limits = plan.limits as any
            const dailyUsage = limits?.dailyUsage || "无限制"

            return (
              <Card key={plan.id} className={plan.slug === "pro" ? "border-primary shadow-lg" : ""}>
                <CardHeader>
                  {plan.slug === "pro" && (
                    <div className="text-xs font-semibold text-primary mb-2">最受欢迎</div>
                  )}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.interval === "year" ? "年" : "月"}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    <div className="text-sm">
                      <p className="font-medium mb-2">功能列表:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        {features.map((feature: string, index: number) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">使用限制:</p>
                      <p className="text-muted-foreground">
                        {typeof dailyUsage === "number" ? `${dailyUsage} 次/天` : dailyUsage}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">订阅用户:</p>
                      <p className="text-muted-foreground">{plan._count.subscriptions} 人</p>
                    </div>
                    {plan.stripePriceId && (
                      <div className="text-sm">
                        <p className="font-medium">Stripe Price ID:</p>
                        <p className="text-xs text-muted-foreground font-mono break-all">{plan.stripePriceId}</p>
                      </div>
                    )}
                    <div className="text-sm">
                      <p className="font-medium">状态:</p>
                      <p className={plan.isActive ? "text-green-600" : "text-red-600"}>
                        {plan.isActive ? "已启用" : "已禁用"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/plans/${plan.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">编辑</Button>
                    </Link>
                    <form action={`/api/admin/plans/${plan.id}/toggle`} method="POST" className="flex-1">
                      <Button
                        type="submit"
                        variant={plan.isActive ? "destructive" : "default"}
                        size="sm"
                        className="w-full"
                      >
                        {plan.isActive ? "禁用" : "启用"}
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
