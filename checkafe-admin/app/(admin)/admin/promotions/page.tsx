import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Plus, Edit, Trash2, Calendar, Clock, MapPin, Percent, Package } from "lucide-react"
import Image from "next/image"

const goldenHours = [
  {
    id: "gh-001",
    title: "Sáng sớm tinh mơ",
    description: "Giảm 25% cho đơn đặt từ 6h-9h sáng",
    image: "/placeholder.svg?height=200&width=400",
    time: "06:00 - 09:00",
    days: "Thứ 2 - Thứ 6",
    discount: "25%",
    status: "active",
    usageCount: 1250,
  },
  {
    id: "gh-002",
    title: "Giờ nghỉ trưa",
    description: "Giảm 20% cho đơn đặt từ 11h-14h",
    image: "/placeholder.svg?height=200&width=400",
    time: "11:00 - 14:00",
    days: "Hàng ngày",
    discount: "20%",
    status: "active",
    usageCount: 2180,
  },
  {
    id: "gh-003",
    title: "Chiều tà thư giãn",
    description: "Giảm 30% cho đơn đặt từ 16h-18h",
    image: "/placeholder.svg?height=200&width=400",
    time: "16:00 - 18:00",
    days: "Thứ 2 - Thứ 6",
    discount: "30%",
    status: "scheduled",
    usageCount: 0,
  },
]

const regionalCombos = [
  {
    id: "rc-001",
    title: "Khám phá Quận 1",
    description: "Combo 3 quán cà phê nổi tiếng tại Quận 1 với giá ưu đãi",
    image: "/placeholder.svg?height=200&width=400",
    region: "Quận 1, TP.HCM",
    price: "199.000đ",
    originalPrice: "350.000đ",
    status: "active",
    soldCount: 320,
  },
  {
    id: "rc-002",
    title: "Tour Cà phê Đà Lạt",
    description: "Trải nghiệm 4 quán cà phê view đẹp tại Đà Lạt",
    image: "/placeholder.svg?height=200&width=400",
    region: "Đà Lạt, Lâm Đồng",
    price: "299.000đ",
    originalPrice: "500.000đ",
    status: "active",
    soldCount: 180,
  },
  {
    id: "rc-003",
    title: "Cà phê Hội An cổ kính",
    description: "Combo 3 quán cà phê phong cách cổ tại Hội An",
    image: "/placeholder.svg?height=200&width=400",
    region: "Hội An, Quảng Nam",
    price: "249.000đ",
    originalPrice: "400.000đ",
    status: "scheduled",
    soldCount: 0,
  },
]

const systemPromotions = [
  {
    id: "sp-001",
    title: "Chào mừng người dùng mới",
    description: "Giảm 50% cho lần đặt chỗ đầu tiên",
    image: "/placeholder.svg?height=200&width=400",
    discount: "50%",
    maxDiscount: "100.000đ",
    startDate: "01/01/2025",
    endDate: "31/12/2025",
    status: "active",
    usageCount: 5280,
  },
  {
    id: "sp-002",
    title: "Ưu đãi sinh nhật",
    description: "Giảm 30% cho đơn đặt chỗ trong tháng sinh nhật",
    image: "/placeholder.svg?height=200&width=400",
    discount: "30%",
    maxDiscount: "150.000đ",
    startDate: "01/01/2025",
    endDate: "31/12/2025",
    status: "active",
    usageCount: 1850,
  },
  {
    id: "sp-003",
    title: "Khuyến mãi mùa hè",
    description: "Giảm 25% cho tất cả đơn đặt chỗ trong mùa hè",
    image: "/placeholder.svg?height=200&width=400",
    discount: "25%",
    maxDiscount: "200.000đ",
    startDate: "01/06/2025",
    endDate: "31/08/2025",
    status: "scheduled",
    usageCount: 0,
  },
]

