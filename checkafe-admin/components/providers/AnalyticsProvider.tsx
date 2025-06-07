'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { analyticsTracker } from '@/lib/analytics'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname()
  const { user, token } = useSelector((state: RootState) => state.auth)
  const isAuthenticated = !!(user && token)

  // Khởi tạo analytics tracking khi user đã đăng nhập
  useEffect(() => {
    if (isAuthenticated && user) {
      analyticsTracker.initializeAfterLogin()
    } else {
      // Clear session khi user logout
      analyticsTracker.clearSession()
    }
  }, [isAuthenticated, user])

  // Track page view khi route thay đổi
  useEffect(() => {
    if (isAuthenticated && user) {
      analyticsTracker.trackPageView(pathname)
    }
  }, [pathname, isAuthenticated, user])

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (isAuthenticated) {
        analyticsTracker.endSession()
      }
    }
  }, [isAuthenticated])

  return <>{children}</>
} 