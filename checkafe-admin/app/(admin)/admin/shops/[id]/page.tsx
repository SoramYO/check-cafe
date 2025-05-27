import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  FileText,
  Star,
  Calendar,
  Users,
  Coffee,
  ImageIcon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ShopDetailPage({ params }: { params: { id: string } }) {
  // Giả lập dữ liệu quán cà phê
  const shop = {
    id: params.id,
    name: "Cafe Ngon",
    logo: "/placeholder.svg?height=80&width=80",
    coverImage: "/placeholder.svg?height=300&width=800",
    description: "Quán cà phê với không gian thoáng đãng, view đẹp và đồ uống chất lượng cao.",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    phone: "0901234567",
    email: "info@cafengon.com",
    website: "https://cafengon.com",
    openingHours: "07:30 - 22:00",
    rating: 4.8,
    totalOrders: 1250,
    status: "active",
    verificationStatus: "pending",
    joinDate: "01/01/2025",
    owner: {
      name: "Nguyễn Văn A",
      phone: "0909123456",
      email: "nguyenvana@gmail.com",
    },
    businessLicense: {
      number: "0123456789",
      issueDate: "01/01/2023",
      issuedBy: "Sở Kế hoạch và Đầu tư TP.HCM",
      document: "/placeholder.svg?height=400&width=300",
      uploadDate: "15/05/2025",
    },
    amenities: ["Wifi miễn phí", "Bãi đỗ xe", "Máy lạnh", "Chỗ ngồi ngoài trời", "Ổ cắm điện"],
    theme: "Vintage",
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/shops">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{shop.name}</h1>
            <p className="text-gray-500">Chi tiết quán cà phê và xác minh giấy phép kinh doanh.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {shop.verificationStatus === "pending" && (
            <>
              <Button variant="outline" className="gap-1 text-red-500 border-red-200 hover:bg-red-50">
                <XCircle className="h-4 w-4" /> Từ chối
              </Button>
              <Button className="gap-1 bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4" /> Xác minh
              </Button>
            </>
          )}
          {shop.status === "active" ? (
            <Button variant="outline" className="gap-1 text-red-500 border-red-200 hover:bg-red-50">
              Tạm ngưng hoạt động
            </Button>
          ) : (
            <Button variant="outline" className="gap-1 text-green-600 border-green-200 hover:bg-green-50">
              Kích hoạt
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <div className="relative h-48 w-full">
            <Image src={shop.coverImage || "/placeholder.svg"} alt={shop.name} fill className="object-cover" />
          </div>
          <CardHeader className="flex-row items-start gap-4 space-y-0">
            <div className="relative h-20 w-20 rounded-full overflow-hidden border-4 border-white -mt-12 bg-white">
              <Image src={shop.logo || "/placeholder.svg"} alt={shop.name} fill className="object-cover" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle>{shop.name}</CardTitle>
                {shop.status === "active" ? (
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    Đang hoạt động
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                    Tạm ngưng
                  </Badge>
                )}
                {shop.verificationStatus === "verified" && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                    <CheckCircle className="h-3 w-3 mr-1" /> Đã xác minh
                  </Badge>
                )}
              </div>
              <CardDescription>{shop.description}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{shop.address}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{shop.phone}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{shop.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>{shop.website}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{shop.openingHours}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  <span>{shop.rating} (120 đánh giá)</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Tham gia: {shop.joinDate}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Coffee className="h-4 w-4 mr-2" />
                  <span>{shop.totalOrders} đơn đặt</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Chủ đề: {shop.theme}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  <span>12 ảnh</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-2">Tiện ích</h3>
              <div className="flex flex-wrap gap-2">
                {shop.amenities.map((amenity, index) => (
                  <Badge key={index} variant="secondary">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin chủ quán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Họ tên:</span>
                <span className="font-medium">{shop.owner.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Số điện thoại:</span>
                <span className="font-medium">{shop.owner.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-medium">{shop.owner.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="verification" className="space-y-4">
        <TabsList>
          <TabsTrigger value="verification">Xác minh giấy phép</TabsTrigger>
          <TabsTrigger value="analytics">Thống kê</TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
          <TabsTrigger value="history">Lịch sử</TabsTrigger>
        </TabsList>

        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Giấy phép kinh doanh</CardTitle>
                  <CardDescription>Xem xét và xác minh giấy phép kinh doanh của quán.</CardDescription>
                </div>
                {shop.verificationStatus === "pending" && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                    Đang chờ xác minh
                  </Badge>
                )}
                {shop.verificationStatus === "verified" && (
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    Đã xác minh
                  </Badge>
                )}
                {shop.verificationStatus === "rejected" && (
                  <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                    Bị từ chối
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Thông tin giấy phép</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Số giấy phép:</span>
                        <span className="font-medium">{shop.businessLicense.number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ngày cấp:</span>
                        <span className="font-medium">{shop.businessLicense.issueDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Cơ quan cấp:</span>
                        <span className="font-medium">{shop.businessLicense.issuedBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ngày tải lên:</span>
                        <span className="font-medium">{shop.businessLicense.uploadDate}</span>
                      </div>
                    </div>
                  </div>

                  {shop.verificationStatus === "pending" && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Quyết định xác minh</h3>
                      <div className="flex gap-2">
                        <Button className="flex-1 gap-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4" /> Xác minh
                        </Button>
                        <Button variant="outline" className="flex-1 gap-1 text-red-500 border-red-200 hover:bg-red-50">
                          <XCircle className="h-4 w-4" /> Từ chối
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Lý do từ chối (nếu từ chối)</h4>
                        <Textarea placeholder="Nhập lý do từ chối xác minh..." />
                      </div>
                    </div>
                  )}

                  {shop.verificationStatus === "verified" && (
                    <Alert className="bg-green-50 text-green-600 border-green-200">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Đã xác minh</AlertTitle>
                      <AlertDescription>Quán này đã được xác minh vào ngày 16/05/2025 bởi Admin.</AlertDescription>
                    </Alert>
                  )}

                  {shop.verificationStatus === "rejected" && (
                    <Alert className="bg-red-50 text-red-600 border-red-200">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Đã từ chối</AlertTitle>
                      <AlertDescription>
                        Giấy phép kinh doanh đã hết hạn. Vui lòng cung cấp giấy phép còn hiệu lực.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Hình ảnh giấy phép</h3>
                  <div className="border rounded-md overflow-hidden">
                    <div className="relative h-[400px] w-full">
                      <Image
                        src={shop.businessLicense.document || "/placeholder.svg"}
                        alt="Giấy phép kinh doanh"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="p-2 bg-gray-50 border-t flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-500">GiayPhepKinhDoanh.pdf</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Tải xuống
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Quay lại danh sách</Button>
              <div className="flex gap-2">
                {shop.verificationStatus === "pending" && (
                  <>
                    <Button variant="outline" className="gap-1 text-red-500 border-red-200 hover:bg-red-50">
                      <XCircle className="h-4 w-4" /> Từ chối
                    </Button>
                    <Button className="gap-1 bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4" /> Xác minh
                    </Button>
                  </>
                )}
                {shop.verificationStatus === "verified" && (
                  <Button variant="outline" className="gap-1 text-red-500 border-red-200 hover:bg-red-50">
                    <XCircle className="h-4 w-4" /> Hủy xác minh
                  </Button>
                )}
                {shop.verificationStatus === "rejected" && (
                  <Button className="gap-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4" /> Xác minh lại
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê hoạt động</CardTitle>
              <CardDescription>Xem thống kê hoạt động của quán cà phê.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-gray-500">Biểu đồ thống kê sẽ hiển thị ở đây</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Đánh giá từ khách hàng</CardTitle>
              <CardDescription>Xem đánh giá của khách hàng về quán cà phê.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-gray-500">Danh sách đánh giá sẽ hiển thị ở đây</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử hoạt động</CardTitle>
              <CardDescription>Xem lịch sử hoạt động và thay đổi của quán cà phê.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-gray-500">Lịch sử hoạt động sẽ hiển thị ở đây</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
