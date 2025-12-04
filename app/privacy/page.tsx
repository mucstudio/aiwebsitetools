import { prisma } from "@/lib/prisma"
import { Footer } from "@/components/layout/Footer"
import MarkdownRenderer from "@/components/admin/MarkdownRenderer"

export const dynamic = 'force-dynamic'

export default async function PrivacyPage() {
    const setting = await prisma.siteSettings.findUnique({
        where: { key: "privacy_policy" },
    })

    const defaultContent = `# Privacy Policy

Last updated: ${new Date().toLocaleDateString()}

## 1. Introduction
Welcome to AI Website Tools. We respect your privacy and are committed to protecting your personal data.

## 2. Data We Collect
We collect data to provide better services to all our users.
- **Personal Information**: Name, email address.
- **Usage Data**: How you use our tools.

## 3. How We Use Your Data
- To provide and maintain our Service.
- To notify you about changes to our Service.
- To provide customer support.

## 4. Contact Us
If you have any questions about this Privacy Policy, please contact us at hello@aiwebsitetools.com.`

    const content = (setting?.value as string) || defaultContent

    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 container py-12 max-w-4xl">
                <MarkdownRenderer content={content} />
            </main>
            <Footer />
        </div>
    )
}
