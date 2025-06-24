"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, Trash2, Filter, Plus, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import authorizedAxiosInstance from "@/lib/axios"
import { Notification, NotificationStats } from "./types"

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [typeFilter, setTypeFilter] = useState<string>("")
  const [categoryFilter, setCategoryFilter] = useState<string>("")
  const [priorityFilter, setPriorityFilter] = useState<string>("")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    fetchNotifications()
    fetchNotificationStats()
  }, [pagination.page, filter, typeFilter, categoryFilter, priorityFilter])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      if (filter === "unread") params.append("read", "false")
      if (filter === "read") params.append("read", "true")
      if (typeFilter) params.append("type", typeFilter)
      if (categoryFilter) params.append("category", categoryFilter)
      if (priorityFilter) params.append("priority", priorityFilter)

      const response = await authorizedAxiosInstance.get(`/v1/admin/notifications?${params}`)
      
      if (response.data.code === "200") {
        setNotifications(response.data.metadata.notifications)
        setPagination(response.data.metadata.pagination)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tải thông báo")
    } finally {
      setLoading(false)
    }
  }

  const fetchNotificationStats = async () => {
    try {
      const response = await authorizedAxiosInstance.get("/v1/admin/notifications/stats")
      
      if (response.data.code === "200") {
        setStats(response.data.metadata)
      }
    } catch (error: any) {
      console.error("Error fetching notification stats:", error)
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
        toast.success("Đã đánh dấu đã đọc")
        fetchNotificationStats() // Refresh stats
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra")
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const response = await authorizedAxiosInstance.delete(`/v1/admin/notifications/${id}`)
      
      if (response.data.code === "200") {
        setNotifications(prev => prev.filter(notif => notif._id !== id))
        toast.success("Đã xóa thông báo")
        fetchNotificationStats() // Refresh stats
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra")
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await authorizedAxiosInstance.put("/v1/admin/notifications/read-all")
      
      if (response.data.code === "200") {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        )
        toast.success(response.data.message || "Đã đánh dấu tất cả đã đọc")
        fetchNotificationStats() // Refresh stats
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra")
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "info": return "bg-blue-500"
      case "warning": return "bg-yellow-500"
      case "error": return "bg-red-500"
      case "success": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "info": return "Thông tin"
      case "warning": return "Cảnh báo"
      case "error": return "Lỗi"
      case "success": return "Thành công"
      default: return "Khác"
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "system": return "Hệ thống"
      case "user": return "Người dùng"
      case "shop": return "Quán cà phê"
      case "booking": return "Đặt chỗ"
      case "payment": return "Thanh toán"
      case "verification": return "Xác thực"
      default: return category
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-gray-500"
      case "medium": return "bg-blue-500"
      case "high": return "bg-orange-500"
      case "urgent": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "low": return "Thấp"
      case "medium": return "Trung bình"
      case "high": return "Cao"
      case "urgent": return "Khẩn cấp"
      default: return priority
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleFilterChange = (newFilter: "all" | "unread" | "read") => {
    setFilter(newFilter)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setFilter("all")
    setTypeFilter("")
    setCategoryFilter("")
    setPriorityFilter("")
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải thông báo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thông báo</h1>
          <p className="text-muted-foreground">
            Quản lý thông báo hệ thống và người dùng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchNotifications()
              fetchNotificationStats()
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button
            onClick={() => router.push("/admin/notifications/create")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Tạo thông báo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={!stats?.summary.unread}
          >
            <Check className="h-4 w-4 mr-2" />
            Đánh dấu tất cả đã đọc
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng cộng</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chưa đọc</CardTitle>
              <div className="h-4 w-4 rounded-full bg-blue-500"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.summary.unread}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã đọc</CardTitle>
              <div className="h-4 w-4 rounded-full bg-green-500"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.summary.read}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tỷ lệ đọc</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.summary.total > 0 ? Math.round((stats.summary.read / stats.summary.total) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Danh sách thông báo</CardTitle>
              {stats?.summary.unread && (
                <Badge variant="destructive">{stats.summary.unread} mới</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              
              {/* Filter buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("all")}
                >
                  Tất cả
                </Button>
                <Button
                  variant={filter === "unread" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("unread")}
                >
                  Chưa đọc
                </Button>
                <Button
                  variant={filter === "read" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("read")}
                >
                  Đã đọc
                </Button>
              </div>

              {/* Type filter */}
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="">Tất cả loại</option>
                <option value="info">Thông tin</option>
                <option value="warning">Cảnh báo</option>
                <option value="error">Lỗi</option>
                <option value="success">Thành công</option>
              </select>

              {/* Category filter */}
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="">Tất cả danh mục</option>
                <option value="system">Hệ thống</option>
                <option value="user">Người dùng</option>
                <option value="shop">Quán cà phê</option>
                <option value="booking">Đặt chỗ</option>
                <option value="payment">Thanh toán</option>
                <option value="verification">Xác thực</option>
              </select>

              {/* Priority filter */}
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="">Tất cả độ ưu tiên</option>
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="urgent">Khẩn cấp</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Không có thông báo nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border rounded-lg ${
                    !notification.read ? "bg-blue-50 border-blue-200" : "bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getTypeColor(notification.type)}>
                          {getTypeLabel(notification.type)}
                        </Badge>
                        <Badge className={getPriorityColor(notification.priority)}>
                          {getPriorityLabel(notification.priority)}
                        </Badge>
                        <Badge variant="outline">
                          {getCategoryLabel(notification.category)}
                        </Badge>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <h3 className="font-semibold mb-1">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      
                      {/* Related info */}
                      {(notification.user_id || notification.shop_id) && (
                        <div className="text-xs text-muted-foreground mb-2">
                          {notification.user_id && (
                            <span>Người dùng: {notification.user_id.full_name}</span>
                          )}
                          {notification.shop_id && (
                            <span>Quán: {notification.shop_id.name}</span>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification._id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Trước
              </Button>
              <span className="text-sm">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 