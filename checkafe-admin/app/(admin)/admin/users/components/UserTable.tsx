'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, Calendar, Eye, Edit, Trash2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { User } from "../types"

interface UserTableProps {
  users: User[]
  onViewDetails: (userId: string) => void
  onEditUser: (userId: string) => void
  onDeleteUser: (userId: string) => void
}

export function UserTable({ users, onViewDetails, onEditUser, onDeleteUser }: UserTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Người dùng</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Trạng thái</TableHead>
            {/* Optional columns that may be in expanded user details */}
            <TableHead>VIP</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.full_name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.full_name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center text-gray-500">
                  <Mail className="mr-1 h-3 w-3" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`
                    ${user.role === "ADMIN" 
                      ? "bg-purple-50 text-purple-600 border-purple-200"
                      : user.role === "SHOP_OWNER"
                        ? "bg-blue-50 text-blue-600 border-blue-200"
                        : "bg-green-50 text-green-600 border-green-200"
                    }
                  `}
                >
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                {user.is_active ? (
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    Hoạt động
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                    Tạm ngưng
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {user.vip_status ? (
                  <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                    <CheckCircle className="h-3 w-3 mr-1" /> VIP
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                    Thường
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {user.createdAt && (
                  <div className="flex items-center text-gray-500">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8"
                    onClick={() => onViewDetails(user._id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8"
                    onClick={() => onEditUser(user._id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-red-500"
                    onClick={() => onDeleteUser(user._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 