"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Menu, LayoutDashboard, ChevronDown, X, Moon, Sun } from 'lucide-react'
import { Button } from "@repo/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@repo/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from "@repo/ui/sheet"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/collapsible"
import { Logo } from '@/components/logo'
import { MegaMenu } from '@/components/landing/mega-menu'
import { ModeToggle } from '@/components/mode-toggle'
import { useTheme } from "@/components/theme-provider"

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:7722"

const navigationItems = [
  { name: 'Home', href: '#hero' },
  { name: 'Features', href: '#features' },
  { name: 'Solutions', href: '#features', hasMegaMenu: true },
  { name: 'Team', href: '#team' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'FAQ', href: '#faq' },
  { name: 'Contact', href: '#contact' },
]

// Solutions menu items for mobile
const solutionsItems = [
  { title: 'For Clinics' },
  { name: 'Appointments', href: '#features' },
  { name: 'Patient Records', href: '#features' },
  { name: 'Prescriptions', href: '#features' },
  { title: 'For Doctors' },
  { name: 'Daily Khata & Billing', href: '#features' },
  { name: 'Reports & Analytics', href: '#features' },
  { title: 'Plans' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'FAQ', href: '#faq' },
]

// Smooth scroll function
const smoothScrollTo = (targetId: string) => {
  if (targetId.startsWith('#')) {
    const element = document.querySelector(targetId)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }
}

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [solutionsOpen, setSolutionsOpen] = useState(false)
  const { setTheme, theme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link href="#hero" className="flex items-center space-x-2 cursor-pointer">
            <Logo size={32} className="text-primary" />
            <span className="font-bold">
              Daktar Khata
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden xl:flex">
          <NavigationMenuList>
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.name}>
                {item.hasMegaMenu ? (
                  <>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:text-primary focus:text-primary cursor-pointer">
                      {item.name}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <MegaMenu />
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink
                    className="group inline-flex h-10 w-max items-center justify-center px-4 py-2 text-sm font-medium transition-colors hover:text-primary focus:text-primary focus:outline-none cursor-pointer"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault()
                      if (item.href.startsWith('#')) {
                        smoothScrollTo(item.href)
                      } else {
                        window.location.href = item.href
                      }
                    }}
                  >
                    {item.name}
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Desktop CTA */}
        <div className="hidden xl:flex items-center space-x-2">
          <ModeToggle />
          <a href={DASHBOARD_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="cursor-pointer">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </a>
          <a href={`${DASHBOARD_URL}/auth/login`} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" className="cursor-pointer">Sign In</Button>
          </a>
          <a href={`${DASHBOARD_URL}/auth/signup`} target="_blank" rel="noopener noreferrer">
            <Button className="cursor-pointer">Get Started</Button>
          </a>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="xl:hidden cursor-pointer"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <SheetContent side="right" className="w-full sm:w-[400px] p-0 gap-0 [&>button]:hidden overflow-hidden flex flex-col">
            <div className="flex flex-col h-full">
              {/* Header */}
              <SheetHeader className="space-y-0 p-4 pb-2 border-b">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Logo size={16} className="text-primary" />
                  </div>
                  <SheetTitle className="text-lg font-semibold">Daktar Khata</SheetTitle>
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                      className="cursor-pointer h-8 w-8"
                    >
                      <Moon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Sun className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="cursor-pointer h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </SheetHeader>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto">
                <nav className="p-6 space-y-1">
                  {navigationItems.map((item) => (
                    <div key={item.name}>
                      {item.hasMegaMenu ? (
                        <Collapsible open={solutionsOpen} onOpenChange={setSolutionsOpen}>
                          <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 text-base font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer">
                            {item.name}
                            <ChevronDown className={`h-4 w-4 transition-transform ${solutionsOpen ? 'rotate-180' : ''}`} />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-4 space-y-1">
                            {solutionsItems.map((solution, index) => (
                              solution.title ? (
                                <div
                                  key={`title-${index}`}
                                  className="px-4 mt-5 py-2 text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider"
                                >
                                  {solution.title}
                                </div>
                              ) : (
                                <a
                                  key={solution.name}
                                  href={solution.href}
                                  className="flex items-center px-4 py-2 text-sm rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                  onClick={(e) => {
                                    setIsOpen(false)
                                    if (solution.href?.startsWith('#')) {
                                      e.preventDefault()
                                      setTimeout(() => smoothScrollTo(solution.href), 100)
                                    }
                                  }}
                                >
                                  {solution.name}
                                </a>
                              )
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <a
                          href={item.href}
                          className="flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          onClick={(e) => {
                            setIsOpen(false)
                            if (item.href.startsWith('#')) {
                              e.preventDefault()
                              setTimeout(() => smoothScrollTo(item.href), 100)
                            }
                          }}
                        >
                          {item.name}
                        </a>
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              {/* Footer Actions */}
              <div className="border-t p-6 space-y-4">

                {/* Primary Actions */}
                <div className="space-y-3">
                  <a href={DASHBOARD_URL} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="lg" className="w-full cursor-pointer">
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </Button>
                  </a>

                  <div className="grid grid-cols-2 gap-3">
                    <a href={`${DASHBOARD_URL}/auth/login`} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="lg" className="cursor-pointer w-full">Sign In</Button>
                    </a>
                    <a href={`${DASHBOARD_URL}/auth/signup`} target="_blank" rel="noopener noreferrer">
                      <Button size="lg" className="cursor-pointer w-full">Get Started</Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}