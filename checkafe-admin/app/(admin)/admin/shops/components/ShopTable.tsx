'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Star, Calendar, Eye, Edit, Trash2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shop } from "../types"

interface ShopTableProps {
  shops: Shop[]
}

export function ShopTable({ shops }: ShopTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Quán cà phê</TableHead>
            <TableHead>Địa chỉ</TableHead>
            <TableHead>Đánh giá</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>VIP</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shops.map((shop) => (
            <TableRow key={shop._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={shop.mainImage?.url} alt={shop.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {shop.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{shop.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center text-gray-500">
                  <MapPin className="mr-1 h-3 w-3" />
                  <span className="text-sm truncate max-w-[200px]">{shop.address}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center text-yellow-500">
                  <Star className="mr-1 h-4 w-4 fill-yellow-500" />
                  <span>{shop.rating_avg.toFixed(1)} ({shop.rating_count})</span>
                </div>
              </TableCell>
              <TableCell>
                {shop.is_open ? (
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    Đang mở cửa
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                    Đóng cửa
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {shop.vip_status ? (
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
                <div className="flex items-center text-gray-500">
                  <Calendar className="mr-1 h-3 w-3" />
                  <span className="text-sm">{new Date(shop.createdAt).toLocaleDateString()}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8"
                    asChild
                  >
                    <Link href={`/admin/shops/${shop._id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
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