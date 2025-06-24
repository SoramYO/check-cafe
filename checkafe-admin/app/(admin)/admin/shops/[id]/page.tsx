'use client'
import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  FileText,
  Star,
  Calendar,
  Users,
  Coffee,
  ImageIcon,
  Eye,
  Download,
  RefreshCw,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import authorizedAxiosInstance from "@/lib/axios"
import { Shop } from "../types"
import { useToast } from "@/hooks/use-toast"

interface Review {
  _id: string
  rating: number
  comment: string
  createdAt: string
  user_id: {
    _id: string
    full_name: string
    avatar?: string
  }
  reservation_id?: {
    booking_date: string
  }
}

interface ShopStats {
  shop: {
    _id: string
    name: string
    address: string
    rating_avg: number
    rating_count: number
    is_open: boolean
    vip_status: boolean
  }
  statistics: {
    reviews: {
      total: number
      averageRating: number
      periodTotal: number
    }
    reservations: {
      total: number
    }
    checkins: {
      total: number
    }
  }
  period: string
  dateRange: {
    start: string
    end: string
  }
}

interface Verification {
  _id: string
  status: string
  document_url: string
  document_name: string
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: {
    _id: string
    full_name: string
  }
  notes?: string
}

interface Activity {
  _id: string
  action: string
  description: string
  createdAt: string
  user_id?: {
    _id: string
    full_name: string
    email: string
  }
}

interface ShopOwner {
  _id: string
  full_name: string
  email: string
  phone?: string
  avatar?: string
  createdAt: string
}

