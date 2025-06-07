'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  Clock, 
  Activity, 
  MousePointer, 
  Smartphone, 
  Monitor, 
  Tablet,
  TrendingDown,
  Calendar as CalendarIcon,
  RefreshCw,
  Eye,
  Search,
  Heart,
  ShoppingCart,
  LogOut,
  Filter
} from "lucide-react"
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import authorizedAxiosInstance from "@/lib/axios"
import { toast } from "sonner"

interface AnalyticsData {
  overall: {
    total_sessions: number
    unique_users_count: number
    total_duration: number
    avg_session_duration: number
    avg_session_duration_minutes: number
    total_pages_visited: number
    total_actions: number
    bounce_sessions: number
    bounce_rate_percentage: number
    platform_distribution: Array<{
      _id: string
      count: number
    }>
    top_countries: Array<{
      _id: string
      count: number
    }>
  }
  topUsers: Array<{
    user_id: string
    full_name: string
    email: string
    avatar: string
    total_sessions: number
    total_duration: number
    total_actions: number
    last_activity: string
    avg_session_duration: number
  }>
  activityByTime: Array<{
    _id: {
      year: number
      month: number
      day: number
    }
    sessions: number
    unique_users_count: number
    total_duration: number
    total_actions: number
    avg_session_duration: number
  }>
  platforms: Array<{
    _id: {
      platform: string
      device_type: string
      browser: string
      os: string
    }
    sessions: number
    unique_users_count: number
    avg_duration: number
    total_actions: number
  }>
  actions: Array<{
    _id: string
    count: number
    unique_users_count: number
    unique_sessions_count: number
  }>
}

const actionIcons = {
  page_view: Eye,
  click: MousePointer,
  search: Search,
  filter: Filter,
  booking: ShoppingCart,
  review: Heart,
  favorite: Heart,
  logout: LogOut
}

