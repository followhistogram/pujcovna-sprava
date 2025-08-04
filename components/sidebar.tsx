"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Camera, Calendar, Package, Settings, BarChart3, Home } from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Fotoaparáty",
    href: "/cameras",
    icon: Camera,
  },
  {
    name: "Rezervace",
    href: "/reservations",
    icon: Calendar,
  },
  {
    name: "Sklad",
    href: "/inventory",
    icon: Package,
  },
  {
    name: "Reporty",
    href: "/reports",
    icon: BarChart3,
  },
  {
    name: "Nastavení",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="pb-12 w-64">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Půjčovna</h2>
          <div className="space-y-1">
            <ScrollArea className="h-[300px] px-1">
              {navigation.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", pathname === item.href && "bg-muted font-medium")}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              ))}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}
