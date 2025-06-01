'use client'
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import authorizedAxiosInstance from "@/lib/axios"
import { CreateStaffData } from "../types"

interface CreateStaffModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Shop {
  _id: string
  name: string
}

export function CreateStaffModal({ open, onClose, onSuccess }: CreateStaffModalProps) {
  const [loading, setLoading] = useState(false)
  const [shops, setShops] = useState<Shop[]>([])
  const [formData, setFormData] = useState<CreateStaffData>({
    full_name: '',
    email: '',
    phone: '',
    password: ''
  })

  useEffect(() => {
    if (open) {
      // No need to fetch shops anymore
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.full_name || !formData.email || !formData.password) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    try {
      setLoading(true)
      
      // Create staff user with STAFF role
      const staffData = {
        ...formData,
        role: 'STAFF'
      }
      const myShop = await authorizedAxiosInstance.get('/v1/shops/my-shop')
      const shopId = myShop.data.data.shop._id
      const response = await authorizedAxiosInstance.post(`/v1/shops/${shopId}/staff`, staffData)
      
      if (response.data.status === 200 || response.data.status === 201) {
        toast.success('Tạo nhân viên thành công')
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          password: ''
        })
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error creating staff:', error)
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tạo nhân viên'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      password: ''
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm nhân viên mới</DialogTitle>
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
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Nhập email"
              required
            />
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

          <div>
            <Label htmlFor="password">Mật khẩu *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo nhân viên'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 