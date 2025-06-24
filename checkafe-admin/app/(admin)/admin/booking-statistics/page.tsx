'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Calendar, 
  Clock, 
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Store,
  BarChart3,
  RefreshCw,
  Filter,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { vi } from 'date-fns/locale'
import authorizedAxiosInstance from "@/lib/axios"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Types
interface BookingStats {
  period: string
  startDate: string
  endDate: string
  shopInfo?: {
    _id: string
    name: string
    address: string
    owner_id: string
  }
  summary: {
    totalBookings: number
    completedBookings: number
    cancelledBookings: number
    pendingBookings: number
    confirmedBookings: number
    totalPeople: number
    avgPeoplePerBooking: number
    completionRate: number
  }
  breakdown: Array<{
    _id: {
      year: number
      month?: number
      day?: number
      hour?: number
      week?: number
    }
    totalBookings: number
    completedBookings: number
    cancelledBookings: number
    pendingBookings: number
    confirmedBookings: number
    totalPeople: number
    avgPeoplePerBooking: number
  }>
  totalPeriods: number
}

interface ShopBookingStats {
  period: string
  startDate: string
  endDate: string
  totalShops: number
  shops: Array<{
    _id: string
    shopName: string
    shopAddress: string
    ownerId: string
    owner: {
      full_name: string
      email: string
    }
    totalBookings: number
    completedBookings: number
    cancelledBookings: number
    pendingBookings: number
    confirmedBookings: number
    totalPeople: number
    avgPeoplePerBooking: number
    completionRate: number
  }>
  summary: {
    totalBookings: number
    totalCompleted: number
    totalCancelled: number
    totalPeople: number
    avgCompletionRate: number
  }
}

interface FilterParams {
  period: string
  shopId?: string
  startDate: string
  endDate: string
}

interface Shop {
  _id: string
  name: string
}

