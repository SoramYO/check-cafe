import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-4">
      {/* Background coffee beans pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/coffee-beans-pattern.svg')] bg-repeat"></div>
      </div>

      <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 shadow-xl border-amber-200">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-amber-600">404</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-amber-900">
            Trang không tồn tại
          </CardTitle>
          <CardDescription className="text-amber-700">
            Trang bạn đang tìm kiếm không tồn tại hoặc bạn không có quyền truy cập.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
              <Link href="/" className="flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                Về trang chủ
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-amber-200 text-amber-700 hover:bg-amber-50">
              <Link href="/login" className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Đăng nhập lại
              </Link>
            </Button>
          </div>
          <div className="text-center text-xs text-amber-600 mt-6">
            © 2025 ChecKafe. Tất cả các quyền được bảo lưu.
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 