"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, X, Search, Filter, Calendar, Clock, Users } from "lucide-react"
import { useEffect, useState } from "react"
import authorizedAxiosInstance from "@/lib/axios"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const fetchReservations = async (status?: string) => {
    setLoading(true)
    try {
      const params: any = {}
      if (status && status !== "all") {
        const statusMap: { [key: string]: string } = {
          pending: "Pending",
          confirmed: "Confirmed", 
          cancelled: "Cancelled",
          completed: "Completed"
        }
        params.status = statusMap[status] || status
      }
      if (selectedDate) {
        params.reservation_date = format(selectedDate, 'yyyy-MM-dd', { locale: vi })
      }
      const res = await authorizedAxiosInstance.get("/v1/reservations/shop-reservations", { params })
      setReservations(res.data?.data?.reservations || [])
    } catch (err) {
      // handle error nếu cần
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReservations(currentStatus)
  }, [currentStatus, selectedDate])

  const handleStatusChange = (status: string) => {
    setCurrentStatus(status)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý đơn đặt chỗ</h1>
          <p className="text-gray-500">Xem và xử lý các đơn đặt chỗ của khách hàng.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input type="search" placeholder="Tìm kiếm đơn đặt chỗ..." className="pl-8 bg-white" />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" /> 
                {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white border shadow-lg" align="end">
              <CalendarComponent
                mode="single"
                selected={selectedDate || undefined}
                onSelect={(date) => setSelectedDate(date || null)}
                initialFocus
                locale={vi}
              />
            </PopoverContent>
          </Popover>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedDate(null)}
            disabled={!selectedDate}
          >
            <X className="mr-2 h-4 w-4" /> Xóa lọc
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={handleStatusChange}>
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="pending">Chờ xác nhận</TabsTrigger>
          <TabsTrigger value="confirmed">Đã xác nhận</TabsTrigger>
          <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
          <TabsTrigger value="completed">Đã hoàn thành</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {loading ? (
              <p className="text-center text-gray-500 py-8">Đang tải...</p>
            ) : reservations.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Không có đơn đặt chỗ nào</p>
            ) : (
              reservations.map((reservation) => (
                <ReservationCard key={reservation._id} reservation={reservation} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4">
            {loading ? (
              <p className="text-center text-gray-500 py-8">Đang tải...</p>
            ) : reservations.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Không có đơn chờ xác nhận</p>
            ) : (
              reservations.map((reservation) => (
                <ReservationCard key={reservation._id} reservation={reservation} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-4">
          <div className="grid gap-4">
            {loading ? (
              <p className="text-center text-gray-500 py-8">Đang tải...</p>
            ) : reservations.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Không có đơn đã xác nhận</p>
            ) : (
              reservations.map((reservation) => (
                <ReservationCard key={reservation._id} reservation={reservation} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          <div className="grid gap-4">
            {loading ? (
              <p className="text-center text-gray-500 py-8">Đang tải...</p>
            ) : reservations.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Không có đơn đã hủy</p>
            ) : (
              reservations.map((reservation) => (
                <ReservationCard key={reservation._id} reservation={reservation} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {loading ? (
              <p className="text-center text-gray-500 py-8">Đang tải...</p>
            ) : reservations.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Không có đơn đã hoàn thành</p>
            ) : (
              reservations.map((reservation) => (
                <ReservationCard key={reservation._id} reservation={reservation} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ReservationCard({ reservation }: { reservation: any }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={reservation.user_id.avatar} alt={reservation.user_id.full_name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {reservation.user_id.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{reservation.user_id.full_name}</CardTitle>
              <div className="text-sm text-gray-500">{reservation.user_id.phone}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {reservation.status === "Pending" && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                Chờ xác nhận
              </Badge>
            )}
            {reservation.status === "Confirmed" && (
              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                Đã xác nhận
              </Badge>
            )}
            {reservation.status === "Cancelled" && (
              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                Đã hủy
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-500 flex items-center">
              <Calendar className="mr-1 h-4 w-4" /> Ngày
            </div>
            <div>{reservation.reservation_date ? new Date(reservation.reservation_date).toLocaleDateString('vi-VN') : ''}</div>
          </div>
          <div>
            <div className="text-gray-500 flex items-center">
              <Clock className="mr-1 h-4 w-4" /> Giờ
            </div>
            <div>{reservation.time_slot_id.start_time} - {reservation.time_slot_id.end_time}</div>
          </div>
          <div>
            <div className="text-gray-500 flex items-center">
              <Users className="mr-1 h-4 w-4" /> Số người
            </div>
            <div>{reservation.number_of_people} người</div>
          </div>
          <div>
            <div className="text-gray-500">Khu vực & Bàn</div>
            <div>
              {reservation.seat_id.seat_name}
            </div>
          </div>
        </div>

        {reservation.notes && (
          <div className="mt-4 text-sm">
            <div className="text-gray-500">Ghi chú</div>
            <div>{reservation.notes}</div>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          {reservation.status === "pending" && (
            <>
              <Button size="sm" className="bg-primary hover:bg-primary-dark">
                <Check className="mr-2 h-4 w-4" /> Xác nhận
              </Button>
              <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                <X className="mr-2 h-4 w-4" /> Từ chối
              </Button>
            </>
          )}
          {reservation.status === "confirmed" && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <Check className="mr-2 h-4 w-4" /> Đánh dấu hoàn thành
            </Button>
          )}
          <Button size="sm" variant="outline">
            Chi tiết
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
