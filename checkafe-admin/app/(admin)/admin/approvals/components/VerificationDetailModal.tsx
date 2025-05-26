'use client'
import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Verification, VerificationDetailResponse } from "../types"
import { 
  CheckCircle, 
  XCircle, 
  Store, 
  Calendar, 
  FileText, 
  User, 
  Clock,
  MapPin,
  Mail,
  Download,
  Eye,
  AlertCircle,
  Loader2
} from "lucide-react"
import authorizedAxiosInstance from "@/lib/axios"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface VerificationDetailModalProps {
  verificationId: string | null
  onClose: () => void
  onStatusUpdate?: () => void
}

export function VerificationDetailModal({ verificationId, onClose, onStatusUpdate }: VerificationDetailModalProps) {
  const [verification, setVerification] = useState<Verification | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [reason, setReason] = useState("")
  const [newStatus, setNewStatus] = useState<string | null>(null)

  useEffect(() => {
    if (verificationId) {
      fetchVerificationDetails()
    }
  }, [verificationId])

  const fetchVerificationDetails = async () => {
    try {
      setLoading(true)
      const response = await authorizedAxiosInstance.get<VerificationDetailResponse>(`/v1/verifications/${verificationId}`)
      if (response.data.status === 200) {
        setVerification(response.data.data.verification)
      }
    } catch (error) {
      console.error('Error fetching verification details:', error)
      toast.error('Không thể tải thông tin xác minh')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!newStatus || !verificationId) return
    
    try {
      setUpdating(true)
      const response = await authorizedAxiosInstance.patch(`/v1/verifications/${verificationId}/status`, {
        status: newStatus,
        reason: reason || undefined
      })
      
      if (response.data.status === 200) {
        toast.success(`Cập nhật trạng thái thành công: ${newStatus === 'Approved' ? 'Đã duyệt' : 'Từ chối'}`)
        if (onStatusUpdate) {
          onStatusUpdate()
        }
        onClose()
      }
    } catch (error) {
      console.error('Error updating verification status:', error)
      toast.error('Không thể cập nhật trạng thái')
    } finally {
      setUpdating(false)
      setNewStatus(null)
      setReason("")
    }
  }

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

  if (!verificationId) return null

  return (
    <Dialog open={!!verificationId} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Chi tiết xác minh giấy tờ
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang tải thông tin...</span>
                </div>
              </div>
            ) : verification ? (
              <div className="space-y-6">
                {/* Header Card */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          {getDocumentTypeDisplay(verification.document_type)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4">
                          <span>ID: {verification._id}</span>
                          <Separator orientation="vertical" className="h-4" />
                          <span>Ngày nộp: {format(new Date(verification.submitted_at), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStatusBadge(verification.status)}
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Shop Information Card */}
                {verification.shop_id && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Store className="h-5 w-5 text-amber-600" />
                        Thông tin quán cà phê
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-amber-100 text-amber-700">
                                <Store className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-900">{verification.shop_id.name}</p>
                              <p className="text-sm text-gray-500">Quán cà phê</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Địa chỉ</p>
                              <p className="text-sm text-gray-600">{verification.shop_id.address}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">ID chủ quán</p>
                              <p className="text-sm text-gray-600 font-mono">{verification.shop_id.owner_id}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Documents Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      Tài liệu đính kèm ({verification.documents.length})
                    </CardTitle>
                    <CardDescription>
                      Các tài liệu được tải lên để xác minh
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {verification.documents.map((doc, index) => (
                        <Card key={doc._id} className="overflow-hidden">
                          <div className="aspect-[4/3] bg-gray-50 relative group">
                            <img 
                              src={doc.url}
                              alt={`Tài liệu ${index + 1}`}
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => window.open(doc.url, '_blank')}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Xem
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  const link = document.createElement('a')
                                  link.href = doc.url
                                  link.download = `document-${index + 1}`
                                  link.click()
                                }}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Tải
                              </Button>
                            </div>
                          </div>
                          <CardContent className="p-3">
                            <p className="text-xs text-gray-500 truncate">
                              {doc.publicId}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Status Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-gray-600" />
                      Thông tin trạng thái
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Ngày nộp</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {format(new Date(verification.submitted_at), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
                            </span>
                          </div>
                        </div>
                        
                        {verification.reviewed_at && (
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Ngày duyệt</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">
                                {format(new Date(verification.reviewed_at), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {verification.reviewed_by && (
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Người duyệt</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                                  <User className="h-3 w-3" />
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{verification.reviewed_by.email}</span>
                            </div>
                          </div>
                        )}
                        
                        {verification.reason && (
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Lý do</Label>
                            <div className="mt-1 p-3 bg-gray-50 rounded-md">
                              <p className="text-sm text-gray-600">{verification.reason}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Section for Pending Status */}
                {verification.status === "Pending" && (
                  <Card className="border-yellow-200 bg-yellow-50/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
                        <AlertCircle className="h-5 w-5" />
                        Thao tác duyệt
                      </CardTitle>
                      <CardDescription>
                        Chọn hành động để phê duyệt hoặc từ chối yêu cầu xác minh này
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => setNewStatus("Approved")}
                          variant={newStatus === "Approved" ? "default" : "outline"}
                          className={newStatus === "Approved" ? "bg-green-600 hover:bg-green-700" : "border-green-200 text-green-700 hover:bg-green-50"}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" /> 
                          Phê duyệt
                        </Button>
                        <Button 
                          onClick={() => setNewStatus("Rejected")}
                          variant={newStatus === "Rejected" ? "destructive" : "outline"}
                          className={newStatus === "Rejected" ? "" : "border-red-200 text-red-700 hover:bg-red-50"}
                        >
                          <XCircle className="h-4 w-4 mr-2" /> 
                          Từ chối
                        </Button>
                      </div>
                      
                      {newStatus && (
                        <div className="space-y-2">
                          <Label htmlFor="reason">
                            Lý do {newStatus === "Approved" ? "phê duyệt" : "từ chối"} (tùy chọn)
                          </Label>
                          <Textarea
                            id="reason"
                            placeholder={`Nhập lý do ${newStatus === "Approved" ? "phê duyệt" : "từ chối"}...`}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="min-h-[80px]"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Không thể tải thông tin xác minh</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {verification && newStatus && (
          <DialogFooter className="px-6 py-4 border-t bg-gray-50/50">
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setNewStatus(null)
                  setReason("")
                }}
                disabled={updating}
              >
                Hủy
              </Button>
              <Button 
                onClick={handleUpdateStatus}
                disabled={updating}
                className={newStatus === "Approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    {newStatus === "Approved" ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Xác nhận phê duyệt
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Xác nhận từ chối
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
} 