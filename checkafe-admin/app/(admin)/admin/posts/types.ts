export interface Post {
  _id: string
  title: string
  content: string
  image?: string
  publishedAt?: string
  url: string
  metaDescription?: string
  keywords?: string[]
  status: string
  createdAt: string
  updatedAt: string
}

export interface PostResponse {
  status: number
  data: {
    posts: Post[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
} 