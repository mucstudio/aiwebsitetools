import { Inter } from "next/font/google"
import { SessionProvider } from "@/components/providers/SessionProvider"
import { generateMetadata as generateSiteMetadata } from "@/lib/metadata"
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export async function generateMetadata() {
  return await generateSiteMetadata()
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <SessionProvider>{children}</SessionProvider>
        <AnalyticsProvider />
      </body>
    </html>
  )
}
