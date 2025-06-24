"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { Bell, Search, Menu, LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logoutAsync } from "@/lib/store/slices/authSlice"
import { AppDispatch, RootState } from "@/lib/store"
import { toast } from "sonner"
import authorizedAxiosInstance from "@/lib/axios"

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  category: string
  priority: string
  read: boolean
  createdAt: string
  user_id?: {
    _id: string
    full_name: string
    email: string
  }
  shop_id?: {
    _id: string
    name: string
    address: string
  }
}

export default function AdminHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { user, loading: authLoading } = useSelector((state: RootState) => state.auth)

  // Fetch notifications
  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await authorizedAxiosInstance.get("/v1/admin/notifications?page=1&limit=5")
      
      if (response.data.code === "200") {
        const fetchedNotifications = response.data.metadata.notifications || []
        setNotifications(fetchedNotifications)
        setUnreadCount(fetchedNotifications.filter((n: Notification) => !n.read).length)
      }
    } catch (error: any) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await authorizedAxiosInstance.put(`/v1/admin/notifications/${id}/read`)
      
      if (response.data.code === "200") {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === id ? { ...notif, read: true } : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error: any) {
      console.error("Error marking notification as read:", error)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "info": return "text-blue-600"
      case "warning": return "text-yellow-600"
      case "error": return "text-red-600"
      case "success": return "text-green-600"
      default: return "text-gray-600"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "info": return "ℹ️"
      case "warning": return "⚠️"
      case "error": return "❌"
      case "success": return "✅"
      default: return "📢"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "Vừa xong"
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`
  }

  const handleLogout = async () => {
    try {
      await dispatch(logoutAsync()).unwrap()
      toast.success("Đăng xuất thành công!")
      router.push("/login")
    } catch (error) {
      toast.error("Đăng xuất thất bại!")
      // Vẫn redirect về login ngay cả khi API thất bại
      router.push("/login")
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu />
          </Button>
        </div>

        <div className="hidden md:flex md:w-1/3 lg:w-1/4 bg-white">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input type="search" placeholder="Tìm kiếm..." className="w-full pl-8 bg-gray-50 border-gray-200" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Thông báo</span>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                    {unreadCount} mới
                  </span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-gray-500">Đang tải...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Không có thông báo nào</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem 
                      key={notification._id}
                      className={`py-3 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification._id)
                        }
                      }}
                    >
                      <div className="w-full">
                        <div className="flex items-start gap-2">
                          <span className="text-sm">{getTypeIcon(notification.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-sm ${getTypeColor(notification.type)}`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            {/* Related info */}
                            {(notification.user_id || notification.shop_id) && (
                              <div className="text-xs text-gray-500 mt-1">
                                {notification.user_id && (
                                  <span>👤 {notification.user_id.full_name}</span>
                                )}
                                {notification.shop_id && (
                                  <span>🏪 {notification.shop_id.name}</span>
                                )}
                              </div>
                            )}
                            
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="justify-center text-primary cursor-pointer"
                onClick={() => router.push("/admin/notifications")}
              >
                Xem tất cả thông báo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative flex items-center gap-2" size="sm">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'AD'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline font-medium">
                  {user?.full_name || 'Admin'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Hồ sơ</DropdownMenuItem>
              <DropdownMenuItem>Cài đặt</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-500 cursor-pointer"
                onClick={handleLogout}
                disabled={authLoading}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {authLoading ? "Đang đăng xuất..." : "Đăng xuất"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
