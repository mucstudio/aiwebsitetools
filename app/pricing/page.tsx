import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"

export default async function PricingPage() {
  // Get all active plans from database
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  })

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="container py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground">
              Choose the plan that works best for you
            </p>
          </div>

          {plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No pricing plans available at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
              {plans.map((plan) => {
                const features = Array.isArray(plan.features) ? plan.features : []
                const isPopular = plan.slug === "pro"

                return (
                  <Card key={plan.id} className={isPopular ? "border-primary shadow-lg" : ""}>
                    <CardHeader>
                      {isPopular && (
                        <div className="text-xs font-semibold text-primary mb-2">MOST POPULAR</div>
                      )}
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/{plan.interval === "year" ? "year" : "month"}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {features.map((feature: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <svg
                              className="h-5 w-5 text-primary mr-2 mt-0.5"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href={plan.price === 0 ? "/signup" : `/checkout?plan=${plan.slug}`}>
                        <Button className="w-full" variant={isPopular ? "default" : "outline"}>
                          {plan.price === 0 ? "Get Started" : "Subscribe"}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
