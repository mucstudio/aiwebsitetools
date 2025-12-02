import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="container py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">About Us</h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-muted-foreground mb-8">
                We&apos;re building the best collection of online tools to help you work smarter and faster.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-6">
                Our mission is to provide free and accessible online tools that help people accomplish
                their daily tasks more efficiently. We believe that powerful tools shouldn&apos;t require
                installation or complicated setup.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Why Choose Us?</h2>
              <ul className="space-y-3 text-muted-foreground mb-6">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Privacy First:</strong> Your data is processed securely and never stored</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Fast & Reliable:</strong> All tools are optimized for speed and performance</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Always Available:</strong> Access tools anytime, anywhere, on any device</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>No Installation:</strong> Everything works directly in your browser</span>
                </li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">Our Story</h2>
              <p className="text-muted-foreground mb-6">
                We started this project because we were frustrated with the lack of simple, reliable
                online tools. Many existing tools were cluttered with ads, slow to load, or required
                unnecessary sign-ups. We wanted to create something better.
              </p>

              <p className="text-muted-foreground mb-6">
                Today, we serve thousands of users worldwide, helping them with everything from text
                processing to image editing, development utilities, and more. We&apos;re constantly adding
                new tools based on user feedback and needs.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                Have questions or suggestions? We&apos;d love to hear from you!<br />
                Email us at: <a href="mailto:hello@aiwebsitetools.com" className="text-primary hover:underline">hello@aiwebsitetools.com</a>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
