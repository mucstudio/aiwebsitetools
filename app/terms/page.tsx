import { prisma } from "@/lib/prisma"
import { Footer } from "@/components/layout/Footer"
import MarkdownRenderer from "@/components/admin/MarkdownRenderer"

export const dynamic = 'force-dynamic'

export default async function TermsPage() {
    const setting = await prisma.siteSettings.findUnique({
        where: { key: "terms_of_service" },
    })

    const defaultContent = `# Terms of Service

Last updated: ${new Date().toLocaleDateString()}

## 1. Acceptance of Terms
By accessing or using our Service, you agree to be bound by these Terms.

## 2. Use of Service
You agree to use the Service only for lawful purposes and in accordance with these Terms.

## 3. Accounts
When you create an account with us, you must provide us information that is accurate, complete, and current at all times.

## 4. Intellectual Property
The Service and its original content, features, and functionality are and will remain the exclusive property of AI Website Tools.

## 5. Contact Us
If you have any questions about these Terms, please contact us at hello@aiwebsitetools.com.`

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
