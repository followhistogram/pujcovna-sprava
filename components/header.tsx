"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, Camera, Calendar, Film, BarChart3, Settings, Menu, Sun, Moon, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { signOut } from "@/app/login/actions"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Fotoaparáty", href: "/cameras", icon: Camera },
  { name: "Rezervace", href: "/reservations", icon: Calendar },
  { name: "Sklad", href: "/inventory", icon: Film },
  { name: "Reporty", href: "/reports", icon: BarChart3 },
  { name: "Nastavení", href: "/settings", icon: Settings },
]

export default function Header() {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Film className="h-4 w-4" />
          </div>
          <span className="hidden font-bold sm:inline-block">Půjčovna Polaroidů</span>
        </Link>

        <nav className="mx-6 hidden items-center space-x-4 lg:space-x-6 md:flex">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Přepnout téma</span>
          </Button>

          <form action={signOut}>
            <Button variant="ghost" size="icon" type="submit" className="h-9 w-9">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Odhlásit se</span>
            </Button>
          </form>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Otevřít menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Film className="h-4 w-4" />
                </div>
                <span className="font-bold">Půjčovna Polaroidů</span>
              </Link>
              <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                <div className="flex flex-col space-y-3">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                          isActive ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
