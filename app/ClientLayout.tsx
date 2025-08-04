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
        <main className={isLoginPage ? "" : "container mx-auto px-4 py-6"}>{children}</main>
      </div>
      <Toaster />
    </ThemeProvider>
  )
}
