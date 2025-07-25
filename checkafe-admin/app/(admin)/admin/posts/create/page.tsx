"use client"
import { useState, ChangeEvent, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Editor } from '@tinymce/tinymce-react';
import authorizedAxiosInstance from "@/lib/axios"

export default function CreatePostPage() {
  const router = useRouter()
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
  const handleContentChange = (val: string) => {
    setForm(prev => ({ ...prev, content: val }))
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
      const res = await authorizedAxiosInstance.post(`/v1/admin/posts`, formData, { headers: { "Content-Type": "multipart/form-data" } })
      if (res.data.status === 200 || res.data.status === 201) {
        router.push("/admin/posts")
      }
    } catch (err) {
      // handle error
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Tạo bài viết mới</h1>
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
              onEditorChange={handleContentChange}
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
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/posts") } disabled={loading}>Hủy</Button>
          <Button type="submit" disabled={loading}>{loading ? "Đang lưu..." : "Tạo mới"}</Button>
        </div>
      </form>
    </div>
  )
} 