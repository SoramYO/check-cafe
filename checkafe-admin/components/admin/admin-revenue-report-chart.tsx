"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

const data = [
  { month: "01/2025", vip: 180, commission: 120, other: 50 },
  { month: "02/2025", vip: 200, commission: 130, other: 55 },
  { month: "03/2025", vip: 210, commission: 135, other: 60 },
  { month: "04/2025", vip: 230, commission: 140, other: 65 },
  { month: "05/2025", vip: 245, commission: 143, other: 70 },
]

export default function AdminRevenueReportChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data} stackOffset="expand">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" stroke="#888888" fontSize={12} />
        <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
        <Tooltip
          formatter={(value, name) => [
            `${value}M VND`,
            name === "vip" ? "Gói VIP" : name === "commission" ? "Hoa hồng" : "Khác",
          ]}
        />
        <Legend formatter={(value) => (value === "vip" ? "Gói VIP" : value === "commission" ? "Hoa hồng" : "Khác")} />
        <Area type="monotone" dataKey="vip" stackId="1" stroke="#f57f1f" fill="#f57f1f" />
        <Area type="monotone" dataKey="commission" stackId="1" stroke="#c49133" fill="#c49133" />
        <Area type="monotone" dataKey="other" stackId="1" stroke="#f89731" fill="#f89731" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
