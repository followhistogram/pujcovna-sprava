"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Camera, Calendar, Package, Settings, Home, Truck } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Fotoaparáty", href: "/cameras", icon: Camera },
  { name: "Rezervace", href: "/reservations", icon: Calendar },
  { name: "Výpůjčky", href: "/rentals", icon: Truck },
  { name: "Sklad", href: "/inventory", icon: Package },
  { name: "Nastavení", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex h-16 shrink-0 items-center px-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Půjčovna</h1>
      </div>
      <nav className="flex flex-1 flex-col px-6 py-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
                    isActive
                      ? "bg-gray-50 text-blue-600 dark:bg-gray-800 dark:text-blue-400"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-6 w-6 shrink-0",
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400",
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
