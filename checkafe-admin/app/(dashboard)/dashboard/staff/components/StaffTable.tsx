'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, Calendar, Eye, Edit, Trash2, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Staff } from "../types"

interface StaffTableProps {
  staff: Staff[]
  onViewDetails: (staffId: string) => void
  onEditStaff: (staffId: string) => void
  onDeleteStaff: (staffId: string) => void
}

export function StaffTable({ staff, onViewDetails, onEditStaff, onDeleteStaff }: StaffTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nhân viên</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Cửa hàng</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((staffMember) => (
            <TableRow key={staffMember._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={staffMember.avatar} alt={staffMember.full_name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {staffMember.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium">{staffMember.full_name}</span>
                    {staffMember.phone && (
                      <div className="flex items-center text-gray-500 text-sm">
                        <Phone className="mr-1 h-3 w-3" />
                        <span>{staffMember.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center text-gray-500">
                  <Mail className="mr-1 h-3 w-3" />
                  <span className="text-sm">{staffMember.email}</span>
                </div>
              </TableCell>
              <TableCell>
                {staffMember.shop_name ? (
                  <div className="flex items-center text-gray-700">
                    <Building2 className="mr-1 h-3 w-3" />
                    <span className="text-sm">{staffMember.shop_name}</span>
                  </div>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                    Chưa phân công
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {staffMember.is_active ? (
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
                {staffMember.createdAt && (
                  <div className="flex items-center text-gray-500">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span className="text-sm">{new Date(staffMember.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8"
                    onClick={() => onViewDetails(staffMember._id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8"
                    onClick={() => onEditStaff(staffMember._id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-red-500"
                    onClick={() => onDeleteStaff(staffMember._id)}
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