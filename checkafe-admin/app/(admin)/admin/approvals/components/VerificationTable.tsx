'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Calendar, 
  Store, 
  Clock,
  User,
  MapPin,
  FileCheck
} from "lucide-react"
import { Verification } from "../types"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface VerificationTableProps {
  verifications: Verification[]
  onViewDetails: (verificationId: string) => void
  onUpdateStatus?: (verificationId: string, status: string) => void
}

export function VerificationTable({ verifications, onViewDetails, onUpdateStatus }: VerificationTableProps) {
  // Function to render status badge with appropriate styling
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-medium">
            <CheckCircle className="h-3 w-3 mr-1" /> 
            Đã duyệt
          </Badge>
        )
      case "Rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-medium">
            <XCircle className="h-3 w-3 mr-1" /> 
            Từ chối
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 font-medium">
            <Clock className="h-3 w-3 mr-1" />
            Chờ duyệt
          </Badge>
        )
    }
  }

  // Function to get document type display name
  const getDocumentTypeDisplay = (type: string) => {
    const types: Record<string, string> = {
      'business_license': 'Giấy phép kinh doanh',
      'identity_card': 'Chứng minh nhân dân',
      'tax_code': 'Mã số thuế',
      'food_safety': 'Giấy phép an toàn thực phẩm'
    }
    return types[type] || type
  }

  return (
    <TooltipProvider>
      <div className="rounded-lg border bg-white shadow-sm">
      <Table>
        <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="font-semibold">Loại giấy tờ</TableHead>
              <TableHead className="font-semibold">Quán cà phê</TableHead>
              <TableHead className="font-semibold">Tài liệu</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="font-semibold">Ngày nộp</TableHead>
              <TableHead className="font-semibold">Người duyệt</TableHead>
              <TableHead className="text-right font-semibold">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {verifications.map((verification) => (
              <TableRow key={verification._id} className="hover:bg-gray-50/50 transition-colors">
              <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {getDocumentTypeDisplay(verification.document_type)}
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: {verification._id.slice(-6)}
                      </p>
                    </div>
                </div>
              </TableCell>
                
              <TableCell>
                {verification.shop_id ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">
                          <Store className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {verification.shop_id.name}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {verification.shop_id.address?.slice(0, 30)}...
                        </p>
                      </div>
                  </div>
                ) : (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-100 text-gray-500 text-xs">
                          <Store className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-gray-500 italic">Chưa có thông tin</span>
                    </div>
                )}
              </TableCell>
                
              <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-50 rounded">
                      <FileCheck className="h-3 w-3 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {verification.documents.length} tài liệu
                      </p>
                      <p className="text-xs text-gray-500">
                        Đã tải lên
                      </p>
                    </div>
                  </div>
              </TableCell>
                
              <TableCell>
                {renderStatusBadge(verification.status)}
              </TableCell>
                
              <TableCell>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">
                        {format(new Date(verification.submitted_at), 'dd/MM/yyyy', { locale: vi })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(verification.submitted_at), 'HH:mm', { locale: vi })}
                      </p>
                    </div>
                </div>
              </TableCell>
                
              <TableCell>
                  {verification.reviewed_by ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {verification.reviewed_by.email.split('@')[0]}
                        </p>
                        {verification.reviewed_at && (
                          <p className="text-xs text-gray-500">
                            {format(new Date(verification.reviewed_at), 'dd/MM', { locale: vi })}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-sm">Chưa duyệt</span>
                  )}
              </TableCell>
                
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                  <Button 
                          size="sm" 
                    variant="ghost" 
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => onViewDetails(verification._id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Xem chi tiết</p>
                      </TooltipContent>
                    </Tooltip>
                    
                  {verification.status === "Pending" && onUpdateStatus && (
                    <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                      <Button 
                              size="sm" 
                        variant="ghost" 
                              className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                        onClick={() => onUpdateStatus(verification._id, "Approved")}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Phê duyệt</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                      <Button 
                              size="sm" 
                        variant="ghost" 
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        onClick={() => onUpdateStatus(verification._id, "Rejected")}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Từ chối</p>
                          </TooltipContent>
                        </Tooltip>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </TooltipProvider>
  )
} 