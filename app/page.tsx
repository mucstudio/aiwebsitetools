import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Footer } from "@/components/layout/Footer"
import {
  ArrowRight,
  Check,
  Zap,
  Shield,
  Globe,
  Code,
  Image as ImageIcon,
  FileText,
  Sparkles,
  Cpu,
  Layers,
  Rocket
} from "lucide-react"

// Since Header and Footer might access the database, we force dynamic rendering
export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <>
      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
          <div className="absolute right-0 top-0 -z-10 h-[400px] w-[400px] rounded-full bg-purple-500/10 opacity-30 blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute left-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-blue-500/10 opacity-30 blur-[120px] -translate-x-1/2 translate-y-1/2"></div>

          <div className="container relative z-10 mx-auto px-4 text-center">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
              <Sparkles className="mr-2 h-4 w-4" />
              <span>New AI Tools Available Now</span>
            </div>

            <h1 className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 ease-out mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl mb-8">
              Master Your Digital <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                Workflow Instantly
              </span>
            </h1>

            <p className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 ease-out mx-auto max-w-2xl text-xl text-muted-foreground mb-10 leading-relaxed">
              Access a comprehensive suite of premium online tools for developers, creators, and professionals.
              Secure, fast, and designed for modern productivity.
            </p>

            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 ease-out flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/tools">
                <Button size="lg" className="h-12 px-8 text-lg rounded-full shadow-lg hover:shadow-primary/25 transition-all">
                  Explore All Tools <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full border-2">
                  View Pricing
                </Button>
              </Link>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 ease-out mt-16 flex justify-center gap-8 text-muted-foreground grayscale opacity-70">
              {/* Placeholder for "Trusted by" logos or stats */}
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" /> <span>1M+ Operations</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" /> <span>Global Access</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> <span>Secure Processing</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-muted/30">
          <div className="container px-4 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Why Professionals Choose Us
              </h2>
              <p className="text-lg text-muted-foreground">
                We built our platform with a focus on performance, privacy, and user experience.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <Card className="bg-background/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                    <Zap className="h-6 w-6" />
                  </div>
                  <CardTitle>Lightning Fast</CardTitle>
                  <CardDescription>
                    Optimized for speed. Process large files and complex data in milliseconds, right in your browser.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-background/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                    <Shield className="h-6 w-6" />
                  </div>
                  <CardTitle>Privacy First</CardTitle>
                  <CardDescription>
                    Your data stays yours. We process files locally whenever possible and never store your sensitive information.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-background/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                    <Layers className="h-6 w-6" />
                  </div>
                  <CardTitle>All-in-One Suite</CardTitle>
                  <CardDescription>
                    Stop switching between dozen websites. Get all your essential developer and creative tools in one dashboard.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Tools Showcase with Tabs */}
        <section className="py-24">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                  Explore Our Toolkit
                </h2>
                <p className="text-lg text-muted-foreground">
                  From code formatters to image processors, we have everything you need.
                </p>
              </div>
              <Link href="/tools">
                <Button variant="ghost" className="group">
                  View All Tools <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <Tabs defaultValue="popular" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid md:grid-cols-4 mb-8">
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="developer">Developer</TabsTrigger>
                <TabsTrigger value="creative">Creative</TabsTrigger>
                <TabsTrigger value="utilities">Utilities</TabsTrigger>
              </TabsList>

              <TabsContent value="popular" className="mt-0">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {popularTools.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="developer" className="mt-0">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {popularTools.filter(t => t.category === 'developer').map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="creative" className="mt-0">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {popularTools.filter(t => t.category === 'image').map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="utilities" className="mt-0">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {popularTools.filter(t => t.category === 'utilities' || t.category === 'text').map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 bg-muted/30">
          <div className="container px-4 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-muted-foreground">
                Start for free, upgrade for power. No hidden fees.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
              {/* Free Plan */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl">Free</CardTitle>
                  <CardDescription>Essential tools for casual users</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>Access to basic tools</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>Standard processing speed</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>Ad-supported experience</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/tools" className="w-full">
                    <Button variant="outline" className="w-full">Get Started</Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Pro Plan */}
              <Card className="flex flex-col border-primary shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                  POPULAR
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Pro</CardTitle>
                  <CardDescription>For power users and creators</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$9</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-primary" />
                      <span>Access to ALL premium tools</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-primary" />
                      <span>Ad-free experience</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-primary" />
                      <span>Priority processing speed</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-primary" />
                      <span>Early access to new features</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/pricing" className="w-full">
                    <Button className="w-full">Subscribe Now</Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Team Plan */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl">Team</CardTitle>
                  <CardDescription>For agencies and organizations</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$29</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>Everything in Pro</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>Team management dashboard</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>API Access</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>Priority Email Support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/contact" className="w-full">
                    <Button variant="outline" className="w-full">Contact Sales</Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container px-4 mx-auto">
            <div className="relative rounded-3xl overflow-hidden bg-primary px-6 py-16 md:px-16 md:py-24 text-center text-primary-foreground">
              <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-6">
                  Ready to boost your productivity?
                </h2>
                <p className="text-xl mb-10 opacity-90">
                  Join thousands of developers and creators who use our tools daily.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button size="lg" variant="secondary" className="h-12 px-8 text-lg w-full sm:w-auto">
                      Get Started for Free
                    </Button>
                  </Link>
                  <Link href="/tools">
                    <Button size="lg" variant="outline" className="h-12 px-8 text-lg bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary w-full sm:w-auto">
                      Browse Tools
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}

function ToolCard({ tool }: { tool: any }) {
  const Icon = getIconForCategory(tool.category)

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 rounded-md bg-muted group-hover:bg-primary/10 transition-colors text-muted-foreground group-hover:text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <Badge variant="secondary" className="text-xs font-normal">
            {tool.category}
          </Badge>
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors">
          {tool.name}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {tool.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href={`/tools/${tool.category}/${tool.slug}`}>
          <Button variant="outline" className="w-full group-hover:border-primary/50 group-hover:text-primary transition-all">
            Launch Tool
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function getIconForCategory(category: string) {
  switch (category) {
    case 'text': return FileText
    case 'image': return ImageIcon
    case 'developer': return Code
    case 'utilities': return Cpu
    default: return Sparkles
  }
}

const popularTools = [
  {
    name: "Word Counter",
    slug: "word-counter",
    category: "text",
    description: "Advanced text analysis with word, character, and sentence counts.",
  },
  {
    name: "Image Compressor",
    slug: "image-compressor",
    category: "image",
    description: "Smart compression that reduces file size while maintaining quality.",
  },
  {
    name: "JSON Formatter",
    slug: "json-formatter",
    category: "developer",
    description: "Beautify and validate your JSON data with error highlighting.",
  },
  {
    name: "Base64 Converter",
    slug: "base64-encoder",
    category: "developer",
    description: "Fast and secure Base64 encoding and decoding for any string.",
  },
  {
    name: "QR Code Generator",
    slug: "qr-code-generator",
    category: "utilities",
    description: "Create custom QR codes for links, text, wifi, and more.",
  },
  {
    name: "Color Converter",
    slug: "color-converter",
    category: "utilities",
    description: "Convert colors between HEX, RGB, HSL, and CMYK formats.",
  },
]
