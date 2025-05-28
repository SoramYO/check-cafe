"use client"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import authorizedAxiosInstance from "@/lib/axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { DiscountForm } from "../types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface ModalCreateDiscountProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function ModalCreateDiscount({ open, onClose, onSuccess }: ModalCreateDiscountProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm<DiscountForm>({
    defaultValues: {
      title: "",
      description: "",
      points_required: 0,
      discount_value: 0,
      discount_type: "percent",
      code: "",
      shop_id: "",
      is_vip_only: false,
      usage_limit: 1,
      used_count: 0,
      start_date: "",
      end_date: "",
      is_active: true,
    }
  })
  const [shops, setShops] = useState<{ _id: string, name: string }[]>([])
  const [shopSearch, setShopSearch] = useState("")
  const selectedShopId = watch("shop_id")

  useEffect(() => {
    // Fetch shops from API
    authorizedAxiosInstance.get("/v1/shops/public", { params: { search: shopSearch, limit: 20 } })
      .then(res => {
        setShops(res.data?.data?.shops || [])
      })
  }, [shopSearch])

  const onSubmit = async (data: DiscountForm) => {
    try {
      await authorizedAxiosInstance.post("/v1/discounts", data)
      toast.success("Tạo ưu đãi thành công!")
      reset()
      onClose()
      onSuccess?.()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Tạo ưu đãi thất bại")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo ưu đãi mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Tên ưu đãi <span className="text-red-500">*</span></label>
            <Input {...register("title", { required: true })} placeholder="Nhập tên ưu đãi, ví dụ: Summer Sale" />
            <p className="text-xs text-gray-500 mt-1">Tên chương trình khuyến mãi hiển thị cho khách hàng.</p>
          </div>
          <div>
            <label className="block font-medium">Mô tả <span className="text-red-500">*</span></label>
            <Input {...register("description", { required: true })} placeholder="Mô tả ngắn về ưu đãi" />
            <p className="text-xs text-gray-500 mt-1">Giới thiệu ngắn gọn về ưu đãi này.</p>
          </div>
          <div>
            <label className="block font-medium">Điểm yêu cầu</label>
            <Input {...register("points_required", { valueAsNumber: true })} type="number" placeholder="0" />
            <p className="text-xs text-gray-500 mt-1">Số điểm khách cần để đổi ưu đãi (nếu có).</p>
          </div>
          <div>
            <label className="block font-medium">Giá trị giảm <span className="text-red-500">*</span></label>
            <Input {...register("discount_value", { valueAsNumber: true })} type="number" placeholder="Nhập số % hoặc số tiền giảm" />
            <p className="text-xs text-gray-500 mt-1">Nhập số phần trăm hoặc số tiền giảm giá.</p>
          </div>
          <div>
            <label className="block font-medium">Loại giảm giá</label>
            <select {...register("discount_type")}
              className="w-full border rounded px-3 py-2">
              <option value="percent">Phần trăm (%)</option>
              <option value="amount">Số tiền (VNĐ)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Chọn kiểu giảm giá: phần trăm hoặc số tiền cụ thể.</p>
          </div>
          <div>
            <label className="block font-medium">Mã code <span className="text-red-500">*</span></label>
            <Input {...register("code", { required: true })} placeholder="Nhập mã code, ví dụ: SUMMER2024" />
            <p className="text-xs text-gray-500 mt-1">Khách hàng nhập mã này để nhận ưu đãi.</p>
          </div>
          <div>
            <label className="block font-medium">Chọn quán áp dụng <span className="text-red-500">*</span></label>
            <Select value={selectedShopId} onValueChange={val => setValue("shop_id", val, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn quán..." />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    placeholder="Tìm kiếm quán..."
                    value={shopSearch}
                    onChange={e => setShopSearch(e.target.value)}
                    className="mb-2"
                  />
                </div>
                {shops.length === 0 && <div className="px-3 py-2 text-gray-400">Không tìm thấy quán</div>}
                {shops.map(shop => (
                  <SelectItem key={shop._id} value={shop._id}>{shop.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">Chọn quán áp dụng ưu đãi. Có thể tìm kiếm theo tên.</p>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <label className="flex items-center gap-2">
              <Switch checked={!!watch("is_vip_only")}
                onCheckedChange={val => setValue("is_vip_only", val)}
                disabled={isSubmitting}
              />
              <span>Chỉ dành cho VIP</span>
            </label>
            <label className="flex items-center gap-2">
              <Switch checked={!!watch("is_active")}
                onCheckedChange={val => setValue("is_active", val)}
                disabled={isSubmitting}
              />
              <span>Kích hoạt</span>
            </label>
          </div>
          <div>
            <label className="block font-medium">Giới hạn lượt dùng</label>
            <Input {...register("usage_limit", { valueAsNumber: true })} type="number" placeholder="50" />
            <p className="text-xs text-gray-500 mt-1">Tổng số lượt ưu đãi được sử dụng (0 = không giới hạn).</p>
          </div>
          <div>
            <label className="block font-medium">Đã dùng</label>
            <Input {...register("used_count", { valueAsNumber: true })} type="number" placeholder="0" />
            <p className="text-xs text-gray-500 mt-1">Số lượt đã sử dụng (tự động tăng, không cần nhập khi tạo mới).</p>
          </div>
          <div>
            <label className="block font-medium">Ngày bắt đầu</label>
            <Input {...register("start_date")} type="datetime-local" placeholder="" />
            <p className="text-xs text-gray-500 mt-1">Thời gian bắt đầu áp dụng ưu đãi.</p>
          </div>
          <div>
            <label className="block font-medium">Ngày kết thúc</label>
            <Input {...register("end_date")} type="datetime-local" placeholder="" />
            <p className="text-xs text-gray-500 mt-1">Thời gian kết thúc ưu đãi.</p>
          </div>
          <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary text-white">Tạo mới</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 