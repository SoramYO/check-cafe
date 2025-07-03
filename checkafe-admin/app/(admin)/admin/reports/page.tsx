'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, Download, Calendar, Filter, TrendingUp, TrendingDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AdminUserReportChart from "@/components/admin/admin-user-report-chart"
import AdminShopReportChart from "@/components/admin/admin-shop-report-chart"
import AdminRevenueReportChart from "@/components/admin/admin-revenue-report-chart"
import AdminOrderReportChart from "@/components/admin/admin-order-report-chart"
import { useState, useEffect } from "react"
import authorizedAxiosInstance from "@/lib/axios"
import { toast } from "sonner"
import { DateRange } from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

interface ReportData {
  summary: {
    [key: string]: number
  }
  breakdown: {
    [key: string]: number
  }
  charts: {
    [key: string]: any[]
  }
  period: {
    start: string
    end: string
    period: string
  }
}

interface ReportsResponse {
  status: number
  message: string
  data: ReportData
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("users")
  const [period, setPeriod] = useState("this-month")
  const [loading, setLoading] = useState(false)
  const [userReports, setUserReports] = useState<ReportData | null>(null)
  const [shopReports, setShopReports] = useState<ReportData | null>(null)
  const [orderReports, setOrderReports] = useState<ReportData | null>(null)
  const [revenueReports, setRevenueReports] = useState<ReportData | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customRange, setCustomRange] = useState<{ startDate: Date, endDate: Date }>({
    startDate: new Date(),
    endDate: new Date(),
  })

  const fetchReports = async (reportType: string) => {
    try {
      setLoading(true)
      
      const params: any = { period }
      if (period === 'custom') {
        params.startDate = customRange.startDate.toISOString()
        params.endDate = customRange.endDate.toISOString()
      }
      const response = await authorizedAxiosInstance.get<ReportsResponse>(`/v1/admin/reports/${reportType}`, { params })
      
      if (response.data.status === 200) {
        // Debug the response data
        debugReportData(reportType, response.data.data)
        
        switch (reportType) {
          case 'users':
            setUserReports(response.data.data)
            break
          case 'shops':
            setShopReports(response.data.data)
            break
          case 'orders':
            setOrderReports(response.data.data)
            break
          case 'revenue':
            setRevenueReports(response.data.data)
            break
        }
      }
    } catch (error) {
      console.error(`Error fetching ${reportType} reports:`, error)
      toast.error(`Có lỗi xảy ra khi tải báo cáo ${reportType}`)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when period changes or component mounts
  useEffect(() => {
    fetchReports(activeTab)
  }, [period, activeTab])

  // Safe number helper - ensures no NaN values are displayed
  const safeNumber = (value: any): number => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      console.warn('safeNumber: Converting invalid value to 0:', value, typeof value)
      return 0
    }
    return Number(value)
  }

  // Debug helper to log data structure
  const debugReportData = (reportType: string, data: any) => {
    console.group(`🔍 Debug ${reportType} Reports`)
    console.log('Raw data:', data)
    
    if (data?.summary) {
      console.group('📊 Summary')
      Object.entries(data.summary).forEach(([key, value]) => {
        const isNaN_check = isNaN(Number(value))
        const style = isNaN_check ? 'color: red; font-weight: bold' : 'color: green'
        console.log(`%c${key}: ${value} (${typeof value}) ${isNaN_check ? '❌ NaN' : '✅ Valid'}`, style)
      })
      console.groupEnd()
    }
    
    if (data?.breakdown) {
      console.group('📈 Breakdown')
      Object.entries(data.breakdown).forEach(([key, value]) => {
        const isNaN_check = isNaN(Number(value))
        const style = isNaN_check ? 'color: red; font-weight: bold' : 'color: green'
        console.log(`%c${key}: ${value} (${typeof value}) ${isNaN_check ? '❌ NaN' : '✅ Valid'}`, style)
      })
      console.groupEnd()
    }

    if (data?.charts) {
      console.group('📊 Charts')
      Object.entries(data.charts).forEach(([key, value]) => {
        console.log(`${key}:`, value)
      })
      console.groupEnd()
    }
    
    console.groupEnd()
  }

  // Format number with Vietnamese locale
  const formatNumber = (num: number) => {
    if (isNaN(num) || num === null || num === undefined) {
      return '0'
    }
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  // Format currency
  const formatCurrency = (num: number) => {
    if (isNaN(num) || num === null || num === undefined) {
      return '0 ₫'
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(num)
  }

  // Growth indicator component
  const GrowthIndicator = ({ value, isPercentage = true }: { value: number, isPercentage?: boolean }) => {
    // Handle NaN, null, undefined values
    const safeValue = isNaN(value) || value === null || value === undefined ? 0 : value
    const isPositive = safeValue >= 0
    const Icon = isPositive ? TrendingUp : TrendingDown
    const colorClass = isPositive ? "text-green-500" : "text-red-500"
    
    return (
      <p className={`text-xs ${colorClass} flex items-center`}>
        <Icon className="mr-1 h-3 w-3" />
        {isPositive ? '+' : ''}{safeValue.toFixed(1)}{isPercentage ? '%' : ''} so với kỳ trước
      </p>
    )
  }

  useEffect(() => {
    if (period === 'custom') {
      fetchReports(activeTab)
    }
  }, [customRange, period, activeTab])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Báo cáo tổng quan</h1>
          <p className="text-gray-500">Xem báo cáo chi tiết về hoạt động của hệ thống ChecKafe.</p>
          {(userReports?.period || shopReports?.period || orderReports?.period || revenueReports?.period) && (
            <p className="text-sm text-muted-foreground mt-1">
              Kỳ báo cáo: {(() => {
                const period = userReports?.period || shopReports?.period || orderReports?.period || revenueReports?.period;
                if (period) {
                  return new Date(period.start).toLocaleDateString('vi-VN') + ' - ' + new Date(period.end).toLocaleDateString('vi-VN');
                }
                return '';
              })()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            className="bg-primary hover:bg-primary-dark"
            disabled={loading}
          >
            <Download className="mr-2 h-4 w-4" /> 
            {loading ? 'Đang tải...' : 'Xuất báo cáo'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hôm nay</SelectItem>
              <SelectItem value="yesterday">Hôm qua</SelectItem>
              <SelectItem value="this-week">Tuần này</SelectItem>
              <SelectItem value="last-week">Tuần trước</SelectItem>
              <SelectItem value="this-month">Tháng này</SelectItem>
              <SelectItem value="last-month">Tháng trước</SelectItem>
              <SelectItem value="this-year">Năm nay</SelectItem>
              <SelectItem value="custom">Tùy chỉnh</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => setShowDatePicker(!showDatePicker)}>
            <Calendar className="h-4 w-4" />
          </Button>
          {showDatePicker && (
            <div className="absolute z-50 bg-white p-4 rounded shadow">
              <DateRange
                ranges={[{
                  startDate: customRange.startDate,
                  endDate: customRange.endDate,
                  key: 'selection'
                }]}
                onChange={item => {
                  setCustomRange({
                    startDate: item.selection.startDate,
                    endDate: item.selection.endDate
                  })
                }}
                maxDate={new Date()}
              />
              <div className="flex justify-end mt-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setPeriod('custom')
                    setShowDatePicker(false)
                  }}
                >
                  Áp dụng
                </Button>
              </div>
            </div>
          )}
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          <TabsTrigger value="shops">Quán cà phê</TabsTrigger>
          <TabsTrigger value="orders">Đơn đặt chỗ</TabsTrigger>
          {/* <TabsTrigger value="revenue">Doanh thu</TabsTrigger> */}
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {loading ? (
            <div className="py-8 text-center">Đang tải dữ liệu...</div>
          ) : userReports ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(userReports.summary.totalUsers || 0)}</div>
                    <GrowthIndicator value={userReports.summary.userGrowth || 0} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Người dùng mới</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(userReports.summary.newUsers || 0)}</div>
                    <GrowthIndicator value={userReports.summary.userGrowth || 0} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Người dùng hoạt động</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(userReports.summary.activeUsers || 0)}</div>
                    <p className="text-xs text-muted-foreground">
                      {userReports.summary.retentionRate || 0}% tỷ lệ hoạt động
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tỷ lệ giữ chân</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userReports.summary.retentionRate || 0}%</div>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(userReports.breakdown.vipUsers || 0)} VIP users
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground">Không có dữ liệu</div>
          )}

          {userReports && (
            <Card>
              <CardHeader>
                <CardTitle>Người dùng theo thời gian</CardTitle>
                <CardDescription>Số lượng người dùng mới và tổng số người dùng theo thời gian</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminUserReportChart 
                  data={userReports.charts?.userGrowth || userReports.charts?.timeline} 
                  loading={loading}
                />
              </CardContent>
            </Card>
          )}

          
        </TabsContent>

        <TabsContent value="shops" className="space-y-4">
          {loading ? (
            <div className="py-8 text-center">Đang tải dữ liệu...</div>
          ) : shopReports ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng quán cà phê</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(shopReports.summary.totalShops || 0)}</div>
                    <GrowthIndicator value={shopReports.summary.shopGrowth || 0} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Quán mới</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(shopReports.summary.newShops || 0)}</div>
                    <GrowthIndicator value={shopReports.summary.shopGrowth || 0} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Quán VIP</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(shopReports.breakdown.vipShops || 0)}</div>
                    <p className="text-xs text-muted-foreground">
                      {safeNumber(shopReports.summary.totalShops) > 0 ? ((safeNumber(shopReports.breakdown.vipShops) / safeNumber(shopReports.summary.totalShops)) * 100).toFixed(1) : 0}% tổng số quán
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Đánh giá trung bình</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{safeNumber(shopReports.summary.avgRating).toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(shopReports.breakdown.activeShops || 0)} quán hoạt động
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground">Không có dữ liệu</div>
          )}

          {shopReports && (
            <Card>
              <CardHeader>
                <CardTitle>Quán cà phê theo thời gian</CardTitle>
                <CardDescription>Số lượng quán mới và tổng số quán theo thời gian</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminShopReportChart 
                  data={shopReports.charts?.shopGrowth || shopReports.charts?.timeline} 
                  loading={loading}
                />
              </CardContent>
            </Card>
          )}

         
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          {loading ? (
            <div className="py-8 text-center">Đang tải dữ liệu...</div>
          ) : orderReports ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng đơn đặt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(orderReports.summary.totalOrders || 0)}</div>
                    <GrowthIndicator value={orderReports.summary.orderGrowth || 0} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Đơn đặt trong kỳ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(orderReports.summary.ordersInPeriod || 0)}</div>
                    <GrowthIndicator value={orderReports.summary.orderGrowth || 0} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tỷ lệ hoàn thành</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{orderReports.summary.completionRate || 0}%</div>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(orderReports.breakdown.completed || 0)} đơn hoàn thành
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Đơn đặt trung bình/ngày</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(orderReports.summary.avgOrdersPerDay || 0)}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(orderReports.breakdown.cancelled || 0)} đơn hủy
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground">Không có dữ liệu</div>
          )}

          {orderReports && (
            <Card>
              <CardHeader>
                <CardTitle>Đơn đặt chỗ theo thời gian</CardTitle>
                <CardDescription>Số lượng đơn đặt chỗ theo thời gian</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminOrderReportChart 
                  data={orderReports.charts?.orderTimeline || orderReports.charts?.dailyOrders} 
                  loading={loading}
                />
              </CardContent>
            </Card>
          )}

        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          {loading ? (
            <div className="py-8 text-center">Đang tải dữ liệu...</div>
          ) : revenueReports ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(revenueReports.summary.totalRevenue || 0)}</div>
                    <GrowthIndicator value={revenueReports.summary.revenueGrowth || 0} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Doanh thu từ VIP</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(revenueReports.breakdown.vipRevenue || 0)}</div>
                    <p className="text-xs text-muted-foreground">
                      {safeNumber(revenueReports.summary.totalRevenue) > 0 ? ((safeNumber(revenueReports.breakdown.vipRevenue) / safeNumber(revenueReports.summary.totalRevenue)) * 100).toFixed(1) : 0}% tổng doanh thu
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Doanh thu từ hoa hồng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(revenueReports.breakdown.commissionRevenue || 0)}</div>
                    <p className="text-xs text-muted-foreground">
                      {safeNumber(revenueReports.summary.totalRevenue) > 0 ? ((safeNumber(revenueReports.breakdown.commissionRevenue) / safeNumber(revenueReports.summary.totalRevenue)) * 100).toFixed(1) : 0}% tổng doanh thu
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Giá trị đơn trung bình</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(revenueReports.summary.avgOrderValue || 0)}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(revenueReports.summary.totalTransactions || 0)} giao dịch
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground">Không có dữ liệu</div>
          )}

          {revenueReports && (
            <Card>
              <CardHeader>
                <CardTitle>Doanh thu theo thời gian</CardTitle>
                <CardDescription>Doanh thu theo thời gian phân chia theo nguồn</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminRevenueReportChart 
                  data={revenueReports.charts?.revenueTimeline || revenueReports.charts?.dailyRevenue} 
                  loading={loading}
                />
              </CardContent>
            </Card>
          )}  
        </TabsContent>
      </Tabs>
    </div>
  )
}
