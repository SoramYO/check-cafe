"use client"
import { useState, useEffect, ChangeEvent, FormEvent } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Post } from "../types"
import authorizedAxiosInstance from "@/lib/axios"
import dynamic from 'next/dynamic'
import { Editor } from '@tinymce/tinymce-react';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface PostFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  post?: Post | null
}

export function PostFormModal({ isOpen, onClose, onSuccess, post }: PostFormModalProps) {
  const [form, setForm] = useState({
    title: "",
    content: "",
    image: "",
    publishedAt: "",
    url: "",
    metaDescription: "",
    keywords: "",
    status: "draft"
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (post) {
      setForm({
        title: post.title || "",
        content: post.content || "",
        image: post.image || "",
        publishedAt: post.publishedAt ? post.publishedAt.slice(0, 10) : "",
        url: post.url || "",
        metaDescription: post.metaDescription || "",
        keywords: post.keywords?.join(", ") || "",
        status: post.status || "draft"
      })
      setImageFile(null)
    } else {
      setForm({
        title: "",
        content: "",
        image: "",
        publishedAt: "",
        url: "",
        metaDescription: "",
        keywords: "",
        status: "draft"
      })
      setImageFile(null)
    }
  }, [post, isOpen])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setForm(prev => ({ ...prev, status: value }))
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setForm(prev => ({ ...prev, image: URL.createObjectURL(file) }))
    }
  }

  const handleContentChange = (content: string) => {
    setForm(prev => ({ ...prev, content }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("title", form.title)
      formData.append("content", form.content)
      formData.append("url", form.url)
      formData.append("metaDescription", form.metaDescription)
      formData.append("keywords", form.keywords)
      formData.append("status", form.status)
      if (form.publishedAt) formData.append("publishedAt", form.publishedAt)
      if (imageFile) formData.append("image", imageFile)
      let res
      if (post) {
        res = await authorizedAxiosInstance.put(`/v1/admin/posts/${post._id}`, formData, { headers: { "Content-Type": "multipart/form-data" } })
      } else {
        res = await authorizedAxiosInstance.post(`/v1/admin/posts`, formData, { headers: { "Content-Type": "multipart/form-data" } })
      }
      if (res.data.status === 200 || res.data.status === 201) {
        onSuccess()
        onClose()
      }
    } catch (err) {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
  }

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'blockquote', 'code-block',
    'link', 'image'
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Tiêu đề *</Label>
            <Input name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div>
            <Label>Nội dung *</Label>
            <div className="bg-white rounded border min-h-[200px]">
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "ri131ytlz0k9b0xyp4eqrlhq19wpr7ngx1eu6ygg4pve5x77"}
                value={form.content}
                onEditorChange={(val: string) => setForm(prev => ({ ...prev, content: val }))}
                init={{
                  height: 220,
                  menubar: false,
                  plugins: [
                    'advlist autolink lists link image charmap preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste code help wordcount'
                  ],
                  toolbar:
                    'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                  content_style: 'body { font-family:Inter,sans-serif; font-size:14px }'
                }}
              />
            </div>
          </div>
          <div>
            <Label>Hình ảnh</Label>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
            {form.image && <img src={form.image} alt="preview" className="mt-2 max-h-32 rounded" />}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Ngày đăng</Label>
              <Input type="date" name="publishedAt" value={form.publishedAt} onChange={handleChange} />
            </div>
            <div>
              <Label>Trạng thái</Label>
              <Select value={form.status} onValueChange={handleStatusChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Nháp</SelectItem>
                  <SelectItem value="published">Đã đăng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>URL *</Label>
            <Input name="url" value={form.url} onChange={handleChange} required />
          </div>
          <div>
            <Label>Meta Description</Label>
            <Textarea name="metaDescription" value={form.metaDescription} onChange={handleChange} rows={2} />
          </div>
          <div>
            <Label>Từ khóa (phân cách bằng dấu phẩy)</Label>
            <Input name="keywords" value={form.keywords} onChange={handleChange} placeholder="cafe, bài viết, tin tức" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Hủy</Button>
            <Button type="submit" disabled={loading}>{loading ? "Đang lưu..." : post ? "Cập nhật" : "Tạo mới"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}