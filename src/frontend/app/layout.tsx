import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Expense Management",
  description: "Minimal expense management system",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <div className="min-h-screen">
            <Suspense fallback={<div>Loading...</div>}>
              <header className="border-b border-border px-4 py-3 flex justify-between items-center">
                <h1 className="text-lg font-normal">Expense Management</h1>
                <ThemeToggle />
              </header>
              <main>{children}</main>
            </Suspense>
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
