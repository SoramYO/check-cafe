export interface Staff {
  _id: string
  full_name: string
  email: string
  phone?: string
  avatar?: string
  role: "STAFF"
  is_active: boolean
  shop_id?: string
  shop_name?: string
  createdAt?: string
  updatedAt?: string
}

export interface StaffResponse {
  message: string
  status: number
  data: {
    data: Staff[]
    metadata: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export interface StaffDetailResponse {
  _id: string
  full_name: string
  phone: string
  email: string
  avatar: string
  is_active: boolean
  role: string
  shop_id: string
  shop_name: string
  createdAt: string
}

export interface FilterParams {
  page: number
  limit: number
  search?: string
  is_active?: string
  shop_id?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CreateStaffData {
  full_name: string
  email: string
  phone?: string
  password: string
}

export interface UpdateStaffData {
  full_name?: string
  phone?: string
  is_active?: boolean
} 