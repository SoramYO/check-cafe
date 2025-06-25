'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Calendar, 
  Users, 
  Coffee, 
  TrendingUp, 
  Clock, 
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Settings,
  BarChart3,
  PieChart,
  Activity,
  Store,
  Utensils,
  Armchair,
  FileCheck,
  Edit,
  RefreshCw,
  Plus,
  Trash2,
  Upload,
  Save,
  X
} from "lucide-react"
import { useState, useEffect } from "react"
import authorizedAxiosInstance from "@/lib/axios"
import { toast } from "sonner"
import Image from "next/image"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { useShop } from "@/context/ShopContext"

interface ShopData {
  _id: string
  name: string
  address: string
  description: string
  phone: string
  website: string
  location: {
    type: string
    coordinates: number[]
  }
  owner_id: {
    _id: string
    full_name: string
    email: string
    avatar?: string
  }
  theme_ids: Array<{
    _id: string
    name: string
    description: string
    theme_image?: string
  }>
  vip_status: boolean
  rating_avg: number
  rating_count: number
  status: string
  amenities: Array<{
    _id: string
    icon: string
    label: string
  }>
  opening_hours: Array<{
    day: number
    is_closed: boolean
    hours: Array<{
      open: string
      close: string
      _id: string
      id: string
    }>
    _id: string
    id: string
  }>
  formatted_opening_hours: {
    [key: string]: string
  }
  is_open: boolean
  images: Array<{
    _id: string
    url: string
    caption?: string
    created_at: string
  }>
  seats: Array<{
    _id: string
    seat_name: string
    description: string
    image?: string
    is_premium: boolean
    is_available: boolean
    capacity: number
  }>
  menuItems: Array<{
    _id: string
    name: string
    description: string
    price: number
    category: {
      _id: string
      name: string
    }
    is_available: boolean
    images: Array<{
      url: string
      publicId: string
      _id: string
    }>
  }>
  timeSlots: Array<{
    _id: string
    day_of_week: number
    start_time: string
    end_time: string
    max_regular_reservations: number
    max_premium_reservations: number
    is_active: boolean
  }>
  verifications: Array<{
    document_type: string
    status: string
    submitted_at: string
    reviewed_at?: string
    reason?: string
  }>
  createdAt: string
  updatedAt: string
}

interface StatsData {
  overview: {
    totalReservations: number
    totalReviews: number
    totalSeats: number
    totalMenuItems: number
    recentReservations: number
    avgRating: number
    shopStatus: string
    verificationStatus: string
  }
  reservations: {
    byStatus: Record<string, number>
    monthly: Array<{
      _id: { year: number; month: number }
      count: number
    }>
  }
  reviews: {
    total: number
    avgRating: number
    distribution: Record<string, number>
  }
  seats: {
    totalSeats: number
    premiumSeats: number
    availableSeats: number
    totalCapacity: number
  }
  popularMenuItems: Array<{
    name: string
    price: number
    category: string
    images: Array<{ url: string }>
  }>
}

interface Seat {
  _id: string
  seat_name: string
  description: string
  image?: string
  is_premium: boolean
  is_available: boolean
  capacity: number
}

interface MenuItem {
  _id: string
  name: string
  description: string
  price: number
  category: {
    _id: string
    name: string
  }
  images: Array<{
    url: string
    publicId: string
  }>
  is_available: boolean
}

interface Category {
  _id: string
  name: string
  description: string
}

