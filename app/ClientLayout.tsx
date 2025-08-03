"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import { Toaster } from "@/components/ui/sonner"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="min-h-screen bg-background">
        {!isLoginPage && <Header />}
        <main className={isLoginPage ? "" : "p-4 md:p-6 lg:p-8"}>{children}</main>
      </div>
      <Toaster position="top-right" />
    </ThemeProvider>
  )
}