const actionLabels = {
  page_view: 'Xem trang',
  click: 'Nhấp chuột',
  search: 'Tìm kiếm',
  filter: 'Lọc',
  booking: 'Đặt chỗ',
  review: 'Đánh giá',
  favorite: 'Yêu thích',
  logout: 'Đăng xuất'
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: subDays(new Date(), 30),
    to: new Date()
  })
  const [showAllTime, setShowAllTime] = useState(false)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (!showAllTime && dateRange.from) {
        params.set('startDate', format(startOfDay(dateRange.from), 'yyyy-MM-dd'))
      }
      if (!showAllTime && dateRange.to) {
        params.set('endDate', format(endOfDay(dateRange.to), 'yyyy-MM-dd'))
      }
      
      const response = await authorizedAxiosInstance.get(`/v1/analytics/dashboard?${params.toString()}`)
      
      console.log('Analytics response:', response.data)
      
      if (response.data.status === 200) {
        console.log('Setting analytics data:', response.data.data)
        console.log('Overall data:', response.data.data?.overall)
        console.log('Platform data:', response.data.data?.platforms)
        console.log('Actions data:', response.data.data?.actions)
        setAnalyticsData(response.data.data)
      } else {
        console.error('Analytics API returned non-200 status:', response.data)
        toast.error('Không thể tải dữ liệu analytics')
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error)
      if (error?.response) {
        console.error('Error response:', error.response.data)
        toast.error(`Lỗi API: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`)
      } else {
        toast.error('Có lỗi xảy ra khi tải dữ liệu')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange, showAllTime])

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }


  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Phân tích hành vi người dùng</h1>
          <p className="text-muted-foreground mt-2">
            Theo dõi và phân tích cách người dùng tương tác với hệ thống
          </p>
          {!showAllTime && dateRange.from && (
            <div className="mt-2 text-sm text-muted-foreground">
              📅 Dữ liệu từ{" "}
              <span className="font-medium">
                {format(dateRange.from, "dd/MM/yyyy")}
              </span>
              {dateRange.to && (
                <>
                  {" "}đến{" "}
                  <span className="font-medium">
                    {format(dateRange.to, "dd/MM/yyyy")}
                  </span>
                </>
              )}
            </div>
          )}
          {showAllTime && (
            <div className="mt-2 text-sm text-muted-foreground">
              📅 Hiển thị <span className="font-medium">tất cả dữ liệu</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Date Range Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant={showAllTime ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAllTime(!showAllTime)}
            >
              {showAllTime ? "Tất cả thời gian" : "Chọn khoảng thời gian"}
            </Button>
            
            {!showAllTime && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date()
                    setDateRange({
                      from: today,
                      to: today
                    })
                  }}
                >
                  Hôm nay
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date()
                    setDateRange({
                      from: subDays(today, 7),
                      to: today
                    })
                  }}
                >
                  7 ngày
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date()
                    setDateRange({
                      from: subDays(today, 30),
                      to: today
                    })
                  }}
                >
                  30 ngày
                </Button>
              </div>
            )}
          </div>
          
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>


      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng phiên làm việc</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.overall?.total_sessions?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData?.overall?.unique_users_count || 0} người dùng duy nhất
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thời gian trung bình</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(analyticsData?.overall?.avg_session_duration_minutes || 0)}m
            </div>
            <p className="text-xs text-muted-foreground">
              Mỗi phiên làm việc
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng hành động</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.overall?.total_actions?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData?.overall?.total_pages_visited || 0} trang đã xem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ thoát</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(analyticsData?.overall?.bounce_rate_percentage || 0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Phiên &lt; 30 giây
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          <TabsTrigger value="platforms">Thiết bị</TabsTrigger>
          <TabsTrigger value="behavior">Hành vi</TabsTrigger>
          <TabsTrigger value="timeline">Thời gian</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top người dùng hoạt động</CardTitle>
              <CardDescription>Người dùng có nhiều hoạt động nhất</CardDescription>
            </CardHeader>
            <CardContent>
                            <div className="space-y-4">
                {analyticsData?.topUsers && analyticsData.topUsers.length > 0 ? (
                  analyticsData.topUsers.map((user, index) => (
                    <div key={user.user_id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <Avatar>
                          <AvatarImage src={user.avatar} alt={user.full_name} />
                          <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="text-sm font-medium">{user.total_sessions} phiên</div>
                        <div className="text-sm text-muted-foreground">
                          {user.total_actions} hành động
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="text-sm font-medium">
                          {formatDuration(user.total_duration)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          TB: {Math.round(user.avg_session_duration / 60)}m
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Chưa có dữ liệu người dùng</p>
                    <p className="text-sm">Tất cả phiên đang ẩn danh</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết thiết bị</CardTitle>
              <CardDescription>Thống kê theo platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.platforms && analyticsData.platforms.length > 0 ? (
                  analyticsData.platforms.map((platform, index) => {
                  const Icon = platform._id.device_type === 'mobile' ? Smartphone : 
                              platform._id.device_type === 'tablet' ? Tablet : Monitor
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">
                            {platform._id.platform || 'Unknown'} ({platform._id.device_type || 'Unknown'})
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {platform.unique_users_count} người dùng
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{platform.sessions} phiên</div>
                        <div className="text-sm text-muted-foreground">
                          TB: {Math.round(platform.avg_duration / 60)}m
                        </div>
                      </div>
                    </div>
                  )
                })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Chưa có dữ liệu thiết bị</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết hành vi</CardTitle>
              <CardDescription>Thống kê các hoạt động</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.actions && analyticsData.actions.length > 0 ? (
                  analyticsData.actions.map((action, index) => {
                  const Icon = actionIcons[action._id as keyof typeof actionIcons] || Activity
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">
                            {actionLabels[action._id as keyof typeof actionLabels] || action._id}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {action.unique_users_count} người dùng
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{action.count.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">lần thực hiện</div>
                      </div>
                    </div>
                  )
                })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Chưa có dữ liệu hành vi</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động theo thời gian</CardTitle>
              <CardDescription>Số phiên và hành động theo ngày</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.activityByTime && analyticsData.activityByTime.length > 0 ? (
                  analyticsData.activityByTime.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">
                          {activity._id.day}/{activity._id.month}/{activity._id.year}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {activity.unique_users_count} người dùng
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{activity.sessions} phiên</div>
                      <div className="text-sm text-muted-foreground">
                        {activity.total_actions} hành động
                      </div>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Chưa có dữ liệu timeline</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 