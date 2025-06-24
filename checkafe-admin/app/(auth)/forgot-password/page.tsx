"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail } from "lucide-react"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error("Vui lòng nhập email")
      return
    }

    try {
      setLoading(true)
      // TODO: Implement forgot password API call
      // const response = await axios.post('/api/auth/forgot-password', { email })
      
      toast.success("Email khôi phục mật khẩu đã được gửi!")
      router.push("/login")
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Mail className="h-6 w-6 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-amber-900">
            Quên mật khẩu
          </CardTitle>
          <CardDescription className="text-amber-700">
            Nhập email của bạn để nhận link khôi phục mật khẩu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-amber-900">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@checkafe.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white transition-colors duration-200"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang gửi...
                </div>
              ) : (
                "Gửi email khôi phục"
              )}
            </Button>
            
            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-800 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 