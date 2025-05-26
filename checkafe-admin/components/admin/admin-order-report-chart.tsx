"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

const data = [
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

export default function AdminOrderReportChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" stroke="#888888" fontSize={12} />
        <YAxis stroke="#888888" fontSize={12} />
        <Tooltip formatter={(value) => [`${value} đơn`, "Số đơn đặt"]} labelFormatter={(label) => `Ngày ${label}`} />
        <Legend />
        <Bar dataKey="orders" name="Đơn đặt chỗ" fill="#f57f1f" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
