"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Post } from "../types"

interface PostDetailModalProps {
  post: Post | null
  isOpen: boolean
  onClose: () => void
}

export function PostDetailModal({ post, isOpen, onClose }: PostDetailModalProps) {
  if (!post) return null
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{post.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {post.image && <img src={post.image} alt={post.title} className="w-full max-h-64 object-contain rounded" />}
          <div className="flex flex-wrap gap-2 text-sm text-gray-500">
            <span>Trạng thái: <b>{post.status === "published" ? "Đã đăng" : "Nháp"}</b></span>
            <span>Ngày đăng: {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "-"}</span>
            <span>URL: <span className="font-mono">{post.url}</span></span>
          </div>
          <div className="text-sm text-gray-600">Meta: {post.metaDescription}</div>
          <div className="text-sm text-gray-600">Từ khóa: {post.keywords?.join(", ")}</div>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content || "" }} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 