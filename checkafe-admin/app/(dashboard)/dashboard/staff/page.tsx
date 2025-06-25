'use client'
import { Button } from "@/components/ui/button"
import { Users, UserPlus } from "lucide-react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import authorizedAxiosInstance from "@/lib/axios"
import { Staff, StaffResponse, FilterParams } from "./types"
import { StaffTable } from "./components/StaffTable"
import { StaffFilters } from "./components/StaffFilters"
import { StaffDetailModal } from "./components/StaffDetailModal"
import { CreateStaffModal } from "./components/CreateStaffModal"
import { EditStaffModal } from "./components/EditStaffModal"
import { toast } from "sonner"
import { useShop } from "@/context/ShopContext"

interface Shop {
  _id: string
  name: string
  staff_ids?: string[]
}

export default function StaffPage() {
  const router = useRouter()
  const { shopData } = useShop()
  const shopId = shopData?._id
  const searchParams = useSearchParams()
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [editStaffId, setEditStaffId] = useState<string | null>(null)
  const [metadata, setMetadata] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  })

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterParams>({
    search: searchParams.get('search') || '',
    is_active: searchParams.get('is_active') || 'all',
    shop_id: searchParams.get('shop_id') || 'all',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10')
  })

  // Sync filters with URL params
  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value.toString())
    })
    router.push(`?${params.toString()}`)
  }, [filters, router])

  // Fetch shop on component mount
  useEffect(() => {
    if (shopId) {
      fetchStaff()
    }
  }, [shopId])

  // Fetch staff when filters change or shop is loaded
  useEffect(() => {
    if (shopId) {
      fetchStaff()
    }
  }, [filters, shopId])


  const fetchStaff = async () => {
    if (!shopId) return

    try {
      setLoading(true)
      setError(null)
      
      // Build query parameters for backend
      const queryParams = new URLSearchParams()
      queryParams.set('page', filters.page.toString())
      queryParams.set('limit', filters.limit.toString())
      
      if (filters.search) {
        queryParams.set('search', filters.search)
      }
      
      if (filters.sortBy && filters.sortBy !== 'all') {
        queryParams.set('sortBy', filters.sortBy)
      }
      if (filters.sortOrder) {
        queryParams.set('sortOrder', filters.sortOrder)
      }
      
      const responseStaff = await authorizedAxiosInstance.get(`/v1/shops/${shopId}/staff?${queryParams.toString()}`)
      if (responseStaff.data.status === 200) {
        console.log(responseStaff.data.data)
        const staffData = responseStaff.data.data.data || []
        
        // Add shop information to each staff member
        const staffWithShopInfo = staffData.map((staffMember: any) => ({
          ...staffMember,
          shop_id: shopId,
          shop_name: shopId
        }))

        // Apply filters - Remove local filtering since backend now handles search
        let filteredStaff = staffWithShopInfo

        // Apply active status filter (keep this as backend might not handle it)
        if (filters.is_active && filters.is_active !== 'all') {
          const isActive = filters.is_active === 'true'
          filteredStaff = filteredStaff.filter((s: Staff) => s.is_active === isActive)
        }

        // Backend now handles search and pagination, so use the data directly
        setStaff(filteredStaff)
        setMetadata({
          total: responseStaff.data.data.metadata?.total || filteredStaff.length,
          page: responseStaff.data.data.metadata?.page || filters.page,
          limit: responseStaff.data.data.metadata?.limit || filters.limit,
          totalPages: responseStaff.data.data.metadata?.totalPages || Math.ceil(filteredStaff.length / filters.limit)
        })
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
      setError('Có lỗi xảy ra khi tải danh sách nhân viên')
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

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    fetchStaff()
  }

  const handleEditSuccess = () => {
    setEditStaffId(null)
    fetchStaff()
  }

  const handleDeleteStaff = async (staffId: string) => {

  }

  if (!shopId && !error) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-gray-500">Đang tải thông tin cửa hàng...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Quản lý nhân viên{shopData && ` - ${shopData.name}`}
          </h1>
          <p className="text-gray-500">Quản lý nhân viên trong cửa hàng của bạn.</p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark" onClick={() => setShowCreateModal(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Thêm nhân viên mới
        </Button>
      </div>

      <StaffFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        shops={shopData ? [shopData] : []}
      />

      {loading ? (
        <div className="py-8 text-center">Đang tải...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">{error}</div>
      ) : staff.length === 0 ? (
        <div className="py-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có nhân viên</h3>
          <p className="mt-1 text-sm text-gray-500">
            Bắt đầu bằng cách thêm nhân viên mới cho cửa hàng.
          </p>
          <div className="mt-6">
            <Button onClick={() => setShowCreateModal(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Thêm nhân viên mới
            </Button>
          </div>
        </div>
      ) : (
        <StaffTable 
          staff={staff}
          onViewDetails={setSelectedStaffId}
          onEditStaff={setEditStaffId}
          onDeleteStaff={handleDeleteStaff}
        />
      )}

      {/* Pagination */}
      {metadata.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị {staff.length} / {metadata.total} nhân viên
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
      <CreateStaffModal 
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <StaffDetailModal 
        staffId={selectedStaffId}
        onClose={() => setSelectedStaffId(null)}
      />

      <EditStaffModal 
        staffId={editStaffId}
        open={!!editStaffId}
        onClose={() => setEditStaffId(null)}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}
