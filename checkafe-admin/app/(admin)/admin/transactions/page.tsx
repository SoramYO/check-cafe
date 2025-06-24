"use client"
import { useEffect, useState } from "react"
import authorizedAxiosInstance from "@/lib/axios"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Package, UserPackage, User, Payment } from "./types"
import ModalCreatePackage from "./components/ModalCreatePackage"
import ModalEditPackage from "./components/ModalEditPackage"



export default function UserTransactionsPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [userPackages, setUserPackages] = useState<UserPackage[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState("packages")
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editPackage, setEditPackage] = useState<Package | null>(null)

  useEffect(() => {
    if (tab === "packages") fetchPackages()
    if (tab === "userPackages") fetchUserPackages()
  }, [tab])

  const fetchPackages = async () => {
    setLoading(true)
    try {
      const res = await authorizedAxiosInstance.get("/v1/packages")
      setPackages(res.data?.data?.packages || [])
    } catch (err) {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPackages = async () => {
    setLoading(true)
    try {
      const res = await authorizedAxiosInstance.get("/v1/user-packages")
      setUserPackages(res.data?.data?.data || [])
    } catch (err) {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  const filteredPackages = packages.filter(pkg =>
    !search || pkg.name.toLowerCase().includes(search.toLowerCase())
  )
  const filteredUserPackages = userPackages.filter(up => {
    const pkg = up.package_id
    return (
      !search || (pkg?.name && pkg.name.toLowerCase().includes(search.toLowerCase()))
    )
  })

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="packages">Danh sách gói</TabsTrigger>
            <TabsTrigger value="userPackages">Giao dịch người dùng</TabsTrigger>
          </TabsList>
          <Input
            placeholder={tab === "packages" ? "Tìm kiếm theo tên gói..." : "Tìm kiếm theo tên gói..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64"
          />
        </div>
        <TabsContent value="packages">
          <div className="bg-white rounded shadow p-4">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setCreateOpen(true)} className="bg-primary text-white">Tạo mới</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên gói</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Thời lượng</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6}>Đang tải...</TableCell></TableRow>
                ) : filteredPackages.length === 0 ? (
                  <TableRow><TableCell colSpan={6}>Không có dữ liệu</TableCell></TableRow>
                ) : (
                  filteredPackages.map(pkg => (
                    <TableRow key={pkg._id}>
                      <TableCell>{pkg.name}</TableCell>
                      <TableCell>
                        {Array.isArray(pkg.description) ? (
                          <ul className="list-disc pl-4 space-y-1">
                            {pkg.description.map((desc, idx) => (
                              <li key={idx}>{desc}</li>
                            ))}
                          </ul>
                        ) : (
                          <span>{pkg.description}</span>
                        )}
                      </TableCell>
                      <TableCell>{pkg.price?.toLocaleString()}đ</TableCell>
                      <TableCell>{pkg.duration} ngày</TableCell>
                      <TableCell>{pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString() : ""}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => { setEditPackage(pkg); setEditOpen(true); }}>Sửa</Button>
                        <Button size="sm" variant="destructive" className="ml-2">Xóa</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <ModalCreatePackage open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={fetchPackages} />
            <ModalEditPackage open={editOpen} onClose={() => setEditOpen(false)} pkg={editPackage} onSuccess={fetchPackages} />
          </div>
        </TabsContent>
        <TabsContent value="userPackages">
          <div className="bg-white rounded shadow p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Avatar</TableHead>
                  <TableHead>Tên user</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead>Tên gói</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Thời lượng</TableHead>
                  <TableHead>Ngày mua</TableHead>
                  <TableHead>Số tiền thanh toán</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={11}>Đang tải...</TableCell></TableRow>
                ) : filteredUserPackages.length === 0 ? (
                  <TableRow><TableCell colSpan={11}>Không có dữ liệu</TableCell></TableRow>
                ) : (
                  filteredUserPackages.map(up => (
                    <TableRow key={up._id}>
                      <TableCell>
                        {up.user_id?.avatar ? (
                          <img src={up.user_id.avatar} alt={up.user_id.full_name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">?
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{up.user_id?.full_name}</TableCell>
                      <TableCell>{up.user_id?.email}</TableCell>
                      <TableCell>{up.user_id?.phone}</TableCell>
                      <TableCell>{up.package_id?.name}</TableCell>
                      <TableCell>{up.package_id?.price?.toLocaleString()}đ</TableCell>
                      <TableCell>{up.package_id?.duration} ngày</TableCell>
                      <TableCell>{new Date(up.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{up.payment_id?.amount ? up.payment_id.amount.toLocaleString() + 'đ' : ''}</TableCell>
                      <TableCell>{up.payment_id?.status || ''}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
