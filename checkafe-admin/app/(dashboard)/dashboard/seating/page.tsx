'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Users, RefreshCw, Upload, Save, X, Crown, CheckCircle, XCircle, ChevronUp, ChevronDown } from "lucide-react"
import Image from "next/image"
import authorizedAxiosInstance from "@/lib/axios"
import { toast } from "sonner"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useShop } from "@/context/ShopContext"

interface Seat {
  _id: string
  seat_name: string
  description: string
  image?: string
  is_premium: boolean
  is_available: boolean
  capacity: number
  createdAt: string
  updatedAt: string
}

interface ShopData {
  _id: string
  name: string
}

export default function SeatingPage() {
  const { shopData } = useShop()
  const shopId = shopData?._id
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [seatModalOpen, setSeatModalOpen] = useState(false)
  const [editingSeat, setEditingSeat] = useState<Seat | null>(null)
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'premium' | 'regular'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'unavailable'>('all')

  useEffect(() => {
    if (shopData) {
      fetchSeats()
    }
  }, [shopData, shopId])


  const fetchSeats = async () => {
    if (!shopData) return
    
    try {
      setLoading(true)
      const response = await authorizedAxiosInstance.get(`/v1/shops/${shopId}/seats`)
      if (response.data.status === 200) {
        setSeats(response.data.data.seats)
      }
    } catch (error) {
      console.error('Error fetching seats:', error)
      toast.error('Không thể tải danh sách chỗ ngồi')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSeat = async (seatId: string) => {
    if (!shopData) return
    
    try {
      const response = await authorizedAxiosInstance.delete(`/v1/shops/${shopId}/seats/${seatId}`)
      if (response.data.status === 200) {
        setSeats(seats.filter(seat => seat._id !== seatId))
        toast.success('Xóa chỗ ngồi thành công')
      }
    } catch (error) {
      console.error('Error deleting seat:', error)
      toast.error('Không thể xóa chỗ ngồi')
    }
  }

  // Filter seats based on search and filters
  const filteredSeats = seats.filter(seat => {
    const matchesSearch = seat.seat_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (seat.description && seat.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = filterType === 'all' || 
                       (filterType === 'premium' && seat.is_premium) ||
                       (filterType === 'regular' && !seat.is_premium)
    
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'available' && seat.is_available) ||
                         (filterStatus === 'unavailable' && !seat.is_available)
    
    return matchesSearch && matchesType && matchesStatus
  })

  // Group filtered seats by type
  const regularSeats = filteredSeats.filter(seat => !seat.is_premium)
  const premiumSeats = filteredSeats.filter(seat => seat.is_premium)

  if (loading && !shopData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Đang tải thông tin...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý chỗ ngồi</h1>
          <p className="text-gray-500">Quản lý các chỗ ngồi trong quán {shopData?.name}.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchSeats} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Dialog open={seatModalOpen} onOpenChange={setSeatModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingSeat(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm chỗ ngồi
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingSeat ? 'Chỉnh sửa chỗ ngồi' : 'Thêm chỗ ngồi mới'}</DialogTitle>
                <DialogDescription>
                  {editingSeat ? 'Cập nhật thông tin chỗ ngồi' : 'Tạo chỗ ngồi mới cho quán'}
                </DialogDescription>
              </DialogHeader>
              <SeatForm 
                seat={editingSeat} 
                onSuccess={() => {
                  setSeatModalOpen(false)
                  fetchSeats()
                }}
                shopId={shopId || ''}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm chỗ ngồi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="premium">VIP</SelectItem>
                  <SelectItem value="regular">Thường</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="available">Có sẵn</SelectItem>
                  <SelectItem value="unavailable">Không có sẵn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(searchTerm || filterType !== 'all' || filterStatus !== 'all') && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">
                Hiển thị {filteredSeats.length} / {seats.length} chỗ ngồi
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setFilterType('all')
                  setFilterStatus('all')
                }}
              >
                <X className="w-4 h-4 mr-1" />
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng chỗ ngồi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seats.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredSeats.length !== seats.length && `${filteredSeats.length} đang hiển thị`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chỗ VIP</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seats.filter(s => s.is_premium).length}</div>
            <p className="text-xs text-muted-foreground">
              {premiumSeats.length !== seats.filter(s => s.is_premium).length && 
               `${premiumSeats.length} đang hiển thị`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Có sẵn</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {seats.filter(seat => seat.is_available).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredSeats.filter(s => s.is_available).length !== seats.filter(s => s.is_available).length && 
               `${filteredSeats.filter(s => s.is_available).length} đang hiển thị`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sức chứa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {seats.reduce((sum, seat) => sum + seat.capacity, 0)} người
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredSeats.reduce((sum, seat) => sum + seat.capacity, 0) !== 
               seats.reduce((sum, seat) => sum + seat.capacity, 0) && 
               `${filteredSeats.reduce((sum, seat) => sum + seat.capacity, 0)} đang hiển thị`}
            </p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Đang tải chỗ ngồi...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Premium Seats */}
          {premiumSeats.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Chỗ ngồi VIP ({premiumSeats.length})</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {premiumSeats.map((seat) => (
                  <SeatCard 
                    key={seat._id} 
                    seat={seat} 
                    onEdit={() => {
                      setEditingSeat(seat)
                      setSeatModalOpen(true)
                    }}
                    onDelete={() => handleDeleteSeat(seat._id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Seats */}
          {regularSeats.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Chỗ ngồi thường ({regularSeats.length})</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {regularSeats.map((seat) => (
                  <SeatCard 
                    key={seat._id} 
                    seat={seat} 
                    onEdit={() => {
                      setEditingSeat(seat)
                      setSeatModalOpen(true)
                    }}
                    onDelete={() => handleDeleteSeat(seat._id)}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredSeats.length === 0 && seats.length > 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy chỗ ngồi</h3>
              <p className="text-gray-500 mb-4">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setFilterType('all')
                  setFilterStatus('all')
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Xóa bộ lọc
              </Button>
            </div>
          )}

          {seats.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có chỗ ngồi</h3>
              <p className="text-gray-500 mb-4">Hãy thêm chỗ ngồi đầu tiên cho quán của bạn.</p>
              <Button onClick={() => setSeatModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm chỗ ngồi
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Seat Card Component
function SeatCard({ seat, onEdit, onDelete }: { 
  seat: Seat, 
  onEdit: () => void, 
  onDelete: () => void 
}) {
  const [showDetails, setShowDetails] = useState(false)

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi })
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {seat.seat_name}
              {seat.is_premium && (
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  VIP
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {seat.description || 'Không có mô tả'}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={seat.is_available ? "default" : "secondary"} className="text-xs">
              {seat.is_available ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Có sẵn
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Không có sẵn
                </>
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {seat.image && (
          <div className="relative h-32 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={seat.image}
              alt={seat.seat_name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-200"
            />
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <Users className="w-4 h-4 text-blue-500" />
            <div>
              <p className="font-medium">{seat.capacity}</p>
              <p className="text-xs text-muted-foreground">Người</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <div className={`w-4 h-4 rounded-full ${seat.is_premium ? 'bg-yellow-500' : 'bg-blue-500'}`} />
            <div>
              <p className="font-medium">{seat.is_premium ? 'VIP' : 'Thường'}</p>
              <p className="text-xs text-muted-foreground">Loại</p>
            </div>
          </div>
        </div>

        {/* Toggle details */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-xs"
        >
          {showDetails ? (
            <>
              <ChevronUp className="w-3 h-3 mr-1" />
              Ẩn chi tiết
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 mr-1" />
              Xem chi tiết
            </>
          )}
        </Button>

        {showDetails && (
          <div className="space-y-2 text-xs text-muted-foreground border-t pt-2">
            <div className="flex justify-between">
              <span>ID:</span>
              <span className="font-mono">{seat._id.slice(-6)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tạo lúc:</span>
              <span>{formatDate(seat.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cập nhật:</span>
              <span>{formatDate(seat.updatedAt)}</span>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEdit}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-1" />
            Sửa
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1"
            onClick={() => {
              if (confirm(`Bạn có chắc muốn xóa chỗ ngồi "${seat.seat_name}"?`)) {
                onDelete()
              }
            }}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Xóa
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

// Seat Form Component
function SeatForm({ seat, onSuccess, shopId }: { 
  seat: Seat | null, 
  onSuccess: () => void, 
  shopId: string 
}) {
  const [formData, setFormData] = useState({
    seat_name: seat?.seat_name || '',
    description: seat?.description || '',
    capacity: seat?.capacity || 2,
    is_premium: seat?.is_premium || false,
    is_available: seat?.is_available ?? true,
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(seat?.image || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = seat 
        ? `/v1/shops/${shopId}/seats/${seat._id}`
        : `/v1/shops/${shopId}/seats`
      
      const method = seat ? 'patch' : 'post'
      
      // Tạo FormData để gửi cả file và data
      const submitData = new FormData()
      submitData.append('seat_name', formData.seat_name)
      submitData.append('description', formData.description)
      submitData.append('capacity', formData.capacity.toString())
      submitData.append('is_premium', formData.is_premium.toString())
      submitData.append('is_available', formData.is_available.toString())
      
      if (selectedImage) {
        submitData.append('image', selectedImage)
      }
      
      const response = await authorizedAxiosInstance[method](url, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      if (response.data.status === 200 || response.data.status === 201) {
        toast.success(seat ? 'Cập nhật chỗ ngồi thành công' : 'Thêm chỗ ngồi thành công')
        onSuccess()
      }
    } catch (error) {
      console.error('Error saving seat:', error)
      toast.error('Không thể lưu chỗ ngồi')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="seat_name">Tên chỗ ngồi *</Label>
        <Input
          id="seat_name"
          value={formData.seat_name}
          onChange={(e) => setFormData({ ...formData, seat_name: e.target.value })}
          placeholder="VD: Bàn 1, Sofa góc, Bàn cửa sổ..."
          required
        />
      </div>
      
      <div>
        <Label htmlFor="capacity">Sức chứa (người) *</Label>
        <Input
          id="capacity"
          type="number"
          min="1"
          max="20"
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">Số người tối đa có thể ngồi</p>
      </div>
      
      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Mô tả chi tiết về chỗ ngồi..."
          rows={2}
        />
      </div>

      {/* Image Upload - Compact */}
      <div>
        <Label>Hình ảnh chỗ ngồi</Label>
        <div className="mt-2">
          {imagePreview ? (
            <div className="relative">
              <div className="relative h-24 w-full rounded-lg overflow-hidden border">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={removeImage}
              >
                <X className="w-4 h-4 mr-1" />
                Xóa ảnh
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
              <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500 mb-2">Tải lên hình ảnh chỗ ngồi</p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <Label htmlFor="image-upload" className="cursor-pointer">
                <Button type="button" variant="outline" size="sm" asChild>
                  <span>Chọn ảnh</span>
                </Button>
              </Label>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="is_premium"
            checked={formData.is_premium}
            onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
          />
          <div>
            <Label htmlFor="is_premium">Chỗ ngồi VIP</Label>
            <p className="text-xs text-muted-foreground">Chỗ ngồi cao cấp, phụ thu</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="is_available"
            checked={formData.is_available}
            onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
          />
          <div>
            <Label htmlFor="is_available">Có sẵn</Label>
            <p className="text-xs text-muted-foreground">Cho phép đặt chỗ</p>
          </div>
        </div>
      </div>

      {/* Preview thông tin - Compact */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="font-medium mb-2 text-sm">Xem trước:</h4>
        <div className="text-xs space-y-1">
          <div className="grid grid-cols-2 gap-2">
            <p><strong>Tên:</strong> {formData.seat_name || 'Chưa nhập'}</p>
            <p><strong>Sức chứa:</strong> {formData.capacity} người</p>
            <p><strong>Loại:</strong> {formData.is_premium ? 'VIP' : 'Thường'}</p>
            <p><strong>Trạng thái:</strong> {formData.is_available ? 'Có sẵn' : 'Không có sẵn'}</p>
          </div>
          {formData.description && (
            <p><strong>Mô tả:</strong> {formData.description.slice(0, 50)}{formData.description.length > 50 ? '...' : ''}</p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting || !formData.seat_name}>
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {seat ? 'Cập nhật' : 'Thêm mới'}
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}
