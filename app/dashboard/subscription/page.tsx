import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCurrentSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function SubscriptionPage() {
  const session = await getCurrentSession()

  if (!session?.user?.id) {
    return null
  }

  // Get user's current subscription
  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    include: { plan: true },
  })

  // Get all available plans
  const availablePlans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  })

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      ACTIVE: { variant: "default", label: "Active" },
      CANCELED: { variant: "destructive", label: "Canceled" },
      PAST_DUE: { variant: "destructive", label: "Past Due" },
      TRIALING: { variant: "secondary", label: "Trial" },
      INCOMPLETE: { variant: "outline", label: "Incomplete" },
    }
    return statusMap[status] || { variant: "outline", label: status }
  }

  return (
    <section className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Subscription Management</h1>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Current Subscription */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your active subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{subscription.plan.name}</h3>
                    <p className="text-muted-foreground">{subscription.plan.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">${subscription.plan.price}</p>
                    <p className="text-sm text-muted-foreground">
                      per {subscription.plan.interval}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={getStatusBadge(subscription.status).variant}>
                      {getStatusBadge(subscription.status).label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Period</p>
                    <p className="font-medium">
                      {new Date(subscription.currentPeriodStart).toLocaleDateString("en-US")} - {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US")}
                    </p>
                  </div>
                  {subscription.cancelAtPeriodEnd && (
                    <div className="col-span-2">
                      <p className="text-sm text-destructive">
                        Your subscription will be canceled at the end of the current period
                      </p>
                    </div>
                  )}
                </div>

                {subscription.plan.price > 0 && (
                  <div className="flex gap-2 pt-4">
                    {!subscription.cancelAtPeriodEnd ? (
                      <Button variant="destructive" size="sm">
                        Cancel Subscription
                      </Button>
                    ) : (
                      <Button variant="default" size="sm">
                        Resume Subscription
                      </Button>
                    )}
                    <Link href="/pricing">
                      <Button variant="outline" size="sm">
                        Change Plan
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You don't have an active subscription</p>
                <Link href="/pricing">
                  <Button>View Plans</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Plans */}
        {!subscription || subscription.plan.price === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Available Plans</CardTitle>
              <CardDescription>Upgrade to unlock more features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {availablePlans
                  .filter((plan) => !subscription || plan.id !== subscription.planId)
                  .map((plan) => {
                    const features = Array.isArray(plan.features) ? plan.features : []
                    return (
                      <Card key={plan.id}>
                        <CardHeader>
                          <CardTitle>{plan.name}</CardTitle>
                          <CardDescription>{plan.description}</CardDescription>
                          <div className="mt-2">
                            <span className="text-2xl font-bold">${plan.price}</span>
                            <span className="text-muted-foreground">/{plan.interval}</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 mb-4">
                            {features.slice(0, 4).map((feature: string, index: number) => (
                              <li key={index} className="flex items-start text-sm">
                                <svg
                                  className="h-4 w-4 text-primary mr-2 mt-0.5"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <Link href={plan.price === 0 ? "/signup" : `/checkout?plan=${plan.slug}`}>
                            <Button className="w-full" size="sm">
                              {plan.price === 0 ? "Get Started" : "Upgrade"}
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Billing History */}
        {subscription && subscription.plan.price > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Your payment history and invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>No billing history available</p>
                <p className="text-sm mt-2">Payment records will appear here once processed</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
