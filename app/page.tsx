import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
              Powerful Online Tools for Everyone
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Access a comprehensive collection of free and premium online tools for text processing,
              image editing, development utilities, and more. No installation required.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/tools">
                <Button size="lg">Browse Tools</Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">View Pricing</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-20 bg-muted/50">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Tools?</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Fast & Efficient</CardTitle>
                  <CardDescription>
                    All tools are optimized for speed and performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Process your data instantly without any delays. Our tools are built with
                    modern technology to ensure the fastest possible performance.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Privacy First</CardTitle>
                  <CardDescription>
                    Your data is processed securely and never stored
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We respect your privacy. All processing happens in your browser or is
                    immediately deleted from our servers after processing.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Always Available</CardTitle>
                  <CardDescription>
                    Access tools anytime, anywhere, on any device
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Our platform is available 24/7 with 99.9% uptime. Use our tools on
                    desktop, tablet, or mobile devices.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Popular Tools Section */}
        <section className="container py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">Popular Tools</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {popularTools.map((tool) => (
                <Card key={tool.slug} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/tools/${tool.category}/${tool.slug}`}>
                      <Button variant="outline" className="w-full">
                        Use Tool
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/tools">
                <Button size="lg" variant="outline">
                  View All Tools
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-20 bg-primary text-primary-foreground">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who trust our tools for their daily tasks
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary">
                Create Free Account
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

const popularTools = [
  {
    name: "Word Counter",
    slug: "word-counter",
    category: "text",
    description: "Count words, characters, sentences, and paragraphs in your text",
  },
  {
    name: "Image Compressor",
    slug: "image-compressor",
    category: "image",
    description: "Compress images without losing quality",
  },
  {
    name: "JSON Formatter",
    slug: "json-formatter",
    category: "developer",
    description: "Format and validate JSON data",
  },
  {
    name: "Base64 Encoder",
    slug: "base64-encoder",
    category: "developer",
    description: "Encode and decode Base64 strings",
  },
  {
    name: "QR Code Generator",
    slug: "qr-code-generator",
    category: "utilities",
    description: "Generate QR codes for URLs, text, and more",
  },
  {
    name: "Color Converter",
    slug: "color-converter",
    category: "utilities",
    description: "Convert between HEX, RGB, and HSL color formats",
  },
]
