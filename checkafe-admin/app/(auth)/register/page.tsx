"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { register } from "@/lib/store/slices/authSlice"
import { AppDispatch, RootState } from "@/lib/store"
import { toast } from "sonner"

interface RegisterFormData {
  shopName: string
  ownerName: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  address: string
  city: string
  cityCode: string
  district: string
  districtCode: string
  ward: string
  description: string
  category: string
  agreeTerms: boolean
}

interface Province {
  _id: string
  name: string
  name_with_type: string
  code: string
}

interface District {
  _id: string
  name: string
  name_with_type: string
  code: string
  parent_code: string
}

interface Ward {
  _id: string
  name: string
  name_with_type: string
  code: string
  parent_code: string
}

export default function RegisterPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { loading } = useSelector((state: RootState) => state.auth)
  const [formData, setFormData] = useState<RegisterFormData>({
    shopName: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    cityCode: '',
    district: '',
    districtCode: '',
    ward: '',
    description: '',
    category: '',
    agreeTerms: false
  })

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({})
  
  // Address data states
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  
  // Loading states for address
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingWards, setLoadingWards] = useState(false)

  // Helper functions for localStorage
  const getStoredData = (key: string) => {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem(key)
      if (!stored) return null
      
      const parsed = JSON.parse(stored)
      // Check if data is expired (7 days)
      const now = new Date().getTime()
      if (now - parsed.timestamp > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(key)
        return null
      }
      return parsed.data
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  }

  const setStoredData = (key: string, data: any) => {
    if (typeof window === 'undefined') return
    try {
      const toStore = {
        data,
        timestamp: new Date().getTime()
      }
      localStorage.setItem(key, JSON.stringify(toStore))
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  }

  const clearAddressCache = () => {
    if (typeof window === 'undefined') return
    try {
      // Clear all address-related cache
      const keys = Object.keys(localStorage).filter(key => key.startsWith('checkafe_'))
      keys.forEach(key => localStorage.removeItem(key))
      console.log('Address cache cleared')
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }

  // API functions for address data with localStorage caching
  const fetchProvinces = async () => {
    // Check localStorage first
    const cachedProvinces = getStoredData('checkafe_provinces')
    if (cachedProvinces) {
      setProvinces(cachedProvinces)
      return
    }

    setLoadingProvinces(true)
    try {
      const response = await fetch('https://vn-public-apis.fpo.vn/provinces/getAll?limit=-1')
      const data = await response.json()
      if (data.exitcode === 1 && data.data?.data) {
        setProvinces(data.data.data)
        // Cache to localStorage
        setStoredData('checkafe_provinces', data.data.data)
      }
    } catch (error) {
      console.error('Error fetching provinces:', error)
      toast.error('Lỗi khi tải danh sách tỉnh/thành phố')
    } finally {
      setLoadingProvinces(false)
    }
  }

  const fetchDistricts = async (provinceCode: string) => {
    if (!provinceCode) return
    
    // Check localStorage first
    const cacheKey = `checkafe_districts_${provinceCode}`
    const cachedDistricts = getStoredData(cacheKey)
    if (cachedDistricts) {
      setDistricts(cachedDistricts)
      return
    }

    setLoadingDistricts(true)
    try {
      const response = await fetch(`https://vn-public-apis.fpo.vn/districts/getByProvince?provinceCode=${provinceCode}&limit=-1`)
      const data = await response.json()
      if (data.exitcode === 1 && data.data?.data) {
        setDistricts(data.data.data)
        // Cache to localStorage
        setStoredData(cacheKey, data.data.data)
      }
    } catch (error) {
      console.error('Error fetching districts:', error)
      toast.error('Lỗi khi tải danh sách quận/huyện')
    } finally {
      setLoadingDistricts(false)
    }
  }

  const fetchWards = async (districtCode: string) => {
    if (!districtCode) return
    
    // Check localStorage first
    const cacheKey = `checkafe_wards_${districtCode}`
    const cachedWards = getStoredData(cacheKey)
    if (cachedWards) {
      setWards(cachedWards)
      return
    }

    setLoadingWards(true)
    try {
      const response = await fetch(`https://vn-public-apis.fpo.vn/wards/getByDistrict?districtCode=${districtCode}&limit=-1`)
      const data = await response.json()
      if (data.exitcode === 1 && data.data?.data) {
        setWards(data.data.data)
        // Cache to localStorage
        setStoredData(cacheKey, data.data.data)
      }
    } catch (error) {
      console.error('Error fetching wards:', error)
      toast.error('Lỗi khi tải danh sách phường/xã')
    } finally {
      setLoadingWards(false)
    }
  }

  // Load provinces on component mount
  useEffect(() => {
    fetchProvinces()
  }, [])

  // Load districts when city changes
  useEffect(() => {
    if (formData.cityCode) {
      fetchDistricts(formData.cityCode)
      // Reset district and ward when city changes
      setFormData(prev => ({ ...prev, district: '', districtCode: '', ward: '' }))
      setWards([])
    }
  }, [formData.cityCode])

  // Load wards when district changes
  useEffect(() => {
    if (formData.districtCode) {
      fetchWards(formData.districtCode)
      // Reset ward when district changes
      setFormData(prev => ({ ...prev, ward: '' }))
    } else {
      // Clear wards if no district selected
      setWards([])
      setFormData(prev => ({ ...prev, ward: '' }))
    }
  }, [formData.districtCode])

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof RegisterFormData, string>> = {}

    if (!formData.shopName.trim()) {
      errors.shopName = 'Tên shop là bắt buộc'
    }

    if (!formData.ownerName.trim()) {
      errors.ownerName = 'Tên chủ shop là bắt buộc'
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

    if (!formData.city || !formData.cityCode) {
      errors.city = 'Tỉnh/Thành phố là bắt buộc'
    }

    if (!formData.category) {
      errors.category = 'Loại hình kinh doanh là bắt buộc'
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
      shop_name: formData.shopName,
      owner_name: formData.ownerName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      city_code: formData.cityCode,
      district: formData.district,
      district_code: formData.districtCode,
      ward: formData.ward,
      description: formData.description,
      category: formData.category
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

  const categories = [
    'Cafe & Coffee Shop',
    'Quán Trà & Nước Uống',
    'Nhà Hàng',
    'Quán Ăn Vặt',
    'Bar & Pub',
    'Bakery & Dessert',
    'Fast Food',
    'Khác'
  ]

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
                  <Label htmlFor="shopName" className="text-amber-900">
                    Tên Shop <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="shopName" 
                    type="text" 
                    placeholder="Cafe ABC..."
                    value={formData.shopName}
                    onChange={(e) => handleInputChange('shopName', e.target.value)}
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                  {formErrors.shopName && (
                    <p className="text-sm text-red-500">{formErrors.shopName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerName" className="text-amber-900">
                    Tên chủ shop <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="ownerName" 
                    type="text" 
                    placeholder="Nguyễn Văn A..."
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                  {formErrors.ownerName && (
                    <p className="text-sm text-red-500">{formErrors.ownerName}</p>
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

            {/* Thông tin địa chỉ */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-amber-900 border-b border-amber-200 pb-2">
                Địa chỉ Shop
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="address" className="text-amber-900">
                  Địa chỉ cụ thể <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="address" 
                  type="text" 
                  placeholder="123 Đường ABC, Phường/Xã..."
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                />
                {formErrors.address && (
                  <p className="text-sm text-red-500">{formErrors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-amber-900">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.cityCode} 
                    onValueChange={(value) => {
                      const selectedProvince = provinces.find(p => p.code === value)
                      if (selectedProvince) {
                        setFormData(prev => ({
                          ...prev,
                          city: selectedProvince.name_with_type,
                          cityCode: selectedProvince.code
                        }))
                      }
                    }}
                    disabled={loadingProvinces}
                  >
                    <SelectTrigger className="border-amber-200 focus:border-amber-500 focus:ring-amber-500">
                      <SelectValue placeholder={loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"} />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province.code} value={province.code}>
                          {province.name_with_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.city && (
                    <p className="text-sm text-red-500">{formErrors.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district" className="text-amber-900">
                    Quận/Huyện
                  </Label>
                  <Select 
                    value={formData.districtCode} 
                    onValueChange={(value) => {
                      const selectedDistrict = districts.find(d => d.code === value)
                      if (selectedDistrict) {
                        setFormData(prev => ({
                          ...prev,
                          district: selectedDistrict.name_with_type,
                          districtCode: selectedDistrict.code
                        }))
                      }
                    }}
                    disabled={loadingDistricts || !formData.cityCode}
                  >
                    <SelectTrigger className="border-amber-200 focus:border-amber-500 focus:ring-amber-500">
                      <SelectValue placeholder={
                        !formData.cityCode ? "Chọn tỉnh/thành phố trước" :
                        loadingDistricts ? "Đang tải..." : 
                        "Chọn quận/huyện"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district.code} value={district.code}>
                          {district.name_with_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ward" className="text-amber-900">
                  Phường/Xã
                </Label>
                <Select 
                  value={formData.ward} 
                  onValueChange={(value) => {
                    setFormData(prev => ({
                      ...prev,
                      ward: value
                    }))
                  }}
                  disabled={loadingWards || !formData.districtCode}
                >
                  <SelectTrigger className="border-amber-200 focus:border-amber-500 focus:ring-amber-500">
                    <SelectValue placeholder={
                      !formData.districtCode ? "Chọn quận/huyện trước" :
                      loadingWards ? "Đang tải..." : 
                      "Chọn phường/xã"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((ward) => (
                      <SelectItem key={ward.code} value={ward.name_with_type}>
                        {ward.name_with_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Thông tin kinh doanh */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-amber-900 border-b border-amber-200 pb-2">
                Thông tin kinh doanh
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="category" className="text-amber-900">
                  Loại hình kinh doanh <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger className="border-amber-200 focus:border-amber-500 focus:ring-amber-500">
                    <SelectValue placeholder="Chọn loại hình kinh doanh" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.category && (
                  <p className="text-sm text-red-500">{formErrors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-amber-900">
                  Mô tả shop
                </Label>
                <Textarea 
                  id="description" 
                  placeholder="Mô tả ngắn về shop của bạn..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="border-amber-200 focus:border-amber-500 focus:ring-amber-500 min-h-[100px]"
                />
              </div>
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
