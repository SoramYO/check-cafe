'use client'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { 
  Search, 
  Filter, 
  X, 
  Clock, 
  CheckCircle, 
  XCircle,
  FileText,
  Store
} from "lucide-react"
import { FilterParams } from "../types"

interface VerificationFiltersProps {
  filters: FilterParams
  onFilterChange: (key: keyof FilterParams, value: string | number) => void
}

export function VerificationFilters({ filters, onFilterChange }: VerificationFiltersProps) {
  const hasActiveFilters = filters.status !== 'all' || filters.shopId

  const clearFilters = () => {
    onFilterChange('status', 'all')
    onFilterChange('shopId', '')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-3 w-3" />
      case 'Approved':
        return <CheckCircle className="h-3 w-3" />
      case 'Rejected':
        return <XCircle className="h-3 w-3" />
      default:
        return <Filter className="h-3 w-3" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'Approved':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'Rejected':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Shop ID Search */}
        <div className="space-y-2">
          <Label htmlFor="shop-search" className="text-sm font-medium flex items-center gap-2">
            <Store className="h-4 w-4" />
            Tìm kiếm quán
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              id="shop-search"
              type="search" 
              placeholder="Nhập ID hoặc tên quán..." 
              className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              value={filters.shopId || ''}
              onChange={(e) => onFilterChange('shopId', e.target.value)}
            />
            {filters.shopId && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                onClick={() => onFilterChange('shopId', '')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status-filter" className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Trạng thái
          </Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => onFilterChange('status', value)}
          >
            <SelectTrigger id="status-filter" className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Filter className="h-3 w-3" />
                  Tất cả trạng thái
                </div>
              </SelectItem>
              <SelectItem value="Pending">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-yellow-600" />
                  Chờ duyệt
                </div>
              </SelectItem>
              <SelectItem value="Approved">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Đã duyệt
                </div>
              </SelectItem>
              <SelectItem value="Rejected">
                <div className="flex items-center gap-2">
                  <XCircle className="h-3 w-3 text-red-600" />
                  Từ chối
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Items per page */}
        <div className="space-y-2">
          <Label htmlFor="limit-filter" className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Hiển thị
          </Label>
          <Select
            value={filters.limit.toString()}
            onValueChange={(value) => onFilterChange('limit', parseInt(value))}
          >
            <SelectTrigger id="limit-filter" className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 mục</SelectItem>
              <SelectItem value="10">10 mục</SelectItem>
              <SelectItem value="20">20 mục</SelectItem>
              <SelectItem value="50">50 mục</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Bộ lọc đang áp dụng:</span>
          
          {filters.status !== 'all' && (
            <Badge 
              variant="outline" 
              className={`${getStatusColor(filters.status)} flex items-center gap-1`}
            >
              {getStatusIcon(filters.status)}
              {filters.status === 'Pending' && 'Chờ duyệt'}
              {filters.status === 'Approved' && 'Đã duyệt'}
              {filters.status === 'Rejected' && 'Từ chối'}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => onFilterChange('status', 'all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.shopId && (
            <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 flex items-center gap-1">
              <Store className="h-3 w-3" />
              Quán: {filters.shopId}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => onFilterChange('shopId', '')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Xóa tất cả
          </Button>
        </div>
      )}
    </div>
  )
} 