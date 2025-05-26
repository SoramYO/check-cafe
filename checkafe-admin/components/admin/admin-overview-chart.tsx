"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useState, useEffect } from "react"
import authorizedAxiosInstance from "@/lib/axios"
import { Skeleton } from "@/components/ui/skeleton"

interface ChartData {
  date: string;
  orders: number;
}

export default function AdminOverviewChart() {
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<ChartData[]>([])

  useEffect(() => {
    fetchBookingChartData()
  }, [])

  const fetchBookingChartData = async () => {
    try {
      setLoading(true)
      // Gọi API để lấy dữ liệu biểu đồ đặt chỗ
      const response = await authorizedAxiosInstance.get('/v1/admin/stats/bookings-chart')
      
      if (response.data.status === 200) {
        setChartData(response.data.data.chartData || [])
      } else {
        // Nếu API chưa có, sử dụng dữ liệu mẫu
        setChartData(sampleData)
      }
    } catch (error) {
      console.error('Error fetching booking chart data:', error)
      // Nếu lỗi, hiển thị dữ liệu mẫu
      setChartData(sampleData)
    } finally {
      setLoading(false)
    }
  }

  const sampleData = [
    { date: "01/05", orders: 1200 },
    { date: "02/05", orders: 1300 },
    { date: "03/05", orders: 1400 },
    { date: "04/05", orders: 1350 },
    { date: "05/05", orders: 1500 },
    { date: "06/05", orders: 1600 },
    { date: "07/05", orders: 1750 },
    { date: "08/05", orders: 1800 },
    { date: "09/05", orders: 1850 },
    { date: "10/05", orders: 1900 },
    { date: "11/05", orders: 1950 },
    { date: "12/05", orders: 2000 },
    { date: "13/05", orders: 1900 },
    { date: "14/05", orders: 1850 },
    { date: "15/05", orders: 1800 },
    { date: "16/05", orders: 1750 },
    { date: "17/05", orders: 1700 },
    { date: "18/05", orders: 1650 },
    { date: "19/05", orders: 1600 },
    { date: "20/05", orders: 1550 },
    { date: "21/05", orders: 1500 },
    { date: "22/05", orders: 1450 },
    { date: "23/05", orders: 1400 },
    { date: "24/05", orders: 1350 },
    { date: "25/05", orders: 1300 },
    { date: "26/05", orders: 1250 },
    { date: "27/05", orders: 1200 },
    { date: "28/05", orders: 1150 },
    { date: "29/05", orders: 1100 },
    { date: "30/05", orders: 1050 },
  ]

  if (loading) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip formatter={(value) => [`${value} đơn`, "Số đơn đặt"]} labelFormatter={(label) => `Ngày ${label}`} />
        <Line type="monotone" dataKey="orders" stroke="#f57f1f" strokeWidth={2} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
