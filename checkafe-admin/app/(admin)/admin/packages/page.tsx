"use client"
import { useEffect, useState } from "react"
import authorizedAxiosInstance from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package as PackageIcon, Star, Search, Plus, Edit2, Trash2 } from "lucide-react"
import ModalCreatePackage from "./components/ModalCreatePackage"
import ModalEditPackage from "./components/ModalEditPackage"

interface Package {
  _id: string
  icon: string
  name: string
  description: string[]
  price: number
  duration: number
  createdAt: string
  updatedAt: string
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editPackage, setEditPackage] = useState<Package | null>(null)

  useEffect(() => {
    fetchPackages()
  }, [])

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

  const filteredPackages = packages.filter(pkg =>
    !search || pkg.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PackageIcon className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Quản lý gói dịch vụ</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm gói dịch vụ..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={() => setCreateOpen(true)} className="bg-primary text-white">
            <Plus className="w-4 h-4 mr-2" />
            Tạo gói mới
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map(pkg => (
            <div key={pkg._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col h-full">
              <div className="p-6 border-b flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {pkg.icon === 'star' ? (
                      <Star className="w-6 h-6 text-yellow-400" />
                    ) : (
                      <PackageIcon className="w-6 h-6 text-primary" />
                    )}
                    <h3 className="text-lg font-semibold">{pkg.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => { setEditPackage(pkg); setEditOpen(true); }}
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-2xl font-bold text-primary">
                    {pkg.price.toLocaleString()}đ
                    <span className="text-sm font-normal text-gray-500 ml-1">/ {pkg.duration} ngày</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {pkg.description.map((desc, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                      <span className="text-gray-600">{desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-gray-50 text-sm text-gray-500 rounded-b-lg mt-auto">
                Cập nhật lần cuối: {new Date(pkg.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalCreatePackage open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={fetchPackages} />
      <ModalEditPackage open={editOpen} onClose={() => setEditOpen(false)} pkg={editPackage} onSuccess={fetchPackages} />
    </div>
  )
} 