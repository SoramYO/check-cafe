"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import HeroSection from "@/components/landing/hero-section"
import FeaturesSection from "@/components/landing/features-section"
import TestimonialsSection from "@/components/landing/testimonials-section"
import DownloadSection from "@/components/landing/download-section"

export default function HomePage() {
  const router = useRouter()
  const { user, token } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      // Kiểm tra token trong localStorage
      const storedToken = localStorage.getItem('accessToken')
      const storedUser = localStorage.getItem('user')
      
      // Nếu không có token, redirect về login
      if (!token && !storedToken) {
        router.push('/login')
        return
      }

      // Lấy thông tin user
      let currentUser = user
      if (!currentUser && storedUser) {
        try {
          currentUser = JSON.parse(storedUser)
        } catch (error) {
          console.error('Error parsing stored user:', error)
          router.push('/login')
          return
        }
      }

      // Điều hướng dựa trên role
      if (currentUser) {
        if (currentUser.role === 'ADMIN') {
          router.push('/admin')
        } else if (currentUser.role === 'SHOP_OWNER') {
          router.push('/dashboard')
        } else {
          // Role không hợp lệ
          router.push('/login')
        }
      } else {
        router.push('/login')
      }
    }

    checkAuthAndRedirect()
  }, [user, token, router])

  // Loading state while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-amber-900 mb-2">ChecKafe</h2>
          <p className="text-amber-700">Đang kiểm tra thông tin đăng nhập...</p>
          </div>
        </div>
    </div>
  )
}
