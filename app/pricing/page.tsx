import Link from "next/link"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { Check, Sparkles, HelpCircle } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// 页面需要动态渲染以访问数据库
export const dynamic = 'force-dynamic'

export default async function PricingPage() {
  // Get all active plans from database
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  })

  return (
    <>
      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-40">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
          
          <div className="container relative z-10 mx-auto px-4 text-center">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Unlock Full Potential</span>
            </div>
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl mb-6">
              Simple, Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Pricing</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground mb-10">
              Choose the plan that fits your needs. No hidden fees, cancel anytime.
            </p>
          </div>
        </section>

        <section className="container py-12 px-4 mx-auto -mt-20 relative z-20">
          {plans.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-muted-foreground/25">
              <p className="text-muted-foreground mb-4">No pricing plans available at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
              {plans.map((plan) => {
                const features = Array.isArray(plan.features) ? plan.features : []
                const isPopular = plan.slug === "pro"

                return (
                  <Card key={plan.id} className={`flex flex-col transition-all duration-300 ${isPopular ? "border-primary shadow-xl scale-105 z-10 bg-background" : "bg-background/50 backdrop-blur-sm hover:shadow-lg border-primary/10"}`}>
                    {isPopular && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-sm">
                        MOST POPULAR
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-6 flex items-baseline">
                        <span className="text-5xl font-extrabold tracking-tight">${plan.price}</span>
                        <span className="text-muted-foreground ml-2">/{plan.interval === "year" ? "year" : "month"}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="space-y-4 mb-6">
                        {features.map((feature: any, index: number) => (
                          <li key={index} className="flex items-start">
                            <div className={`mr-3 mt-1 rounded-full p-0.5 ${isPopular ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                              <Check className="h-3 w-3" />
                            </div>
                            <span className="text-sm font-medium opacity-90">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Link href={plan.price === 0 ? "/signup" : `/checkout?plan=${plan.slug}`} className="w-full">
                        <Button 
                          className={`w-full h-12 text-lg ${isPopular ? "shadow-lg shadow-primary/25" : ""}`} 
                          variant={isPopular ? "default" : "outline"}
                        >
                          {plan.price === 0 ? "Get Started Free" : "Subscribe Now"}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        {/* FAQ Section */}
        <section className="container py-24 px-4 mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about our pricing and billing.</p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Can I cancel my subscription anytime?</AccordionTrigger>
              <AccordionContent>
                Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is there a free trial for the Pro plan?</AccordionTrigger>
              <AccordionContent>
                We offer a 7-day money-back guarantee. If you're not satisfied with the Pro plan, contact us within 7 days for a full refund.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
              <AccordionContent>
                We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. All payments are processed securely via Stripe.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Do you offer team or enterprise pricing?</AccordionTrigger>
              <AccordionContent>
                Yes! If you need access for a larger team, please contact our sales team for a custom quote tailored to your organization's needs.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
      <Footer />
    </>
  )
}
