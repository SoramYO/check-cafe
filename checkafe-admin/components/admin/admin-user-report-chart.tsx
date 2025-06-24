"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

interface UserReportChartProps {
  data?: any[]
  loading?: boolean
}

export default function AdminUserReportChart({ data, loading }: UserReportChartProps) {
  // Default data if no data provided
  const chartData = data || [
    { month: "01/2025", newUsers: 850, totalUsers: 10200 },
    { month: "02/2025", newUsers: 920, totalUsers: 11120 },
    { month: "03/2025", newUsers: 880, totalUsers: 12000 },
    { month: "04/2025", newUsers: 950, totalUsers: 12950 },
    { month: "05/2025", newUsers: 1245, totalUsers: 14195 },
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
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="month" 
          stroke="#888888" 
          fontSize={12}
          tickFormatter={(value) => {
            if (typeof value === 'string') {
              return value
            }
            return new Date(value).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })
          }}
        />
        <YAxis stroke="#888888" fontSize={12} />
        <Tooltip 
          formatter={(value: any, name: string) => [
            new Intl.NumberFormat('vi-VN').format(value), 
            name === 'newUsers' ? 'Người dùng mới' : 'Tổng người dùng'
          ]}
          labelFormatter={(label) => {
            if (typeof label === 'string') {
              return label
            }
            return new Date(label).toLocaleDateString('vi-VN', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            })
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="newUsers"
          name="Người dùng mới"
          stroke="#f57f1f"
          strokeWidth={2}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="totalUsers"
          name="Tổng người dùng"
          stroke="#c49133"
          strokeWidth={2}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
