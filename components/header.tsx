"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Film, Camera, Package, Calendar, Settings, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { logout } from "@/app/login/actions"

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Fotoaparáty", href: "/cameras", icon: Camera },
  { name: "Sklad", href: "/inventory", icon: Package },
  { name: "Rezervace", href: "/reservations", icon: Calendar },
  { name: "Reporty", href: "/reports", icon: BarChart3 },
  { name: "Nastavení", href: "/settings", icon: Settings },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <Film className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Půjčovna Polaroidů</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-foreground/80",
                    pathname === item.href
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <ModeToggle />
          {/* Možná zde chybí logout tlačítko */}
        </div>
      </div>
    </header>
  )
}
