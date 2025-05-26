'use client'
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import authorizedAxiosInstance from "@/lib/axios"

interface TopShop {
  _id: string
  name: string
  address: string
  logo?: string
  average_rating: number
  total_reviews: number
  verified: boolean
}

export default function AdminTopShops() {
  const [loading, setLoading] = useState(true)
  const [shops, setShops] = useState<TopShop[]>([])

  useEffect(() => {
    fetchTopShops()
  }, [])

  const fetchTopShops = async () => {
    try {
      setLoading(true)
      const response = await authorizedAxiosInstance.get('/v1/admin/shops/top')
      
      if (response.data.status === 200) {
        setShops(response.data.data.shops || [])
      }
    } catch (error) {
      console.error('Error fetching top shops:', error)
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

  // Render stars based on rating
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {Array(5).fill(0).map((_, i) => (
          <Star 
            key={i} 
            className={`h-3 w-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : i < rating ? 'text-yellow-400 fill-yellow-400 opacity-50' : 'text-gray-300'}`} 
          />
        ))}
        <span className="ml-1 text-xs font-medium">{rating.toFixed(1)}</span>
      </div>
    )
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
    <div className="space-y-4">
      {shops.length > 0 ? shops.map((shop, index) => (
        <div key={shop._id} className="flex items-center space-x-4 rounded-md border p-3">
          <div className="text-sm font-medium text-gray-500">{index + 1}</div>
          <Avatar>
            <AvatarImage src={shop.logo} alt={shop.name} />
            <AvatarFallback className="bg-primary/10 text-primary">{getInitials(shop.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center">
              <p className="text-sm font-medium">{shop.name}</p>
              {shop.verified && (
                <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                  Đã xác minh
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500">{shop.address}</p>
            <div className="mt-1 flex items-center">
              {renderRating(shop.average_rating)}
              <span className="ml-2 text-xs text-gray-500">
                ({shop.total_reviews} đánh giá)
              </span>
            </div>
          </div>
        </div>
      )) : (
        <div className="text-center py-4 text-gray-500">Không có dữ liệu quán hàng đầu</div>
      )}
    </div>
  )
}
