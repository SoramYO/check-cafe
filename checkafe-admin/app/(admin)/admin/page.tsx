"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  Users,
  Coffee,
  TrendingUp,
  Calendar,
  DollarSign,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Palette,
  Image,
  Menu as MenuIcon,
  Timer,
  UserCheck,
  Crown,
  Activity,
} from "lucide-react";
import AdminOverviewChart from "@/components/admin/admin-overview-chart";
import AdminRecentShops from "@/components/admin/admin-recent-shops";
// import AdminTopShops from "@/components/admin/admin-top-shops";
// import AdminOverviewStats from "@/components/admin/admin-overview-stats";
import AdminAdsAnalysis from "@/components/admin/admin-ads-analysis";
import { useState, useEffect } from "react";
import authorizedAxiosInstance from "@/lib/axios";
import { toast } from "sonner";

interface DashboardStats {
  totalUsers: number;
  totalShops: number;
  todayBookings: number;
  averageRevenue: number;
  userGrowth: number;
  shopGrowth: number;
  bookingGrowth: number;
  revenueGrowth: number;
  userStats: {
    total: number;
    customers: number;
    shopOwners: number;
    active: number;
    vip: number;
    newThisMonth: number;
    activeRate: number;
    vipRate: number;
  };
  shopStats: {
    total: number;
    active: number;
    pending: number;
    rejected: number;
    vip: number;
    newThisMonth: number;
    activeRate: number;
    vipRate: number;
    withImages: number;
    withMenuItems: number;
    withTimeSlots: number;
    setupCompletionRate: number;
  };
  bookingStats: {
    today: number;
    yesterday: number;
    thisWeek: number;
    thisMonth: number;
    completed: number;
    cancelled: number;
    completionRate: number;
  };
  revenueStats: {
    today: number;
    averageDaily: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  verificationStats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    thisWeek: number;
    approvalRate: number;
  };
  packageStats: {
    total: number;
    active: number;
    expired: number;
    newThisMonth: number;
    activeRate: number;
  };
  themeStats: {
    total: number;
  };
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await authorizedAxiosInstance.get("/v1/admin/stats");

      if (response.data.status === 200) {
        setStats(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
      toast.error(error.response?.data?.message || "Không thể tải thông tin tổng quan");
    } finally {
      setLoading(false);
    }
  };