export default function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { toast } = useToast()
  const [shop, setShop] = useState<Shop | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Tab data states
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsPagination, setReviewsPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0
  })
  
  const [stats, setStats] = useState<ShopStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [verificationsLoading, setVerificationsLoading] = useState(false)
  
  const [activities, setActivities] = useState<Activity[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  
  const [owner, setOwner] = useState<ShopOwner | null>(null)
  const [ownerLoading, setOwnerLoading] = useState(false)

  useEffect(() => {
    fetchShopDetails()
    fetchShopOwnerInfo()
  }, [resolvedParams.id])

  const fetchShopDetails = async () => {
    try {
      setLoading(true)
      const response = await authorizedAxiosInstance.get(`/v1/shops/${resolvedParams.id}`)
      if (response.data.status === 200) {
        setShop(response.data.data.shop)
      }
    } catch (error) {
      console.error('Error fetching shop details:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: 'Không thể tải thông tin quán'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchShopOwnerInfo = async () => {
    try {
      setOwnerLoading(true)
      const response = await authorizedAxiosInstance.get(`/v1/admin/shops/${resolvedParams.id}/owner`)
      if (response.data.status === 200 && response.data.data.code === "200") {
        setOwner(response.data.data.metadata.owner)
      } else {
        console.error('Error fetching shop owner:', response.data.data?.message)
      }
    } catch (error) {
      console.error('Error fetching shop owner:', error)
    } finally {
      setOwnerLoading(false)
    }
  }

  const fetchShopReviews = async (page = 1) => {
    try {
      setReviewsLoading(true)
      const response = await authorizedAxiosInstance.get(`/v1/admin/shops/${resolvedParams.id}/reviews`, {
        params: { page, limit: 10 }
      })
      if (response.data.status === 200 && response.data.data.code === "200") {
        setReviews(response.data.data.metadata.reviews)
        setReviewsPagination({
          page: response.data.data.metadata.pagination.page,
          total: response.data.data.metadata.pagination.total,
          totalPages: response.data.data.metadata.pagination.totalPages
        })
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: response.data.data?.message || 'Không thể tải đánh giá'
        })
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: 'Không thể tải đánh giá'
      })
    } finally {
      setReviewsLoading(false)
    }
  }

  const fetchShopStats = async () => {
    try {
      setStatsLoading(true)
      const response = await authorizedAxiosInstance.get(`/v1/admin/shops/${resolvedParams.id}/statistics`)
      if (response.data.status === 200 && response.data.data.code === "200") {
        setStats(response.data.data.metadata)
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: response.data.data?.message || 'Không thể tải thống kê'
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: 'Không thể tải thống kê'
      })
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchShopVerifications = async () => {
    try {
      setVerificationsLoading(true)
      const response = await authorizedAxiosInstance.get(`/v1/admin/shops/${resolvedParams.id}/verifications`)
      if (response.data.status === 200 && response.data.data.code === "200") {
        setVerifications(response.data.data.metadata.verifications)
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: response.data.data?.message || 'Không thể tải giấy phép xác minh'
        })
      }
    } catch (error) {
      console.error('Error fetching verifications:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: 'Không thể tải giấy phép xác minh'
      })
    } finally {
      setVerificationsLoading(false)
    }
  }

  const fetchShopActivities = async () => {
    try {
      setActivitiesLoading(true)
      const response = await authorizedAxiosInstance.get(`/v1/admin/shops/${resolvedParams.id}/activity-history`)
      if (response.data.status === 200 && response.data.data.code === "200") {
        setActivities(response.data.data.metadata.activities)
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: response.data.data?.message || 'Không thể tải lịch sử hoạt động'
        })
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: 'Không thể tải lịch sử hoạt động'
      })
    } finally {
      setActivitiesLoading(false)
    }
  }

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'reviews':
        if (reviews.length === 0) fetchShopReviews()
        break
      case 'analytics':
        if (!stats) fetchShopStats()
        break
      case 'verification':
        if (verifications.length === 0) fetchShopVerifications()
        break
      case 'history':
        if (activities.length === 0) fetchShopActivities()
        break
    }
  }

  if (loading) {
    return <div>Đang tải...</div>
  }

  if (!shop) {
    return <div>Không tìm thấy thông tin quán</div>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Đang chờ</Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Đã duyệt</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Từ chối</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/shops">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{shop.name}</h1>
            <p className="text-gray-500">Chi tiết quán cà phê và xác minh giấy phép kinh doanh.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {verifications.length > 0 && (
            <>
              {verifications.map((verification) => (
                <Badge key={verification._id} variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                  {verification.status}
                </Badge>
              ))}
            </>
          )}
          {shop.is_open ? (
            <Button variant="outline" className="gap-1 text-red-500 border-red-200 hover:bg-red-50">
              Đóng cửa
            </Button>
          ) : (
            <Button variant="outline" className="gap-1 text-green-600 border-green-200 hover:bg-green-50">
              Mở cửa
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <div className="relative h-48 w-full">
            <Image 
              src={shop.mainImage?.url || "/placeholder.svg"} 
              alt={shop.name} 
              fill 
              className="object-cover" 
            />
          </div>
          <CardHeader className="flex-row items-start gap-4 space-y-0">
            <div className="relative h-20 w-20 rounded-full overflow-hidden border-4 border-white -mt-12 bg-white">
              <Image 
                src={shop.mainImage?.url || "/placeholder.svg"} 
                alt={shop.name} 
                fill 
                className="object-cover" 
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle>{shop.name}</CardTitle>
                {shop.is_open ? (
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    Đang hoạt động
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                    Đóng cửa
                  </Badge>
                )}
                {shop.vip_status && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                    <CheckCircle className="h-3 w-3 mr-1" /> VIP
                  </Badge>
                )}
              </div>
              <CardDescription>{shop.description}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{shop.address}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{shop.phone}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>{shop.website}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Giờ mở cửa</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  <span>{shop.rating_avg.toFixed(1)} ({shop.rating_count} đánh giá)</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Tham gia: {new Date(shop.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Coffee className="h-4 w-4 mr-2" />
                  <span>Chủ đề: {shop.theme_ids.map(t => t.name).join(', ')}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  <span>{shop.images?.length || 0} ảnh</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-2">Tiện ích</h3>
              <div className="flex flex-wrap gap-2">
                {shop.amenities.map((amenity) => (
                  <Badge key={amenity._id} variant="secondary">
                    {amenity.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Giờ hoạt động</h3>
              <div className="grid gap-2">
                {Object.entries(shop.formatted_opening_hours).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{day}</span>
                    <span className="text-sm">{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin chủ quán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ownerLoading ? (
              <div className="text-center py-4">Đang tải...</div>
            ) : owner ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={owner.avatar} />
                    <AvatarFallback>{owner.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{owner.full_name}</p>
                    <p className="text-sm text-gray-500">{owner.email}</p>
                  </div>
                </div>
                {owner.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{owner.phone}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Tham gia: {new Date(owner.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                Không tìm thấy thông tin chủ quán
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="verification" className="space-y-4" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="verification">Xác minh giấy phép</TabsTrigger>
          <TabsTrigger value="analytics">Thống kê</TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
          <TabsTrigger value="history">Lịch sử</TabsTrigger>
        </TabsList>

        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Giấy phép kinh doanh</CardTitle>
                  <CardDescription>Xem xét và xác minh giấy phép kinh doanh của quán.</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchShopVerifications}
                  disabled={verificationsLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${verificationsLoading ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationsLoading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : verifications.length > 0 ? (
                <div className="space-y-4">
                  {verifications.map((verification) => (
                    <div key={verification._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <span className="font-medium">{verification.document_name}</span>
                        </div>
                        {getStatusBadge(verification.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Ngày nộp:</span>
                          <span className="ml-2">{new Date(verification.submitted_at).toLocaleDateString()}</span>
                        </div>
                        {verification.reviewed_at && (
                          <div>
                            <span className="text-gray-500">Ngày duyệt:</span>
                            <span className="ml-2">{new Date(verification.reviewed_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      {verification.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <span className="text-gray-500">Ghi chú:</span>
                          <p className="mt-1">{verification.notes}</p>
                        </div>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Xem
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Tải xuống
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Chưa có giấy phép xác minh nào
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Thống kê hoạt động</CardTitle>
                  <CardDescription>Xem thống kê hoạt động của quán cà phê.</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchShopStats}
                  disabled={statsLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats?.statistics?.reviews?.total || 0}
                    </div>
                    <div className="text-sm text-gray-600">Đánh giá</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Trung bình: {stats?.statistics?.reviews?.averageRating?.toFixed(1) || '0.0'} ⭐
                    </div>
                    {stats?.statistics?.reviews?.periodTotal > 0 && (
                      <div className="text-xs text-blue-500 mt-1">
                        {stats.statistics.reviews.periodTotal} trong tháng này
                      </div>
                    )}
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.statistics?.reservations?.total || 0}
                    </div>
                    <div className="text-sm text-gray-600">Đặt bàn</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Trong {stats?.period || 'tháng'} này
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats?.statistics?.checkins?.total || 0}
                    </div>
                    <div className="text-sm text-gray-600">Check-in</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Trong {stats?.period || 'tháng'} này
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Không có dữ liệu thống kê
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Đánh giá từ khách hàng</CardTitle>
                  <CardDescription>Xem đánh giá của khách hàng về quán cà phê.</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchShopReviews()}
                  disabled={reviewsLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${reviewsLoading ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {reviewsLoading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={review.user_id.avatar} />
                            <AvatarFallback>{review.user_id.full_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.user_id.full_name}</p>
                            <div className="flex items-center mt-1">
                              {renderStars(review.rating)}
                              <span className="ml-2 text-sm text-gray-500">{review.rating}/5</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700">{review.comment}</p>
                      )}
                      {review.reservation_id && (
                        <div className="mt-2 text-sm text-gray-500">
                          Đặt bàn ngày: {new Date(review.reservation_id.booking_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                  {reviewsPagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchShopReviews(reviewsPagination.page - 1)}
                        disabled={reviewsPagination.page === 1}
                      >
                        Trước
                      </Button>
                      <span className="flex items-center px-3 text-sm">
                        Trang {reviewsPagination.page} / {reviewsPagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchShopReviews(reviewsPagination.page + 1)}
                        disabled={reviewsPagination.page === reviewsPagination.totalPages}
                      >
                        Sau
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Chưa có đánh giá nào
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Lịch sử hoạt động</CardTitle>
                  <CardDescription>Xem lịch sử hoạt động và thay đổi của quán cà phê.</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchShopActivities}
                  disabled={activitiesLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${activitiesLoading ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity._id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{activity.action}</p>
                          <span className="text-sm text-gray-500">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        {activity.user_id && (
                          <p className="text-xs text-gray-500 mt-1">
                            Bởi: {activity.user_id.full_name} ({activity.user_id.email})
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Chưa có lịch sử hoạt động
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
