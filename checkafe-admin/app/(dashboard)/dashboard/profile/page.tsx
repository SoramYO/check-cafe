"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TimePickerDemo } from "@/components/dashboard/time-picker"
import { Upload, Clock, MapPin, Phone, Mail, Globe, FileText, CheckCircle, AlertCircle, Info, Plus, Edit, FileCheck, Eye } from "lucide-react"
import Image from "next/image"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import authorizedAxiosInstance from "@/lib/axios"
import { toast } from "sonner"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ShopData {
  _id: string
  name: string
  address: string
  description: string
  phone: string
  website: string
  location: {
    coordinates: [number, number]
  }
  owner_id: {
    _id: string
    full_name: string
    email: string
    avatar?: string
  }
  theme_ids: Array<{
    _id: string
    name: string
    description: string
    theme_image?: string
  }>
  vip_status: boolean
  rating_avg: number
  rating_count: number
  status: string
  amenities: Array<{
    _id: string
    icon: string
    label: string
  }>
  opening_hours: Array<{
    day: number
    is_closed: boolean
    hours: Array<{
      open: string
      close: string
      _id: string
    }>
    _id: string
  }>
  images: Array<{
    url: string
    caption?: string
    created_at: string
  }>
  timeSlots: Array<{
    _id: string
    day_of_week: number
    start_time: string
    end_time: string
    max_regular_reservations: number
    max_premium_reservations: number
    is_active: boolean
  }>
  verifications: Array<{
    _id: string
    document_type: string
    status: string
    submitted_at: string
    reviewed_at?: string
    reason?: string
    documents: Array<{
      url: string
      publicId: string
    }>
  }>
  formatted_opening_hours?: Record<string, string>
  is_open: boolean
}

interface Theme {
  _id: string
  name: string
  description: string
  theme_image?: string
}

interface Amenity {
  _id: string
  icon: string
  label: string
}

