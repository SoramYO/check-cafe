"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

const data = [
  { month: "01/2025", newShops: 22, totalShops: 280 },
  { month: "02/2025", newShops: 25, totalShops: 305 },
  { month: "03/2025", newShops: 18, totalShops: 323 },
  { month: "04/2025", newShops: 24, totalShops: 347 },
  { month: "05/2025", newShops: 28, totalShops: 375 },
]

export default function AdminShopReportChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" stroke="#888888" fontSize={12} />
        <YAxis stroke="#888888" fontSize={12} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="newShops"
          name="Quán mới"
          stroke="#f57f1f"
          strokeWidth={2}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="totalShops"
          name="Tổng số quán"
          stroke="#c49133"
          strokeWidth={2}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
