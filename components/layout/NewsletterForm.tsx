"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function NewsletterForm() {
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

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
  )
}
