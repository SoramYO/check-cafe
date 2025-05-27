'use client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shop } from "../types"
import { MapPin, Phone, Globe, Star, Clock, Users, Coffee, Cake } from "lucide-react"
import { useState, useEffect } from "react"
import authorizedAxiosInstance from "@/lib/axios"
import { ShopDetailResponse } from "../types"

interface ShopDetailModalProps {
  shopId: string | null
  onClose: () => void
}

export function ShopDetailModal({ shopId, onClose }: ShopDetailModalProps) {
  const [shop, setShop] = useState<Shop | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (shopId) {
      fetchShopDetails()
    }
  }, [shopId])

  const fetchShopDetails = async () => {
    try {
      setLoading(true)
      const response = await authorizedAxiosInstance.get<ShopDetailResponse>(`/v1/shops/${shopId}`)
      if (response.data.status === 200) {
        setShop(response.data.data.shop)
      }
    } catch (error) {
      console.error('Error fetching shop details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!shopId) return null

  return (
    <Dialog open={!!shopId} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết quán</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div>Loading...</div>
        ) : shop ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden">
                <img 
                  src={shop.mainImage?.url} 
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{shop.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={shop.is_open ? "success" : "secondary"}>
                    {shop.is_open ? "Đang mở cửa" : "Đóng cửa"}
                  </Badge>
                  {shop.vip_status && (
                    <Badge variant="warning">VIP</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span>{shop.rating_avg.toFixed(1)} ({shop.rating_count} đánh giá)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium">Địa chỉ</div>
                  <div className="text-sm text-gray-500">{shop.address}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium">Số điện thoại</div>
                  <div className="text-sm text-gray-500">{shop.phone}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium">Website</div>
                  <div className="text-sm text-gray-500">
                    <a href={shop.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {shop.website}
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium">Giờ mở cửa</div>
                  <div className="text-sm text-gray-500">
                    {Object.entries(shop.formatted_opening_hours).map(([day, hours]) => (
                      <div key={day}>
                        <span className="font-medium">{day}:</span> {hours}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="info">
              <TabsList>
                <TabsTrigger value="info">Thông tin</TabsTrigger>
                <TabsTrigger value="menu">Thực đơn</TabsTrigger>
                <TabsTrigger value="seats">Bàn ghế</TabsTrigger>
                <TabsTrigger value="images">Hình ảnh</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Mô tả</h3>
                  <p className="text-sm text-gray-500">{shop.description}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Tiện ích</h3>
                  <div className="flex flex-wrap gap-2">
                    {shop.amenities.map((amenity) => (
                      <Badge key={amenity._id} variant="secondary">
                        {amenity.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Chủ đề</h3>
                  <div className="flex flex-wrap gap-2">
                    {shop.theme_ids.map((theme) => (
                      <Badge key={theme._id} variant="secondary">
                        {theme.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="menu" className="space-y-4">
                {shop.menuItems?.map((item) => (
                  <div key={item._id} className="flex items-start gap-4 p-4 border rounded-lg">
                    {item.images?.[0] && (
                      <img 
                        src={item.images[0].url} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                      <div className="text-sm font-medium mt-1">{item.price.toLocaleString()}đ</div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="seats" className="space-y-4">
                {shop.seats?.map((seat) => (
                  <div key={seat._id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <img 
                      src={seat.image} 
                      alt={seat.seat_name}
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{seat.seat_name}</div>
                      <div className="text-sm text-gray-500">{seat.description}</div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center text-sm">
                          <Users className="w-4 h-4 mr-1" />
                          {seat.capacity} người
                        </div>
                        {seat.is_premium && (
                          <Badge variant="warning">Premium</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="images" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {shop.images?.map((image) => (
                    <div key={image._id} className="aspect-square rounded-lg overflow-hidden">
                      <img 
                        src={image.url} 
                        alt={image.caption}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div>Không tìm thấy thông tin quán</div>
        )}
      </DialogContent>
    </Dialog>
  )
} 