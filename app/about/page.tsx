import { Footer } from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Zap, Ghost, Palette, Heart, Rocket } from "lucide-react"
import { Metadata } from "next"

// 由于 Header 和 Footer 需要访问数据库，页面需要动态渲染
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "InspoaiBox - Viral AI Tools, Roasts & Creative Generators",
  description: "Your daily dose of digital dopamine. InspoaiBox offers fun AI tools for everyone—from savage roasts and aura checks to creative inspiration. Try it for free!",
}

export default function AboutPage() {
  return (
    <>
      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-40">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
          <div className="absolute right-0 top-0 -z-10 h-[400px] w-[400px] rounded-full bg-purple-500/10 opacity-30 blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute left-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-blue-500/10 opacity-30 blur-[120px] -translate-x-1/2 translate-y-1/2"></div>

          <div className="container relative z-10 mx-auto px-4 text-center">
            <Badge variant="outline" className="mb-6 px-4 py-1 text-sm border-primary/20 bg-primary/5 text-primary">
              The Ultimate Creative AI Playground
            </Badge>
            <h1 className="mx-auto max-w-5xl text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl mb-8 leading-tight">
              Your Daily Dose of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500 animate-gradient-x">
                Digital Dopamine
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground leading-relaxed">
              Unleash your creativity with InspoaiBox. Explore hundreds of fun AI tools: from roasting your Instagram and checking your aura to generating viral content.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="container py-12 px-4 mx-auto">
          <div className="grid gap-12 md:grid-cols-2 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Bored? Not Anymore.</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                InspoaiBox is your go-to destination for <strong>Free AI Tools</strong> and <strong>Fun Websites</strong>. We believe AI shouldn't just be about productivity—it should be about <i>creativity</i>, <i>entertainment</i>, and a little bit of chaos.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you're looking for an <strong>Instagram Roast AI</strong> to humble your friends, a <strong>TikTok Caption Generator</strong> for your next viral hit, or just an <strong>Aura Calculator</strong> to check your vibe, we've got you covered.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="secondary">#AIPlayground</Badge>
                <Badge variant="secondary">#ViralTools</Badge>
                <Badge variant="secondary">#GenZ</Badge>
                <Badge variant="secondary">#Creativity</Badge>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="bg-muted/50 border-none shadow-none hover:bg-muted/80 transition-colors">
                <CardContent className="pt-6">
                  <Sparkles className="h-8 w-8 text-yellow-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Viral Content</h3>
                  <p className="text-sm text-muted-foreground">Tools designed to help you create shareable, meme-worthy content instantly.</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50 border-none shadow-none hover:bg-muted/80 transition-colors">
                <CardContent className="pt-6">
                  <Ghost className="h-8 w-8 text-purple-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Vibe Checks</h3>
                  <p className="text-sm text-muted-foreground">From roasting your resume to finding your toxic trait, get ready for some fun.</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50 border-none shadow-none hover:bg-muted/80 transition-colors">
                <CardContent className="pt-6">
                  <Palette className="h-8 w-8 text-pink-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Creative Spark</h3>
                  <p className="text-sm text-muted-foreground">Break through creative blocks with our character sheet makers and story generators.</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50 border-none shadow-none hover:bg-muted/80 transition-colors">
                <CardContent className="pt-6">
                  <Rocket className="h-8 w-8 text-blue-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Always Free</h3>
                  <p className="text-sm text-muted-foreground">Enjoy our collection of AI Generators without breaking the bank. Just pure fun.</p>
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
                <div className="text-muted-foreground">Fun Generators</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">1M+</div>
                <div className="text-muted-foreground">Vibes Checked</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">∞</div>
                <div className="text-muted-foreground">Laughs Generated</div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="container py-24 px-4 mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <Heart className="h-12 w-12 text-red-500 mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl font-bold tracking-tight mb-6">Got a Crazy Idea?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              We love hearing from our community. If you have an idea for the next viral AI tool, let us know!
            </p>
            <a
              href="mailto:hello@inspoaibox.com"
              className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 shadow-lg shadow-primary/25"
            >
              Submit Your Idea
            </a>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
