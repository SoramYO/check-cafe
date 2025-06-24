'use client'
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, UserDetailResponse } from "@/app/(admin)/admin/users/types"
import { 
  Mail, 
  Phone, 
  Calendar, 
  User as UserIcon, 
  Trophy, 
  Coins, 
  ArrowLeft, 
  Edit, 
  Trash2,
  Shield,
  Coffee,
  UserCheck,
  Clock,
  MapPin,
  Star,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import authorizedAxiosInstance from "@/lib/axios"
import { toast } from "sonner"

interface UserActivity {
  reservations: any[]
  reviews: any[]
  checkins: any[]
}

interface UserStatistics {
  total: {
    reservations: number
    checkins: number
    reviews: number
  }
  recent: {
    reservations: number
    checkins: number
    reviews: number
  }
  statusBreakdown: {
    PENDING: number
    CONFIRMED: number
    COMPLETED: number
    CANCELLED: number
  }
}

interface ExtendedUser extends User {
  activities: UserActivity
  statistics: UserStatistics
}

export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  
  const [user, setUser] = useState<ExtendedUser | null>(null)
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
      setUser(response.data as ExtendedUser)
    } catch (error) {
      console.error('Error fetching user details:', error)
      toast.error('Không thể tải thông tin người dùng')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        const response = await authorizedAxiosInstance.delete(`/v1/admin/users/${userId}`)
        if (response.data.status === 200) {
          toast.success('Xóa người dùng thành công')
          router.push('/admin/users')
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        toast.error('Có lỗi xảy ra khi xóa người dùng')
      }
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-4 w-4" />
      case 'SHOP_OWNER':
        return <Coffee className="h-4 w-4" />
      default:
        return <UserIcon className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500'
      case 'SHOP_OWNER':
        return 'bg-amber-500'
      default:
        return 'bg-blue-500'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200"><AlertCircle className="h-3 w-3 mr-1" />Chờ xác nhận</Badge>
      case 'CONFIRMED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200"><CheckCircle className="h-3 w-3 mr-1" />Đã xác nhận</Badge>
      case 'COMPLETED':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Hoàn thành</Badge>
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200"><XCircle className="h-3 w-3 mr-1" />Đã hủy</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải thông tin người dùng...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-medium">Không tìm thấy thông tin người dùng</p>
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mt-4"
          >
            Quay lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold">Chi tiết người dùng</h1>
            <p className="text-muted-foreground">Thông tin chi tiết về người dùng</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => router.push(`/admin/users/${userId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDeleteUser}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-3xl font-bold">
                      {user.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{user.full_name}</h2>
                    <div className="flex items-center gap-2 mt-2">
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
                        <div className={`p-1 rounded mr-1 ${getRoleColor(user.role)} text-white`}>
                          {getRoleIcon(user.role)}
                        </div>
                        {user.role}
                      </Badge>
                      <Badge variant={user.is_active ? "outline" : "secondary"} className={user.is_active ? "bg-green-50 text-green-600 border-green-200" : ""}>
                        <UserCheck className="h-3 w-3 mr-1" />
                        {user.is_active ? "Đang hoạt động" : "Tạm ngưng"}
                      </Badge>
                      {user.vip_status && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                          <Trophy className="h-3 w-3 mr-1" />
                          VIP
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Email</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    {user.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <div className="font-medium">Số điện thoại</div>
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        </div>
                      </div>
                    )}
                    {user.points !== undefined && (
                      <div className="flex items-start gap-3">
                        <Coins className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <div className="font-medium">Điểm tích lũy</div>
                          <div className="text-sm text-gray-500">{user.points} điểm</div>
                        </div>
                      </div>
                    )}
                    {user.createdAt && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <div className="font-medium">Ngày tạo</div>
                          <div className="text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động và thống kê</CardTitle>
              <CardDescription>Thông tin chi tiết về hoạt động của người dùng</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="activity" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="activity">Hoạt động</TabsTrigger>
                  <TabsTrigger value="reservations">Đặt chỗ</TabsTrigger>
                  <TabsTrigger value="checkins">Check-in</TabsTrigger>
                  <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-600">Tổng đặt chỗ</p>
                            <p className="text-2xl font-bold text-blue-700">{user.statistics?.total.reservations || 0}</p>
                          </div>
                          <Calendar className="h-8 w-8 text-blue-500" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">30 ngày qua: {user.statistics?.recent.reservations || 0}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-600">Tổng check-in</p>
                            <p className="text-2xl font-bold text-green-700">{user.statistics?.total.checkins || 0}</p>
                          </div>
                          <MapPin className="h-8 w-8 text-green-500" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">30 ngày qua: {user.statistics?.recent.checkins || 0}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-amber-600">Đánh giá</p>
                            <p className="text-2xl font-bold text-amber-700">{user.statistics?.total.reviews || 0}</p>
                          </div>
                          <Star className="h-8 w-8 text-amber-500" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">30 ngày qua: {user.statistics?.recent.reviews || 0}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Status Breakdown */}
                  {user.statistics?.statusBreakdown && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Phân bố trạng thái đặt chỗ</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{user.statistics.statusBreakdown.PENDING}</div>
                            <div className="text-sm text-gray-500">Chờ xác nhận</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{user.statistics.statusBreakdown.CONFIRMED}</div>
                            <div className="text-sm text-gray-500">Đã xác nhận</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{user.statistics.statusBreakdown.COMPLETED}</div>
                            <div className="text-sm text-gray-500">Hoàn thành</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{user.statistics.statusBreakdown.CANCELLED}</div>
                            <div className="text-sm text-gray-500">Đã hủy</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="reservations" className="space-y-4 mt-6">
                  {user.activities?.reservations && user.activities.reservations.length > 0 ? (
                    <div className="space-y-4">
                      {user.activities.reservations.map((reservation) => (
                        <Card key={reservation._id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium">{reservation.shop_id?.name || 'Quán không xác định'}</h3>
                              {getStatusBadge(reservation.status)}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Ngày:</span> {formatDate(reservation.reservation_date)}
                              </div>
                              <div>
                                <span className="font-medium">Giờ:</span> {reservation.time_slot_id ? `${formatTime(reservation.time_slot_id.start_time)} - ${formatTime(reservation.time_slot_id.end_time)}` : 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium">Số người:</span> {reservation.number_of_people}
                              </div>
                              <div>
                                <span className="font-medium">Ghế:</span> {reservation.seat_id?.seat_name || 'N/A'}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              Tạo lúc: {formatDate(reservation.createdAt)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Không có lịch đặt chỗ nào</p>
                      <p className="text-sm">Lịch đặt chỗ của người dùng sẽ hiển thị ở đây</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="checkins" className="space-y-4 mt-6">
                  {user.activities?.checkins && user.activities.checkins.length > 0 ? (
                    <div className="space-y-4">
                      {user.activities.checkins.map((checkin) => (
                        <Card key={checkin._id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium">{checkin.shop_id?.name || 'Quán không xác định'}</h3>
                              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />Đã check-in
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Ngày:</span> {formatDate(checkin.reservation_date)}
                              </div>
                              <div>
                                <span className="font-medium">Giờ:</span> {checkin.time_slot_id ? `${formatTime(checkin.time_slot_id.start_time)} - ${formatTime(checkin.time_slot_id.end_time)}` : 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium">Số người:</span> {checkin.number_of_people}
                              </div>
                              <div>
                                <span className="font-medium">Ghế:</span> {checkin.seat_id?.seat_name || 'N/A'}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              Check-in lúc: {formatDate(checkin.updatedAt)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Không có check-in nào</p>
                      <p className="text-sm">Lịch sử check-in của người dùng sẽ hiển thị ở đây</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4 mt-6">
                  {user.activities?.reviews && user.activities.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {user.activities.reviews.map((review) => (
                        <Card key={review._id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium">{review.shop_id?.name || 'Quán không xác định'}</h3>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-gray-600 mb-2">{review.comment}</p>
                            )}
                            <div className="text-xs text-gray-500">
                              Đánh giá lúc: {formatDate(review.createdAt)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Không có đánh giá nào</p>
                      <p className="text-sm">Đánh giá của người dùng sẽ hiển thị ở đây</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Thống kê nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-600">Tổng đặt chỗ</p>
                  <p className="text-2xl font-bold text-blue-700">{user.statistics?.total.reservations || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-600">Tổng check-in</p>
                  <p className="text-2xl font-bold text-green-700">{user.statistics?.total.checkins || 0}</p>
                </div>
                <MapPin className="h-8 w-8 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-amber-600">Đánh giá</p>
                  <p className="text-2xl font-bold text-amber-700">{user.statistics?.total.reviews || 0}</p>
                </div>
                <Star className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái tài khoản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Trạng thái</span>
                <Badge variant={user.is_active ? "outline" : "secondary"} className={user.is_active ? "bg-green-50 text-green-600 border-green-200" : ""}>
                  {user.is_active ? "Hoạt động" : "Tạm ngưng"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">VIP Status</span>
                <Badge variant="outline" className={user.vip_status ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-gray-50 text-gray-600 border-gray-200"}>
                  {user.vip_status ? "VIP" : "Thường"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Điểm tích lũy</span>
                <span className="font-medium">{user.points || 0} điểm</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push(`/admin/users/${userId}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa thông tin
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/admin/users')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại danh sách
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 