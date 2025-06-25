"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart, TrendingUp, Users, DollarSign, Calendar, Coffee, Star, TrendingDown } from "lucide-react"
import { useEffect, useState } from "react"
import { AnalyticsOverview } from "@/app/(dashboard)/dashboard/analytics/type"
import { useShop } from "@/context/ShopContext"
import { Skeleton } from "@/components/ui/skeleton"
import authorizedAxiosInstance from "@/lib/axios"
import { BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { RevenueAnalytics, PopularItemsAnalytics, TimeBasedAnalytics } from './type'

export default function AnalyticsPage() {
  const { shopId } = useShop()
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(30)
  const [revenueData, setRevenueData] = useState<RevenueAnalytics | null>(null)
  const [popularItems, setPopularItems] = useState<PopularItemsAnalytics | null>(null)
  const [timeBased, setTimeBased] = useState<TimeBasedAnalytics | null>(null)

  useEffect(() => {
    if (shopId) {
      fetchOverview()
      fetchRevenue()
      fetchPopularItems()
      fetchTimeBased()
    }
  }, [shopId, period])

  const fetchOverview = async () => {
    if (!shopId) return
    
    try {
      setLoading(true)
      const response = await authorizedAxiosInstance.get(`/v1/shops/${shopId}/analytics/overview`, {
        params: { period }
      })
      setOverview(response.data.data)
    } catch (error) {
      console.error('Failed to fetch analytics overview:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRevenue = async () => {
    if (!shopId) return
    try {
      const res = await authorizedAxiosInstance.get(`/v1/shops/${shopId}/analytics/revenue`, { params: { period: 6 } })
      setRevenueData(res.data.data)
    } catch (e) { setRevenueData(null) }
  }

  const fetchPopularItems = async () => {
    if (!shopId) return
    try {
      const res = await authorizedAxiosInstance.get(`/v1/shops/${shopId}/analytics/popular-items`, { params: { period } })
      setPopularItems(res.data.data)
    } catch (e) { setPopularItems(null) }
  }

  const fetchTimeBased = async () => {
    if (!shopId) return
    try {
      const res = await authorizedAxiosInstance.get(`/v1/shops/${shopId}/analytics/time-based`, { params: { period } })
      setTimeBased(res.data.data)
    } catch (e) { setTimeBased(null) }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  const getChangeIcon = (trend: 'up' | 'down') => {
    return trend === 'up' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    )
  }

  const getChangeColor = (trend: 'up' | 'down') => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600'
  }

  if (!shopId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Thống kê</h1>
            <p className="text-muted-foreground">
              Phân tích dữ liệu và hiệu suất kinh doanh
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Vui lòng chọn shop để xem thống kê</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thống kê</h1>
          <p className="text-muted-foreground">
            Phân tích dữ liệu và hiệu suất kinh doanh
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={period === 7 ? "default" : "outline"}
            onClick={() => setPeriod(7)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            7 ngày
          </Button>
          <Button 
            variant={period === 30 ? "default" : "outline"}
            onClick={() => setPeriod(30)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            30 ngày
          </Button>
          <Button 
            variant={period === 90 ? "default" : "outline"}
            onClick={() => setPeriod(90)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            90 ngày
          </Button>
          <Button>
            <BarChart className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(overview?.overview.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {overview?.changes.revenue && (
                    <>
                      {getChangeIcon(overview.changes.revenue.trend)}
                      <span className={getChangeColor(overview.changes.revenue.trend)}>
                        {overview.changes.revenue.change > 0 ? '+' : ''}{overview.changes.revenue.change.toFixed(1)}%
                      </span>
                      <span> so với kỳ trước</span>
                    </>
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatNumber(overview?.overview.totalCustomers || 0)}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {overview?.changes.customers && (
                    <>
                      {getChangeIcon(overview.changes.customers.trend)}
                      <span className={getChangeColor(overview.changes.customers.trend)}>
                        {overview.changes.customers.change > 0 ? '+' : ''}{overview.changes.customers.change.toFixed(1)}%
                      </span>
                      <span> so với kỳ trước</span>
                    </>
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatNumber(overview?.overview.totalReservations || 0)}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {overview?.changes.reservations && (
                    <>
                      {getChangeIcon(overview.changes.reservations.trend)}
                      <span className={getChangeColor(overview.changes.reservations.trend)}>
                        {overview.changes.reservations.change > 0 ? '+' : ''}{overview.changes.reservations.change.toFixed(1)}%
                      </span>
                      <span> so với kỳ trước</span>
                    </>
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đánh giá</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {overview?.overview.avgRating.toFixed(1) || '0.0'}/5
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(overview?.overview.totalReviews || 0)} đánh giá
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Doanh thu theo tháng</CardTitle>
            <CardDescription>
              Biểu đồ doanh thu {period} ngày gần đây
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {revenueData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={revenueData.dailyRevenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={formatCurrency} />
                    <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu" />
                  </ReBarChart>
                </ResponsiveContainer>
              ) : (
                <Skeleton className="h-full w-full" />
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Sản phẩm bán chạy</CardTitle>
            <CardDescription>
              Top 5 sản phẩm được yêu thích
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {popularItems ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={popularItems.popularItemsByRating.slice(0,5)} dataKey="reviewCount" nameKey="item.name" cx="50%" cy="50%" outerRadius={80} label>
                      {popularItems.popularItemsByRating.slice(0,5).map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"][idx % 5]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} đánh giá`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Skeleton className="h-full w-full" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Khách hàng theo độ tuổi</CardTitle>
            <CardDescription>
              Phân bố khách hàng theo nhóm tuổi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">18-25 tuổi</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full">
                    <div className="w-3/4 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">75%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">26-35 tuổi</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full">
                    <div className="w-1/2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">50%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">36-45 tuổi</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full">
                    <div className="w-1/4 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">25%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">46+ tuổi</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full">
                    <div className="w-1/8 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">12%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thời gian đặt chỗ</CardTitle>
            <CardDescription>
              Phân bố đặt chỗ theo giờ trong ngày
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {timeBased ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={timeBased.hourly} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value) => `${value} lượt`} />
                    <Bar dataKey="count" fill="#82ca9d" name="Lượt đặt" />
                  </ReBarChart>
                </ResponsiveContainer>
              ) : (
                <Skeleton className="h-full w-full" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 