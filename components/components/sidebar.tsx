"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Calendar, Camera, ChevronDown, FileText, Home, Settings, Shield, Sliders, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface SidebarProps {
  isOpen: boolean
}

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  submenu?: NavItem[]
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname()
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Enroll Member",
      href: "/enroll",
      icon: <Camera className="h-5 w-5" />,
    },
    {
      title: "Attendance Reports",
      href: "#",
      icon: <FileText className="h-5 w-5" />,
      submenu: [
        {
          title: "Daily Report",
          href: "/reports/daily",
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          title: "Individual Report",
          href: "/reports/individual",
          icon: <User className="h-4 w-4" />,
        },
        {
          title: "Date Range Report",
          href: "/reports/date-range",
          icon: <Calendar className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Manual Attendance",
      href: "/manual-attendance",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: "Threshold Settings",
      href: "/threshold",
      icon: <Sliders className="h-5 w-5" />,
    },
    {
      title: "Role Manager",
      href: "/roles",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  const toggleSubmenu = (title: string) => {
    setOpenSubmenu(openSubmenu === title ? null : title)
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r bg-background/80 backdrop-blur-md transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      )}
    >
      <div className="flex h-full flex-col py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Navigation</h2>
          <div className="space-y-1">
            {navItems.map((item) =>
              item.submenu ? (
                <Collapsible
                  key={item.title}
                  open={openSubmenu === item.title}
                  onOpenChange={() => toggleSubmenu(item.title)}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between">
                      <div className="flex items-center">
                        {item.icon}
                        <span className="ml-3">{item.title}</span>
                      </div>
                      <ChevronDown
                        className={cn("h-4 w-4 transition-transform", openSubmenu === item.title && "rotate-180")}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pl-8 pt-1 space-y-1">
                      {item.submenu.map((subitem) => (
                        <Link key={subitem.href} href={subitem.href}>
                          <Button
                            variant="ghost"
                            className={cn("w-full justify-start", pathname === subitem.href && "bg-muted")}
                          >
                            {subitem.icon}
                            <span className="ml-3">{subitem.title}</span>
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Link key={item.href} href={item.href}>
                  <Button variant="ghost" className={cn("w-full justify-start", pathname === item.href && "bg-muted")}>
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                  </Button>
                </Link>
              ),
            )}
          </div>
        </div>
        <div className="mt-auto px-3 py-2">
          <div className="rounded-lg bg-muted p-3">
            <h3 className="text-sm font-medium">Need help?</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Check our documentation or contact support for assistance.
            </p>
            <Button className="mt-2 w-full text-xs" size="sm">
              View Documentation
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}

