"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

const data = [
  { month: "01/2025", newUsers: 850, totalUsers: 10200 },
  { month: "02/2025", newUsers: 920, totalUsers: 11120 },
  { month: "03/2025", newUsers: 880, totalUsers: 12000 },
  { month: "04/2025", newUsers: 950, totalUsers: 12950 },
  { month: "05/2025", newUsers: 1245, totalUsers: 14195 },
]

export default function AdminUserReportChart() {
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
