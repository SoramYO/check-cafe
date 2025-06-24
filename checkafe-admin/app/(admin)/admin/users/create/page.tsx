'use client'
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Shield, Coffee, Eye, EyeOff, ArrowLeft } from "lucide-react"
import authorizedAxiosInstance from "@/lib/axios"

interface CreateUserForm {
  full_name: string
  email: string
  password: string
  role: "ADMIN" | "CUSTOMER" | "SHOP_OWNER"
  phone?: string
}

const roleOptions = [
  {
    value: "CUSTOMER",
    label: "Khách hàng",
    description: "Người dùng thông thường có thể đặt chỗ tại các quán",
    icon: User,
    color: "bg-blue-500"
  },
  {
    value: "SHOP_OWNER", 
    label: "Chủ quán",
    description: "Quản lý quán cà phê, nhận đặt chỗ và quản lý dịch vụ",
    icon: Coffee,
    color: "bg-amber-500"
  },
  {
    value: "ADMIN",
    label: "Quản trị viên", 
    description: "Quản lý toàn bộ hệ thống và người dùng",
    icon: Shield,
    color: "bg-red-500"
  }
]

export default function CreateUserPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<CreateUserForm>({
    full_name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
    phone: ""
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCreateUser = async () => {
    try {
      setLoading(true)
      
      // Validate form
      if (!formData.full_name || !formData.email || !formData.password) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
        return
      }

      const response = await authorizedAxiosInstance.post('/v1/admin/users', formData)
      
      if (response.data.code === "201") {
        toast.success('Tạo người dùng thành công')
        router.push('/admin/users')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo người dùng mới')
    } finally {
      setLoading(false)
    }
  }

  const selectedRole = roleOptions.find(role => role.value === formData.role)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Thêm người dùng mới</h1>
          <p className="text-muted-foreground">Tạo tài khoản người dùng mới trên hệ thống</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Role Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Vai trò người dùng
              </CardTitle>
              <CardDescription>Chọn vai trò phù hợp cho người dùng mới</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3">
                {roleOptions.map((role) => {
                  const Icon = role.icon
                  const isSelected = formData.role === role.value
                  return (
                    <Card 
                      key={role.value}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'ring-2 ring-primary border-primary' : 'border-gray-200'
                      }`}
                      onClick={() => handleSelectChange('role', role.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${role.color} text-white`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{role.label}</h3>
                              {isSelected && (
                                <Badge variant="default" className="text-xs">Đã chọn</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cá nhân
              </CardTitle>
              <CardDescription>Nhập thông tin chi tiết của người dùng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Họ và tên *</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    placeholder="Nhập họ và tên"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Nhập số điện thoại"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Nhập địa chỉ email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Mật khẩu phải có ít nhất 6 ký tự</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Role Summary */}
          {selectedRole && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Vai trò được chọn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${selectedRole.color} text-white`}>
                    <selectedRole.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedRole.label}</p>
                    <p className="text-sm text-gray-600">{selectedRole.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleCreateUser} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Đang tạo..." : "Tạo người dùng"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="w-full"
              >
                Hủy
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 