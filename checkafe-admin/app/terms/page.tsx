"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, Users, Store, Coffee } from "lucide-react"

export default function TermsPage() {
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
              Điều Khoản Sử Dụng
            </h1>
            <p className="text-amber-700">
              Áp dụng cho hệ thống quản lý ChecKafe
            </p>
            <p className="text-sm text-amber-600 mt-2">
              Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Giới thiệu */}
          <Card className="backdrop-blur-sm bg-white/80 shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-900">
                <Coffee className="w-5 h-5 mr-2" />
                1. Giới Thiệu
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-800 space-y-4">
              <p>
                Chào mừng bạn đến với <strong>ChecKafe</strong> - hệ thống quản lý toàn diện cho các cửa hàng cafe, 
                nhà hàng và dịch vụ ăn uống. Bằng việc sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ 
                các điều khoản và điều kiện được quy định dưới đây.
              </p>
              <p>
                Các điều khoản này áp dụng cho tất cả người dùng, bao gồm chủ cửa hàng, nhân viên, 
                và khách hàng sử dụng hệ thống ChecKafe.
              </p>
            </CardContent>
          </Card>

          {/* Quyền và nghĩa vụ của Shop */}
          <Card className="backdrop-blur-sm bg-white/80 shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-900">
                <Store className="w-5 h-5 mr-2" />
                2. Quyền và Nghĩa Vụ Của Shop
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-800 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">2.1. Quyền của Shop:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Quản lý thông tin menu, giá cả, và dịch vụ</li>
                  <li>Theo dõi đặt chỗ và quản lý khách hàng</li>
                  <li>Truy cập báo cáo doanh thu và thống kê</li>
                  <li>Sử dụng các tính năng marketing và khuyến mãi</li>
                  <li>Nhận hỗ trợ kỹ thuật từ đội ngũ ChecKafe</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2.2. Nghĩa vụ của Shop:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Cung cấp thông tin chính xác và cập nhật</li>
                  <li>Duy trì chất lượng dịch vụ theo cam kết</li>
                  <li>Tuân thủ các quy định pháp luật về kinh doanh</li>
                  <li>Bảo mật thông tin khách hàng</li>
                  <li>Thanh toán phí dịch vụ đúng hạn</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Sử dụng dịch vụ */}
          <Card className="backdrop-blur-sm bg-white/80 shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-900">
                <Users className="w-5 h-5 mr-2" />
                3. Quy Định Sử Dụng Dịch Vụ
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-800 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">3.1. Tài khoản và bảo mật:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Mỗi shop chỉ được tạo một tài khoản chính</li>
                  <li>Bảo mật thông tin đăng nhập và không chia sẻ cho bên thứ ba</li>
                  <li>Thông báo ngay khi phát hiện tài khoản bị xâm nhập</li>
                  <li>Sử dụng mật khẩu mạnh và thay đổi định kỳ</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3.2. Nội dung và hình ảnh:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Không đăng tải nội dung vi phạm pháp luật</li>
                  <li>Sử dụng hình ảnh có bản quyền hoặc tự chụp</li>
                  <li>Thông tin menu phải chính xác và cập nhật</li>
                  <li>Không sử dụng từ ngữ phân biệt đối xử</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Thanh toán và hoàn tiền */}
          <Card className="backdrop-blur-sm bg-white/80 shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-900">
                <Shield className="w-5 h-5 mr-2" />
                4. Thanh Toán và Hoàn Tiền
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-800 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">4.1. Phí dịch vụ:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Phí đăng ký: Miễn phí trong giai đoạn thử nghiệm</li>
                  <li>Phí sử dụng hàng tháng: Theo gói dịch vụ đã chọn</li>
                  <li>Phí giao dịch: 2% trên mỗi đơn hàng online</li>
                  <li>Thanh toán qua chuyển khoản hoặc ví điện tử</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4.2. Chính sách hoàn tiền:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Hoàn tiền trong 7 ngày nếu không hài lòng</li>
                  <li>Không hoàn tiền phí giao dịch đã phát sinh</li>
                  <li>Hoàn tiền qua cùng phương thức thanh toán</li>
                  <li>Thời gian xử lý: 5-7 ngày làm việc</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Trách nhiệm và giới hạn */}
          <Card className="backdrop-blur-sm bg-white/80 shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-900">
                <Shield className="w-5 h-5 mr-2" />
                5. Trách Nhiệm và Giới Hạn
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-800 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">5.1. Trách nhiệm của ChecKafe:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Cung cấp dịch vụ ổn định và bảo mật</li>
                  <li>Hỗ trợ kỹ thuật 24/7</li>
                  <li>Bảo vệ dữ liệu khách hàng</li>
                  <li>Cập nhật và nâng cấp hệ thống</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">5.2. Giới hạn trách nhiệm:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Không chịu trách nhiệm về thiệt hại do mất điện, mạng</li>
                  <li>Không can thiệp vào tranh chấp giữa shop và khách hàng</li>
                  <li>Tổng thiệt hại bồi thường không vượt quá phí dịch vụ 1 tháng</li>
                  <li>Không bảo đảm lợi nhuận cho shop</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Chấm dứt dịch vụ */}
          <Card className="backdrop-blur-sm bg-white/80 shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-900">
                <Shield className="w-5 h-5 mr-2" />
                6. Chấm Dứt Dịch Vụ
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-800 space-y-4">
              <p>
                <strong>6.1. Chấm dứt tự nguyện:</strong> Shop có thể hủy dịch vụ bất kỳ lúc nào 
                bằng cách thông báo trước 30 ngày.
              </p>
              <p>
                <strong>6.2. Chấm dứt do vi phạm:</strong> ChecKafe có quyền tạm ngưng hoặc 
                chấm dứt dịch vụ nếu shop vi phạm điều khoản.
              </p>
              <p>
                <strong>6.3. Xử lý dữ liệu:</strong> Dữ liệu sẽ được lưu trữ thêm 90 ngày 
                sau khi chấm dứt để shop có thể xuất dữ liệu.
              </p>
            </CardContent>
          </Card>

          {/* Liên hệ */}
          <Card className="backdrop-blur-sm bg-white/80 shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-900">
                <Coffee className="w-5 h-5 mr-2" />
                7. Thông Tin Liên Hệ
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-800 space-y-2">
              <p><strong>Công ty:</strong> ChecKafe Technology Co., Ltd</p>
              <p><strong>Email:</strong> support@checkafe.com</p>
              <p><strong>Hotline:</strong> 1900-CAFE (1900-2233)</p>
              <p><strong>Địa chỉ:</strong> Tầng 15, Tòa nhà FPT, Cầu Giấy, Hà Nội</p>
              <p><strong>Website:</strong> https://checkafe.com</p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pb-8">
          <p className="text-amber-600 text-sm mb-4">
            Bằng việc sử dụng dịch vụ ChecKafe, bạn đã đồng ý với các điều khoản trên.
          </p>
          <div className="space-x-4">
            <Link href="/register">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                Quay lại đăng ký
              </Button>
            </Link>
            <Link href="/privacy">
              <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                Xem Chính sách bảo mật
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 