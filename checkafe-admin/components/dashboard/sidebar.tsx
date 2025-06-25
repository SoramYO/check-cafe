"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Store,
  Coffee,
  Users,
  Calendar,
  Tag,
  Map,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ImageIcon,
  MessageSquare,
  BarChart,
  Crown,
} from "lucide-react"

const shopNavItems = [
  {
    title: "Tổng quan",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Hồ sơ quán",
    href: "/dashboard/profile",
    icon: Store,
  },
  {
    title: "Khu vực ngồi",
    href: "/dashboard/seating",
    icon: Map,
  },
  {
    title: "Menu",
    href: "/dashboard/menu",
    icon: Coffee,
  },
  {
    title: "Đơn đặt chỗ",
    href: "/dashboard/reservations",
    icon: Calendar,
  },
  {
    title: "Nhân viên",
    href: "/dashboard/staff",
    icon: Users,
  },
  {
    title: "Thống kê",
    href: "/dashboard/analytics",
    icon: BarChart,
  },
  {
    title: "Phản hồi khách",
    href: "/dashboard/feedback",
    icon: MessageSquare,
  },
  {
    title: "Cài đặt",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs">CK</span>
            </div>
            <span className="font-bold">ChecKafe</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-xs">CK</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("ml-auto", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {shopNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                pathname === item.href ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100",
                collapsed && "justify-center px-2",
              )}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
