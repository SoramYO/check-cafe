'use client'
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Plus, Edit, Trash2, Coffee, Store, RefreshCw } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import authorizedAxiosInstance from "@/lib/axios"
import { Theme, ThemeResponse, FilterParams } from "./types"
import { toast } from "sonner"
import { ThemeFilters } from "./components/ThemeFilters"
import { ThemeFormModal } from "./components/ThemeFormModal"
import { ThemeDetailModal } from "./components/ThemeDetailModal"
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog"

const themes = [
  {
    id: "theme-001",
    name: "Vintage",
    description: "Phong cách cổ điển, hoài niệm với nội thất gỗ và tông màu ấm",
    image: "/placeholder.svg?height=200&width=400",
    shops: 42,
  },
  {
    id: "theme-002",
    name: "View Rừng",
    description: "Không gian xanh mát, gần gũi thiên nhiên với view nhìn ra rừng cây",
    image: "/placeholder.svg?height=200&width=400",
    shops: 28,
  },
  {
    id: "theme-003",
    name: "Hàn Quốc",
    description: "Thiết kế tối giản, hiện đại theo phong cách Hàn Quốc",
    image: "/placeholder.svg?height=200&width=400",
    shops: 35,
  },
  {
    id: "theme-004",
    name: "Industrial",
    description: "Phong cách công nghiệp với kim loại, bê tông và ánh sáng vàng",
    image: "/placeholder.svg?height=200&width=400",
    shops: 23,
  },
  {
    id: "theme-005",
    name: "Minimalist",
    description: "Đơn giản, tối giản với tông màu trắng và đen chủ đạo",
    image: "/placeholder.svg?height=200&width=400",
    shops: 31,
  },
  {
    id: "theme-006",
    name: "Tropical",
    description: "Không gian nhiệt đới với cây xanh và màu sắc rực rỡ",
    image: "/placeholder.svg?height=200&width=400",
    shops: 19,
  },
]

export default function ThemesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [metadata, setMetadata] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  })

  // State for modals
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterParams>({
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    search: searchParams.get('search') || ''
  })

  // Sync filters with URL params
  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value.toString())
    })
    router.push(`?${params.toString()}`, { scroll: false })
  }, [filters, router])

  // Fetch themes when filters change
  useEffect(() => {
    fetchThemes()
  }, [filters])

  const fetchThemes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query parameters
      const queryParams = new URLSearchParams()
      queryParams.set('page', filters.page.toString())
      queryParams.set('limit', filters.limit.toString())
      
      if (filters.search) {
        queryParams.set('search', filters.search)
      }
      
      const response = await authorizedAxiosInstance.get<ThemeResponse>(`/v1/themes?${queryParams.toString()}`)
      
      if (response.data.status === 200) {
        setThemes(response.data.data.themes)
        setMetadata({
          total: response.data.data.metadata.total,
          page: response.data.data.metadata.page,
          limit: response.data.data.metadata.limit,
          totalPages: response.data.data.metadata.totalPages
        })
      }
    } catch (error) {
      console.error('Error fetching themes:', error)
      setError('Có lỗi xảy ra khi tải danh sách chủ đề')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof FilterParams, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }))
  }

  const handleViewDetail = (theme: Theme) => {
    setSelectedTheme(theme)
    setIsDetailModalOpen(true)
  }

  const handleAddNew = () => {
    setSelectedTheme(null)
    setIsFormModalOpen(true)
  }

  const handleEdit = (theme: Theme) => {
    setSelectedTheme(theme)
    setIsDetailModalOpen(false)
    setIsFormModalOpen(true)
  }

  const handleDelete = (theme: Theme) => {
    setSelectedTheme(theme)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedTheme) return
    
    try {
      setIsDeleting(true)
      const response = await authorizedAxiosInstance.delete(`/v1/themes/${selectedTheme._id}`)
      
      if (response.data.status === 200) {
        toast.success('Xóa chủ đề thành công')
        fetchThemes()
      }
    } catch (error) {
      console.error('Error deleting theme:', error)
      toast.error('Không thể xóa chủ đề')
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý chủ đề</h1>
          <p className="text-gray-500">Tạo và quản lý các chủ đề cho quán cà phê.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={fetchThemes}
          >
            <RefreshCw className="h-4 w-4" /> Làm mới
          </Button>
          <Button 
            className="bg-primary hover:bg-primary-dark flex items-center gap-1"
            onClick={handleAddNew}
          >
            <Plus className="h-4 w-4" /> Thêm chủ đề mới
          </Button>
        </div>
      </div>

      <ThemeFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {loading ? (
        <div className="py-8 text-center">Đang tải...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">{error}</div>
      ) : themes.length === 0 ? (
        <div className="py-8 text-center text-gray-500">Không có chủ đề nào</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <Card key={theme._id} className="overflow-hidden">
              <div className="relative h-48 w-full">
                <img 
                  src={theme.theme_image} 
                  alt={theme.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{theme.name}</CardTitle>
                </div>
                <CardDescription className="line-clamp-2">{theme.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewDetail(theme)}
                >
                  Xem chi tiết
                </Button>
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleEdit(theme)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(theme)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {metadata.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị {themes.length} / {metadata.total} chủ đề
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(metadata.page - 1)}
              disabled={metadata.page === 1}
            >
              Trang trước
            </Button>
            <div className="text-sm">
              Trang {metadata.page} / {metadata.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(metadata.page + 1)}
              disabled={metadata.page === metadata.totalPages}
            >
              Trang sau
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ThemeDetailModal
        theme={selectedTheme}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleEdit}
        onDelete={(themeId: string) => {
          const theme = themes.find(t => t._id === themeId);
          if (theme) {
            handleDelete(theme);
          }
        }}
      />

      <ThemeFormModal
        theme={selectedTheme}
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchThemes}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        themeName={selectedTheme?.name}
      />
    </div>
  )
}
