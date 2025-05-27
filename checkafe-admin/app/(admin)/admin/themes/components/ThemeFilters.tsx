'use client'
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { FilterParams } from "../types"

interface ThemeFiltersProps {
  filters: FilterParams;
  onFilterChange: (key: keyof FilterParams, value: string | number) => void;
}

export function ThemeFilters({ filters, onFilterChange }: ThemeFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative w-full md:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input 
          type="search" 
          placeholder="Tìm kiếm chủ đề..." 
          className="pl-8 bg-white"
          value={filters.search || ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
        />
      </div>
    </div>
  )
} 