'use client'
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Advertisement } from "../types"
import { Edit, Trash2, CalendarDays, Clock, Tag, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import authorizedAxiosInstance from "@/lib/axios"
import { toast } from "sonner"

interface AdvertisementDetailModalProps {
  advertisement: Advertisement | null
  isOpen: boolean
  onClose: () => void
  onEdit: (advertisementId: string) => void
  onDelete: (advertisementId: string) => void
  onSuccess?: () => void
}

const iconMap: Record<string, React.ReactNode> = {
  star: <span className="text-yellow-500">★</span>,
  calendar: <CalendarDays className="h-4 w-4" />,
  clock: <Clock className="h-4 w-4" />,
  tag: <Tag className="h-4 w-4" />,
};

export function AdvertisementDetailModal({ 
  advertisement, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete,
  onSuccess
}: AdvertisementDetailModalProps) {
  const [updating, setUpdating] = useState(false);
  
  if (!advertisement) return null

  // Function to render type badge
  const renderTypeBadge = (type: string) => {
    switch (type) {
      case "promotion":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            Khuyến mãi
          </Badge>
        )
      case "event":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            Sự kiện
          </Badge>
        )
      case "news":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
            Tin tức
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
            {type}
          </Badge>
        )
    }
  }
  
  // Function to render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Đã duyệt
          </Badge>
        )
      case "Rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
            <XCircle className="h-3 w-3 mr-1" /> Từ chối
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
            Chờ duyệt
          </Badge>
        )
    }
  }
  
  const handleUpdateStatus = async (status: string) => {
    if (!advertisement) return;
    
    try {
      setUpdating(true);
      const response = await authorizedAxiosInstance.patch(`/v1/advertisements/${advertisement._id}`, {
        status
      });
      
      if (response.data.status === 200) {
        toast.success(`Đã ${status === 'Approved' ? 'phê duyệt' : 'từ chối'} quảng cáo thành công`);
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        toast.error('Không thể cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Không thể cập nhật trạng thái');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Chi tiết quảng cáo</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="relative w-full h-64 overflow-hidden rounded-md">
            <img
              src={advertisement.image}
              alt={advertisement.title}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{advertisement.title}</h3>
                {advertisement.subtitle && (
                  <p className="text-gray-600 mt-1">{advertisement.subtitle}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {renderTypeBadge(advertisement.type)}
                {advertisement.status && renderStatusBadge(advertisement.status)}
              </div>
            </div>
            
            <p className="text-gray-700">{advertisement.description}</p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" /> Ngày bắt đầu:
                </span>
                <div>{advertisement.start_date ? format(new Date(advertisement.start_date), 'dd/MM/yyyy') : 'Không có'}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" /> Ngày kết thúc:
                </span>
                <div>{advertisement.end_date ? format(new Date(advertisement.end_date), 'dd/MM/yyyy') : 'Không có'}</div>
              </div>
            </div>

            {advertisement.features && advertisement.features.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-md font-medium mb-2">Tính năng nổi bật</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {advertisement.features.map((feature, index) => (
                    <Card key={index} className="border">
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {iconMap[feature.icon] || <span className="text-primary">•</span>}
                        </div>
                        <div>
                          <h5 className="font-medium">{feature.title}</h5>
                          <CardDescription>{feature.description}</CardDescription>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" /> Ngày tạo:
                </span>
                <div>{format(new Date(advertisement.createdAt), 'dd/MM/yyyy')}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" /> Cập nhật lần cuối:
                </span>
                <div>{format(new Date(advertisement.updatedAt), 'dd/MM/yyyy')}</div>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-gray-500">ID:</span>
                <div className="font-mono text-xs">{advertisement._id}</div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onEdit(advertisement._id)}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" /> Sửa
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => onDelete(advertisement._id)}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" /> Xóa
            </Button>
          </div>
          
          {/* Review status buttons */}
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Button 
              onClick={() => handleUpdateStatus("Approved")}
              variant="outline" 
              className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
              disabled={updating || advertisement.status === 'Approved'}
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Duyệt
            </Button>
            <Button 
              onClick={() => handleUpdateStatus("Rejected")}
              variant="outline" 
              className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
              disabled={updating || advertisement.status === 'Rejected'}
            >
              <XCircle className="h-4 w-4 mr-1" /> Từ chối
            </Button>
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 