import { prisma } from "@/lib/prisma"
import { Footer } from "@/components/layout/Footer"
import MarkdownRenderer from "@/components/admin/MarkdownRenderer"

export const dynamic = 'force-dynamic'

export default async function TermsPage() {
    const setting = await prisma.siteSettings.findUnique({
        where: { key: "terms_of_service" },
    })

    const content = (setting?.value as string) || "# Terms of Service\n\nComing soon..."

    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 container py-12 max-w-4xl">
                <MarkdownRenderer content={content} />
            </main>
            <Footer />
        </div>
    )
}
