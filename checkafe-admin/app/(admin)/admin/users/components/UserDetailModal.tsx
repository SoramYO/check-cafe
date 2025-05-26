'use client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User } from "../types"
import { Mail, Phone, Calendar, User as UserIcon, Trophy, Coins } from "lucide-react"
import { useState, useEffect } from "react"
import authorizedAxiosInstance from "@/lib/axios"
import { UserDetailResponse } from "../types"

interface UserDetailModalProps {
  userId: string | null
  onClose: () => void
}

export function UserDetailModal({ userId, onClose }: UserDetailModalProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchUserDetails()
    }
  }, [userId])

  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      const response = await authorizedAxiosInstance.get<UserDetailResponse>(`/v1/admin/users/${userId}`)
      if (response.data.status === 200) {
        setUser(response.data.data.user)
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!userId) return null

  return (
    <Dialog open={!!userId} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết người dùng</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div>Đang tải...</div>
        ) : user ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-3xl font-bold">
                    {user.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{user.full_name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline"
                    className={`
                      ${user.role === "ADMIN" 
                        ? "bg-purple-50 text-purple-600 border-purple-200"
                        : user.role === "SHOP_OWNER"
                          ? "bg-blue-50 text-blue-600 border-blue-200"
                          : "bg-green-50 text-green-600 border-green-200"
                      }
                    `}
                  >
                    {user.role}
                  </Badge>
                  <Badge variant={user.is_active ? "outline" : "secondary"} className={user.is_active ? "bg-green-50 text-green-600 border-green-200" : ""}>
                    {user.is_active ? "Đang hoạt động" : "Tạm ngưng"}
                  </Badge>
                  {user.vip_status && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                      VIP
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Số điện thoại</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </div>
                </div>
              )}
              {user.points !== undefined && (
                <div className="flex items-start gap-2">
                  <Coins className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Điểm tích lũy</div>
                    <div className="text-sm text-gray-500">{user.points} điểm</div>
                  </div>
                </div>
              )}
              {user.createdAt && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Ngày tạo</div>
                    <div className="text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs can be added for additional information */}
            <Tabs defaultValue="activity">
              <TabsList>
                <TabsTrigger value="activity">Hoạt động gần đây</TabsTrigger>
                <TabsTrigger value="reservations">Lịch đặt chỗ</TabsTrigger>
                <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="space-y-4">
                <div className="p-4 text-center text-gray-500">
                  Không có hoạt động gần đây
                </div>
              </TabsContent>

              <TabsContent value="reservations" className="space-y-4">
                <div className="p-4 text-center text-gray-500">
                  Không có lịch đặt chỗ nào
                </div>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                <div className="p-4 text-center text-gray-500">
                  Không có đơn hàng nào
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div>Không tìm thấy thông tin người dùng</div>
        )}
      </DialogContent>
    </Dialog>
  )
} 