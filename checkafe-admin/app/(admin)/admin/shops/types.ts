export interface Shop {
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
  location?: {
    type: string
    coordinates: [number, number]
  }
  images?: Array<{
    _id: string
    url: string
    caption: string
    created_at: string
  }>
  seats?: Array<{
    _id: string
    seat_name: string
    image: string
    is_premium: boolean
    is_available: boolean
    capacity: number
    description?: string
  }>
  menuItems?: Array<{
    _id: string
    name: string
    description: string
    price: number
    category: string
    is_available: boolean
    images?: Array<{
      url: string
      publicId: string
      _id: string
    }>
  }>
  timeSlots?: Array<{
    _id: string
    day_of_week: number
    start_time: string
    end_time: string
    max_regular_reservations: number
    max_premium_reservations: number
    is_active: boolean
  }>
}

export interface ShopResponse {
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

export interface ShopDetailResponse {
  message: string
  status: number
  data: {
    shop: Shop
  }
}

export interface FilterParams {
  page: number
  limit: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  amenities?: string
  search?: string
  latitude?: number
  longitude?: number
  themes?: string
  radius?: number
} 