"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

interface RevenueReportChartProps {
  data?: any[]
  loading?: boolean
}

export default function AdminRevenueReportChart({ data, loading }: RevenueReportChartProps) {
  // Default data if no data provided
  const chartData = data || [
    { month: "01/2025", vip: 180, commission: 120, other: 50 },
    { month: "02/2025", vip: 200, commission: 130, other: 55 },
    { month: "03/2025", vip: 210, commission: 135, other: 60 },
    { month: "04/2025", vip: 230, commission: 140, other: 65 },
    { month: "05/2025", vip: 245, commission: 143, other: 70 },
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
      <AreaChart data={chartData} stackOffset="expand">
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
        <YAxis 
          stroke="#888888" 
          fontSize={12} 
          tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} 
        />
        <Tooltip
          formatter={(value: any, name: string) => [
            `${new Intl.NumberFormat('vi-VN').format(value)}M VND`,
            name === "vip" ? "Gói VIP" : name === "commission" ? "Hoa hồng" : "Khác",
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
        <Legend formatter={(value) => (value === "vip" ? "Gói VIP" : value === "commission" ? "Hoa hồng" : "Khác")} />
        <Area type="monotone" dataKey="vip" stackId="1" stroke="#f57f1f" fill="#f57f1f" />
        <Area type="monotone" dataKey="commission" stackId="1" stroke="#c49133" fill="#c49133" />
        <Area type="monotone" dataKey="other" stackId="1" stroke="#f89731" fill="#f89731" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
