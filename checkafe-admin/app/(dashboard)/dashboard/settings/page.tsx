import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Bell, Shield, Globe, Database, Palette, Save } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
          <p className="text-muted-foreground">
            Quản lý cài đặt hệ thống và tùy chọn
          </p>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Lưu thay đổi
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Thông tin quán
            </CardTitle>
            <CardDescription>
              Cập nhật thông tin cơ bản của quán cà phê
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shop-name">Tên quán</Label>
              <Input id="shop-name" defaultValue="ChecKafe Coffee Shop" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shop-address">Địa chỉ</Label>
              <Input id="shop-address" defaultValue="123 Đường ABC, Quận 1, TP.HCM" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shop-phone">Số điện thoại</Label>
              <Input id="shop-phone" defaultValue="+84 123 456 789" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shop-email">Email</Label>
              <Input id="shop-email" defaultValue="info@checkafe.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shop-description">Mô tả</Label>
              <Textarea 
                id="shop-description" 
                defaultValue="Quán cà phê với không gian thoải mái, phục vụ các loại cà phê chất lượng cao và đồ ăn ngon."
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Thông báo
            </CardTitle>
            <CardDescription>
              Cài đặt thông báo và cảnh báo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Thông báo đặt chỗ</Label>
                <p className="text-sm text-muted-foreground">
                  Nhận thông báo khi có đặt chỗ mới
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Thông báo đánh giá</Label>
                <p className="text-sm text-muted-foreground">
                  Nhận thông báo khi có đánh giá mới
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Thông báo khuyến mãi</Label>
                <p className="text-sm text-muted-foreground">
                  Nhận thông báo về khuyến mãi và sự kiện
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email thông báo</Label>
                <p className="text-sm text-muted-foreground">
                  Gửi thông báo qua email
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Bảo mật
            </CardTitle>
            <CardDescription>
              Cài đặt bảo mật và quyền truy cập
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Mật khẩu mới</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Xác thực 2 yếu tố</Label>
                <p className="text-sm text-muted-foreground">
                  Bảo mật tài khoản với 2FA
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Đăng nhập từ thiết bị mới</Label>
                <p className="text-sm text-muted-foreground">
                  Yêu cầu xác thực khi đăng nhập từ thiết bị mới
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Giao diện
            </CardTitle>
            <CardDescription>
              Tùy chỉnh giao diện và hiển thị
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Ngôn ngữ</Label>
              <Select defaultValue="vi">
                <SelectTrigger>
                  <SelectValue placeholder="Chọn ngôn ngữ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Múi giờ</Label>
              <Select defaultValue="gmt+7">
                <SelectTrigger>
                  <SelectValue placeholder="Chọn múi giờ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gmt+7">GMT+7 (Việt Nam)</SelectItem>
                  <SelectItem value="gmt+8">GMT+8 (Singapore)</SelectItem>
                  <SelectItem value="gmt+0">GMT+0 (London)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Đơn vị tiền tệ</Label>
              <Select defaultValue="vnd">
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đơn vị tiền tệ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vnd">VND (₫)</SelectItem>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Chế độ tối</Label>
                <p className="text-sm text-muted-foreground">
                  Sử dụng giao diện tối
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Hiển thị thông báo</Label>
                <p className="text-sm text-muted-foreground">
                  Hiển thị thông báo trên màn hình
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Dữ liệu
            </CardTitle>
            <CardDescription>
              Quản lý dữ liệu và sao lưu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Dung lượng sử dụng</Label>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <p className="text-sm text-muted-foreground">2.4 GB / 5 GB</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Sao lưu dữ liệu
              </Button>
              <Button variant="outline" className="flex-1">
                Khôi phục dữ liệu
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Xuất dữ liệu
              </Button>
              <Button variant="outline" className="flex-1">
                Nhập dữ liệu
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sao lưu tự động</Label>
                <p className="text-sm text-muted-foreground">
                  Tự động sao lưu hàng ngày
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Hệ thống
            </CardTitle>
            <CardDescription>
              Cài đặt hệ thống và hiệu suất
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cache-time">Thời gian cache (phút)</Label>
              <Input id="cache-time" type="number" defaultValue="30" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Thời gian timeout phiên (phút)</Label>
              <Input id="session-timeout" type="number" defaultValue="60" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Debug mode</Label>
                <p className="text-sm text-muted-foreground">
                  Bật chế độ debug cho nhà phát triển
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Log chi tiết</Label>
                <p className="text-sm text-muted-foreground">
                  Ghi log chi tiết cho hệ thống
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Xóa cache
              </Button>
              <Button variant="outline" className="flex-1">
                Kiểm tra cập nhật
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 