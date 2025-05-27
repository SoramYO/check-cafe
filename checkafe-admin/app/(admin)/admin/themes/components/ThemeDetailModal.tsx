'use client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Theme } from "../types"
import { Edit, Trash2, CalendarDays } from "lucide-react"
import { format } from "date-fns"

interface ThemeDetailModalProps {
  theme: Theme | null
  isOpen: boolean
  onClose: () => void
  onEdit: (theme: Theme) => void
  onDelete: (themeId: string) => void
}

export function ThemeDetailModal({ theme, isOpen, onClose, onEdit, onDelete }: ThemeDetailModalProps) {
  if (!theme) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Chi tiết chủ đề</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="relative w-full h-64 overflow-hidden rounded-md">
            <img
              src={theme.theme_image}
              alt={theme.name}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{theme.name}</h3>
              <p className="text-gray-500 mt-1">{theme.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" /> Ngày tạo:
                </span>
                <div>{format(new Date(theme.createdAt), 'dd/MM/yyyy')}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" /> Cập nhật lần cuối:
                </span>
                <div>{format(new Date(theme.updatedAt), 'dd/MM/yyyy')}</div>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-gray-500">ID:</span>
                <div className="font-mono text-xs">{theme._id}</div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onEdit(theme)}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" /> Sửa
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => onDelete(theme._id)}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" /> Xóa
            </Button>
          </div>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 