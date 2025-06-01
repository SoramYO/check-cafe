'use client'
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import authorizedAxiosInstance from "@/lib/axios"
import { UpdateStaffData, Staff } from "../types"

interface EditStaffModalProps {
  open: boolean
  staffId: string | null
  onClose: () => void
  onSuccess: () => void
}

interface Shop {
  _id: string
  name: string
}

export function EditStaffModal({ open, staffId, onClose, onSuccess }: EditStaffModalProps) {
  const [loading, setLoading] = useState(false)
  const [shops, setShops] = useState<Shop[]>([])
  const [staff, setStaff] = useState<Staff | null>(null)
  const [formData, setFormData] = useState<UpdateStaffData>({
    full_name: '',
    phone: '',
    is_active: true
  })

  useEffect(() => {
    if (open && staffId) {
      fetchStaff()
    }
  }, [open, staffId])

  const fetchStaff = async () => {
    if (!staffId) return

    const shopResponse = await authorizedAxiosInstance.get('/v1/shops/my-shop')
    const shopId = shopResponse.data.data.shop._id
    try {
      const response = await authorizedAxiosInstance.get(`/v1/shops/${shopId}/staff/${staffId}`)
      if (response.data.status === 200) {
        const staffData = response.data.data
        setStaff(staffData)
        setFormData({
          full_name: staffData.full_name || '',
          phone: staffData.phone || '',
          is_active: staffData.is_active ?? true
        })
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
      toast.error('Không thể tải thông tin nhân viên')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!staffId || !formData.full_name) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    try {
      setLoading(true)
      
      // Update staff user info
      const updateData = {
        full_name: formData.full_name,
        phone: formData.phone,
        is_active: formData.is_active
      }

      // Get shop ID for the endpoint
      const shopResponse = await authorizedAxiosInstance.get('/v1/shops/my-shop')
      const shopId = shopResponse.data.data.shop._id

      const response = await authorizedAxiosInstance.patch(`/v1/shops/${shopId}/staff/${staffId}`, updateData)
      
      if (response.data.status === 200) {
        toast.success('Cập nhật nhân viên thành công')
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error updating staff:', error)
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật nhân viên'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStaff(null)
    setFormData({
      full_name: '',
      phone: '',
      is_active: true
    })
    onClose()
  }

  if (!staff) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa nhân viên</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="full_name">Họ và tên *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={staff.email}
              disabled
              className="bg-gray-50"
            />
            <p className="text-sm text-gray-500 mt-1">Email không thể thay đổi</p>
          </div>

          <div>
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Nhập số điện thoại"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Trạng thái hoạt động</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 