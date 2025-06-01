'use client'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import { FilterParams } from "../types"

interface StaffFiltersProps {
  filters: FilterParams
  onFilterChange: (key: keyof FilterParams, value: string | number) => void
  shops?: Array<{ _id: string; name: string }>
}

export function StaffFilters({ filters, onFilterChange, shops = [] }: StaffFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select
          value={filters.is_active || 'all'}
          onValueChange={(value) => onFilterChange('is_active', value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="true">Hoạt động</SelectItem>
            <SelectItem value="false">Tạm ngưng</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortBy || 'createdAt'}
          onValueChange={(value) => onFilterChange('sortBy', value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Ngày tạo</SelectItem>
            <SelectItem value="full_name">Tên</SelectItem>
            <SelectItem value="email">Email</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortOrder || 'desc'}
          onValueChange={(value) => onFilterChange('sortOrder', value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Thứ tự" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Giảm dần</SelectItem>
            <SelectItem value="asc">Tăng dần</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
} 