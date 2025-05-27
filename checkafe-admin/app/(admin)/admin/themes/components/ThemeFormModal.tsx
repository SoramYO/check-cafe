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
import { Theme } from "../types"
import authorizedAxiosInstance from "@/lib/axios"
import { Image as ImageIcon, Loader2 } from "lucide-react"

interface ThemeFormModalProps {
  theme?: Theme | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ThemeFormModal({ theme, isOpen, onClose, onSuccess }: ThemeFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const isEditMode = !!theme

  // Initialize form with theme data if in edit mode
  useEffect(() => {
    if (theme) {
      setFormData({
        name: theme.name,
        description: theme.description,
      })
      setImagePreview(theme.theme_image)
    } else {
      resetForm()
    }
  }, [theme, isOpen])

  const resetForm = () => {
    setFormData({ name: '', description: '' })
    setImageFile(null)
    setImagePreview('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên chủ đề')
      return
    }
    
    if (!formData.description.trim()) {
      toast.error('Vui lòng nhập mô tả chủ đề')
      return
    }
    
    if (!imageFile && !isEditMode) {
      toast.error('Vui lòng chọn hình ảnh')
      return
    }

    // Prepare form data for API
    const apiFormData = new FormData()
    apiFormData.append('name', formData.name)
    apiFormData.append('description', formData.description)
    
    if (imageFile) {
      apiFormData.append('theme_image', imageFile)
    }

    try {
      setLoading(true)
      
      if (isEditMode && theme) {
        await authorizedAxiosInstance.patch(`/v1/themes/${theme._id}`, apiFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Cập nhật chủ đề thành công')
      } else {
        await authorizedAxiosInstance.post('/v1/themes', apiFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Thêm chủ đề mới thành công')
      }
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error submitting theme:', error)
      toast.error(isEditMode ? 'Không thể cập nhật chủ đề' : 'Không thể thêm chủ đề')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Chỉnh sửa chủ đề' : 'Thêm chủ đề mới'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên chủ đề</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nhập tên chủ đề"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Mô tả chủ đề"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="image">Hình ảnh</Label>
              <div className="flex flex-col gap-4">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                
                {imagePreview ? (
                  <div className="relative w-full h-40 overflow-hidden border rounded-md">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full h-40 border rounded-md bg-gray-50">
                    <div className="flex flex-col items-center text-gray-400">
                      <ImageIcon size={32} />
                      <span>Chưa có hình ảnh</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 