  // Format số tiền thành định dạng VND
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    })
      .format(value)
      .replace("₫", "VND");
  };

  // Format growth percentage với màu sắc
  const formatGrowth = (value: number) => {
    const isPositive = value >= 0;
    const color = isPositive ? "text-green-500" : "text-red-500";
    const icon = isPositive ? (
      <TrendingUp className="mr-1 h-3 w-3" />
    ) : (
      <TrendingUp className="mr-1 h-3 w-3 transform rotate-180" />
    );
    
    return (
      <p className={`text-xs ${color} flex items-center`}>
        {icon}
        {isPositive ? "+" : ""}{value}% so với kỳ trước
      </p>
    );
  };

  if (!stats && !loading) {
    return <div>Không thể tải dữ liệu</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Admin</h1>
          <p className="text-gray-500">
            Xem tổng quan hoạt động của hệ thống ChecKafe.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-1"
            onClick={fetchDashboardStats}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />{" "}
            Làm mới
          </Button>
          <Button className="bg-primary hover:bg-primary-dark">
            <ArrowUpRight className="mr-2 h-4 w-4" /> Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng người dùng
            </CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats?.totalUsers.toLocaleString()}
            </div>
            {!loading && stats && formatGrowth(stats.userGrowth)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng quán cà phê
            </CardTitle>
            <Coffee className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats?.totalShops.toLocaleString()}
            </div>
            {!loading && stats && formatGrowth(stats.shopGrowth)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Đơn đặt hôm nay
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats?.todayBookings.toLocaleString()}
            </div>
            {!loading && stats && formatGrowth(stats.bookingGrowth)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Doanh thu trung bình
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : formatCurrency(stats?.averageRevenue || 0)}
            </div>
            {!loading && stats && formatGrowth(stats.revenueGrowth)}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          <TabsTrigger value="shops">Quán cà phê</TabsTrigger>
          <TabsTrigger value="verifications">Xác minh</TabsTrigger>
          <TabsTrigger value="packages">Gói VIP</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Đơn đặt chỗ theo thời gian</CardTitle>
                <CardDescription>
                  Số lượng đơn đặt chỗ trong 30 ngày qua
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {/* <AdminOverviewChart /> */}
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-gray-500">Biểu đồ đơn đặt chỗ</p>
                </div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Thống kê nhanh</CardTitle>
                <CardDescription>
                  Các chỉ số quan trọng hôm nay
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!loading && stats && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Đơn hoàn thành</span>
                      <span className="font-medium">{stats.bookingStats.completionRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quán hoạt động</span>
                      <span className="font-medium">{stats.shopStats.activeRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Xác minh thành công</span>
                      <span className="font-medium">{stats.verificationStats.approvalRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Gói VIP hoạt động</span>
                      <span className="font-medium">{stats.packageStats.activeRate}%</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.userStats.customers.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">
                  {!loading && stats && `${((stats.userStats.customers / stats.userStats.total) * 100).toFixed(1)}% tổng users`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chủ quán</CardTitle>
                <Coffee className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.userStats.shopOwners.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">
                  {!loading && stats && `${((stats.userStats.shopOwners / stats.userStats.total) * 100).toFixed(1)}% tổng users`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Users hoạt động</CardTitle>
                <UserCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.userStats.active.toLocaleString()}
                </div>
                <p className="text-xs text-green-500">
                  {!loading && stats && `${stats.userStats.activeRate}% tổng users`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Users VIP</CardTitle>
                <Crown className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.userStats.vip.toLocaleString()}
                </div>
                <p className="text-xs text-yellow-600">
                  {!loading && stats && `${stats.userStats.vipRate}% tổng users`}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shops" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quán hoạt động</CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.shopStats.active.toLocaleString()}
                </div>
                <p className="text-xs text-green-500">
                  {!loading && stats && `${stats.shopStats.activeRate}% tổng quán`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.shopStats.pending.toLocaleString()}
                </div>
                <p className="text-xs text-yellow-600">
                  {!loading && stats && `${((stats.shopStats.pending / stats.shopStats.total) * 100).toFixed(1)}% tổng quán`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Có hình ảnh</CardTitle>
                <Image className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.shopStats.withImages.toLocaleString()}
                </div>
                <p className="text-xs text-blue-500">
                  {!loading && stats && `${((stats.shopStats.withImages / stats.shopStats.total) * 100).toFixed(1)}% tổng quán`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hoàn thiện setup</CardTitle>
                <CheckCircle className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : `${stats?.shopStats.setupCompletionRate}%`}
                </div>
                <p className="text-xs text-purple-600">
                  Có đủ ảnh, menu, khung giờ
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Có menu</CardTitle>
                <MenuIcon className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.shopStats.withMenuItems.toLocaleString()}
                </div>
                <p className="text-xs text-orange-600">
                  {!loading && stats && `${((stats.shopStats.withMenuItems / stats.shopStats.total) * 100).toFixed(1)}% tổng quán`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Có khung giờ</CardTitle>
                <Timer className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.shopStats.withTimeSlots.toLocaleString()}
                </div>
                <p className="text-xs text-indigo-600">
                  {!loading && stats && `${((stats.shopStats.withTimeSlots / stats.shopStats.total) * 100).toFixed(1)}% tổng quán`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quán VIP</CardTitle>
                <Crown className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.shopStats.vip.toLocaleString()}
                </div>
                <p className="text-xs text-yellow-600">
                  {!loading && stats && `${stats.shopStats.vipRate}% tổng quán`}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="verifications" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng xác minh</CardTitle>
                <CheckCircle className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.verificationStats.total.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">
                  Tất cả yêu cầu xác minh
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.verificationStats.pending.toLocaleString()}
                </div>
                <p className="text-xs text-yellow-600">
                  {!loading && stats && `${((stats.verificationStats.pending / stats.verificationStats.total) * 100).toFixed(1)}% tổng yêu cầu`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.verificationStats.approved.toLocaleString()}
                </div>
                <p className="text-xs text-green-500">
                  {!loading && stats && `${stats.verificationStats.approvalRate}% tỷ lệ duyệt`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bị từ chối</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.verificationStats.rejected.toLocaleString()}
                </div>
                <p className="text-xs text-red-500">
                  {!loading && stats && `${((stats.verificationStats.rejected / stats.verificationStats.total) * 100).toFixed(1)}% tổng yêu cầu`}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="packages" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng gói VIP</CardTitle>
                <Package className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.packageStats.total.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">
                  Tất cả gói đã mua
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.packageStats.active.toLocaleString()}
                </div>
                <p className="text-xs text-green-500">
                  {!loading && stats && `${stats.packageStats.activeRate}% tổng gói`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã hết hạn</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.packageStats.expired.toLocaleString()}
                </div>
                <p className="text-xs text-red-500">
                  {!loading && stats && `${((stats.packageStats.expired / stats.packageStats.total) * 100).toFixed(1)}% tổng gói`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mới tháng này</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.packageStats.newThisMonth.toLocaleString()}
                </div>
                <p className="text-xs text-blue-500">
                  Gói mới được mua
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Thống kê theme</CardTitle>
              <CardDescription>
                Tổng số theme có sẵn trong hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Palette className="h-8 w-8 text-purple-500" />
                <div>
                  <div className="text-3xl font-bold">
                    {loading ? "..." : stats?.themeStats.total.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">Theme có sẵn</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
