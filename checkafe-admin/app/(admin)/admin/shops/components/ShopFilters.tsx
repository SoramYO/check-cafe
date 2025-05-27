'use client'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import { FilterParams } from "../types"

interface ShopFiltersProps {
  filters: FilterParams
  onFilterChange: (key: keyof FilterParams, value: string | number) => void
}

export function ShopFilters({ filters, onFilterChange }: ShopFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative w-full md:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input 
          type="search" 
          placeholder="Tìm kiếm quán..." 
          className="pl-8 bg-white"
          value={filters.search || ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
        />
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <Select
          value={filters.sortBy}
          onValueChange={(value) => onFilterChange('sortBy', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating_avg">Đánh giá</SelectItem>
            <SelectItem value="rating_count">Số lượt đánh giá</SelectItem>
            <SelectItem value="name">Tên</SelectItem>
            <SelectItem value="createdAt">Ngày tạo</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.sortOrder}
          onValueChange={(value) => onFilterChange('sortOrder', value as 'asc' | 'desc')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Thứ tự" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Giảm dần</SelectItem>
            <SelectItem value="asc">Tăng dần</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 