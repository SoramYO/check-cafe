'use client'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import { FilterParams } from "../types"

interface UserFiltersProps {
  filters: FilterParams
  onFilterChange: (key: keyof FilterParams, value: string | number) => void
}

export function UserFilters({ filters, onFilterChange }: UserFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative w-full md:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input 
          type="search" 
          placeholder="Tìm kiếm người dùng..." 
          className="pl-8 bg-white"
          value={filters.search || ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2 w-full md:w-auto">
        <Select
          value={filters.role || 'all'}
          onValueChange={(value) => onFilterChange('role', value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="SHOP_OWNER">Chủ quán</SelectItem>
            <SelectItem value="CUSTOMER">Khách hàng</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.is_active || 'all'}
          onValueChange={(value) => onFilterChange('is_active', value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="true">Đang hoạt động</SelectItem>
            <SelectItem value="false">Tạm ngưng</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.vip_status || 'all'}
          onValueChange={(value) => onFilterChange('vip_status', value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="VIP" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="true">VIP</SelectItem>
            <SelectItem value="false">Thường</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.sortBy || 'createdAt'}
          onValueChange={(value) => onFilterChange('sortBy', value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full_name">Tên</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="createdAt">Ngày tạo</SelectItem>
            <SelectItem value="points">Điểm</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.sortOrder || 'desc'}
          onValueChange={(value) => onFilterChange('sortOrder', value as 'asc' | 'desc')}
        >
          <SelectTrigger className="w-[150px]">
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