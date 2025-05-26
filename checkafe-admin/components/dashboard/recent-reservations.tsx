import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

const reservations = [
  {
    id: "RES-001",
    customer: "Nguyễn Văn A",
    initials: "NVA",
    time: "17:30",
    date: "Hôm nay",
    people: 2,
    status: "pending",
  },
  {
    id: "RES-002",
    customer: "Trần Thị B",
    initials: "TTB",
    time: "18:00",
    date: "Hôm nay",
    people: 4,
    status: "pending",
  },
  {
    id: "RES-003",
    customer: "Lê Văn C",
    initials: "LVC",
    time: "19:30",
    date: "Hôm nay",
    people: 3,
    status: "confirmed",
  },
  {
    id: "RES-004",
    customer: "Phạm Thị D",
    initials: "PTD",
    time: "20:00",
    date: "Hôm nay",
    people: 2,
    status: "confirmed",
  },
  {
    id: "RES-005",
    customer: "Hoàng Văn E",
    initials: "HVE",
    time: "18:30",
    date: "Ngày mai",
    people: 6,
    status: "pending",
  },
]

export default function RecentReservations() {
  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <div key={reservation.id} className="flex items-center justify-between space-x-4 rounded-md border p-3">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">{reservation.initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{reservation.customer}</p>
              <div className="flex items-center text-xs text-gray-500">
                <span>
                  {reservation.date} • {reservation.time} • {reservation.people} người
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {reservation.status === "pending" ? (
              <>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                  Chờ xác nhận
                </Badge>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                Đã xác nhận
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
