"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useFeature } from "@/hooks/useFeatures"
import { Button } from "@/components/ui/button"

export function Footer() {
  const [siteInfo, setSiteInfo] = useState({
    companyName: "AI Website Tools Inc.",
    contactEmail: "hello@aiwebsitetools.com",
  })
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const blogEnabled = useFeature("enableBlog")
  const docsEnabled = useFeature("enableDocumentation")
  const newsletterEnabled = useFeature("enableNewsletter")

  // 加载网站信息
  useEffect(() => {
    async function loadSiteInfo() {
      try {
        const response = await fetch("/api/admin/settings")
        if (response.ok) {
          const data = await response.json()
          const settings = data.settings || {}

          setSiteInfo({
            companyName: settings.company_name || "AI Website Tools Inc.",
            contactEmail: settings.contact_email || "hello@aiwebsitetools.com",
          })
        }
      } catch (error) {
        console.error("Failed to load site info:", error)
      }
    }

    loadSiteInfo()
  }, [])

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNewsletterStatus("loading")

    try {
      // TODO: 实现邮件订阅 API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setNewsletterStatus("success")
      setNewsletterEmail("")
      setTimeout(() => setNewsletterStatus("idle"), 3000)
    } catch (error) {
      setNewsletterStatus("error")
      setTimeout(() => setNewsletterStatus("idle"), 3000)
    }
  }

  return (
    <footer className="border-t bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/tools" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  All Tools
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              {blogEnabled && (
                <li>
                  <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
              )}
              {docsEnabled && (
                <li>
                  <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
              )}
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <ul className="space-y-3">
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href={`mailto:${siteInfo.contactEmail}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Email Us
                </a>
              </li>
            </ul>
          </div>

          {newsletterEnabled && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Subscribe to get updates and news
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 text-sm border rounded-md"
                  required
                  disabled={newsletterStatus === "loading"}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="w-full"
                  disabled={newsletterStatus === "loading"}
                >
                  {newsletterStatus === "loading" ? "Subscribing..." : "Subscribe"}
                </Button>
                {newsletterStatus === "success" && (
                  <p className="text-xs text-green-600">Successfully subscribed!</p>
                )}
                {newsletterStatus === "error" && (
                  <p className="text-xs text-red-600">Failed to subscribe. Please try again.</p>
                )}
              </form>
            </div>
          )}
        </div>
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {siteInfo.companyName}. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Contact: <a href={`mailto:${siteInfo.contactEmail}`} className="hover:text-foreground transition-colors">{siteInfo.contactEmail}</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
