import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { NewsletterForm } from "./NewsletterForm"

export async function Footer() {
  // 服务器端并行获取数据
  const [companyNameSetting, contactEmailSetting, blogFeature, docsFeature, newsletterFeature] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { key: 'company_name' } }),
    prisma.siteSettings.findUnique({ where: { key: 'contact_email' } }),
    prisma.siteSettings.findUnique({ where: { key: 'enableBlog' } }),
    prisma.siteSettings.findUnique({ where: { key: 'enableDocumentation' } }),
    prisma.siteSettings.findUnique({ where: { key: 'enableNewsletter' } }),
  ])

  const companyName = (companyNameSetting?.value as string) || 'AI Website Tools Inc.'
  const contactEmail = (contactEmailSetting?.value as string) || 'hello@aiwebsitetools.com'

  const blogEnabled = (blogFeature?.value as boolean) ?? false
  const docsEnabled = (docsFeature?.value as boolean) ?? false
  const newsletterEnabled = (newsletterFeature?.value as boolean) ?? false

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
                <a href={`mailto:${contactEmail}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Email Us
                </a>
              </li>
            </ul>
          </div>

          {newsletterEnabled && <NewsletterForm />}
        </div>
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {companyName}. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Contact: <a href={`mailto:${contactEmail}`} className="hover:text-foreground transition-colors">{contactEmail}</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
