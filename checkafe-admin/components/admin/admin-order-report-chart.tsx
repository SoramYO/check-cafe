"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

interface OrderReportChartProps {
  data?: any[]
  loading?: boolean
}

export default function AdminOrderReportChart({ data, loading }: OrderReportChartProps) {
  // Default data if no data provided
  const chartData = data || [
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
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">Không có dữ liệu để hiển thị</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          stroke="#888888" 
          fontSize={12}
          tickFormatter={(value) => {
            if (typeof value === 'string') {
              return value
            }
            return new Date(value).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })
          }}
        />
        <YAxis stroke="#888888" fontSize={12} />
        <Tooltip 
          formatter={(value: any) => [`${new Intl.NumberFormat('vi-VN').format(value)} đơn`, "Số đơn đặt"]} 
          labelFormatter={(label) => {
            if (typeof label === 'string') {
              return `Ngày ${label}`
            }
            return `Ngày ${new Date(label).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })}`
          }} 
        />
        <Legend />
        <Bar dataKey="orders" name="Đơn đặt chỗ" fill="#f57f1f" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
