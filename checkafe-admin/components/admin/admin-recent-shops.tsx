'use client'
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import authorizedAxiosInstance from "@/lib/axios"
import { format, formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

interface Shop {
  _id: string
  name: string
  address: string
  logo?: string
  status: 'approved' | 'pending' | 'rejected'
  createdAt: string
}

export default function AdminRecentShops() {
  const [loading, setLoading] = useState(true)
  const [shops, setShops] = useState<Shop[]>([])

  useEffect(() => {
    fetchRecentShops()
  }, [])

  const fetchRecentShops = async () => {
    try {
      setLoading(true)
      const response = await authorizedAxiosInstance.get('/v1/admin/shops/recent')
      
      if (response.data.status === 200) {
        setShops(response.data.data.shops || [])
      }
    } catch (error) {
      console.error('Error fetching recent shops:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Hàm lấy initials từ tên cửa hàng để hiển thị trong Avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Đã duyệt</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Từ chối</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Chờ duyệt</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {shops.length > 0 ? shops.map((shop) => (
        <div key={shop._id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={shop.logo} alt={shop.name} />
            <AvatarFallback>{getInitials(shop.name)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <div className="flex items-center">
              <p className="text-sm font-medium leading-none">{shop.name}</p>
              <div className="ml-2">{getStatusBadge(shop.status)}</div>
            </div>
            <p className="text-xs text-gray-500">{shop.address}</p>
            <p className="text-xs text-gray-400">
              Đăng ký {format(new Date(shop.createdAt), 'dd/MM/yyyy')} ({formatDistanceToNow(new Date(shop.createdAt), { addSuffix: true, locale: vi })})
            </p>
          </div>
        </div>
      )) : (
        <div className="text-center py-4 text-gray-500">Không có quán mới đăng ký gần đây</div>
      )}
    </div>
  )
}
