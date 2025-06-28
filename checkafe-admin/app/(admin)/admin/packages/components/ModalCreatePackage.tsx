"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Package as PackageIcon } from "lucide-react"
import authorizedAxiosInstance from "@/lib/axios"

interface ModalCreatePackageProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ModalCreatePackage({ open, onClose, onSuccess }: ModalCreatePackageProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    icon: "package",
    description: "",
    price: "",
    duration: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const descriptions = formData.description.split("\n").filter(desc => desc.trim())
      await authorizedAxiosInstance.post("/v1/packages", {
        ...formData,
        description: descriptions,
        price: Number(formData.price),
        duration: Number(formData.duration)
      })
      onSuccess()
      onClose()
    } catch (err) {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tạo gói dịch vụ mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Tên gói</Label>
              <Input
                required
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nhập tên gói dịch vụ..."
              />
            </div>

            <div>
              <Label>Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={value => setFormData(prev => ({ ...prev, icon: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="star">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      <span>Star</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="package">
                    <div className="flex items-center gap-2">
                      <PackageIcon className="w-4 h-4" />
                      <span>Package</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Mô tả (mỗi dòng là một điểm mô tả)</Label>
              <Textarea
                required
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Nhập mô tả gói dịch vụ..."
                rows={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Giá (VNĐ)</Label>
                <Input
                  required
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Nhập giá..."
                />
              </div>

              <div>
                <Label>Thời hạn (ngày)</Label>
                <Input
                  required
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="Nhập số ngày..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo mới"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 