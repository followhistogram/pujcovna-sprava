"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import { Toaster } from "@/components/ui/sonner"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"

  return (
    <html lang="cs" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <title>Půjčovna Polaroidů - Admin</title>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {isLoginPage ? (
            children
          ) : (
            <div className="min-h-screen bg-background">
              <Header />
              <main className="p-4 md:p-6 lg:p-8">{children}</main>
            </div>
          )}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