export default function PromotionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý ưu đãi hệ thống</h1>
          <p className="text-gray-500">Tạo và quản lý các ưu đãi trên toàn hệ thống ChecKafe.</p>
        </div>
      </div>

      <Tabs defaultValue="golden-hours" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="golden-hours">Giờ vàng</TabsTrigger>
            <TabsTrigger value="regional-combos">Combo khu vực</TabsTrigger>
            <TabsTrigger value="system-promotions">Ưu đãi hệ thống</TabsTrigger>
          </TabsList>
          <Button className="bg-primary hover:bg-primary-dark">
            <Plus className="mr-2 h-4 w-4" /> Tạo mới
          </Button>
        </div>

        <TabsContent value="golden-hours" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input type="search" placeholder="Tìm kiếm giờ vàng..." className="pl-8 bg-white" />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {goldenHours.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative h-40 w-full">
                  <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                  <div className="absolute top-2 right-2">
                    {item.status === "active" ? (
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                        Đang áp dụng
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                        Đã lên lịch
                      </Badge>
                    )}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 flex items-center">
                        <Clock className="mr-1 h-4 w-4" /> Thời gian
                      </div>
                      <div>{item.time}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 flex items-center">
                        <Calendar className="mr-1 h-4 w-4" /> Ngày áp dụng
                      </div>
                      <div>{item.days}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 flex items-center">
                        <Percent className="mr-1 h-4 w-4" /> Giảm giá
                      </div>
                      <div>{item.discount}</div>
                    </div>
                    {item.status === "active" && (
                      <div>
                        <div className="text-gray-500 flex items-center">
                          <Package className="mr-1 h-4 w-4" /> Đã sử dụng
                        </div>
                        <div>{item.usageCount} lần</div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" /> Sửa
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
                    <Trash2 className="mr-2 h-4 w-4" /> Xóa
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="regional-combos" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input type="search" placeholder="Tìm kiếm combo khu vực..." className="pl-8 bg-white" />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {regionalCombos.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative h-40 w-full">
                  <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                  <div className="absolute top-2 right-2">
                    {item.status === "active" ? (
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                        Đang bán
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                        Đã lên lịch
                      </Badge>
                    )}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 flex items-center">
                        <MapPin className="mr-1 h-4 w-4" /> Khu vực
                      </div>
                      <div>{item.region}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Giá</div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">{item.price}</span>
                        <span className="text-gray-500 line-through text-xs">{item.originalPrice}</span>
                      </div>
                    </div>
                    {item.status === "active" && (
                      <div>
                        <div className="text-gray-500 flex items-center">
                          <Package className="mr-1 h-4 w-4" /> Đã bán
                        </div>
                        <div>{item.soldCount} combo</div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" /> Sửa
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
                    <Trash2 className="mr-2 h-4 w-4" /> Xóa
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system-promotions" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input type="search" placeholder="Tìm kiếm ưu đãi hệ thống..." className="pl-8 bg-white" />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {systemPromotions.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative h-40 w-full">
                  <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                  <div className="absolute top-2 right-2">
                    {item.status === "active" ? (
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                        Đang áp dụng
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                        Đã lên lịch
                      </Badge>
                    )}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 flex items-center">
                        <Percent className="mr-1 h-4 w-4" /> Giảm giá
                      </div>
                      <div>
                        {item.discount} (tối đa {item.maxDiscount})
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 flex items-center">
                        <Calendar className="mr-1 h-4 w-4" /> Thời gian
                      </div>
                      <div>
                        {item.startDate} - {item.endDate}
                      </div>
                    </div>
                    {item.status === "active" && (
                      <div className="col-span-2">
                        <div className="text-gray-500 flex items-center">
                          <Package className="mr-1 h-4 w-4" /> Đã sử dụng
                        </div>
                        <div>{item.usageCount} lần</div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" /> Sửa
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
                    <Trash2 className="mr-2 h-4 w-4" /> Xóa
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
