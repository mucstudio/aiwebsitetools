import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Zap, Shield, Globe, Heart, Coffee } from "lucide-react"

// 由于 Header 和 Footer 需要访问数据库，页面需要动态渲染
export const dynamic = 'force-dynamic'

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-40">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
          
          <div className="container relative z-10 mx-auto px-4 text-center">
            <Badge variant="outline" className="mb-6 px-4 py-1 text-sm border-primary/20 bg-primary/5 text-primary">
              Our Story
            </Badge>
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl mb-8">
              Empowering Creators with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                Powerful Tools
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground leading-relaxed">
              We believe that essential digital tools should be accessible, fast, and privacy-focused. 
              No installations, no complications.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="container py-12 px-4 mx-auto">
          <div className="grid gap-12 md:grid-cols-2 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our mission is to provide free and accessible online tools that help people accomplish
                their daily tasks more efficiently. We believe that powerful tools shouldn't require
                installation or complicated setup.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We started this project because we were frustrated with the lack of simple, reliable
                online tools. Many existing tools were cluttered with ads, slow to load, or required
                unnecessary sign-ups. We wanted to create something better.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="bg-muted/50 border-none shadow-none">
                <CardContent className="pt-6">
                  <Zap className="h-8 w-8 text-yellow-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Fast & Reliable</h3>
                  <p className="text-sm text-muted-foreground">Optimized for speed and performance across all devices.</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50 border-none shadow-none">
                <CardContent className="pt-6">
                  <Shield className="h-8 w-8 text-green-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Privacy First</h3>
                  <p className="text-sm text-muted-foreground">Your data is processed securely and never stored.</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50 border-none shadow-none">
                <CardContent className="pt-6">
                  <Globe className="h-8 w-8 text-blue-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Always Available</h3>
                  <p className="text-sm text-muted-foreground">Access tools anytime, anywhere, on any device.</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50 border-none shadow-none">
                <CardContent className="pt-6">
                  <Coffee className="h-8 w-8 text-orange-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Simple to Use</h3>
                  <p className="text-sm text-muted-foreground">Intuitive interfaces designed for productivity.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-muted/30 mt-12">
          <div className="container px-4 mx-auto">
            <div className="grid gap-8 md:grid-cols-3 text-center max-w-4xl mx-auto">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">100+</div>
                <div className="text-muted-foreground">Tools Available</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">1M+</div>
                <div className="text-muted-foreground">Monthly Users</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">99.9%</div>
                <div className="text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="container py-24 px-4 mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <Heart className="h-12 w-12 text-red-500 mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl font-bold tracking-tight mb-6">We'd Love to Hear From You</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Have questions, suggestions, or just want to say hello? We're always looking to improve.
            </p>
            <a 
              href="mailto:hello@aiwebsitetools.com" 
              className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
            >
              Contact Support
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
