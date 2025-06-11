'use client'

import { useEffect } from 'react'
import { analyticsTracker } from '@/lib/analytics'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

/**
 * AnalyticsProvider cho Admin Dashboard
 * 
 * Analytics tracking được disable hoàn toàn cho admin dashboard
 * vì nó chỉ dành cho end-users (customers) trên customer app.
 * 
 * Provider này đảm bảo rằng không có analytics session nào 
 * được tạo trong admin dashboard.
 */
export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    // Ensure no analytics session exists for admin dashboard
    analyticsTracker.forceClearAll()
    console.log('🚫 Analytics tracking disabled for admin dashboard')
  }, [])

  return <>{children}</>
} 