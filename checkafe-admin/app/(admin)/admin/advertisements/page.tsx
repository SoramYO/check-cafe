'use client'
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import authorizedAxiosInstance from "@/lib/axios"
import { Advertisement, AdvertisementResponse, FilterParams } from "./types"
import { toast } from "sonner"
import { Plus, RefreshCw } from "lucide-react"
import { AdvertisementFilters } from "./components/AdvertisementFilters"
import { AdvertisementTable } from "./components/AdvertisementTable"
import { AdvertisementDetailModal } from "./components/AdvertisementDetailModal"
import { AdvertisementFormModal } from "./components/AdvertisementFormModal"
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog"

export default function AdvertisementsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [metadata, setMetadata] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  })

  // State for modals
  const [selectedAdvertisement, setSelectedAdvertisement] = useState<Advertisement | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterParams>({
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || 'all'
  })

  // Sync filters with URL params
  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value.toString())
    })
    router.push(`?${params.toString()}`, { scroll: false })
  }, [filters, router])

  // Fetch advertisements when filters change
  useEffect(() => {
    fetchAdvertisements()
  }, [filters])

  const fetchAdvertisements = async () => {
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
      
      if (filters.type && filters.type !== 'all') {
        queryParams.set('type', filters.type)
      }
      
      const response = await authorizedAxiosInstance.get<AdvertisementResponse>(`v1/advertisements?${queryParams.toString()}`)
      
      if (response.data.status === 200) {
        setAdvertisements(response.data.data.data)
        setMetadata({
          total: response.data.data.metadata.total,
          page: response.data.data.metadata.page,
          limit: response.data.data.metadata.limit,
          totalPages: response.data.data.metadata.totalPages
        })
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error)
      setError('Có lỗi xảy ra khi tải danh sách quảng cáo')
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

  const handleViewDetail = (advertisementId: string) => {
    const advertisement = advertisements.find(ad => ad._id === advertisementId)
    if (advertisement) {
      setSelectedAdvertisement(advertisement)
      setIsDetailModalOpen(true)
    }
  }

  const handleAddNew = () => {
    setSelectedAdvertisement(null)
    setIsFormModalOpen(true)
  }

  const handleEdit = (advertisementId: string) => {
    const advertisement = advertisements.find(ad => ad._id === advertisementId)
    if (advertisement) {
      setSelectedAdvertisement(advertisement)
      setIsDetailModalOpen(false)
      setIsFormModalOpen(true)
    }
  }

  const handleDelete = (advertisementId: string) => {
    const advertisement = advertisements.find(ad => ad._id === advertisementId)
    if (advertisement) {
      setSelectedAdvertisement(advertisement)
      setIsDeleteDialogOpen(true)
    }
  }

  const confirmDelete = async () => {
    if (!selectedAdvertisement) return
    
    try {
      setIsDeleting(true)
      const response = await authorizedAxiosInstance.delete(`/v1/advertisements/${selectedAdvertisement._id}`)
      
      if (response.data.status === 200) {
        toast.success('Xóa quảng cáo thành công')
        fetchAdvertisements()
      }
    } catch (error) {
      console.error('Error deleting advertisement:', error)
      toast.error('Không thể xóa quảng cáo')
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý quảng cáo</h1>
          <p className="text-gray-500">Tạo và quản lý các quảng cáo trên ứng dụng ChecKafe.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={fetchAdvertisements}
          >
            <RefreshCw className="h-4 w-4" /> Làm mới
          </Button>
          <Button 
            className="bg-primary hover:bg-primary-dark flex items-center gap-1"
            onClick={handleAddNew}
          >
            <Plus className="h-4 w-4" /> Thêm quảng cáo mới
          </Button>
        </div>
      </div>

      <AdvertisementFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {loading ? (
        <div className="py-8 text-center">Đang tải...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">{error}</div>
      ) : (
        <AdvertisementTable 
          advertisements={advertisements}
          onViewDetails={handleViewDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Pagination */}
      {metadata.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị {advertisements.length} / {metadata.total} quảng cáo
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
      <AdvertisementDetailModal
        advertisement={selectedAdvertisement}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSuccess={fetchAdvertisements}
      />

      <AdvertisementFormModal
        advertisement={selectedAdvertisement}
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchAdvertisements}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        advertisementTitle={selectedAdvertisement?.title}
      />
    </div>
  )
}