export default function DashboardPage() {
  const [statsData, setStatsData] = useState<StatsData | null>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [seatsLoading, setSeatsLoading] = useState(true)
  const [menuLoading, setMenuLoading] = useState(true)
  const [editingShop, setEditingShop] = useState(false)
  const [editedShop, setEditedShop] = useState<ShopData | null>(null)
  const [savingShop, setSavingShop] = useState(false)
  const [seatDialogOpen, setSeatDialogOpen] = useState(false)
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const [menuDialogOpen, setMenuDialogOpen] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)

  const { shopData, shopId, loading: shopLoading, refreshShopData } = useShop()

  useEffect(() => {
    if (shopId && !shopLoading) {
      fetchStatsData()
      fetchSeats()
      fetchMenuItems()
      fetchCategories()
    }
  }, [shopId, shopLoading])

  const fetchStatsData = async () => {
    if (!shopId) return
    
    try {
      setStatsLoading(true)
      const response = await authorizedAxiosInstance.get(`/v1/shops/${shopId}/stats`)
      if (response.data.status === 200) {
        setStatsData(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Không thể tải thống kê')
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchSeats = async () => {
    if (!shopId) return
    
    try {
      setSeatsLoading(true)
      const response = await authorizedAxiosInstance.get(`/v1/shops/${shopId}/seats`)
      if (response.data.status === 200) {
        setSeats(response.data.data.seats)
      }
    } catch (error) {
      console.error('Error fetching seats:', error)
      toast.error('Không thể tải danh sách chỗ ngồi')
    } finally {
      setSeatsLoading(false)
    }
  }

  const fetchMenuItems = async () => {
    if (!shopId) return
    
    try {
      setMenuLoading(true)
      const response = await authorizedAxiosInstance.get(`/v1/shops/${shopId}/menu-items`)
      if (response.data.status === 200) {
        setMenuItems(response.data.data.menuItems)
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
      toast.error('Không thể tải danh sách món ăn')
    } finally {
      setMenuLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await authorizedAxiosInstance.get('/v1/menu-item-categories')
      if (response.data.status === 200) {
        setCategories(response.data.data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSaveShop = async () => {
    if (!shopId || !editedShop) return
    
    try {
      setSavingShop(true)
      const response = await authorizedAxiosInstance.put(`/v1/shops/${shopId}`, editedShop)
      if (response.data.status === 200) {
        toast.success('Cập nhật thông tin quán thành công')
        setEditingShop(false)
        refreshShopData() // Refresh shop data from context
      }
    } catch (error) {
      console.error('Error updating shop:', error)
      toast.error('Không thể cập nhật thông tin quán')
    } finally {
      setSavingShop(false)
    }
  }

  const handleDeleteSeat = async (seatId: string) => {
    if (!shopId) return
    
    try {
      const response = await authorizedAxiosInstance.delete(`/v1/shops/${shopId}/seats/${seatId}`)
      if (response.data.status === 200) {
        toast.success('Xóa chỗ ngồi thành công')
        fetchSeats()
      }
    } catch (error) {
      console.error('Error deleting seat:', error)
      toast.error('Không thể xóa chỗ ngồi')
    }
  }

  const handleDeleteMenuItem = async (itemId: string) => {
    if (!shopId) return
    
    try {
      const response = await authorizedAxiosInstance.delete(`/v1/shops/${shopId}/menu-items/${itemId}`)
      if (response.data.status === 200) {
        toast.success('Xóa món ăn thành công')
        fetchMenuItems()
      }
    } catch (error) {
      console.error('Error deleting menu item:', error)
      toast.error('Không thể xóa món ăn')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Hoạt động</Badge>
      case 'Inactive':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200"><XCircle className="w-3 h-3 mr-1" />Tạm dừng</Badge>
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Chờ duyệt</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Đã xác minh</Badge>
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Bị từ chối</Badge>
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Chờ xác minh</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200"><AlertCircle className="w-3 h-3 mr-1" />Chưa xác minh</Badge>
    }
  }

  // Show loading if shop is still loading
  if (shopLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Tổng quan về hoạt động của quán
          </p>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-gray-500 mt-4">Đang tải thông tin quán...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show placeholder if no shop data
  if (!shopData || !shopId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Tổng quan về hoạt động của quán
          </p>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy thông tin quán</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Tổng quan về hoạt động của quán
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingShop(!editingShop)
              if (!editingShop) {
                setEditedShop(shopData)
              }
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            {editingShop ? 'Hủy chỉnh sửa' : 'Chỉnh sửa'}
          </Button>
          {editingShop && (
            <Button
              size="sm"
              onClick={handleSaveShop}
              disabled={savingShop}
            >
              <Save className="mr-2 h-4 w-4" />
              {savingShop ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          )}
        </div>
      </div>

      {/* Shop Info Card */}
      <Card className="overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
          {shopData.images && shopData.images.length > 0 && shopData.images[0] && (
            <Image
              src={shopData.images[0].url}
              alt="Shop cover"
              fill
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <CardContent className="relative -mt-16 pb-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-24 w-24 border-4 border-white bg-white">
              <AvatarImage src={shopData.images?.[0]?.url || undefined} />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {shopData.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pt-8">
              {editingShop ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Tên quán</Label>
                      <Input
                        id="name"
                        value={editedShop?.name || ''}
                        onChange={(e) => setEditedShop(prev => prev ? { ...prev, name: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input
                        id="phone"
                        value={editedShop?.phone || ''}
                        onChange={(e) => setEditedShop(prev => prev ? { ...prev, phone: e.target.value } : null)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      value={editedShop?.description || ''}
                      onChange={(e) => setEditedShop(prev => prev ? { ...prev, description: e.target.value } : null)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input
                        id="address"
                        value={editedShop?.address || ''}
                        onChange={(e) => setEditedShop(prev => prev ? { ...prev, address: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={editedShop?.website || ''}
                        onChange={(e) => setEditedShop(prev => prev ? { ...prev, website: e.target.value } : null)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{shopData.name}</h2>
                    {getStatusBadge(shopData.status)}
                    {getVerificationBadge(statsData?.overview.verificationStatus || 'Pending')}
                    {shopData.vip_status && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <Star className="w-3 h-3 mr-1" />VIP
                      </Badge>
                    )}
                  </div>
                  <p className="text-white/90 mb-3">{shopData.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-white/80">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{shopData.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{shopData.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      <span>{shopData.rating_avg.toFixed(1)} ({shopData.rating_count} đánh giá)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{seats.reduce((sum, seat) => sum + seat.capacity, 0)} chỗ ngồi</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      {statsData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng đặt chỗ</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.overview.totalReservations}</div>
              <p className="text-xs text-muted-foreground">
                {statsData.overview.recentReservations} đặt chỗ trong 30 ngày qua
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đánh giá</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.reviews.avgRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                {statsData.reviews.total} đánh giá
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menu</CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.overview.totalMenuItems}</div>
              <p className="text-xs text-muted-foreground">
                Món ăn & đồ uống
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chỗ ngồi</CardTitle>
              <Armchair className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.seats.totalSeats}</div>
              <p className="text-xs text-muted-foreground">
                {statsData.seats.availableSeats} đang có sẵn
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="seats">Chỗ ngồi</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Reservation Status */}
            {statsData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trạng thái đặt chỗ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(statsData.reservations.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{status}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Rating Distribution */}
            {statsData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Phân bố đánh giá</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(statsData.reviews.distribution).reverse().map(([star, count]) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm w-8">{star}⭐</span>
                      <Progress value={(count / statsData.reviews.total) * 100} className="flex-1" />
                      <span className="text-sm text-muted-foreground w-8">{count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Seat Stats */}
            {statsData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thống kê chỗ ngồi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Tổng chỗ ngồi</span>
                    <span className="font-medium">{statsData.seats.totalSeats}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Chỗ VIP</span>
                    <span className="font-medium">{statsData.seats.premiumSeats}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Đang có sẵn</span>
                    <span className="font-medium text-green-600">{statsData.seats.availableSeats}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tổng sức chứa</span>
                    <span className="font-medium">{statsData.seats.totalCapacity} người</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="seats" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Quản lý chỗ ngồi</h2>
              <p className="text-muted-foreground">Quản lý các chỗ ngồi trong quán</p>
            </div>
            <Dialog open={seatDialogOpen} onOpenChange={setSeatDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedSeat(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm chỗ ngồi
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{selectedSeat ? 'Chỉnh sửa chỗ ngồi' : 'Thêm chỗ ngồi mới'}</DialogTitle>
                  <DialogDescription>
                    {selectedSeat ? 'Cập nhật thông tin chỗ ngồi' : 'Tạo chỗ ngồi mới cho quán'}
                  </DialogDescription>
                </DialogHeader>
                <SeatForm 
                  seat={selectedSeat} 
                  onSuccess={() => {
                    setSeatDialogOpen(false)
                    fetchSeats()
                  }}
                  shopId={shopId}
                />
              </DialogContent>
            </Dialog>
          </div>

          {seatsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span>Đang tải chỗ ngồi...</span>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {seats.map((seat) => (
                <Card key={seat._id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{seat.seat_name}</CardTitle>
                        <CardDescription>{seat.description}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        {seat.is_premium && (
                          <Badge className="bg-yellow-100 text-yellow-800">VIP</Badge>
                        )}
                        <Badge variant={seat.is_available ? "default" : "secondary"}>
                          {seat.is_available ? "Có sẵn" : "Không có sẵn"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {seat.image && (
                      <div className="relative h-32 mb-3 rounded-lg overflow-hidden">
                        <Image
                          src={seat.image}
                          alt={seat.seat_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{seat.capacity} người</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSelectedSeat(seat)
                          setSeatDialogOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Sửa
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteSeat(seat._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Xóa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="menu" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Quản lý Menu</h2>
              <p className="text-muted-foreground">Quản lý các món ăn và đồ uống</p>
            </div>
            <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedMenuItem(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm món mới
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{selectedMenuItem ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}</DialogTitle>
                  <DialogDescription>
                    {selectedMenuItem ? 'Cập nhật thông tin món ăn' : 'Tạo món ăn mới cho menu'}
                  </DialogDescription>
                </DialogHeader>
                <MenuItemForm 
                  menuItem={selectedMenuItem} 
                  categories={categories}
                  onSuccess={() => {
                    setMenuDialogOpen(false)
                    fetchMenuItems()
                  }}
                  shopId={shopId}
                />
              </DialogContent>
            </Dialog>
          </div>

          {menuLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span>Đang tải menu...</span>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {menuItems.map((item) => (
                <Card key={item._id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {item.price.toLocaleString()}đ
                        </div>
                        <Badge variant={item.is_available ? "default" : "secondary"}>
                          {item.is_available ? "Có sẵn" : "Hết hàng"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {item.images.length > 0 && (
                      <div className="relative h-32 mb-3 rounded-lg overflow-hidden">
                        <Image
                          src={item.images[0].url}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <Badge variant="outline">{item.category.name}</Badge>
                  </CardContent>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSelectedMenuItem(item)
                          setMenuDialogOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Sửa
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteMenuItem(item._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Xóa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt quán</CardTitle>
              <CardDescription>Quản lý thông tin và cài đặt quán cà phê.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Tính năng cài đặt đang được phát triển...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Seat Form Component
function SeatForm({ seat, onSuccess, shopId }: { seat: Seat | null, onSuccess: () => void, shopId: string }) {
  const [formData, setFormData] = useState({
    seat_name: seat?.seat_name || '',
    description: seat?.description || '',
    capacity: seat?.capacity || 2,
    is_premium: seat?.is_premium || false,
    is_available: seat?.is_available ?? true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = seat 
        ? `/v1/shops/${shopId}/seats/${seat._id}`
        : `/v1/shops/${shopId}/seats`
      
      const method = seat ? 'patch' : 'post'
      
      const response = await authorizedAxiosInstance[method](url, formData)
      
      if (response.data.status === 200 || response.data.status === 201) {
        toast.success(seat ? 'Cập nhật chỗ ngồi thành công' : 'Thêm chỗ ngồi thành công')
        onSuccess()
      }
    } catch (error) {
      console.error('Error saving seat:', error)
      toast.error('Không thể lưu chỗ ngồi')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="seat_name">Tên chỗ ngồi</Label>
        <Input
          id="seat_name"
          value={formData.seat_name}
          onChange={(e) => setFormData({ ...formData, seat_name: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      
      <div>
        <Label htmlFor="capacity">Sức chứa (người)</Label>
        <Input
          id="capacity"
          type="number"
          min="1"
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
          required
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="is_premium"
          checked={formData.is_premium}
          onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
        />
        <Label htmlFor="is_premium">Chỗ ngồi VIP</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="is_available"
          checked={formData.is_available}
          onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
        />
        <Label htmlFor="is_available">Có sẵn</Label>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : (seat ? 'Cập nhật' : 'Thêm mới')}
        </Button>
      </DialogFooter>
    </form>
  )
}

// Menu Item Form Component
function MenuItemForm({ menuItem, categories, onSuccess, shopId }: { 
  menuItem: MenuItem | null, 
  categories: Category[], 
  onSuccess: () => void, 
  shopId: string 
}) {
  const [formData, setFormData] = useState({
    name: menuItem?.name || '',
    description: menuItem?.description || '',
    price: menuItem?.price || 0,
    category: menuItem?.category._id || '',
    is_available: menuItem?.is_available ?? true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = menuItem 
        ? `/v1/shops/${shopId}/menu-items/${menuItem._id}`
        : `/v1/shops/${shopId}/menu-items`
      
      const method = menuItem ? 'patch' : 'post'
      
      const response = await authorizedAxiosInstance[method](url, formData)
      
      if (response.data.status === 200 || response.data.status === 201) {
        toast.success(menuItem ? 'Cập nhật món ăn thành công' : 'Thêm món ăn thành công')
        onSuccess()
      }
    } catch (error) {
      console.error('Error saving menu item:', error)
      toast.error('Không thể lưu món ăn')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Tên món</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Giá (VNĐ)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="category">Danh mục</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="is_available"
          checked={formData.is_available}
          onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
        />
        <Label htmlFor="is_available">Có sẵn</Label>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : (menuItem ? 'Cập nhật' : 'Thêm mới')}
        </Button>
      </DialogFooter>
    </form>
  )
}
