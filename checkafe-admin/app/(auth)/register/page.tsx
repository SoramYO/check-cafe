"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { register } from "@/lib/store/slices/authSlice"
import { AppDispatch, RootState } from "@/lib/store"
import { toast } from "sonner"
import { MapPin, Phone, Globe } from "lucide-react"

interface RegisterFormData {
  name: string
  description: string
  address: string
  phone: string
  website: string
  latitude: number | string
  longitude: number | string
  owner_name: string
  email: string
  password: string
  confirmPassword: string
  city: string
  city_code: string
  district: string
  district_code: string
  ward: string
  category: string
  amenities: string[]
  theme_ids: string[]
  opening_hours: {
    day: number
    is_closed: boolean
    hours?: { open: string; close: string }[]
  }[]
  agreeTerms: boolean
}

const defaultOpeningHours = [
  { day: 0, is_closed: true },
  { day: 1, is_closed: false, hours: [{ open: "08:00", close: "22:00" }] },
  { day: 2, is_closed: false, hours: [{ open: "08:00", close: "22:00" }] },
  { day: 3, is_closed: false, hours: [{ open: "08:00", close: "22:00" }] },
  { day: 4, is_closed: false, hours: [{ open: "08:00", close: "22:00" }] },
  { day: 5, is_closed: false, hours: [{ open: "08:00", close: "22:00" }] },
  { day: 6, is_closed: false, hours: [{ open: "08:00", close: "22:00" }] }
]

export default function RegisterPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { loading } = useSelector((state: RootState) => state.auth)
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    latitude: '',
    longitude: '',
    owner_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    city_code: '',
    district: '',
    district_code: '',
    ward: '',
    category: '',
    amenities: ["6820f0e5628427b63b334ad3", "6820f0e5628427b63b334ad7"],
    theme_ids: ["682074de420997d7051394ba"],
    opening_hours: defaultOpeningHours,
    agreeTerms: false
  })

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({})

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof RegisterFormData, string>> = {}

    if (!formData.name.trim()) {
      errors.name = 'Tên shop là bắt buộc'
    }

    if (!formData.owner_name.trim()) {
      errors.owner_name = 'Tên chủ shop là bắt buộc'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email là bắt buộc'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email không hợp lệ'
    }

    if (!formData.password) {
      errors.password = 'Mật khẩu là bắt buộc'
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Số điện thoại là bắt buộc'
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s+/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ'
    }

    if (!formData.address.trim()) {
      errors.address = 'Địa chỉ là bắt buộc'
    }

    if (!formData.website.trim()) {
      errors.website = 'Website là bắt buộc'
    }

    if (!formData.latitude || !formData.longitude) {
      errors.latitude = 'Tọa độ là bắt buộc'
    }

    if (!formData.agreeTerms) {
      errors.agreeTerms = 'Bạn phải đồng ý với điều khoản sử dụng'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: keyof RegisterFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Xóa lỗi khi user bắt đầu sửa
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin")
      return
    }

    const registerData = {
      name: formData.name,
      description: formData.description,
      address: formData.address,
      phone: formData.phone,
      website: formData.website,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      owner_name: formData.owner_name,
      email: formData.email,
      password: formData.password,
      city: formData.city,
      city_code: formData.city_code,
      district: formData.district,
      district_code: formData.district_code,
      ward: formData.ward,
      category: formData.category,
      amenities: formData.amenities,
      theme_ids: formData.theme_ids,
      opening_hours: formData.opening_hours
    }

    try {
      const resultAction = await dispatch(register(registerData))
      if (register.fulfilled.match(resultAction)) {
        toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.")
        router.push('/login')
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error('Đăng ký thất bại, vui lòng thử lại')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-4">
      {/* Background coffee beans pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/coffee-beans-pattern.svg')] bg-repeat"></div>
      </div>

      <Card className="w-full max-w-2xl backdrop-blur-sm bg-white/80 shadow-xl border-amber-200">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="ChecKafe Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <CardTitle className="text-3xl text-center font-bold text-amber-900">
            Đăng ký Shop
          </CardTitle>
          <CardDescription className="text-center text-amber-700">
            Tạo tài khoản ChecKafe để quản lý shop của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Thông tin cơ bản */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-amber-900 border-b border-amber-200 pb-2">
                Thông tin cơ bản
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-amber-900">
                    Tên Shop <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="Cafe ABC..."
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner_name" className="text-amber-900">
                    Tên chủ shop <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="owner_name" 
                    type="text" 
                    placeholder="Nguyễn Văn A..."
                    value={formData.owner_name}
                    onChange={(e) => handleInputChange('owner_name', e.target.value)}
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                  {formErrors.owner_name && (
                    <p className="text-sm text-red-500">{formErrors.owner_name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-amber-900">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="example@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-amber-900">
                    Số điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                  {formErrors.phone && (
                    <p className="text-sm text-red-500">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-amber-900">
                    Mật khẩu <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Tối thiểu 6 ký tự"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                  {formErrors.password && (
                    <p className="text-sm text-red-500">{formErrors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-amber-900">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Thông tin quán */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-amber-900 border-b border-amber-200 pb-2">
                Thông tin quán
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-amber-900">
                  Mô tả <span className="text-red-500">*</span>
                </Label>
                <Textarea 
                  id="description" 
                  placeholder="Mô tả về quán cà phê"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address" className="text-amber-900">
                  Địa chỉ <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    id="address" 
                    type="text" 
                    placeholder="123 Đường ABC, Phường/Xã..."
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500 pl-10"
                  />
                </div>
                {formErrors.address && (
                  <p className="text-sm text-red-500">{formErrors.address}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website" className="text-amber-900">
                  Website <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    id="website" 
                    type="url" 
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500 pl-10"
                  />
                </div>
                {formErrors.website && (
                  <p className="text-sm text-red-500">{formErrors.website}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-amber-900">
                    Vĩ độ <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="latitude" 
                    type="number" 
                    step="any"
                    placeholder="10.762622"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-amber-900">
                    Kinh độ <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="longitude" 
                    type="number" 
                    step="any"
                    placeholder="106.660172"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
              {formErrors.latitude && (
                <p className="text-sm text-red-500">{formErrors.latitude}</p>
              )}
            </div>

            {/* Điều khoản */}
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => handleInputChange('agreeTerms', !!checked)}
                  className="border-amber-300 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                />
                <div className="text-sm text-amber-800">
                  <Label htmlFor="agreeTerms" className="cursor-pointer">
                    Tôi đồng ý với{" "}
                    <Link href="/terms" className="text-amber-600 hover:text-amber-800 hover:underline">
                      Điều khoản sử dụng
                    </Link>
                    {" "}và{" "}
                    <Link href="/privacy" className="text-amber-600 hover:text-amber-800 hover:underline">
                      Chính sách bảo mật
                    </Link>
                    {" "}của ChecKafe <span className="text-red-500">*</span>
                  </Label>
                </div>
              </div>
              {formErrors.agreeTerms && (
                <p className="text-sm text-red-500">{formErrors.agreeTerms}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-amber-600 hover:bg-amber-700 text-white transition-colors duration-200" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang đăng ký...
                </div>
              ) : (
                "Đăng ký Shop"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-amber-800">
            Đã có tài khoản?{" "}
            <Link 
              href="/login" 
              className="text-amber-600 hover:text-amber-800 hover:underline font-medium"
            >
              Đăng nhập ngay
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
