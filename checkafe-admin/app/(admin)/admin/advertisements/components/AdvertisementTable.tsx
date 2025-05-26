'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2, Calendar } from "lucide-react"
import { Advertisement } from "../types"
import { format } from "date-fns"
import Image from "next/image"

interface AdvertisementTableProps {
  advertisements: Advertisement[]
  onViewDetails: (advertisementId: string) => void
  onEdit: (advertisementId: string) => void
  onDelete: (advertisementId: string) => void
}

export function AdvertisementTable({ 
  advertisements, 
  onViewDetails,
  onEdit,
  onDelete 
}: AdvertisementTableProps) {
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

  // Function to check if advertisement is active
  const isActive = (ad: Advertisement) => {
    if (!ad.start_date && !ad.end_date) return true;
    
    const now = new Date();
    const startDate = ad.start_date ? new Date(ad.start_date) : null;
    const endDate = ad.end_date ? new Date(ad.end_date) : null;
    
    if (startDate && endDate) {
      return now >= startDate && now <= endDate;
    }
    
    if (startDate && !endDate) {
      return now >= startDate;
    }
    
    if (!startDate && endDate) {
      return now <= endDate;
    }
    
    return true;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hình ảnh</TableHead>
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {advertisements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                Không có dữ liệu quảng cáo
              </TableCell>
            </TableRow>
          ) : (
            advertisements.map((ad) => (
              <TableRow key={ad._id}>
                <TableCell>
                  <div className="h-14 w-20 relative rounded-md overflow-hidden">
                    <img
                      src={ad.image}
                      alt={ad.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-semibold">{ad.title}</div>
                  <div className="text-sm text-gray-500 line-clamp-1">
                    {ad.description}
                  </div>
                </TableCell>
                <TableCell>{renderTypeBadge(ad.type)}</TableCell>
                <TableCell>
                  <div className="flex items-center text-gray-500">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span className="text-sm">
                      {ad.start_date && ad.end_date ? (
                        <>
                          {format(new Date(ad.start_date), 'dd/MM/yyyy')} - {format(new Date(ad.end_date), 'dd/MM/yyyy')}
                        </>
                      ) : ad.start_date ? (
                        <>Từ {format(new Date(ad.start_date), 'dd/MM/yyyy')}</>
                      ) : ad.end_date ? (
                        <>Đến {format(new Date(ad.end_date), 'dd/MM/yyyy')}</>
                      ) : (
                        'Không giới hạn'
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {isActive(ad) ? (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      Đang hiển thị
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                      Không hoạt động
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8"
                      onClick={() => onViewDetails(ad._id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8"
                      onClick={() => onEdit(ad._id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-red-500"
                      onClick={() => onDelete(ad._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 