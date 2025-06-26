'use client'
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Shield, Coffee, ArrowLeft, Save, UserCheck, Eye, EyeOff, Key } from "lucide-react"
import authorizedAxiosInstance from "@/lib/axios"
import { UserDetailResponse } from "../../types"

interface EditUserForm {
  full_name: string
  role: "ADMIN" | "CUSTOMER" | "SHOP_OWNER"
  is_active: boolean
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

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [formData, setFormData] = useState<EditUserForm>({
    full_name: "",
    role: "CUSTOMER",
    is_active: true,
    phone: ""
  })

  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchUserDetails()
    }
  }, [userId])

  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      
      const response = await authorizedAxiosInstance.get(`/v1/admin/users/${userId}`)
    
      const responseData = response.data as any
      if (responseData.code && responseData.code !== "200") {
        toast.error(responseData.message || 'Không thể tải thông tin người dùng')
        return
      }
      
      const user = responseData as UserDetailResponse
      
      if (!user || !user._id) {
        return
      }
      
      setUserEmail(user.email || '')
      setFormData({
        full_name: user.full_name || '',
        role: (user.role as "ADMIN" | "CUSTOMER" | "SHOP_OWNER") || "CUSTOMER",
        is_active: user.is_active !== undefined ? user.is_active : true,
        phone: user.phone || ""
      })
      

    } catch (error: any) {
      toast.error('Không thể tải thông tin người dùng')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdateUser = async () => {
    try {
      setLoading(true)
      const response = await authorizedAxiosInstance.put(`/v1/admin/users/${userId}`, formData)
      if (response.data.status === 200 || response.data.code === "200") {
        toast.success('Cập nhật người dùng thành công')
        router.push('/admin/users')
      }
    } catch (err: any) {
      console.error('Error updating user:', err)
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật người dùng')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }

    try {
      setChangingPassword(true)
      const response = await authorizedAxiosInstance.patch(`/v1/admin/users/${userId}/password`, {
        newPassword
      })
      
      if (response.data.code === "200") {
        toast.success('Đổi mật khẩu thành công')
        setShowPasswordModal(false)
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(response.data.message || 'Có lỗi xảy ra khi đổi mật khẩu')
      }
    } catch (err: any) {
      console.error('Error changing password:', err)
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu')
    } finally {
      setChangingPassword(false)
    }
  }

  const selectedRole = roleOptions.find(role => role.value === formData.role)

  if (loading && !userEmail) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải thông tin người dùng...</p>
        </div>
      </div>
    )
  }

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
          <h1 className="text-3xl font-bold">Chỉnh sửa người dùng</h1>
          <p className="text-muted-foreground">Cập nhật thông tin người dùng</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cá nhân
              </CardTitle>
              <CardDescription>Cập nhật thông tin chi tiết của người dùng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={userEmail}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Email không thể thay đổi</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Họ và tên *</Label>
                  <Input
                    id="full_name"
                    name="full_name"
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
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role and Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Vai trò và trạng thái
              </CardTitle>
              <CardDescription>Quản lý vai trò và trạng thái hoạt động</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label>Vai trò người dùng</Label>
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
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Trạng thái hoạt động</Label>
                  <p className="text-sm text-gray-500">
                    {formData.is_active ? 'Người dùng có thể đăng nhập và sử dụng hệ thống' : 'Người dùng bị tạm ngưng và không thể đăng nhập'}
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                />
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
                <CardTitle className="text-lg">Vai trò hiện tại</CardTitle>
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

          {/* Status Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trạng thái</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${formData.is_active ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">
                    {formData.is_active ? 'Đang hoạt động' : 'Tạm ngưng'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formData.is_active ? 'Người dùng có thể đăng nhập' : 'Người dùng không thể đăng nhập'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleUpdateUser} 
                disabled={loading}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setShowPasswordModal(true)}
                className="w-full"
              >
                <Key className="h-4 w-4 mr-2" />
                Đổi mật khẩu
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

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Đổi mật khẩu người dùng
              </CardTitle>
              <CardDescription>
                Đặt mật khẩu mới cho {userEmail}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
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

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleChangePassword}
                  disabled={changingPassword || !newPassword || !confirmPassword}
                  className="flex-1"
                >
                  {changingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowPasswordModal(false)
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                  disabled={changingPassword}
                >
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 