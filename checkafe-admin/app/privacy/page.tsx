"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, Lock, Eye, Database, Bell, UserX } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100">
      {/* Background coffee beans pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/coffee-beans-pattern.svg')] bg-repeat"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/register">
            <Button variant="ghost" className="mb-4 text-amber-700 hover:text-amber-900 hover:bg-amber-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại đăng ký
            </Button>
          </Link>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/logo.png" 
                alt="ChecKafe Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-amber-900 mb-2">
              Chính Sách Bảo Mật
            </h1>
            <p className="text-amber-700">
              Cam kết bảo vệ thông tin cá nhân của bạn
            </p>
            <p className="text-sm text-amber-600 mt-2">
              Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Cam kết bảo mật */}
          <Card className="backdrop-blur-sm bg-white/80 shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-900">
                <Shield className="w-5 h-5 mr-2" />
                1. Cam Kết Bảo Mật
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-800 space-y-4">
              <p>
                <strong>ChecKafe</strong> cam kết bảo vệ quyền riêng tư và thông tin cá nhân của 
                tất cả người dùng. Chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn 
                theo các tiêu chuẩn bảo mật cao nhất và tuân thủ các quy định pháp luật.
              </p>
              <p>
                Chính sách này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và 
                bảo vệ thông tin cá nhân của bạn khi sử dụng dịch vụ ChecKafe.
              </p>
            </CardContent>
          </Card>

          {/* Thông tin thu thập */}
          <Card className="backdrop-blur-sm bg-white/80 shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-900">
                <Database className="w-5 h-5 mr-2" />
                2. Thông Tin Chúng Tôi Thu Thập
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-800 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">2.1. Thông tin cá nhân:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Họ tên, email, số điện thoại</li>
                  <li>Thông tin tài khoản đăng nhập</li>
                  <li>Thông tin định danh (CCCD, CMND nếu cần)</li>
                  <li>Thông tin thanh toán và ngân hàng</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2.2. Thông tin kinh doanh:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Thông tin cửa hàng (tên, địa chỉ, loại hình)</li>
                  <li>Menu, giá cả, hình ảnh sản phẩm</li>
                  <li>Dữ liệu giao dịch và doanh thu</li>
                  <li>Thông tin khách hàng của shop</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2.3. Thông tin kỹ thuật:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Địa chỉ IP, thông tin thiết bị</li>
                  <li>Dữ liệu cookie và session</li>
                  <li>Lịch sử truy cập và sử dụng</li>
                  <li>Logs hệ thống và bảo mật</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Mục đích sử dụng */}
          <Card className="backdrop-blur-sm bg-white/80 shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-900">
                <Eye className="w-5 h-5 mr-2" />
                3. Mục Đích Sử Dụng Thông Tin
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-800 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">3.1. Cung cấp dịch vụ:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Tạo và quản lý tài khoản người dùng</li>
                  <li>Xử lý đặt chỗ và thanh toán</li>
                  <li>Gửi thông báo quan trọng</li>
                  <li>Hỗ trợ khách hàng khi cần thiết</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3.2. Cải thiện dịch vụ:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Phân tích hành vi sử dụng</li>
                  <li>Tối ưu hóa hiệu suất hệ thống</li>
                  <li>Phát triển tính năng mới</li>
                  <li>Khắc phục lỗi và sự cố</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3.3. Bảo mật và tuân thủ:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Ngăn chặn gian lận và lạm dụng</li>
                  <li>Tuân thủ các quy định pháp luật</li>
                  <li>Xác minh danh tính khi cần</li>
                  <li>Báo cáo với cơ quan chức năng</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Bảo mật thông tin */}
          <Card className="backdrop-blur-sm bg-white/80 shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-900">
                <Lock className="w-5 h-5 mr-2" />
                4. Biện Pháp Bảo Mật
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-800 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">4.1. Mã hóa dữ liệu:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>SSL/TLS cho tất cả kết nối</li>
                  <li>Mã hóa AES-256 cho dữ liệu nhạy cảm</li>
                  <li>Hash password với bcrypt</li>
                  <li>Mã hóa thông tin thanh toán</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4.2. Kiểm soát truy cập:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Xác thực đa yếu tố (2FA)</li>
                  <li>Phân quyền dựa trên vai trò</li>
                  <li>Giám sát truy cập bất thường</li>
                  <li>Tự động đăng xuất khi không hoạt động</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4.3. Hạ tầng bảo mật:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Tường lửa và IDS/IPS</li>
                  <li>Backup dữ liệu định kỳ</li>
                  <li>Disaster recovery plan</li>
                  <li>Kiểm tra bảo mật thường xuyên</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Chia sẻ thông tin */}
          <Card className="backdrop-blur-sm bg-white/80 shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-900">
                <UserX className="w-5 h-5 mr-2" />
                5. Chia Sẻ Thông Tin
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-800 space-y-4">
              <p>
                <strong>ChecKafe KHÔNG bán hoặc cho thuê</strong> thông tin cá nhân của bạn 
                cho bên thứ ba với mục đích thương mại.
              </p>
              <div>
                <h4 className="font-semibold mb-2">5.1. Chúng tôi chỉ chia sẻ thông tin khi:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Bạn đồng ý rõ ràng</li>
                  <li>Pháp luật yêu cầu</li>
                  <li>Cần thiết để cung cấp dịch vụ (ví dụ: xử lý thanh toán)</li>
                  <li>Bảo vệ quyền lợi của ChecKafe và người dùng</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">5.2. Đối tác được ủy quyền:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Nhà cung cấp thanh toán (VNPay, MoMo, v.v.)</li>
                  <li>Dịch vụ email và SMS</li>
                  <li>Đối tác phân tích dữ liệu</li>
                  <li>Nhà cung cấp hạ tầng cloud</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Quyền của người dùng */}
          <Card className="backdrop-blur-sm bg-white/80 shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-900">
                <Bell className="w-5 h-5 mr-2" />
                6. Quyền Của Người Dùng
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-800 space-y-4">
              <p>Bạn có các quyền sau đối với thông tin cá nhân của mình:</p>
              <div>
                <h4 className="font-semibold mb-2">6.1. Quyền truy cập và cập nhật:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Xem thông tin cá nhân được lưu trữ</li>
                  <li>Cập nhật thông tin không chính xác</li>
                  <li>Yêu cầu sao lưu dữ liệu</li>
                  <li>Nhận báo cáo về việc sử dụng dữ liệu</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">6.2. Quyền kiểm soát:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Hủy đăng ký nhận email marketing</li>
                  <li>Tắt các thông báo không cần thiết</li>
                  <li>Yêu cầu xóa tài khoản</li>
                  <li>Từ chối chia sẻ thông tin</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">6.3. Quyền khiếu nại:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Báo cáo vi phạm bảo mật</li>
                  <li>Khiếu nại việc xử lý dữ liệu</li>
                  <li>Yêu cầu điều tra sự cố</li>
                  <li>Liên hệ cơ quan quản lý</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Cookie và tracking */}
          <Card className="backdrop-blur-sm bg-white/80 shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-900">
                <Eye className="w-5 h-5 mr-2" />
                7. Cookie và Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-800 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">7.1. Loại cookie sử dụng:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Essential:</strong> Cần thiết cho hoạt động cơ bản</li>
                  <li><strong>Functional:</strong> Ghi nhớ tùy chọn người dùng</li>
                  <li><strong>Analytics:</strong> Phân tích cách sử dụng website</li>
                  <li><strong>Marketing:</strong> Hiển thị quảng cáo phù hợp</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">7.2. Quản lý cookie:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Tắt cookie trong cài đặt trình duyệt</li>
                  <li>Sử dụng chế độ ẩn danh/riêng tư</li>
                  <li>Xóa cookie đã lưu trữ</li>
                  <li>Chọn loại cookie muốn chấp nhận</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Lưu trữ và xóa dữ liệu */}
          <Card className="backdrop-blur-sm bg-white/80 shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-900">
                <Database className="w-5 h-5 mr-2" />
                8. Lưu Trữ và Xóa Dữ Liệu
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-800 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">8.1. Thời gian lưu trữ:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Thông tin tài khoản: Cho đến khi hủy tài khoản</li>
                  <li>Dữ liệu giao dịch: 7 năm theo quy định</li>
                  <li>Logs hệ thống: 2 năm</li>
                  <li>Cookie: Tối đa 2 năm</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">8.2. Xóa dữ liệu:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Tự động xóa khi hết thời hạn</li>
                  <li>Xóa theo yêu cầu của người dùng</li>
                  <li>Xóa an toàn không thể khôi phục</li>
                  <li>Thông báo xác nhận sau khi xóa</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Liên hệ */}
          <Card className="backdrop-blur-sm bg-white/80 shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-900">
                <Shield className="w-5 h-5 mr-2" />
                9. Liên Hệ và Hỗ Trợ
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-800 space-y-2">
              <p>Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ:</p>
              <div className="mt-4 space-y-2">
                <p><strong>Data Protection Officer:</strong> privacy@checkafe.com</p>
                <p><strong>Hotline bảo mật:</strong> 1900-SAFE (1900-7233)</p>
                <p><strong>Địa chỉ:</strong> Tầng 15, Tòa nhà FPT, Cầu Giấy, Hà Nội</p>
                <p><strong>Thời gian hỗ trợ:</strong> 24/7 cho vấn đề bảo mật khẩn cấp</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pb-8">
          <p className="text-amber-600 text-sm mb-4">
            Chính sách này có thể được cập nhật. Chúng tôi sẽ thông báo khi có thay đổi quan trọng.
          </p>
          <div className="space-x-4">
            <Link href="/register">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                Quay lại đăng ký
              </Button>
            </Link>
            <Link href="/terms">
              <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                Xem Điều khoản sử dụng
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 