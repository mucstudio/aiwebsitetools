import { Inter } from "next/font/google"
import { SessionProvider } from "@/components/providers/SessionProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>{children}</SessionProvider>
          <AnalyticsProvider />
        </ThemeProvider>
      </body>
    </html>
  )
}
