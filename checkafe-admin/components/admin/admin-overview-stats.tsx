'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageIcon, PaletteIcon, TrendingUp } from "lucide-react"
import authorizedAxiosInstance from "@/lib/axios"
import { Skeleton } from "@/components/ui/skeleton"

interface OverviewStats {
  totalThemes: number;
  themeGrowth: number;
  totalAds: number;
  adsGrowth: number;
  pendingAds: number;
}

export default function AdminOverviewStats() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<OverviewStats>({
    totalThemes: 0,
    themeGrowth: 0,
    totalAds: 0,
    adsGrowth: 0,
    pendingAds: 0
  })

  useEffect(() => {
    fetchOverviewStats()
  }, [])

  const fetchOverviewStats = async () => {
    try {
      setLoading(true)
      
      // // Gọi API để lấy thống kê về theme
      // const themesResponse = await authorizedAxiosInstance.get('/v1/admin/themes/stats')
      // // Gọi API để lấy thống kê về advertisement
      // const adsResponse = await authorizedAxiosInstance.get('/v1/admin/advertisements/stats')
      
      // if (themesResponse.data.status === 200 && adsResponse.data.status === 200) {
      //   const themesData = themesResponse.data.data
      //   const adsData = adsResponse.data.data
        
        // setStats({
        //   totalThemes: themesData.total || 0,
        //   themeGrowth: themesData.growth || 0,
        //   totalAds: adsData.total || 0,
        //   adsGrowth: adsData.growth || 0,
        //   pendingAds: adsData.pending || 0
        // })
      } else {
        // Nếu API chưa có, dùng dữ liệu mẫu
        setStats({
          totalThemes: 24,
          themeGrowth: 12,
          totalAds: 87,
          adsGrowth: 8,
          pendingAds: 15
        })
      }
    } catch (error) {
      console.error('Error fetching overview stats:', error)
      // Nếu lỗi, dùng dữ liệu mẫu
      setStats({
        totalThemes: 24,
        themeGrowth: 12,
        totalAds: 87,
        adsGrowth: 8,
        pendingAds: 15
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-4 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng số chủ đề</CardTitle>
          <PaletteIcon className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalThemes}</div>
          <p className={`text-xs ${stats.themeGrowth >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
            {stats.themeGrowth >= 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingUp className="mr-1 h-3 w-3 transform rotate-180" />}
            {stats.themeGrowth >= 0 ? '+' : ''}{stats.themeGrowth}% so với tháng trước
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng số quảng cáo</CardTitle>
          <ImageIcon className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAds}</div>
          <p className={`text-xs ${stats.adsGrowth >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
            {stats.adsGrowth >= 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingUp className="mr-1 h-3 w-3 transform rotate-180" />}
            {stats.adsGrowth >= 0 ? '+' : ''}{stats.adsGrowth}% so với tháng trước
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quảng cáo chờ duyệt</CardTitle>
          <ImageIcon className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingAds}</div>
          <p className="text-xs text-yellow-600">Cần phê duyệt</p>
        </CardContent>
      </Card>
    </div>
  )
} 