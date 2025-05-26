"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { login } from "@/lib/store/slices/authSlice"
import { AppDispatch, RootState } from "@/lib/store"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector((state: RootState) => state.auth)
  const [activeTab, setActiveTab] = useState<"shop" | "admin">("shop")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const resultAction = await dispatch(login({ email, password }))
      if (login.fulfilled.match(resultAction)) {
        const user = resultAction.payload.user
        toast.success("Đăng nhập thành công!")
        
        // Chuyển hướng dựa vào role
        if (user.role === "ADMIN") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      }
    } catch (error) {
      toast.error("Đăng nhập thất bại!")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-4">
      {/* Background coffee beans pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/coffee-beans-pattern.svg')] bg-repeat"></div>
      </div>

      <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 shadow-xl border-amber-200">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="ChecKafe Logo" 
              className="w-24 h-24 object-contain"
            />
          </div>
          <CardTitle className="text-3xl text-center font-bold text-amber-900">
            Đăng nhập
          </CardTitle>
          <CardDescription className="text-center text-amber-700">
            Đăng nhập vào tài khoản ChecKafe của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="shop" 
            className="w-full"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "shop" | "admin")}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-amber-100">
              <TabsTrigger 
                value="shop"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
              >
                Chủ quán
              </TabsTrigger>
              <TabsTrigger 
                value="admin"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
              >
                Admin
              </TabsTrigger>
            </TabsList>
            <TabsContent value="shop">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-amber-900">Email</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="example@example.com" 
                    required 
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-amber-900">Mật khẩu</Label>
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-amber-600 hover:text-amber-800 hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <Input 
                    id="password" 
                    name="password"
                    type="password" 
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
                      Đang đăng nhập...
                    </div>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="admin">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-amber-900">Email</Label>
                  <Input 
                    id="admin-email" 
                    name="email"
                    type="email" 
                    placeholder="admin@checkafe.com" 
                    required 
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="admin-password" className="text-amber-900">Mật khẩu</Label>
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-amber-600 hover:text-amber-800 hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <Input 
                    id="admin-password" 
                    name="password"
                    type="password" 
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
                      Đang đăng nhập...
                    </div>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-amber-800">
            Chưa có tài khoản?{" "}
            <Link 
              href="/register" 
              className="text-amber-600 hover:text-amber-800 hover:underline font-medium"
            >
              Đăng ký ngay
            </Link>
          </div>
          <div className="text-center text-xs text-amber-600">
            © 2025 ChecKafe. Tất cả các quyền được bảo lưu.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
