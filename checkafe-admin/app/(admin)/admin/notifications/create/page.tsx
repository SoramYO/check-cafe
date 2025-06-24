"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import authorizedAxiosInstance from "@/lib/axios"

interface User {
  _id: string
  full_name: string
  email: string
  avatar?: string
  role: string
  is_active: boolean
  createdAt: string
}

interface Shop {
  _id: string
  name: string
  address: string
  owner_id: string
}

export default function CreateNotificationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingShops, setLoadingShops] = useState(false)
  const [userSearch, setUserSearch] = useState("")
  const [shopSearch, setShopSearch] = useState("")
  const [showUserSelect, setShowUserSelect] = useState(false)
  const [showShopSelect, setShowShopSelect] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info" as "info" | "warning" | "error" | "success",
    category: "system" as "system" | "user" | "shop" | "booking" | "payment" | "verification",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    user_id: "",
    shop_id: "",
    action_url: "",
    action_text: "",
    expires_at: ""
  })

  // Fetch users when category changes to user
  useEffect(() => {
    if (formData.category === "user") {
      fetchUsers()
    }
  }, [formData.category])

  // Fetch shops when category changes to shop
  useEffect(() => {
    if (formData.category === "shop") {
      fetchShops()
    }
  }, [formData.category])

  const fetchUsers = async (search = "") => {
    try {
      setLoadingUsers(true)
      const params = new URLSearchParams({
        page: "1",
        limit: "50"
      })
      if (search) {
        params.append("search", search)
      }
      
      const response = await authorizedAxiosInstance.get(`/v1/admin/users?${params}`)
      
      if (response.data.status === 200) {
        setUsers(response.data.data.data || [])
      }
    } catch (error: any) {
      console.error("Error fetching users:", error)
      toast.error("Không thể tải danh sách người dùng")
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchShops = async (search = "") => {
    try {
      setLoadingShops(true)
      const params = new URLSearchParams({
        page: "1",
        limit: "50"
      })
      if (search) {
        params.append("search", search)
      }
      
      const response = await authorizedAxiosInstance.get(`/v1/admin/shops?${params}`)
      
      if (response.data.status === 200) {
        setShops(response.data.data.shops || [])
      }
    } catch (error: any) {
      console.error("Error fetching shops:", error)
      toast.error("Không thể tải danh sách quán cà phê")
    } finally {
      setLoadingShops(false)
    }
  }

  const handleUserSearch = (value: string) => {
    setUserSearch(value)
    if (value.length >= 2) {
      fetchUsers(value)
    } else if (value.length === 0) {
      fetchUsers()
    }
  }

  const handleShopSearch = (value: string) => {
    setShopSearch(value)
    if (value.length >= 2) {
      fetchShops(value)
    } else if (value.length === 0) {
      fetchShops()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.message) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }

    try {
      setLoading(true)
      
      const notificationData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        category: formData.category,
        priority: formData.priority,
        action_url: formData.action_url || undefined,
        action_text: formData.action_text || undefined,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : undefined
      }

      let response
      
      if (formData.category === "user" && formData.user_id) {
        response = await authorizedAxiosInstance.post("/v1/admin/notifications/user", {
          userId: formData.user_id,
          ...notificationData
        })
      } else if (formData.category === "shop" && formData.shop_id) {
        response = await authorizedAxiosInstance.post("/v1/admin/notifications/shop", {
          shopId: formData.shop_id,
          ...notificationData
        })
      } else {
        response = await authorizedAxiosInstance.post("/v1/admin/notifications", notificationData)
      }

      if (response.data.code === "201") {
        toast.success("Tạo thông báo thành công")
        router.push("/admin/notifications")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tạo thông báo")
    } finally {
      setLoading(false)
    }
  }

  const getSelectedUserName = () => {
    const user = users.find(u => u._id === formData.user_id)
    return user ? `${user.full_name} (${user.email})` : ""
  }

  const getSelectedShopName = () => {
    const shop = shops.find(s => s._id === formData.shop_id)
    return shop ? `${shop.name} - ${shop.address}` : ""
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tạo thông báo mới</h1>
          <p className="text-muted-foreground">
            Tạo thông báo hệ thống hoặc gửi thông báo cho người dùng/quán cà phê cụ thể
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin thông báo</CardTitle>
          <CardDescription>
            Điền đầy đủ thông tin để tạo thông báo mới
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nhập tiêu đề thông báo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Loại</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Thông tin</SelectItem>
                    <SelectItem value="warning">Cảnh báo</SelectItem>
                    <SelectItem value="error">Lỗi</SelectItem>
                    <SelectItem value="success">Thành công</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Nội dung *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Nhập nội dung thông báo"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Danh mục</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      category: value,
                      user_id: "",
                      shop_id: ""
                    }))
                    setUserSearch("")
                    setShopSearch("")
                    setShowUserSelect(false)
                    setShowShopSelect(false)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">Hệ thống</SelectItem>
                    <SelectItem value="user">Người dùng</SelectItem>
                    <SelectItem value="shop">Quán cà phê</SelectItem>
                    <SelectItem value="booking">Đặt chỗ</SelectItem>
                    <SelectItem value="payment">Thanh toán</SelectItem>
                    <SelectItem value="verification">Xác thực</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Độ ưu tiên</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="urgent">Khẩn cấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* User Selection */}
            {formData.category === "user" && (
              <div className="space-y-2">
                <Label>Chọn người dùng</Label>
                <div className="relative">
                  <Input
                    placeholder="Tìm kiếm người dùng..."
                    value={userSearch}
                    onChange={(e) => handleUserSearch(e.target.value)}
                    onFocus={() => setShowUserSelect(true)}
                  />
                  {showUserSelect && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {loadingUsers ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                          Đang tải...
                        </div>
                      ) : users.length > 0 ? (
                        users.map((user) => (
                          <div
                            key={user._id}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, user_id: user._id }))
                              setUserSearch(user.full_name)
                              setShowUserSelect(false)
                            }}
                          >
                            <div className="flex items-center gap-3">
                              {user.avatar ? (
                                <img 
                                  src={user.avatar} 
                                  alt={user.full_name}
                                  className="w-8 h-8 rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                                  {user.full_name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="font-medium">{user.full_name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                <div className="text-xs text-muted-foreground">
                                  Role: {user.role} • {user.is_active ? 'Hoạt động' : 'Không hoạt động'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Không tìm thấy người dùng
                        </div>
                      )}
                    </div>
                  )}
                  {formData.user_id && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                      <strong>Đã chọn:</strong> {getSelectedUserName()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Shop Selection */}
            {formData.category === "shop" && (
              <div className="space-y-2">
                <Label>Chọn quán cà phê</Label>
                <div className="relative">
                  <Input
                    placeholder="Tìm kiếm quán cà phê..."
                    value={shopSearch}
                    onChange={(e) => handleShopSearch(e.target.value)}
                    onFocus={() => setShowShopSelect(true)}
                  />
                  {showShopSelect && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {loadingShops ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                          Đang tải...
                        </div>
                      ) : shops.length > 0 ? (
                        shops.map((shop) => (
                          <div
                            key={shop._id}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, shop_id: shop._id }))
                              setShopSearch(shop.name)
                              setShowShopSelect(false)
                            }}
                          >
                            <div className="font-medium">{shop.name}</div>
                            <div className="text-sm text-muted-foreground">{shop.address}</div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Không tìm thấy quán cà phê
                        </div>
                      )}
                    </div>
                  )}
                  {formData.shop_id && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                      <strong>Đã chọn:</strong> {getSelectedShopName()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="action_url">URL Hành động</Label>
                <Input
                  id="action_url"
                  value={formData.action_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, action_url: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="action_text">Văn bản hành động</Label>
                <Input
                  id="action_text"
                  value={formData.action_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, action_text: e.target.value }))}
                  placeholder="Xem chi tiết"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires_at">Hết hạn</Label>
              <Input
                id="expires_at"
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Tạo thông báo
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 