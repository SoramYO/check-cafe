'use client'
import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import authorizedAxiosInstance from "@/lib/axios"
import { User, UserDetailResponse } from "../types"

interface EditUserModalProps {
  userId: string | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface EditUserForm {
  full_name: string
  email: string
  role: "ADMIN" | "CUSTOMER" | "SHOP_OWNER"
  is_active: boolean
  phone?: string
  vip_status?: boolean
  points?: number
}

export function EditUserModal({ userId, open, onClose, onSuccess }: EditUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<EditUserForm>({
    full_name: "",
    email: "",
    role: "CUSTOMER",
    is_active: true,
    phone: "",
    vip_status: false,
    points: 0
  })

  useEffect(() => {
    if (userId && open) {
      fetchUserDetails()
    }
  }, [userId, open])

  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      const response = await authorizedAxiosInstance.get<UserDetailResponse>(`/v1/admin/users/${userId}`)
      if (response.data.status === 200) {
        const user = response.data.data.user
        setFormData({
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          is_active: user.is_active,
          phone: user.phone || "",
          vip_status: user.vip_status || false,
          points: user.points || 0
        })
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
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
      const response = await authorizedAxiosInstance.put(`/v1/admin/users/${userId}`, formData)
      if (response.data.status === 200) {
        toast.success('Cập nhật người dùng thành công')
        onSuccess()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật người dùng')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center">Đang tải...</div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="full_name" className="text-right">
                  Họ và tên
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Số điện thoại
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Vai trò
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange('role', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SHOP_OWNER">Chủ quán</SelectItem>
                    <SelectItem value="CUSTOMER">Khách hàng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="points" className="text-right">
                  Điểm
                </Label>
                <Input
                  id="points"
                  name="points"
                  type="number"
                  value={formData.points}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="is_active" className="text-right">
                  Trạng thái
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                  />
                  <Label htmlFor="is_active">
                    {formData.is_active ? 'Hoạt động' : 'Tạm ngưng'}
                  </Label>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vip_status" className="text-right">
                  VIP
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="vip_status"
                    checked={formData.vip_status}
                    onCheckedChange={(checked) => handleSwitchChange('vip_status', checked)}
                  />
                  <Label htmlFor="vip_status">
                    {formData.vip_status ? 'VIP' : 'Thường'}
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button onClick={handleUpdateUser}>Lưu thay đổi</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 