export default function BookingStatisticsPage() {
  // State
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null)
  const [shopBookingStats, setShopBookingStats] = useState<ShopBookingStats | null>(null)
  const [shops, setShops] = useState<Shop[]>([])

  // Filters
  const [filters, setFilters] = useState<FilterParams>({
    period: 'day',
    shopId: 'all',
    startDate: '',
    endDate: ''
  })

  // Fetch shops
  const fetchShops = useCallback(async () => {
    try {
      const response = await authorizedAxiosInstance.get('/v1/shops?limit=100')
      if (response.data.status === 200) {
        setShops(response.data.data?.shops || [])
      }
    } catch (error) {
      console.error('Error fetching shops:', error)
      setShops([])
    }
  }, [])

  // Fetch booking statistics
  const fetchBookingStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (activeTab === 'overview') {
        const params = new URLSearchParams()
        params.set('period', filters.period)
        if (filters.shopId && filters.shopId !== 'all') params.set('shopId', filters.shopId)
        if (filters.startDate) params.set('startDate', filters.startDate)
        if (filters.endDate) params.set('endDate', filters.endDate)
        
        const response = await authorizedAxiosInstance.get(`/v1/admin/statistics/bookings/period?${params.toString()}`)
        if (response.data.code === '200') {
          setBookingStats(response.data.metadata)
        } else {
          setError('Không thể tải dữ liệu thống kê')
          setBookingStats(null)
        }
      } else if (activeTab === 'shops') {
        const params = new URLSearchParams()
        params.set('period', filters.period)
        if (filters.startDate) params.set('startDate', filters.startDate)
        if (filters.endDate) params.set('endDate', filters.endDate)
        params.set('limit', '20')
        
        const response = await authorizedAxiosInstance.get(`/v1/admin/statistics/bookings/shops?${params.toString()}`)
        if (response.data.code === '200') {
          setShopBookingStats(response.data.metadata)
        } else {
          setError('Không thể tải dữ liệu thống kê quán')
          setShopBookingStats(null)
        }
      }
    } catch (error: any) {
      console.error('Error fetching booking stats:', error)
      setError(error.response?.data?.message || 'Không thể tải dữ liệu thống kê')
      if (activeTab === 'overview') {
        setBookingStats(null)
      } else {
        setShopBookingStats(null)
      }
    } finally {
      setLoading(false)
    }
  }, [activeTab, filters])

  // Effects
  useEffect(() => {
    fetchShops()
  }, [fetchShops])

  useEffect(() => {
    fetchBookingStats()
  }, [fetchBookingStats])

  // Handlers
  const handleFilterChange = (key: keyof FilterParams, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleQuickDateSelect = (type: string) => {
    const now = new Date()
    let start, end
    
    switch (type) {
      case 'today':
        start = format(startOfDay(now), 'yyyy-MM-dd')
        end = format(endOfDay(now), 'yyyy-MM-dd')
        break
      case 'yesterday':
        const yesterday = subDays(now, 1)
        start = format(startOfDay(yesterday), 'yyyy-MM-dd')
        end = format(endOfDay(yesterday), 'yyyy-MM-dd')
        break
      case 'thisWeek':
        start = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
        end = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
        break
      case 'thisMonth':
        start = format(startOfMonth(now), 'yyyy-MM-dd')
        end = format(endOfMonth(now), 'yyyy-MM-dd')
        break
      default:
        return
    }
    
    setFilters(prev => ({
      ...prev,
      startDate: start,
      endDate: end
    }))
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Reset shop filter when switching to shops tab
    if (value === 'shops') {
      setFilters(prev => ({ ...prev, shopId: 'all' }))
    }
  }

  // Utility functions
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi })
    } catch (error) {
      return dateString
    }
  }

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'day': return 'Ngày'
      case 'week': return 'Tuần'
      case 'month': return 'Tháng'
      default: return 'Ngày'
    }
  }

  const getGrowthIndicator = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : null
    const growth = ((current - previous) / previous) * 100
    return growth > 0 ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Thống kê đặt chỗ</h1>
          <p className="text-muted-foreground mt-2">
            Phân tích chi tiết các lượt đặt chỗ theo ngày, tuần, tháng
          </p>
        </div>
        
        <Button onClick={fetchBookingStats} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Period Select */}
            <div className="space-y-2">
              <Label>Chu kỳ thời gian</Label>
              <Select value={filters.period} onValueChange={(value) => handleFilterChange('period', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Theo ngày</SelectItem>
                  <SelectItem value="week">Theo tuần</SelectItem>
                  <SelectItem value="month">Theo tháng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Shop Select (only for overview tab) */}
            {activeTab === 'overview' && (
              <div className="space-y-2">
                <Label>Chọn quán (tùy chọn)</Label>
                <Select value={filters.shopId || 'all'} onValueChange={(value) => handleFilterChange('shopId', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả quán" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả quán</SelectItem>
                    {shops.map((shop) => (
                      <SelectItem key={shop._id} value={shop._id}>
                        {shop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Từ ngày</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Đến ngày</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>

          {/* Quick Date Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => handleQuickDateSelect('today')}>
              Hôm nay
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickDateSelect('yesterday')}>
              Hôm qua
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickDateSelect('thisWeek')}>
              Tuần này
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickDateSelect('thisMonth')}>
              Tháng này
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="shops">Theo quán</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2">Đang tải dữ liệu...</span>
            </div>
          ) : bookingStats ? (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng đặt chỗ</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{bookingStats.summary.totalBookings}</div>
                    <p className="text-xs text-muted-foreground">
                      {bookingStats.summary.totalPeople} người
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{bookingStats.summary.completedBookings}</div>
                    <p className="text-xs text-muted-foreground">
                      {bookingStats.summary.completionRate.toFixed(1)}% tỷ lệ hoàn thành
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Đã hủy</CardTitle>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{bookingStats.summary.cancelledBookings}</div>
                    <p className="text-xs text-muted-foreground">
                      {bookingStats.summary.totalBookings > 0 ? 
                        ((bookingStats.summary.cancelledBookings / bookingStats.summary.totalBookings) * 100).toFixed(1) : 0}% tỷ lệ hủy
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Trung bình/đặt chỗ</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{bookingStats.summary.avgPeoplePerBooking.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground">
                      người mỗi đặt chỗ
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Shop Info (if selected) */}
              {bookingStats.shopInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      Thông tin quán
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {bookingStats.shopInfo.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{bookingStats.shopInfo.name}</h3>
                        <p className="text-sm text-muted-foreground">{bookingStats.shopInfo.address}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Breakdown Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Chi tiết theo {getPeriodLabel(filters.period)}
                  </CardTitle>
                  <CardDescription>
                    Từ {formatDate(bookingStats.startDate)} đến {formatDate(bookingStats.endDate)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Thời gian</TableHead>
                          <TableHead className="text-center">Tổng</TableHead>
                          <TableHead className="text-center">Hoàn thành</TableHead>
                          <TableHead className="text-center">Đã hủy</TableHead>
                          <TableHead className="text-center">Chờ xác nhận</TableHead>
                          <TableHead className="text-center">Đã xác nhận</TableHead>
                          <TableHead className="text-center">Tổng người</TableHead>
                          <TableHead className="text-center">TB/đặt chỗ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookingStats.breakdown.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {filters.period === 'day' && item._id.hour !== undefined ? (
                                `${item._id.day}/${item._id.month}/${item._id.year} ${item._id.hour}:00`
                              ) : filters.period === 'week' ? (
                                `Tuần ${item._id.week}, ${item._id.year}`
                              ) : (
                                `${item._id.month}/${item._id.year}`
                              )}
                            </TableCell>
                            <TableCell className="text-center font-medium">{item.totalBookings}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {item.completedBookings}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                {item.cancelledBookings}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                {item.pendingBookings}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {item.confirmedBookings}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">{item.totalPeople}</TableCell>
                            <TableCell className="text-center">{item.avgPeoplePerBooking.toFixed(1)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không có dữ liệu thống kê</p>
            </div>
          )}
        </TabsContent>

        {/* Shops Tab */}
        <TabsContent value="shops" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2">Đang tải dữ liệu...</span>
            </div>
          ) : shopBookingStats ? (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng quán</CardTitle>
                    <Store className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{shopBookingStats.totalShops}</div>
                    <p className="text-xs text-muted-foreground">
                      có đặt chỗ trong kỳ
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng đặt chỗ</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{shopBookingStats.summary.totalBookings}</div>
                    <p className="text-xs text-muted-foreground">
                      {shopBookingStats.summary.totalPeople} người
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{shopBookingStats.summary.totalCompleted}</div>
                    <p className="text-xs text-muted-foreground">
                      {shopBookingStats.summary.avgCompletionRate.toFixed(1)}% TB hoàn thành
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Đã hủy</CardTitle>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{shopBookingStats.summary.totalCancelled}</div>
                    <p className="text-xs text-muted-foreground">
                      tổng số đặt chỗ hủy
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Shops Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Thống kê theo quán
                  </CardTitle>
                  <CardDescription>
                    Top {shopBookingStats.shops.length} quán có nhiều đặt chỗ nhất
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {shopBookingStats.shops.map((shop, index) => (
                      <div key={shop._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {shop.shopName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{shop.shopName}</h3>
                            <p className="text-sm text-muted-foreground">{shop.shopAddress}</p>
                            <p className="text-xs text-muted-foreground">
                              Chủ quán: {shop.owner.full_name}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right space-y-1">
                          <div className="text-lg font-bold">{shop.totalBookings} đặt chỗ</div>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {shop.completedBookings} hoàn thành
                            </Badge>
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              {shop.cancelledBookings} hủy
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {shop.completionRate.toFixed(1)}% tỷ lệ hoàn thành
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12">
              <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không có dữ liệu thống kê quán</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 