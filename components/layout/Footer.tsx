import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { NewsletterForm } from "./NewsletterForm"

interface FooterProps {
  showLinks?: boolean
}

export async function Footer({ showLinks = true }: FooterProps) {
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
    <footer className="border-t bg-muted/20">
      <div className="container py-12 md:py-16">
        {showLinks && newsletterEnabled && (
          <div className="mb-12">
            <NewsletterForm />
          </div>
        )}
        <div className={`${showLinks ? 'mt-12 border-t pt-8' : ''}`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {companyName}. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Contact: <a href={`mailto:${contactEmail}`} className="hover:text-foreground transition-colors">{contactEmail}</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
