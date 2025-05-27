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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, RefreshCw, Upload, Save, X, Search, Filter, ChevronDown, ChevronUp } from "lucide-react"
import Image from "next/image"
import authorizedAxiosInstance from "@/lib/axios"
import { toast } from "sonner"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface MenuItem {
  _id: string
  name: string
  description: string
  price: number
  category: {
    _id: string
    name: string
    description?: string
  }
  is_available: boolean
  images: Array<{
    url: string
    publicId: string
  }>
  createdAt: string
  updatedAt: string
}

interface Category {
  _id: string
  name: string
  description?: string
}

interface ShopData {
  _id: string
  name: string
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [shopData, setShopData] = useState<ShopData | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuLoading, setMenuLoading] = useState(false)
  const [menuModalOpen, setMenuModalOpen] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null)
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [filterAvailable, setFilterAvailable] = useState<'all' | 'available' | 'unavailable'>('all')

  useEffect(() => {
    fetchShopData()
    fetchCategories()
  }, [])

  useEffect(() => {
    if (shopData) {
      fetchMenuItems()
    }
  }, [shopData])

  const fetchShopData = async () => {
    try {
      const response = await authorizedAxiosInstance.get('/v1/shops/my-shop')
      if (response.data.status === 200) {
        setShopData(response.data.data.shop)
      }
    } catch (error) {
      console.error('Error fetching shop data:', error)
      toast.error('Không thể tải thông tin quán')
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await authorizedAxiosInstance.get('/v1/menu-item-categories')
      if (response.data.status === 200) {
        setCategories(response.data.data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Không thể tải danh sách danh mục')
    }
  }

  const fetchMenuItems = async () => {
    if (!shopData) return
    
    try {
      setMenuLoading(true)
      const response = await authorizedAxiosInstance.get(`/v1/shops/${shopData._id}/menu-items`)
      if (response.data.status === 200) {
        setMenuItems(response.data.data.menuItems)
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
      toast.error('Không thể tải danh sách menu')
    } finally {
      setMenuLoading(false)
      setLoading(false)
    }
  }

  const handleDeleteMenuItem = async (itemId: string) => {
    if (!shopData) return
    
    try {
      const response = await authorizedAxiosInstance.delete(`/v1/shops/${shopData._id}/menu-items/${itemId}`)
      if (response.data.status === 200) {
        setMenuItems(menuItems.filter(item => item._id !== itemId))
        toast.success('Xóa món ăn thành công')
      }
    } catch (error) {
      console.error('Error deleting menu item:', error)
      toast.error('Không thể xóa món ăn')
    }
  }

  // Filter menu items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || item.category._id === selectedCategory
    
    const matchesAvailable = filterAvailable === 'all' ||
                            (filterAvailable === 'available' && item.is_available) ||
                            (filterAvailable === 'unavailable' && !item.is_available)
    
    return matchesSearch && matchesCategory && matchesAvailable
  })

  // Group by category
  const groupedMenuItems = categories.reduce((acc, category) => {
    const categoryItems = filteredMenuItems.filter(item => item.category._id === category._id)
    if (categoryItems.length > 0) {
      acc[category._id] = {
        category,
        items: categoryItems
      }
    }
    return acc
  }, {} as Record<string, { category: Category; items: MenuItem[] }>)

  if (loading) {
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
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Menu</h1>
          <p className="text-gray-500">Quản lý các món ăn, đồ uống trong menu của quán {shopData?.name}.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchMenuItems} disabled={menuLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${menuLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Dialog open={menuModalOpen} onOpenChange={setMenuModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingMenuItem(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm món mới
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingMenuItem ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}</DialogTitle>
                <DialogDescription>
                  {editingMenuItem ? 'Cập nhật thông tin món ăn' : 'Tạo món ăn mới cho menu'}
                </DialogDescription>
              </DialogHeader>
              <MenuItemForm 
                menuItem={editingMenuItem} 
                categories={categories}
                onSuccess={() => {
                  setMenuModalOpen(false)
                  fetchMenuItems()
                }}
                shopId={shopData?._id || ''}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm món ăn..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterAvailable} onValueChange={(value: any) => setFilterAvailable(value)}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="available">Có sẵn</SelectItem>
                    <SelectItem value="unavailable">Hết hàng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category Filter - Horizontal */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Danh mục:</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                  className="h-8"
                >
                  Tất cả ({menuItems.length})
                </Button>
                {categories.map((category) => {
                  const categoryCount = menuItems.filter(item => item.category._id === category._id).length
                  return (
                    <Button
                      key={category._id}
                      variant={selectedCategory === category._id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category._id)}
                      className="h-8"
                    >
                      {category.name} ({categoryCount})
                    </Button>
                  )
                })}
              </div>
            </div>
            
            {(searchTerm || selectedCategory !== 'all' || filterAvailable !== 'all') && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Hiển thị {filteredMenuItems.length} / {menuItems.length} món ăn
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                    setFilterAvailable('all')
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng món ăn</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menuItems.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredMenuItems.length !== menuItems.length && `${filteredMenuItems.length} đang hiển thị`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Có sẵn</CardTitle>
            <Badge className="h-4 w-4 text-muted-foreground bg-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {menuItems.filter(item => item.is_available).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredMenuItems.filter(i => i.is_available).length !== menuItems.filter(i => i.is_available).length && 
               `${filteredMenuItems.filter(i => i.is_available).length} đang hiển thị`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Danh mục</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              {Object.keys(groupedMenuItems).length !== categories.length && 
               `${Object.keys(groupedMenuItems).length} có món`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giá trung bình</CardTitle>
            <span className="h-4 w-4 text-muted-foreground">₫</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {menuItems.length > 0 
                ? Math.round(menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length).toLocaleString()
                : 0}₫
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredMenuItems.length > 0 && filteredMenuItems.length !== menuItems.length &&
               `${Math.round(filteredMenuItems.reduce((sum, item) => sum + item.price, 0) / filteredMenuItems.length).toLocaleString()}₫ hiển thị`}
            </p>
          </CardContent>
        </Card>
      </div>

      {menuLoading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Đang tải menu...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMenuItems.length > 0 ? (
            <div className="space-y-4">
              {selectedCategory !== 'all' ? (
                // Hiển thị cho category cụ thể
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {categories.find(c => c._id === selectedCategory)?.name}
                      </h2>
                      {categories.find(c => c._id === selectedCategory)?.description && (
                        <p className="text-muted-foreground">
                          {categories.find(c => c._id === selectedCategory)?.description}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{filteredMenuItems.length} món</span>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredMenuItems.map((item) => (
                      <MenuItemCard 
                        key={item._id} 
                        item={item} 
                        onEdit={() => {
                          setEditingMenuItem(item)
                          setMenuModalOpen(true)
                        }}
                        onDelete={() => handleDeleteMenuItem(item._id)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                // Hiển thị tất cả theo categories
                <div className="space-y-8">
                  {Object.values(groupedMenuItems).map(({ category, items }) => (
                    <div key={category._id}>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h2 className="text-xl font-semibold">{category.name}</h2>
                          {category.description && (
                            <p className="text-muted-foreground">{category.description}</p>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">{items.length} món</span>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                          <MenuItemCard 
                            key={item._id} 
                            item={item} 
                            onEdit={() => {
                              setEditingMenuItem(item)
                              setMenuModalOpen(true)
                            }}
                            onDelete={() => handleDeleteMenuItem(item._id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : filteredMenuItems.length === 0 && menuItems.length > 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy món ăn</h3>
              <p className="text-gray-500 mb-4">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                  setFilterAvailable('all')
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Xóa bộ lọc
              </Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có món ăn</h3>
              <p className="text-gray-500 mb-4">Hãy thêm món ăn đầu tiên cho menu của bạn.</p>
              <Button onClick={() => setMenuModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm món ăn
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Menu Item Card Component
function MenuItemCard({ item, onEdit, onDelete }: { 
  item: MenuItem, 
  onEdit: () => void, 
  onDelete: () => void 
}) {
  const [showDetails, setShowDetails] = useState(false)

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{item.name}</CardTitle>
            <CardDescription className="mt-1">
              {item.description || 'Không có mô tả'}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-lg font-bold text-primary">
              {formatPrice(item.price)}
            </div>
            <Badge variant={item.is_available ? "default" : "secondary"} className="text-xs">
              {item.is_available ? 'Có sẵn' : 'Hết hàng'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {item.images.length > 0 && (
          <div className="relative h-40 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={item.images[0].url}
              alt={item.name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-200"
            />
            {item.images.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                +{item.images.length - 1}
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <Badge variant="outline">{item.category.name}</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs"
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
        </div>

        {showDetails && (
          <div className="space-y-2 text-xs text-muted-foreground border-t pt-2">
            <div className="flex justify-between">
              <span>ID:</span>
              <span className="font-mono">{item._id.slice(-6)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tạo lúc:</span>
              <span>{formatDate(item.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cập nhật:</span>
              <span>{formatDate(item.updatedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Số ảnh:</span>
              <span>{item.images.length}</span>
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
              if (confirm(`Bạn có chắc muốn xóa món "${item.name}"?`)) {
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

// Menu Item Form Component
function MenuItemForm({ menuItem, categories, onSuccess, shopId }: { 
  menuItem: MenuItem | null, 
  categories: Category[], 
  onSuccess: () => void, 
  shopId: string 
}) {
  const [formData, setFormData] = useState({
    name: menuItem?.name || '',
    description: menuItem?.description || '',
    price: menuItem?.price || 0,
    category: menuItem?.category._id || '',
    is_available: menuItem?.is_available ?? true,
  })
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    menuItem?.images.map(img => img.url) || []
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + imagePreviews.length > 3) {
      toast.error('Tối đa 3 ảnh')
      return
    }

    setSelectedImages(prev => [...prev, ...files])
    
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = menuItem 
        ? `/v1/shops/${shopId}/menu-items/${menuItem._id}`
        : `/v1/shops/${shopId}/menu-items`
      
      const method = menuItem ? 'patch' : 'post'
      
      // Tạo FormData để gửi cả file và data
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('description', formData.description)
      submitData.append('price', formData.price.toString())
      submitData.append('category', formData.category)
      submitData.append('is_available', formData.is_available.toString())
      
      selectedImages.forEach((image, index) => {
        submitData.append('images', image)
      })
      
      const response = await authorizedAxiosInstance[method](url, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      if (response.data.status === 200 || response.data.status === 201) {
        toast.success(menuItem ? 'Cập nhật món ăn thành công' : 'Thêm món ăn thành công')
        onSuccess()
      }
    } catch (error) {
      console.error('Error saving menu item:', error)
      toast.error('Không thể lưu món ăn')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Tên món ăn *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="VD: Cà phê đen, Bánh tiramisu..."
            required
          />
        </div>
        
        <div>
          <Label htmlFor="price">Giá (VNĐ) *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
            placeholder="25000"
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="category">Danh mục *</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category._id} value={category._id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Mô tả chi tiết về món ăn..."
          rows={2}
        />
      </div>

      {/* Image Upload - Compact */}
      <div>
        <Label>Hình ảnh món ăn (1-3 ảnh)</Label>
        <div className="mt-2 space-y-2">
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <div className="relative h-20 rounded-lg overflow-hidden border">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {imagePreviews.length < 3 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
              <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500 mb-2">Tải lên hình ảnh</p>
              <Input
                type="file"
                accept="image/*"
                multiple
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
      
      <div className="flex items-center space-x-2">
        <Switch
          id="is_available"
          checked={formData.is_available}
          onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
        />
        <div>
          <Label htmlFor="is_available">Có sẵn</Label>
          <p className="text-xs text-muted-foreground">Cho phép khách hàng đặt món này</p>
        </div>
      </div>

      {/* Preview thông tin - Compact */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="font-medium mb-2 text-sm">Xem trước:</h4>
        <div className="text-xs space-y-1">
          <div className="grid grid-cols-2 gap-2">
            <p><strong>Tên:</strong> {formData.name || 'Chưa nhập'}</p>
            <p><strong>Giá:</strong> {formData.price.toLocaleString()}₫</p>
            <p><strong>Danh mục:</strong> {categories.find(c => c._id === formData.category)?.name || 'Chưa chọn'}</p>
            <p><strong>Trạng thái:</strong> {formData.is_available ? 'Có sẵn' : 'Hết hàng'}</p>
          </div>
          <p><strong>Số ảnh:</strong> {imagePreviews.length}</p>
          {formData.description && (
            <p><strong>Mô tả:</strong> {formData.description.slice(0, 50)}{formData.description.length > 50 ? '...' : ''}</p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting || !formData.name || !formData.category}>
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {menuItem ? 'Cập nhật' : 'Thêm mới'}
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}
