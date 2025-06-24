'use client'
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Phone, Globe, User, Coffee, Clock, RefreshCw, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import authorizedAxiosInstance from "@/lib/axios"

interface ShopOwner {
  _id: string
  full_name: string
  email: string
  phone?: string
  avatar?: string
  createdAt: string
}

interface CreateShopForm {
  name: string
  description: string
  address: string
  phone: string
  website: string
  latitude: number | string
  longitude: number | string
  owner_id: string
  amenities: string[]
  theme_ids: string[]
  opening_hours: {
    day: number
    is_closed: boolean
    hours?: { open: string; close: string }[]
  }[]
}

const defaultOpeningHours = [
  { day: 0, is_closed: true },
  { day: 1, is_closed: false, hours: [{ open: "08:00", close: "22:00" }] },
  { day: 2, is_closed: false, hours: [{ open: "08:00", close: "22:00" }] },
  { day: 3, is_closed: false, hours: [{ open: "08:00", close: "22:00" }] },
  { day: 4, is_closed: false, hours: [{ open: "08:00", close: "22:00" }] },
  { day: 5, is_closed: false, hours: [{ open: "08:00", close: "22:00" }] },
  { day: 6, is_closed: false, hours: [{ open: "08:00", close: "22:00" }] }
]

const dayNames = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]

