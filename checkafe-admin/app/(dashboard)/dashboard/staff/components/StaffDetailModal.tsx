'use client'
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, Calendar, Building2 } from "lucide-react"
import authorizedAxiosInstance from "@/lib/axios"
import { StaffDetailResponse } from "../types"

interface StaffDetailModalProps {
  staffId: string | null
  onClose: () => void
}

export function StaffDetailModal({ staffId, onClose }: StaffDetailModalProps) {
  const [staff, setStaff] = useState<StaffDetailResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (staffId) {
      fetchStaffDetail()
    } else {
      setStaff(null)
    }
  }, [staffId])

  const fetchStaffDetail = async () => {
    if (!staffId) return
    
    try {
      setLoading(true)
      const shopResponse = await authorizedAxiosInstance.get('/v1/shops/my-shop')
      const shopId = shopResponse.data.data.shop._id
      
      const response = await authorizedAxiosInstance.get(`/v1/shops/${shopId}/staff/${staffId}`)
      
      if (response.data.status === 200) {
        setStaff(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching staff detail:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={!!staffId} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chi tiết nhân viên</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="py-8 text-center">Đang tải...</div>
        ) : staff ? (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={staff.avatar} alt={staff.full_name} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {staff.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{staff.full_name}</h3>
                <Badge 
                  variant="outline" 
                  className="bg-blue-50 text-blue-600 border-blue-200 mt-1"
                >
                  {staff.role}
                </Badge>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Thông tin liên hệ</h4>
              
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{staff.email}</span>
              </div>
              
              {staff.phone && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{staff.phone}</span>
                </div>
              )}
            </div>


            {/* Status */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Trạng thái</h4>
              
              <div className="flex items-center gap-3">
                {staff.is_active ? (
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    Đang hoạt động
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                    Tạm ngưng
                  </Badge>
                )}
              </div>
            </div>

            {/* Created Date */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Thông tin tài khoản</h4>
              
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  Ngày tạo: {new Date(staff.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            Không thể tải thông tin nhân viên
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 