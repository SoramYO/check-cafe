'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Mail, Phone, Calendar, Eye, Edit, Trash2, CheckCircle, UserPlus } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import authorizedAxiosInstance from "@/lib/axios"
import { User, UserResponse, FilterParams } from "./types"
import { UserTable } from "./components/UserTable"
import { UserFilters } from "./components/UserFilters"
import { toast } from "sonner"

export default function UsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [metadata, setMetadata] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  })

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterParams>({
    search: searchParams.get('search') || '',
    role: searchParams.get('role') || 'all',
    is_active: searchParams.get('is_active') || 'all',
    vip_status: searchParams.get('vip_status') || 'all',
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

  // Fetch users when filters change
  useEffect(() => {
    fetchUsers()
  }, [filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query parameters based on backend service requirements
      const queryParams = new URLSearchParams()
      // Add pagination parameters
      queryParams.set('page', filters.page.toString())
      queryParams.set('limit', filters.limit.toString())
      
      // Add search parameter if provided
      if (filters.search) {
        queryParams.set('search', filters.search)
      }
      
      // Add role filter if not "all"
      if (filters.role && filters.role !== 'all') {
        queryParams.set('role', filters.role)
      }
      
      // Handle is_active filter - convert string to boolean
      if (filters.is_active && filters.is_active !== 'all') {
        // Backend expects actual boolean value
        const isActive = filters.is_active === 'true'
        queryParams.set('is_active', isActive.toString())
      }
      
      // Note: vip_status, sortBy and sortOrder aren't handled by the backend service in the provided code
      // But we'll keep them in the URL for future implementation
      if (filters.vip_status && filters.vip_status !== 'all') {
        queryParams.set('vip_status', filters.vip_status)
      }
      if (filters.sortBy && filters.sortBy !== 'all') {
        queryParams.set('sortBy', filters.sortBy)
      }
      if (filters.sortOrder) {
        queryParams.set('sortOrder', filters.sortOrder)
      }
      
      const response = await authorizedAxiosInstance.get<UserResponse>(`/v1/admin/users?${queryParams.toString()}`)
      
      if (response.data.status === 200) {
        setUsers(response.data.data.data)
        setMetadata({
          total: response.data.data.metadata.total,
          page: response.data.data.metadata.page,
          limit: response.data.data.metadata.limit,
          totalPages: response.data.data.metadata.totalPages
        })
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Có lỗi xảy ra khi tải danh sách người dùng')
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

  const handleViewDetails = (userId: string) => {
    router.push(`/admin/users/${userId}`)
  }

  const handleEditUser = (userId: string) => {
    router.push(`/admin/users/${userId}/edit`)
  }

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        const response = await authorizedAxiosInstance.delete(`/v1/admin/users/${userId}`)
        if (response.data.status === 200) {
          toast.success('Xóa người dùng thành công')
          fetchUsers()
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        toast.error('Có lỗi xảy ra khi xóa người dùng')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý người dùng</h1>
          <p className="text-gray-500">Quản lý tất cả người dùng trên hệ thống ChecKafe.</p>
        </div>
        <Button 
          onClick={() => router.push('/admin/users/create')}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Thêm người dùng mới
        </Button>
      </div>

      <UserFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {loading ? (
        <div className="py-8 text-center">Đang tải...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">{error}</div>
      ) : (
        <UserTable 
          users={users}
          onViewDetails={handleViewDetails}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {/* Pagination */}
      {metadata.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị {users.length} / {metadata.total} người dùng
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
    </div>
  )
}
