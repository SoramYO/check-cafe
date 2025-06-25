'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import authorizedAxiosInstance from '@/lib/axios'
import { useToast } from '@/hooks/use-toast'

interface Shop {
  _id: string
  name: string
  address: string
  description: string
  phone: string
  website: string
  location: {
    type: string
    coordinates: number[]
  }
  owner_id: {
    _id: string
    full_name: string
    email: string
    avatar?: string
  }
  theme_ids: Array<{
    _id: string
    name: string
    description: string
    theme_image?: string
  }>
  vip_status: boolean
  rating_avg: number
  rating_count: number
  status: string
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
      _id: string
      id: string
    }>
    _id: string
    id: string
  }>
  formatted_opening_hours: {
    [key: string]: string
  }
  is_open: boolean
  images: Array<{
    _id: string
    url: string
    caption?: string
    created_at: string
  }>
  seats: Array<{
    _id: string
    seat_name: string
    description: string
    image?: string
    is_premium: boolean
    is_available: boolean
    capacity: number
  }>
  menuItems: Array<{
    _id: string
    name: string
    description: string
    price: number
    category: {
      _id: string
      name: string
    }
    is_available: boolean
    images: Array<{
      url: string
      publicId: string
      _id: string
    }>
  }>
  timeSlots: Array<{
    _id: string
    day_of_week: number
    start_time: string
    end_time: string
    max_regular_reservations: number
    max_premium_reservations: number
    is_active: boolean
  }>
  verifications: Array<{
    document_type: string
    status: string
    submitted_at: string
    reviewed_at?: string
    reason?: string
  }>
  createdAt: string
  updatedAt: string
}

interface ShopContextType {
  shopData: Shop | null
  shopId: string | null
  loading: boolean
  error: string | null
  fetchShopData: () => Promise<void>
  refreshShopData: () => Promise<void>
}

const ShopContext = createContext<ShopContextType | undefined>(undefined)

export const useShop = () => {
  const context = useContext(ShopContext)
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider')
  }
  return context
}

interface ShopProviderProps {
  children: ReactNode
}

export const ShopProvider: React.FC<ShopProviderProps> = ({ children }) => {
  const [shopData, setShopData] = useState<Shop | null>(null)
  const [shopId, setShopId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchShopData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await authorizedAxiosInstance.get('/v1/shops/my-shop')
      
      if (response.data.status === 200) {
        const shop = response.data.data.shop
        setShopData(shop)
        setShopId(shop._id)
      } else {
        throw new Error('Failed to fetch shop data')
      }
    } catch (error: any) {
      console.error('Error fetching shop data:', error)
      setError(error.response?.data?.message || 'Không thể tải thông tin quán')
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải thông tin quán"
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshShopData = async () => {
    await fetchShopData()
  }

  useEffect(() => {
    fetchShopData()
  }, [])

  const value: ShopContextType = {
    shopData,
    shopId,
    loading,
    error,
    fetchShopData,
    refreshShopData
  }

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  )
} 