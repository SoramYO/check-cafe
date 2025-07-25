"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw } from "lucide-react"
import authorizedAxiosInstance from "@/lib/axios"
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog"
import { PostDetailModal } from "./components/PostDetailModal"

interface Post {
  _id: string
  title: string
  image?: string
  publishedAt?: string
  url: string
  metaDescription?: string
  keywords?: string[]
  status: string
  createdAt: string
  updatedAt: string
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingPost, setDeletingPost] = useState<Post | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [detailPost, setDetailPost] = useState<Post | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [page, limit, search])

  const fetchPosts = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (search) params.append("search", search)
      const res = await authorizedAxiosInstance.get(`/admin/posts?${params.toString()}`)
      if (res.data?.data?.posts) {
        setPosts(res.data.data.posts)
        setTotalPages(res.data.data.pagination.totalPages)
      }
    } catch (err: any) {
      setError("Không thể tải danh sách bài viết")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (post: Post) => {
    setDeletingPost(post)
    setIsDeleteOpen(true)
  }
  const confirmDelete = async () => {
    if (!deletingPost) return
    setIsDeleting(true)
    try {
      await authorizedAxiosInstance.delete(`/admin/posts/${deletingPost._id}`)
      setIsDeleteOpen(false)
      setDeletingPost(null)
      fetchPosts()
    } catch (err) {
      // handle error
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý bài viết</h1>
          <p className="text-gray-500">Tạo và quản lý các bài viết trên hệ thống.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-1" onClick={fetchPosts}>
            <RefreshCw className="h-4 w-4" /> Làm mới
          </Button>
          <Button className="bg-primary flex items-center gap-1">
            <Plus className="h-4 w-4" /> Thêm bài viết mới
          </Button>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <input
          type="search"
          placeholder="Tìm kiếm bài viết..."
          className="border px-3 py-2 rounded w-full md:w-64"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
      </div>
      {loading ? (
        <div className="py-8 text-center">Đang tải...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 text-left">Tiêu đề</th>
                <th className="p-2 text-left">Trạng thái</th>
                <th className="p-2 text-left">Ngày đăng</th>
                <th className="p-2 text-left">URL</th>
                <th className="p-2 text-left">Từ khóa</th>
                <th className="p-2 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">Không có bài viết</td></tr>
              ) : posts.map(post => (
                <tr key={post._id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{post.title}</td>
                  <td className="p-2">{post.status === "published" ? "Đã đăng" : "Nháp"}</td>
                  <td className="p-2">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "-"}</td>
                  <td className="p-2">{post.url}</td>
                  <td className="p-2">{post.keywords?.join(", ")}</td>
                  <td className="p-2">
                    <Button size="sm" variant="secondary" className="mr-2" onClick={() => { setDetailPost(post); setIsDetailOpen(true) }}>Xem</Button>
                    <Button size="sm" variant="outline">Sửa</Button>
                    <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDelete(post)}>Xóa</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Trang {page} / {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>Trước</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>Sau</Button>
          </div>
        </div>
      )}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        postTitle={deletingPost?.title}
      />
      <PostDetailModal
        post={detailPost}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  )
} 