export default function ShopProfilePage() {
  const [shopData, setShopData] = useState<ShopData | null>(null)
  const [themes, setThemes] = useState<Theme[]>([])
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "rejected">("pending")
  const [documentUploaded, setDocumentUploaded] = useState(false)
  const [verificationModalOpen, setVerificationModalOpen] = useState(false)
  const [isEditingHours, setIsEditingHours] = useState(false)
  const [editingOpeningHours, setEditingOpeningHours] = useState<any[]>([])

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    website: '',
    latitude: 0,
    longitude: 0,
    amenities: [] as string[],
    theme_ids: [] as string[],
    opening_hours: [] as any[]
  })

  useEffect(() => {
    fetchShopData()
    fetchThemes()
    fetchAmenities()
  }, [])

  const fetchShopData = async () => {
    try {
      setLoading(true)
      const response = await authorizedAxiosInstance.get('/v1/shops/my-shop')
      if (response.data.status === 200) {
        const shop = response.data.data.shop
        setShopData(shop)
        setFormData({
          name: shop.name || '',
          description: shop.description || '',
          phone: shop.phone || '',
          address: shop.address || '',
          website: shop.website || '',
          latitude: shop.location?.coordinates[1] || 0,
          longitude: shop.location?.coordinates[0] || 0,
          amenities: shop.amenities?.map((a: any) => a._id) || [],
          theme_ids: shop.theme_ids?.map((t: any) => t._id) || [],
          opening_hours: shop.opening_hours || []
        })
        
        // Set verification status
        const latestVerification = shop.verifications?.[0]
        if (latestVerification) {
          setVerificationStatus(latestVerification.status.toLowerCase() as any)
          setDocumentUploaded(true)
        }
      }
    } catch (error) {
      console.error('Error fetching shop data:', error)
      toast.error('Không thể tải thông tin quán')
    } finally {
      setLoading(false)
    }
  }

  const fetchThemes = async () => {
    try {
      const response = await authorizedAxiosInstance.get('/v1/themes')
      if (response.data.status === 200) {
        setThemes(response.data.data.themes)
      }
    } catch (error) {
      console.error('Error fetching themes:', error)
    }
  }

  const fetchAmenities = async () => {
    try {
      const response = await authorizedAxiosInstance.get('/v1/amenities')
      if (response.data.status === 200) {
        setAmenities(response.data.data.amenities)
      }
    } catch (error) {
      console.error('Error fetching amenities:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shopData) return

    setIsSubmitting(true)
    try {
      const response = await authorizedAxiosInstance.patch(`/v1/shops/${shopData._id}`, formData)
      if (response.data.status === 200) {
        toast.success('Cập nhật thông tin quán thành công')
        fetchShopData() // Refresh data
      }
    } catch (error) {
      console.error('Error updating shop:', error)
      toast.error('Không thể cập nhật thông tin quán')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDocumentUpload = () => {
    // Simulate document upload
    setTimeout(() => {
      setDocumentUploaded(true)
    }, 1000)
  }

  const handleVerificationSubmit = () => {
    // Simulate verification submission
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setVerificationStatus("pending")
    }, 1500)
  }

  const handleAmenityToggle = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }))
  }

  const handleSaveOpeningHours = async () => {
    if (!shopData) return
    
    try {
      setIsSubmitting(true)
      const response = await authorizedAxiosInstance.patch(`/v1/shops/${shopData._id}`, {
        opening_hours: editingOpeningHours
      })
      if (response.data.status === 200) {
        toast.success('Cập nhật giờ hoạt động thành công')
        setIsEditingHours(false)
        fetchShopData()
      }
    } catch (error) {
      console.error('Error updating opening hours:', error)
      toast.error('Không thể cập nhật giờ hoạt động')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitVerification = async () => {
    try {
      setIsSubmitting(true)
      // Implement verification submission logic here
      toast.success('Gửi xác minh thành công')
      setVerificationModalOpen(false)
      fetchShopData()
    } catch (error) {
      console.error('Error submitting verification:', error)
      toast.error('Không thể gửi xác minh')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải thông tin quán...</p>
        </div>
      </div>
    )
  }

  if (!shopData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy thông tin quán</h3>
          <p className="text-gray-500 mb-4">Vui lòng thử lại sau.</p>
          <Button onClick={fetchShopData}>Thử lại</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hồ sơ quán</h1>
          <p className="text-gray-500">Quản lý thông tin và hồ sơ quán cà phê của bạn.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-primary hover:bg-primary-dark" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic-info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic-info">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="business-hours">Giờ hoạt động</TabsTrigger>
          <TabsTrigger value="verification">Xác minh quán</TabsTrigger>
          <TabsTrigger value="preview">Xem trước</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info" className="space-y-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin quán</CardTitle>
                    <CardDescription>Cập nhật thông tin cơ bản về quán cà phê của bạn.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="shop-name">Tên quán</Label>
                      <Input 
                        id="shop-name" 
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shop-description">Mô tả</Label>
                      <Textarea
                        id="shop-description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shop-phone">Số điện thoại</Label>
                        <Input 
                          id="shop-phone" 
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shop-website">Website</Label>
                        <Input 
                          id="shop-website" 
                          value={formData.website}
                          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shop-address">Địa chỉ</Label>
                      <Input 
                        id="shop-address" 
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="latitude">Vĩ độ</Label>
                        <Input 
                          id="latitude" 
                          type="number" 
                          step="any"
                          value={formData.latitude}
                          onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="longitude">Kinh độ</Label>
                        <Input 
                          id="longitude" 
                          type="number" 
                          step="any"
                          value={formData.longitude}
                          onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin bổ sung</CardTitle>
                    <CardDescription>Cung cấp thêm thông tin để khách hàng hiểu rõ hơn về quán.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tiện ích</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {amenities.map((amenity) => (
                          <div key={amenity._id} className="flex items-center space-x-2">
                            <Switch 
                              id={amenity._id}
                              checked={formData.amenities.includes(amenity._id)}
                              onCheckedChange={() => handleAmenityToggle(amenity._id)}
                            />
                            <Label htmlFor={amenity._id} className="text-sm">{amenity.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Chủ đề quán</Label>
                      <Select 
                        value={formData.theme_ids[0] || ''} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, theme_ids: [value] }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn chủ đề" />
                        </SelectTrigger>
                        <SelectContent>
                          {themes.map((theme) => (
                            <SelectItem key={theme._id} value={theme._id}>
                              {theme.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Hình ảnh quán</CardTitle>
                    <CardDescription>Tải lên logo và hình ảnh đại diện cho quán.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Logo quán</Label>
                      <div className="flex items-center gap-4">
                        <div className="relative h-20 w-20 rounded-md overflow-hidden border">
                          {shopData.images.length > 0 ? (
                            <Image src={shopData.images[0].url} alt="Logo quán" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <Upload className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          <Upload className="mr-2 h-4 w-4" /> Tải lên logo
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Ảnh bìa</Label>
                      <div className="relative h-32 w-full rounded-md overflow-hidden border">
                        {shopData.images.length > 0 ? (
                          <Image
                            src={shopData.images[0].url}
                            alt="Ảnh bìa quán"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <Upload className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" /> Tải lên ảnh bìa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="business-hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Giờ hoạt động</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${shopData.is_open ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium">
                    {shopData.is_open ? 'Hiện tại đang mở cửa' : 'Hiện tại đang đóng cửa'}
                  </span>
                </div>
              </CardTitle>
              <CardDescription>Cài đặt giờ mở cửa và đóng cửa cho quán.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditingHours ? (
                // Display Mode
                <div className="space-y-4">
                  {/* Current Opening Hours */}
                  <div className="grid gap-3">
                    {shopData.opening_hours && shopData.opening_hours.length > 0 ? (
                      shopData.opening_hours.map((daySchedule) => {
                        const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
                        return (
                          <div key={daySchedule.day} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-20 text-sm font-medium">
                                {dayNames[daySchedule.day]}
                              </div>
                              <div className="flex items-center gap-2">
                                {daySchedule.is_closed ? (
                                  <Badge variant="secondary" className="text-xs">Đóng cửa</Badge>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {daySchedule.hours.map((hour: any, index: number) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {hour.open} - {hour.close}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">Chưa có giờ hoạt động được thiết lập</p>
                      </div>
                    )}
                  </div>

                  {/* Quick Summary */}
                  {shopData.formatted_opening_hours && Object.keys(shopData.formatted_opening_hours).length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Tóm tắt giờ hoạt động</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
                        {Object.entries(shopData.formatted_opening_hours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span>{day}:</span>
                            <span className="font-medium">{hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setIsEditingHours(true);
                      setEditingOpeningHours(shopData.opening_hours || []);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Chỉnh sửa giờ hoạt động
                  </Button>
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Chỉnh sửa giờ hoạt động</h4>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setIsEditingHours(false);
                          setEditingOpeningHours([]);
                        }}
                      >
                        Hủy
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleSaveOpeningHours}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                      const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
                      const daySchedule = editingOpeningHours.find(d => d.day === dayIndex) || {
                        day: dayIndex,
                        is_closed: false,
                        hours: [{ open: '07:00', close: '22:00' }]
                      };

                      return (
                        <div key={dayIndex} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium">{dayNames[dayIndex]}</h5>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={!daySchedule.is_closed}
                                onCheckedChange={(checked) => {
                                  const newSchedules = [...editingOpeningHours];
                                  const existingIndex = newSchedules.findIndex(d => d.day === dayIndex);
                                  
                                  if (existingIndex >= 0) {
                                    newSchedules[existingIndex] = {
                                      ...newSchedules[existingIndex],
                                      is_closed: !checked,
                                      hours: checked ? [{ open: '07:00', close: '22:00' }] : []
                                    };
                                  } else {
                                    newSchedules.push({
                                      day: dayIndex,
                                      is_closed: !checked,
                                      hours: checked ? [{ open: '07:00', close: '22:00' }] : []
                                    });
                                  }
                                  
                                  setEditingOpeningHours(newSchedules);
                                }}
                              />
                              <Label className="text-sm">Mở cửa</Label>
                            </div>
                          </div>

                          {!daySchedule.is_closed && (
                            <div className="space-y-2">
                              {daySchedule.hours.map((hour: any, hourIndex: number) => (
                                <div key={hourIndex} className="flex items-center gap-2">
                                  <Input
                                    type="time"
                                    value={hour.open}
                                    onChange={(e) => {
                                      const newSchedules = [...editingOpeningHours];
                                      const scheduleIndex = newSchedules.findIndex(d => d.day === dayIndex);
                                      if (scheduleIndex >= 0) {
                                        newSchedules[scheduleIndex].hours[hourIndex].open = e.target.value;
                                        setEditingOpeningHours(newSchedules);
                                      }
                                    }}
                                    className="w-32"
                                  />
                                  <span className="text-sm text-muted-foreground">đến</span>
                                  <Input
                                    type="time"
                                    value={hour.close}
                                    onChange={(e) => {
                                      const newSchedules = [...editingOpeningHours];
                                      const scheduleIndex = newSchedules.findIndex(d => d.day === dayIndex);
                                      if (scheduleIndex >= 0) {
                                        newSchedules[scheduleIndex].hours[hourIndex].close = e.target.value;
                                        setEditingOpeningHours(newSchedules);
                                      }
                                    }}
                                    className="w-32"
                                  />
                                  {daySchedule.hours.length > 1 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const newSchedules = [...editingOpeningHours];
                                        const scheduleIndex = newSchedules.findIndex(d => d.day === dayIndex);
                                        if (scheduleIndex >= 0) {
                                          newSchedules[scheduleIndex].hours.splice(hourIndex, 1);
                                          setEditingOpeningHours(newSchedules);
                                        }
                                      }}
                                    >
                                      ×
                                    </Button>
                                  )}
                                </div>
                              ))}
                              
                              {daySchedule.hours.length < 3 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newSchedules = [...editingOpeningHours];
                                    const scheduleIndex = newSchedules.findIndex(d => d.day === dayIndex);
                                    if (scheduleIndex >= 0) {
                                      newSchedules[scheduleIndex].hours.push({ open: '07:00', close: '22:00' });
                                    } else {
                                      newSchedules.push({
                                        day: dayIndex,
                                        is_closed: false,
                                        hours: [{ open: '07:00', close: '22:00' }, { open: '07:00', close: '22:00' }]
                                      });
                                    }
                                    setEditingOpeningHours(newSchedules);
                                  }}
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Thêm khung giờ
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time Slots Management */}
          {shopData.timeSlots && shopData.timeSlots.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Khung giờ đặt chỗ</CardTitle>
                <CardDescription>Quản lý các khung giờ cho phép đặt chỗ trong ngày.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    shopData.timeSlots
                      .sort((a: any, b: any) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))
                      .reduce((acc: Record<string, any[]>, slot: any) => {
                        const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
                        const dayName = dayNames[slot.day_of_week];
                        if (!acc[dayName]) acc[dayName] = [];
                        acc[dayName].push(slot);
                        return acc;
                      }, {} as Record<string, any[]>)
                  ).map(([dayName, slots]: [string, any[]]) => (
                    <div key={dayName} className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">{dayName}</h4>
                      <div className="grid gap-2">
                        {slots.map((slot: any) => (
                          <div key={slot._id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                            <div className="flex items-center gap-4">
                              <span className="font-medium">{slot.start_time} - {slot.end_time}</span>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-xs">
                                  Thường: {slot.max_regular_reservations}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  VIP: {slot.max_premium_reservations}
                                </Badge>
                              </div>
                            </div>
                            <Badge variant={slot.is_active ? "default" : "secondary"} className="text-xs">
                              {slot.is_active ? "Hoạt động" : "Tạm dừng"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          {shopData.verifications && shopData.verifications.length > 0 && 
           shopData.verifications.some(v => v.status === 'Approved') ? (
            // Đã xác minh - Hiển thị thông tin xác minh
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Quán đã được xác minh
                      </CardTitle>
                      <CardDescription>Quán của bạn đã được xác minh thành công.</CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Đã xác minh
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {shopData.verifications
                    .filter(v => v.status === 'Approved')
                    .map((verification) => (
                      <div key={verification._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">
                              {verification.document_type === 'business_license' ? 'Giấy phép kinh doanh' : verification.document_type}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Được duyệt: {verification.reviewed_at ? format(new Date(verification.reviewed_at), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        {verification.reason && (
                          <div className="mb-3">
                            <p className="text-sm"><strong>Ghi chú:</strong> {verification.reason}</p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Tài liệu đã nộp:</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {verification.documents.map((doc, index) => (
                              <div key={index} className="relative group">
                                <div className="relative h-24 rounded-lg overflow-hidden border">
                                  <Image
                                    src={doc.url}
                                    alt={`Tài liệu ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => window.open(doc.url, '_blank')}
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      Xem
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>

              {/* Benefits Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Lợi ích đã nhận được</CardTitle>
                  <CardDescription>Những lợi ích mà quán đã xác minh được hưởng.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Biểu tượng xác minh</p>
                        <p className="text-sm text-gray-500">Hiển thị biểu tượng xác minh bên cạnh tên quán.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Ưu tiên hiển thị</p>
                        <p className="text-sm text-gray-500">Quán được ưu tiên hiển thị trong kết quả tìm kiếm.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Tăng độ tin cậy</p>
                        <p className="text-sm text-gray-500">Khách hàng tin tưởng và lựa chọn quán nhiều hơn.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Khả năng tiếp cận cao hơn</p>
                        <p className="text-sm text-gray-500">Được giới thiệu trong các chương trình khuyến mãi.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Chưa xác minh hoặc bị từ chối - Hiển thị form xác minh
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Xác minh quán</CardTitle>
                      <CardDescription>Cung cấp giấy phép kinh doanh để xác minh quán của bạn.</CardDescription>
                    </div>
                    {shopData.verifications && shopData.verifications.length > 0 ? (
                      shopData.verifications[0].status === 'Pending' ? (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                          Đang chờ xác minh
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                          Bị từ chối
                        </Badge>
                      )
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                        Chưa xác minh
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Thông tin quan trọng</AlertTitle>
                    <AlertDescription>
                      Quán cà phê được xác minh sẽ hiển thị biểu tượng xác minh và được ưu tiên hiển thị trong kết quả tìm kiếm.
                    </AlertDescription>
                  </Alert>

                  {shopData.verifications && shopData.verifications.length > 0 && 
                   shopData.verifications[0].status === 'Rejected' && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Lý do từ chối</AlertTitle>
                      <AlertDescription>
                        {shopData.verifications[0].reason || "Tài liệu không hợp lệ. Vui lòng kiểm tra và nộp lại."}
                      </AlertDescription>
                    </Alert>
                  )}

                  {shopData.verifications && shopData.verifications.length > 0 && 
                   shopData.verifications[0].status === 'Pending' ? (
                    <div className="text-center py-6">
                      <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                      <h4 className="font-medium mb-2">Đang chờ xác minh</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Tài liệu của bạn đang được xem xét. Chúng tôi sẽ thông báo kết quả trong vòng 1-3 ngày làm việc.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Nộp lúc: {format(new Date(shopData.verifications[0].submitted_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </p>
                    </div>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => setVerificationModalOpen(true)}
                    >
                      <FileCheck className="mr-2 h-4 w-4" />
                      {shopData.verifications && shopData.verifications.length > 0 ? 'Nộp lại tài liệu' : 'Bắt đầu xác minh'}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Benefits Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Lợi ích khi được xác minh</CardTitle>
                  <CardDescription>Quán được xác minh sẽ nhận được nhiều lợi ích trên ChecKafe.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Biểu tượng xác minh</p>
                        <p className="text-sm text-gray-500">Hiển thị biểu tượng xác minh bên cạnh tên quán.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Ưu tiên hiển thị</p>
                        <p className="text-sm text-gray-500">
                          Quán được xác minh sẽ được ưu tiên hiển thị trong kết quả tìm kiếm.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Tăng độ tin cậy</p>
                        <p className="text-sm text-gray-500">
                          Khách hàng sẽ tin tưởng và lựa chọn quán được xác minh nhiều hơn.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Khả năng tiếp cận cao hơn</p>
                        <p className="text-sm text-gray-500">
                          Quán được xác minh sẽ được giới thiệu trong các chương trình khuyến mãi của ChecKafe.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Verification Modal */}
          <Dialog open={verificationModalOpen} onOpenChange={setVerificationModalOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Xác minh quán cà phê</DialogTitle>
                <DialogDescription>
                  Tải lên giấy phép kinh doanh và thông tin cần thiết để xác minh quán.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Loại tài liệu</Label>
                  <Select defaultValue="business_license">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business_license">Giấy phép kinh doanh</SelectItem>
                      <SelectItem value="tax_certificate">Giấy chứng nhận thuế</SelectItem>
                      <SelectItem value="food_safety">Giấy chứng nhận an toàn thực phẩm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tài liệu (1-5 file)</Label>
                  <div className="border border-dashed rounded-md p-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <p className="font-medium">Kéo thả hoặc nhấp để tải lên</p>
                      <p className="text-sm text-gray-500">Hỗ trợ PDF, JPG, PNG (tối đa 5MB mỗi file)</p>
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        multiple
                        className="hidden"
                        id="verification-upload"
                      />
                      <Label htmlFor="verification-upload" className="cursor-pointer">
                        <Button type="button" variant="outline" size="sm" asChild>
                          <span>Chọn tệp</span>
                        </Button>
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Ghi chú (tùy chọn)</Label>
                  <Textarea
                    id="reason"
                    placeholder="Thêm ghi chú về tài liệu..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setVerificationModalOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleSubmitVerification} disabled={isSubmitting}>
                    <FileCheck className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Đang gửi...' : 'Gửi xác minh'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Xem trước hồ sơ quán</CardTitle>
              <CardDescription>Xem trước cách quán của bạn hiển thị với khách hàng.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden max-w-2xl mx-auto">
                <div className="relative h-48 w-full">
                  {shopData.images.length > 0 ? (
                    <Image src={shopData.images[0].url} alt="Ảnh bìa quán" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Upload className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden border-4 border-white -mt-10 bg-white flex-shrink-0">
                      {shopData.images.length > 0 ? (
                        <Image src={shopData.images[0].url} alt="Logo quán" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-bold">{shopData.name}</h2>
                        {verificationStatus === "verified" && (
                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" /> Đã xác minh
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm mt-1">
                        {shopData.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{shopData.address}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{shopData.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{shopData.owner_id.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{shopData.website}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>07:30 - 22:00 (Hôm nay)</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {shopData.amenities.map((amenity) => (
                        <Badge key={amenity._id} variant="secondary" className="text-xs">{amenity.label}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
