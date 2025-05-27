export interface User {
  _id: string
  full_name: string
  email: string
  role: "ADMIN" | "CUSTOMER" | "SHOP_OWNER"
  is_active: boolean
  phone?: string
  avatar?: string
  points?: number
  vip_status?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface UserResponse {
  message: string
  status: number
  data: {
    data: User[]
    metadata: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export interface UserDetailResponse {
  _id: string
  full_name: string
  phone: string 
  points: number
  vip_status: boolean
  role: string
  email: string
  avatar: string
  is_active: boolean
  createdAt: string
}

export interface FilterParams {
  page: number
  limit: number
  search?: string
  role?: string
  is_active?: string
  vip_status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
} 