import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, Download, Calendar, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AdminUserReportChart from "@/components/admin/admin-user-report-chart"
import AdminShopReportChart from "@/components/admin/admin-shop-report-chart"
import AdminRevenueReportChart from "@/components/admin/admin-revenue-report-chart"
import AdminOrderReportChart from "@/components/admin/admin-order-report-chart"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Báo cáo tổng quan</h1>
          <p className="text-gray-500">Xem báo cáo chi tiết về hoạt động của hệ thống ChecKafe.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-primary hover:bg-primary-dark">
            <Download className="mr-2 h-4 w-4" /> Xuất báo cáo
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full md:w-auto">
          <Select defaultValue="this-month">
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
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          <TabsTrigger value="shops">Quán cà phê</TabsTrigger>
          <TabsTrigger value="orders">Đơn đặt chỗ</TabsTrigger>
          <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,845</div>
                <p className="text-xs text-green-500 flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +18% so với tháng trước
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Người dùng mới</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,245</div>
                <p className="text-xs text-green-500 flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +12% so với tháng trước
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Người dùng hoạt động</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8,432</div>
                <p className="text-xs text-green-500 flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +5% so với tháng trước
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tỷ lệ giữ chân</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-green-500 flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +2% so với tháng trước
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Người dùng theo thời gian</CardTitle>
              <CardDescription>Số lượng người dùng mới và tổng số người dùng theo thời gian</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminUserReportChart />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Phân bố người dùng theo khu vực</CardTitle>
                <CardDescription>Số lượng người dùng theo khu vực địa lý</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                  <p className="text-gray-500">Biểu đồ phân bố người dùng</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Phân bố người dùng theo độ tuổi</CardTitle>
                <CardDescription>Số lượng người dùng theo nhóm tuổi</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                  <p className="text-gray-500">Biểu đồ phân bố độ tuổi</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shops" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng quán cà phê</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">342</div>
                <p className="text-xs text-green-500 flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +7% so với tháng trước
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quán mới</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">28</div>
                <p className="text-xs text-green-500 flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +15% so với tháng trước
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quán VIP</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">124</div>
                <p className="text-xs text-green-500 flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +10% so với tháng trước
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đánh giá trung bình</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.6</div>
                <p className="text-xs text-green-500 flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +0.2 so với tháng trước
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quán cà phê theo thời gian</CardTitle>
              <CardDescription>Số lượng quán mới và tổng số quán theo thời gian</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminShopReportChart />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Phân bố quán theo khu vực</CardTitle>
                <CardDescription>Số lượng quán theo khu vực địa lý</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                  <p className="text-gray-500">Biểu đồ phân bố quán</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Phân bố quán theo chủ đề</CardTitle>
                <CardDescription>Số lượng quán theo chủ đề</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                  <p className="text-gray-500">Biểu đồ phân bố chủ đề</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng đơn đặt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">28,452</div>
                <p className="text-xs text-green-500 flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +12% so với tháng trước
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đơn đặt hôm nay</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,284</div>
                <p className="text-xs text-green-500 flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +8% so với hôm qua
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tỷ lệ hoàn thành</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-green-500 flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +2% so với tháng trước
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Thời gian đặt trước</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.5 giờ</div>
                <p className="text-xs text-green-500 flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +0.3 giờ so với tháng trước
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Đơn đặt chỗ theo thời gian</CardTitle>
              <CardDescription>Số lượng đơn đặt chỗ theo thời gian</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminOrderReportChart />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Phân bố đơn đặt theo giờ</CardTitle>
                <CardDescription>Số lượng đơn đặt theo khung giờ trong ngày</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                  <p className="text-gray-500">Biểu đồ phân bố theo giờ</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Phân bố đơn đặt theo ngày</CardTitle>
                <CardDescription>Số lượng đơn đặt theo ngày trong tuần</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                  <p className="text-gray-500">Biểu đồ phân bố theo ngày</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">985.6M VND</div>
                <p className="text-xs text-green-500 flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +15% so với tháng trước
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Doanh thu từ VIP</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245.2M VND</div>
                <p className="text-xs text-green-500 flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +20% so với tháng trước
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Doanh thu từ hoa hồng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">142.8M VND</div>
                <p className="text-xs text-green-500 flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +8% so với tháng trước
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Giá trị đơn trung bình</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">120K VND</div>
                <p className="text-xs text-green-500 flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +5% so với tháng trước
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Doanh thu theo thời gian</CardTitle>
              <CardDescription>Doanh thu theo thời gian phân chia theo nguồn</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminRevenueReportChart />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Phân bố doanh thu theo nguồn</CardTitle>
                <CardDescription>Tỷ lệ doanh thu từ các nguồn khác nhau</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                  <p className="text-gray-500">Biểu đồ phân bố doanh thu</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top 10 quán có doanh thu cao nhất</CardTitle>
                <CardDescription>Các quán cà phê có doanh thu cao nhất hệ thống</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                  <p className="text-gray-500">Biểu đồ top quán</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
