'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, MapPin, Star, Calendar, Eye, Edit, Trash2, CheckCircle, Plus } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import authorizedAxiosInstance from "@/lib/axios"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useSearchParams, useRouter } from "next/navigation"
import { Shop, ShopResponse, FilterParams } from "./types"
import { ShopTable } from "./components/ShopTable"
import { ShopFilters } from "./components/ShopFilters"
import { ShopDetailModal } from "./components/ShopDetailModal"
import { CreateShopModal } from "./components/CreateShopModal"

interface Shop {
  _id: string
  name: string
  address: string
  description: string
  phone: string
  website: string
  theme_ids: Array<{
    _id: string
    name: string
    description: string
    theme_image: string
  }>
  vip_status: boolean
  rating_avg: number
  rating_count: number
  amenities: Array<{
    _id: string
    icon: string
    label: string
  }>
  opening_hours: Array<{
    day: number
    is_closed: boolean
    hours: Array<{
      open: string
      close: string
    }>
  }>
  formatted_opening_hours: {
    [key: string]: string
  }
  is_open: boolean
  createdAt: string
  updatedAt: string
  mainImage: {
    url: string
  }
  distance?: number
}

interface ShopResponse {
  message: string
  status: number
  data: {
    shops: Shop[]
    metadata: {
      totalItems: number
      totalPages: number
      currentPage: number
      limit: number
    }
  }
}

interface CreateShopForm {
  name: string
  description: string
  address: string
  phone: string
  website: string
  latitude: number
  longitude: number
  amenities: string[]
  theme_ids: string[]
  opening_hours: Array<{
    day: number
    is_closed: boolean
    hours?: Array<{
      open: string
      close: string
    }>
  }>
}

export default function ShopsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null)
  const [metadata, setMetadata] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  })

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterParams>({
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || 'rating_avg',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10')
  })

  // Sync filters with URL params
  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value.toString())
    })
    router.push(`?${params.toString()}`)
  }, [filters, router])

  // Fetch shops when filters change
  useEffect(() => {
    fetchShops()
  }, [filters])

  const fetchShops = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await authorizedAxiosInstance.get<ShopResponse>('/v1/shops/public', {
        params: {
          search: filters.search,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          page: filters.page,
          limit: filters.limit
        }
      })
      if (response.data.status === 200) {
        setShops(response.data.data.shops)
        setMetadata({
          total: response.data.data.metadata.totalItems,
          page: response.data.data.metadata.currentPage,
          limit: response.data.data.metadata.limit,
          totalPages: response.data.data.metadata.totalPages
        })
      }
    } catch (error) {
      console.error('Error fetching shops:', error)
      setError('Có lỗi xảy ra khi tải danh sách quán')
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
    fetchShops()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý quán</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm quán mới
        </Button>
      </div>

      <ShopFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <ShopTable 
          shops={shops}
          onViewDetails={setSelectedShopId}
        />
      )}

      {/* Pagination */}
      {metadata.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị {shops.length} / {metadata.total} quán
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

      <CreateShopModal 
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <ShopDetailModal 
        shopId={selectedShopId}
        onClose={() => setSelectedShopId(null)}
      />
    </div>
  )
}