export default function CreateShopPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<CreateShopForm>({
    name: "",
    description: "",
    address: "",
    phone: "",
    website: "",
    latitude: "",
    longitude: "",
    owner_id: "",
    amenities: ["6820f0e5628427b63b334ad3", "6820f0e5628427b63b334ad7"],
    theme_ids: ["682074de420997d7051394ba"],
    opening_hours: defaultOpeningHours
  })

  const [shopOwners, setShopOwners] = useState<ShopOwner[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingOwners, setLoadingOwners] = useState(false)

  useEffect(() => {
    fetchShopOwners()
  }, [])

  const fetchShopOwners = async () => {
    try {
      setLoadingOwners(true)
      const response = await authorizedAxiosInstance.get('/v1/admin/shop-owners-without-shops')
      if (response.data.code === "200") {
        setShopOwners(response.data.metadata.shopOwners)
      }
    } catch (error) {
      console.error('Error fetching shop owners:', error)
      toast.error('Không thể tải danh sách chủ quán')
    } finally {
      setLoadingOwners(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleOpeningHoursChange = (dayIndex: number, field: string, value: any, hourIndex?: number) => {
    setFormData(prev => {
      const newOpeningHours = [...prev.opening_hours]
      const dayScheduleIndex = newOpeningHours.findIndex(d => d.day === dayIndex)
      
      if (dayScheduleIndex >= 0) {
        if (field === 'is_closed') {
          newOpeningHours[dayScheduleIndex] = {
            ...newOpeningHours[dayScheduleIndex],
            is_closed: !value,
            hours: value ? [{ open: '08:00', close: '22:00' }] : []
          }
        } else if (field === 'open' || field === 'close') {
          if (hourIndex !== undefined && newOpeningHours[dayScheduleIndex].hours) {
            newOpeningHours[dayScheduleIndex].hours![hourIndex][field as 'open' | 'close'] = value
          }
        }
      } else {
        // Create new day schedule
        newOpeningHours.push({
          day: dayIndex,
          is_closed: field === 'is_closed' ? !value : false,
          hours: field === 'is_closed' && value ? [{ open: '08:00', close: '22:00' }] : []
        })
      }
      
      return {
        ...prev,
        opening_hours: newOpeningHours.sort((a, b) => a.day - b.day)
      }
    })
  }

  const addTimeSlot = (dayIndex: number) => {
    setFormData(prev => {
      const newOpeningHours = [...prev.opening_hours]
      const dayScheduleIndex = newOpeningHours.findIndex(d => d.day === dayIndex)
      
      if (dayScheduleIndex >= 0 && newOpeningHours[dayScheduleIndex].hours) {
        newOpeningHours[dayScheduleIndex].hours!.push({ open: '08:00', close: '22:00' })
      }
      
      return {
        ...prev,
        opening_hours: newOpeningHours
      }
    })
  }

  const removeTimeSlot = (dayIndex: number, hourIndex: number) => {
    setFormData(prev => {
      const newOpeningHours = [...prev.opening_hours]
      const dayScheduleIndex = newOpeningHours.findIndex(d => d.day === dayIndex)
      
      if (dayScheduleIndex >= 0 && newOpeningHours[dayScheduleIndex].hours) {
        newOpeningHours[dayScheduleIndex].hours!.splice(hourIndex, 1)
      }
      
      return {
        ...prev,
        opening_hours: newOpeningHours
      }
    })
  }

  const handleCreateShop = async () => {
    try {
      setLoading(true)
      
      // Validate form
      if (!formData.name || !formData.description || !formData.address || !formData.phone || !formData.website || !formData.latitude || !formData.longitude || !formData.owner_id) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
        return
      }

      const submitData = {
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude)
      }

      const response = await authorizedAxiosInstance.post('/v1/admin/shops', submitData)
      
      if (response.data.status === 201) {
        toast.success('Tạo quán mới thành công')
        router.push('/admin/shops')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo quán mới')
    } finally {
      setLoading(false)
    }
  }

  const selectedOwner = shopOwners.find(owner => owner._id === formData.owner_id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/shops">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Tạo quán cà phê mới</h1>
          <p className="text-gray-500">Thêm quán cà phê mới vào hệ thống</p>
        </div>
      </div>
      
      <Tabs defaultValue="basic-info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic-info">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="opening-hours">Giờ hoạt động</TabsTrigger>
          <TabsTrigger value="preview">Xem trước</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info" className="space-y-6">
          {/* Shop Owner Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Chọn chủ quán
              </CardTitle>
              <CardDescription>
                Chọn chủ quán từ danh sách những người chưa có quán
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchShopOwners}
                  disabled={loadingOwners}
                  className="ml-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingOwners ? 'animate-spin' : ''}`} />
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingOwners ? (
                <div className="text-center py-4">Đang tải danh sách chủ quán...</div>
              ) : shopOwners.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Không có chủ quán nào chưa có quán
                </div>
              ) : (
                <Select
                  value={formData.owner_id}
                  onValueChange={(value) => handleSelectChange('owner_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chủ quán" />
                  </SelectTrigger>
                  <SelectContent>
                    {shopOwners.map((owner) => (
                      <SelectItem key={owner._id} value={owner._id}>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={owner.avatar} />
                            <AvatarFallback>
                              {owner.full_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{owner.full_name}</div>
                            <div className="text-xs text-gray-500">{owner.email}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {selectedOwner && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={selectedOwner.avatar} />
                        <AvatarFallback>
                          {selectedOwner.full_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedOwner.full_name}</p>
                        <p className="text-sm text-gray-600">{selectedOwner.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Shop Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin quán</CardTitle>
              <CardDescription>Nhập thông tin chi tiết về quán cà phê</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên quán *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Nhập tên quán"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="Nhập số điện thoại"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Mô tả về quán cà phê"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    name="address"
                    placeholder="Nhập địa chỉ quán"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website *</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="website"
                    name="website"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Vĩ độ *</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    placeholder="10.762622"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Kinh độ *</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    placeholder="106.660172"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opening-hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Thiết lập giờ hoạt động
              </CardTitle>
              <CardDescription>
                Cài đặt giờ mở cửa và đóng cửa cho từng ngày trong tuần
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                  const daySchedule = formData.opening_hours.find(d => d.day === dayIndex) || {
                    day: dayIndex,
                    is_closed: false,
                    hours: [{ open: '08:00', close: '22:00' }]
                  }

                  return (
                    <div key={dayIndex} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium">{dayNames[dayIndex]}</h5>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={!daySchedule.is_closed}
                            onCheckedChange={(checked) => {
                              handleOpeningHoursChange(dayIndex, 'is_closed', checked)
                            }}
                          />
                          <Label className="text-sm">Mở cửa</Label>
                        </div>
                      </div>

                      {!daySchedule.is_closed && (
                        <div className="space-y-2">
                          {daySchedule.hours?.map((hour, hourIndex) => (
                            <div key={hourIndex} className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={hour.open}
                                onChange={(e) => {
                                  handleOpeningHoursChange(dayIndex, 'open', e.target.value, hourIndex)
                                }}
                                className="w-32"
                              />
                              <span className="text-sm text-muted-foreground">đến</span>
                              <Input
                                type="time"
                                value={hour.close}
                                onChange={(e) => {
                                  handleOpeningHoursChange(dayIndex, 'close', e.target.value, hourIndex)
                                }}
                                className="w-32"
                              />
                              {daySchedule.hours && daySchedule.hours.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeTimeSlot(dayIndex, hourIndex)}
                                >
                                  ×
                                </Button>
                              )}
                            </div>
                          ))}
                          
                          {daySchedule.hours && daySchedule.hours.length < 3 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addTimeSlot(dayIndex)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Thêm khung giờ
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Xem trước thông tin quán</CardTitle>
              <CardDescription>Kiểm tra lại thông tin trước khi tạo quán</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Info Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Thông tin cơ bản</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Tên quán:</strong> {formData.name || 'Chưa nhập'}</div>
                    <div><strong>Mô tả:</strong> {formData.description || 'Chưa nhập'}</div>
                    <div><strong>Địa chỉ:</strong> {formData.address || 'Chưa nhập'}</div>
                    <div><strong>Điện thoại:</strong> {formData.phone || 'Chưa nhập'}</div>
                    <div><strong>Website:</strong> {formData.website || 'Chưa nhập'}</div>
                    <div><strong>Tọa độ:</strong> {formData.latitude && formData.longitude ? `${formData.latitude}, ${formData.longitude}` : 'Chưa nhập'}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Chủ quán</h4>
                  {selectedOwner ? (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                      <Avatar>
                        <AvatarImage src={selectedOwner.avatar} />
                        <AvatarFallback>
                          {selectedOwner.full_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedOwner.full_name}</p>
                        <p className="text-sm text-gray-600">{selectedOwner.email}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Chưa chọn chủ quán</p>
                  )}
                </div>
              </div>

              {/* Opening Hours Preview */}
              <div>
                <h4 className="font-medium mb-2">Giờ hoạt động</h4>
                <div className="grid gap-2">
                  {formData.opening_hours.map((schedule) => (
                    <div key={schedule.day} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">{dayNames[schedule.day]}</span>
                      {schedule.is_closed ? (
                        <Badge variant="secondary">Đóng cửa</Badge>
                      ) : (
                        <div className="flex gap-2">
                          {schedule.hours?.map((hour, hourIndex) => (
                            <Badge key={hourIndex} variant="outline">
                              {hour.open} - {hour.close}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href="/admin/shops">Hủy</Link>
        </Button>
        <Button onClick={handleCreateShop} disabled={loading || !formData.owner_id}>
          {loading ? "Đang tạo..." : "Tạo quán"}
        </Button>
      </div>
    </div>
  )
} 