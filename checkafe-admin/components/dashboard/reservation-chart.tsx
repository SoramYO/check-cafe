"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "T2",
    total: 18,
  },
  {
    name: "T3",
    total: 22,
  },
  {
    name: "T4",
    total: 25,
  },
  {
    name: "T5",
    total: 32,
  },
  {
    name: "T6",
    total: 42,
  },
  {
    name: "T7",
    total: 56,
  },
  {
    name: "CN",
    total: 48,
  },
]

export default function ReservationChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip formatter={(value) => [`${value} đơn`, "Số đơn đặt"]} labelFormatter={(label) => `Thứ ${label}`} />
        <Bar dataKey="total" fill="#f57f1f" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
