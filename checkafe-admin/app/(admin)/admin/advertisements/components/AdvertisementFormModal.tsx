'use client'
import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Image as ImageIcon, 
  Loader2, 
  Plus, 
  Trash, 
  Calendar,
  Tag,
  FileText,
  Store,
  Megaphone,
  RefreshCw
} from "lucide-react"
import { Advertisement, FeatureItem } from "../types"
import authorizedAxiosInstance from "@/lib/axios"
import { format } from "date-fns"

interface AdvertisementFormModalProps {
  advertisement?: Advertisement | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Shop {
  _id: string
  name: string
  address: string
  owner_id: {
    full_name: string
    email: string
    avatar?: string
  }
}

export function AdvertisementFormModal({ advertisement, isOpen, onClose, onSuccess }: AdvertisementFormModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    type: 'promotion',
    shop_id: '',
    redirect_url: '',
    start_date: '',
    end_date: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [features, setFeatures] = useState<FeatureItem[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingShops, setLoadingShops] = useState(false)

  const isEditMode = !!advertisement

  // Fetch shops for selection
  useEffect(() => {
    if (isOpen) {
      fetchShops()
    }
  }, [isOpen])

  // Initialize form with advertisement data if in edit mode
  useEffect(() => {
    if (advertisement) {
      setFormData({
        title: advertisement.title,
        subtitle: advertisement.subtitle || '',
        description: advertisement.description,
        type: advertisement.type,
        shop_id: advertisement.shop_id || '',
        redirect_url: advertisement.redirect_url || '',
        start_date: advertisement.start_date ? format(new Date(advertisement.start_date), 'yyyy-MM-dd') : '',
        end_date: advertisement.end_date ? format(new Date(advertisement.end_date), 'yyyy-MM-dd') : '',
      })
      setImagePreview(advertisement.image)
      setFeatures(advertisement.features || [])
    } else {
      resetForm()
    }
  }, [advertisement, isOpen])

  const fetchShops = async () => {
    try {
      setLoadingShops(true)
      const response = await authorizedAxiosInstance.get('/v1/shops?limit=100')
      if (response.data.status === 200) {
        setShops(response.data.data?.shops || [])
      }
    } catch (error) {
      console.error('Error fetching shops:', error)
      toast.error('Không thể tải danh sách quán')
    } finally {
      setLoadingShops(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      type: 'promotion',
      shop_id: '',
      redirect_url: '',
      start_date: '',
      end_date: '',
    })
    setImageFile(null)
    setImagePreview('')
    setFeatures([])
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value === "none" ? "" : value 
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 5MB')
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh')
        return
      }
      
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addFeature = () => {
    setFeatures([...features, { icon: 'star', title: '', description: '' }])
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const updateFeature = (index: number, field: keyof FeatureItem, value: string) => {
    const updatedFeatures = [...features]
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value }
    setFeatures(updatedFeatures)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề quảng cáo')
      return
    }
    
    if (!formData.description.trim()) {
      toast.error('Vui lòng nhập mô tả quảng cáo')
      return
    }
    
    if (!imageFile && !isEditMode) {
      toast.error('Vui lòng chọn hình ảnh')
      return
    }

    // Validate date range
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        toast.error('Ngày kết thúc phải sau ngày bắt đầu')
        return
      }
    }

    // Validate features
    const validFeatures = features.filter(f => f.title.trim() && f.description.trim())
    if (features.length > 0 && validFeatures.length < features.length) {
      toast.error('Vui lòng điền đầy đủ thông tin cho tất cả tính năng')
      return
    }

    try {
      setLoading(true)
      
        // Prepare form data for API
      const formDataToSubmit = new FormData()
      formDataToSubmit.append('title', formData.title)
      formDataToSubmit.append('subtitle', formData.subtitle || '')
      formDataToSubmit.append('description', formData.description)
      formDataToSubmit.append('type', formData.type)
      formDataToSubmit.append('redirect_url', formData.redirect_url || '')
      
      if (formData.shop_id) {
        formDataToSubmit.append('shop_id', formData.shop_id)
      }
        
        if (formData.start_date) {
        formDataToSubmit.append('start_date', formData.start_date)
        }
        
        if (formData.end_date) {
        formDataToSubmit.append('end_date', formData.end_date)
        }
        
        if (imageFile) {
        formDataToSubmit.append('image', imageFile)
        }
        
        // Add features if any
        if (validFeatures.length > 0) {
        formDataToSubmit.append('features', JSON.stringify(validFeatures))
        }
        
      let response
      if (isEditMode && advertisement) {
        response = await authorizedAxiosInstance.put(
          `/v1/advertisements/${advertisement._id}`, 
          formDataToSubmit, 
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
      } else {
        response = await authorizedAxiosInstance.post(
          '/v1/advertisements', 
          formDataToSubmit, 
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
      }
        
      if (response.data.status === 200 || response.data.status === 201) {
        toast.success(isEditMode ? 'Cập nhật quảng cáo thành công' : 'Thêm quảng cáo mới thành công')
          onSuccess()
          onClose()
        } else {
        toast.error(isEditMode ? 'Không thể cập nhật quảng cáo' : 'Không thể thêm quảng cáo')
      }
    } catch (error: any) {
      console.error('Error submitting advertisement:', error)
      toast.error(error.response?.data?.message || (isEditMode ? 'Không thể cập nhật quảng cáo' : 'Không thể thêm quảng cáo'))
    } finally {
      setLoading(false)
    }
  }

  const selectedShop = formData.shop_id && formData.shop_id !== "" ? shops.find(shop => shop._id === formData.shop_id) : null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            {isEditMode ? 'Chỉnh sửa quảng cáo' : 'Thêm quảng cáo mới'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Thông tin cơ bản
              </CardTitle>
              <CardDescription>Nhập thông tin chi tiết về quảng cáo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề quảng cáo *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Nhập tiêu đề quảng cáo"
                  required
                />
              </div>
              
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Tiêu đề phụ</Label>
                <Input
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                    placeholder="Nhập tiêu đề phụ (không bắt buộc)"
                />
              </div>
            </div>
            
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                  placeholder="Mô tả chi tiết về quảng cáo"
                  rows={4}
                required
              />
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Loại quảng cáo *</Label>
                <Select 
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger>
                      <SelectValue placeholder="Chọn loại quảng cáo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promotion">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Khuyến mãi
                        </div>
                      </SelectItem>
                      <SelectItem value="event">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Sự kiện
                        </div>
                      </SelectItem>
                      <SelectItem value="news">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Tin tức
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="redirect_url">Liên kết (URL)</Label>
                  <Input
                    id="redirect_url"
                    name="redirect_url"
                    type="url"
                    value={formData.redirect_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shop Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Store className="h-5 w-5" />
                Chọn quán (không bắt buộc)
              </CardTitle>
              <CardDescription>
                Chọn quán cà phê liên quan đến quảng cáo này
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={fetchShops}
                  disabled={loadingShops}
                  className="ml-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingShops ? 'animate-spin' : ''}`} />
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingShops ? (
                <div className="text-center py-4">Đang tải danh sách quán...</div>
              ) : (
                <Select
                  value={formData.shop_id || "none"}
                  onValueChange={(value) => handleSelectChange('shop_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn quán (để trống nếu quảng cáo chung)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không chọn quán (quảng cáo chung)</SelectItem>
                    {shops.map((shop) => (
                      <SelectItem key={shop._id} value={shop._id}>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={shop.owner_id?.avatar} />
                            <AvatarFallback>
                              {shop.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{shop.name}</div>
                            <div className="text-xs text-gray-500">{shop.address}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {selectedShop && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={selectedShop.owner_id?.avatar} />
                        <AvatarFallback>
                          {selectedShop.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedShop.name}</p>
                        <p className="text-sm text-gray-600">{selectedShop.address}</p>
                        <p className="text-xs text-gray-500">Chủ quán: {selectedShop.owner_id?.full_name}</p>
                      </div>
                      <Badge variant="secondary">Quán được chọn</Badge>
              </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Thời gian hiển thị
              </CardTitle>
              <CardDescription>Thiết lập thời gian bắt đầu và kết thúc quảng cáo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="start_date">Ngày bắt đầu</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                />
              </div>
              
                <div className="space-y-2">
                <Label htmlFor="end_date">Ngày kết thúc</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Hình ảnh quảng cáo
              </CardTitle>
              <CardDescription>Tải lên hình ảnh cho quảng cáo (tối đa 5MB)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                
                {imagePreview ? (
                <div className="relative w-full h-64 overflow-hidden border rounded-md">
                    <img
                      src={imagePreview}
                      alt="Preview"
                    className="w-full h-full object-contain bg-gray-50"
                    />
                  </div>
                ) : (
                <div className="flex items-center justify-center w-full h-64 border-2 border-dashed rounded-md bg-gray-50">
                    <div className="flex flex-col items-center text-gray-400">
                    <ImageIcon size={48} />
                    <span className="mt-2">Chưa có hình ảnh</span>
                    <span className="text-sm">Chọn file để tải lên</span>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Tính năng nổi bật</CardTitle>
                  <CardDescription>Thêm các tính năng đặc biệt của quảng cáo</CardDescription>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={addFeature}
                >
                  <Plus className="h-4 w-4" /> Thêm tính năng
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-medium">Tính năng {index + 1}</h5>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:bg-red-50"
                          onClick={() => removeFeature(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label htmlFor={`feature-${index}-icon`}>Icon</Label>
                          <Select 
                            value={feature.icon} 
                            onValueChange={(value) => updateFeature(index, 'icon', value)}
                          >
                            <SelectTrigger id={`feature-${index}-icon`}>
                              <SelectValue placeholder="Chọn icon" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="star">⭐ Sao</SelectItem>
                              <SelectItem value="calendar">📅 Lịch</SelectItem>
                              <SelectItem value="clock">⏰ Đồng hồ</SelectItem>
                              <SelectItem value="tag">🏷️ Thẻ</SelectItem>
                              <SelectItem value="gift">🎁 Quà tặng</SelectItem>
                              <SelectItem value="fire">🔥 Hot</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor={`feature-${index}-title`}>Tiêu đề</Label>
                          <Input
                            id={`feature-${index}-title`}
                            value={feature.title}
                            onChange={(e) => updateFeature(index, 'title', e.target.value)}
                            placeholder="Tiêu đề tính năng"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`feature-${index}-description`}>Mô tả</Label>
                          <Input
                            id={`feature-${index}-description`}
                            value={feature.description}
                            onChange={(e) => updateFeature(index, 'description', e.target.value)}
                            placeholder="Mô tả tính năng"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {features.length === 0 && (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                    <Plus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>Chưa có tính năng nào được thêm</p>
                    <p className="text-sm">Nhấn "Thêm tính năng" để bắt đầu</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Cập nhật quảng cáo' : 'Tạo quảng cáo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 