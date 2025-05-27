'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import authorizedAxiosInstance from "@/lib/axios"
import { Verification, VerificationResponse, FilterParams } from "./types"
import { VerificationTable } from "./components/VerificationTable"
import { VerificationFilters } from "./components/VerificationFilters"
import { VerificationDetailModal } from "./components/VerificationDetailModal"
import { toast } from "sonner"
import { 
  ClipboardCheck, 
  RefreshCw, 
  FileCheck, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Users,
  Building
} from "lucide-react"

export default function ApprovalsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedVerificationId, setSelectedVerificationId] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })
  const [metadata, setMetadata] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  })

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterParams>({
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    status: searchParams.get('status') || 'all',
    shopId: searchParams.get('shopId') || ''
  })

  // Sync filters with URL params
  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value.toString())
    })
    router.push(`?${params.toString()}`, { scroll: false })
  }, [filters, router])

  // Fetch verifications when filters change
  useEffect(() => {
    fetchVerifications()
  }, [filters])

  const fetchVerifications = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query parameters
      const queryParams = new URLSearchParams()
      queryParams.set('page', filters.page.toString())
      queryParams.set('limit', filters.limit.toString())
      
      if (filters.status && filters.status !== 'all') {
        queryParams.set('status', filters.status)
      }
      
      if (filters.shopId) {
        queryParams.set('shopId', filters.shopId)
      }
      
      const response = await authorizedAxiosInstance.get<VerificationResponse>(`/v1/verifications?${queryParams.toString()}`)
      
      if (response.data.status === 200) {
        setVerifications(response.data.data.verifications)
        setMetadata({
          total: response.data.data.pagination.total,
          page: response.data.data.pagination.page,
          limit: response.data.data.pagination.limit,
          totalPages: response.data.data.pagination.totalPages
        })
        
        // Calculate stats
        const allVerifications = response.data.data.verifications
        setStats({
          total: allVerifications.length,
          pending: allVerifications.filter(v => v.status === 'Pending').length,
          approved: allVerifications.filter(v => v.status === 'Approved').length,
          rejected: allVerifications.filter(v => v.status === 'Rejected').length
        })
      }
    } catch (error) {
      console.error('Error fetching verifications:', error)
      setError('Có lỗi xảy ra khi tải danh sách xác minh')
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

  const handleUpdateStatus = async (verificationId: string, status: string) => {
    try {
      const response = await authorizedAxiosInstance.patch(`/v1/verifications/${verificationId}`, {
        status,
        reason: status === 'Approved' ? 'Approved by admin' : 'Rejected by admin'
      })
      
      if (response.data.status === 200) {
        toast.success(`Cập nhật trạng thái thành công: ${status === 'Approved' ? 'Đã duyệt' : 'Từ chối'}`)
        fetchVerifications()
      }
    } catch (error) {
      console.error('Error updating verification status:', error)
      toast.error('Không thể cập nhật trạng thái')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý xác minh giấy tờ</h1>
          <p className="text-muted-foreground">
            Quản lý yêu cầu xác minh giấy tờ của các quán cà phê trên hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={fetchVerifications} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng yêu cầu</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metadata.total}</div>
            <p className="text-xs text-muted-foreground">
              Tất cả yêu cầu xác minh
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Cần xem xét và phê duyệt
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              Đã được phê duyệt
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Từ chối</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">
              Đã bị từ chối
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bộ lọc</CardTitle>
          <CardDescription>
            Lọc yêu cầu xác minh theo trạng thái và quán cà phê
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VerificationFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Danh sách yêu cầu xác minh</CardTitle>
              <CardDescription>
                {loading ? 'Đang tải...' : `${verifications.length} yêu cầu được tìm thấy`}
              </CardDescription>
            </div>
            {filters.status !== 'all' && (
              <Badge variant="secondary" className="capitalize">
                {filters.status === 'Pending' && 'Chờ duyệt'}
                {filters.status === 'Approved' && 'Đã duyệt'}
                {filters.status === 'Rejected' && 'Từ chối'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang tải dữ liệu...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 font-medium">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={fetchVerifications}
                  className="mt-4"
                >
                  Thử lại
                </Button>
              </div>
            </div>
          ) : verifications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Không có yêu cầu xác minh nào</p>
                <p className="text-sm text-gray-400 mt-1">
                  Thử thay đổi bộ lọc để xem thêm kết quả
                </p>
              </div>
            </div>
          ) : (
            <VerificationTable 
              verifications={verifications}
              onViewDetails={setSelectedVerificationId}
              onUpdateStatus={handleUpdateStatus}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {metadata.totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Hiển thị {verifications.length} / {metadata.total} yêu cầu
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
                <div className="flex items-center gap-1">
                  <span className="text-sm">Trang</span>
                  <Badge variant="outline">{metadata.page}</Badge>
                  <span className="text-sm">trên {metadata.totalPages}</span>
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
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      <VerificationDetailModal 
        verificationId={selectedVerificationId}
        onClose={() => setSelectedVerificationId(null)}
        onStatusUpdate={fetchVerifications}
      />
    </div>
  )
} 