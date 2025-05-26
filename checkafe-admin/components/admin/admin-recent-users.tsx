'use client'
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import authorizedAxiosInstance from "@/lib/axios"
import { format, formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

interface User {
  _id: string
  fullName: string
  email: string
  avatar?: string
  status: 'active' | 'inactive' | 'blocked'
  createdAt: string
}

export default function AdminRecentUsers() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetchRecentUsers()
  }, [])

  const fetchRecentUsers = async () => {
    try {
      setLoading(true)
      const response = await authorizedAxiosInstance.get('/v1/admin/users/recent')
      
      if (response.data.status === 200) {
        setUsers(response.data.data.users || [])
      }
    } catch (error) {
      console.error('Error fetching recent users:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Hàm lấy initials từ tên người dùng để hiển thị trong Avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Hoạt động</Badge>
      case 'blocked':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Bị chặn</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Không hoạt động</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {users.length > 0 ? users.map((user) => (
        <div key={user._id} className="flex items-center space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.fullName} />
            <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center">
              <p className="text-sm font-medium">{user.fullName}</p>
              <div className="ml-2">{getStatusBadge(user.status)}</div>
            </div>
            <p className="text-xs text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400">
              Đăng ký {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: vi })}
            </p>
          </div>
        </div>
      )) : (
        <div className="text-center py-4 text-gray-500">Không có người dùng mới gần đây</div>
      )}
    </div>
  )
} 