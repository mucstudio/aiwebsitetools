import { Inter } from "next/font/google"
import { SessionProvider } from "@/components/providers/SessionProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { generateMetadata as generateSiteMetadata } from "@/lib/metadata"
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider"
import { Sidebar } from "@/components/layout/Sidebar"
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
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <div className="flex min-h-screen bg-background flex-col md:flex-row">
              <Sidebar />
              <main className="flex-1 md:pl-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out w-full">
                {children}
              </main>
            </div>
          </SessionProvider>
          <AnalyticsProvider />
        </ThemeProvider>
      </body>
    </html>
  )
}
