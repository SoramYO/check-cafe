'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MessageSquare, Star, ThumbsUp, ThumbsDown, Reply, Filter, Search, Calendar, Users, Crown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useShop } from "@/context/ShopContext"
import authorizedAxiosInstance from "@/lib/axios"

// Types
interface Review {
  _id: string;
  shop_id: string;
  user_id: {
    _id: string;
    full_name: string;
    avatar?: string;
    vip_status: boolean;
  };
  rating: number;
  comment: string;
  images?: string[];
  shop_reply?: {
    reply: string;
    replied_by?: {
      _id: string;
      full_name: string;
    };
    replied_at: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface FeedbackStats {
  overview: {
    totalReviews: number;
    repliedReviews: number;
    pendingReplies: number;
    recentReviews: number;
    avgRating: number;
    satisfactionRate: number;
  };
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  monthlyReviews: Array<{
    _id: {
      year: number;
      month: number;
    };
    count: number;
  }>;
  topReviewers: Array<{
    user: {
      _id: string;
      full_name: string;
      avatar?: string;
      vip_status: boolean;
    };
    reviewCount: number;
    avgRating: number;
  }>;
}

interface FeedbackResponse {
  reviews: Review[];
  metadata: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

// API Functions
const shopFeedbackAPI = {
  // Get shop feedback/reviews
  getShopFeedback: async (
    shopId: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      rating?: number;
      hasReply?: boolean;
      search?: string;
    }
  ): Promise<FeedbackResponse> => {
    const response = await authorizedAxiosInstance.get(`/v1/shops/${shopId}/feedback`, {
      params,
    });
    return response.data.data;
  },

  // Get shop feedback statistics
  getShopFeedbackStats: async (shopId: string): Promise<FeedbackStats> => {
    const response = await authorizedAxiosInstance.get(`/v1/shops/${shopId}/feedback/stats`);
    return response.data.data;
  },

  // Reply to a review
  replyToReview: async (
    shopId: string,
    reviewId: string,
    reply: string
  ): Promise<{ review: Review }> => {
    const response = await authorizedAxiosInstance.post(
      `/v1/shops/${shopId}/feedback/${reviewId}/reply`,
      { reply }
    );
    return response.data.data;
  },
};

export default function FeedbackPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [filters, setFilters] = useState({
    rating: "all",
    hasReply: "all",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc"
  })
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [replyText, setReplyText] = useState("")
  const [replyLoading, setReplyLoading] = useState(false)
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const { toast } = useToast()
  const { shopId, loading: shopLoading } = useShop()

  useEffect(() => {
    // Only fetch data if we have a valid shop ID
    if (shopId && !shopLoading) {
      fetchFeedbackStats()
      fetchReviews()
    } else if (!shopLoading) {
      setLoading(false)
      setStatsLoading(false)
    }
  }, [shopId, shopLoading])

  useEffect(() => {
    if (shopId && !shopLoading) {
      fetchReviews()
    }
  }, [currentPage, filters, shopId, shopLoading])

  const fetchFeedbackStats = async () => {
    if (!shopId) return
    
    try {
      setStatsLoading(true)
      const data = await shopFeedbackAPI.getShopFeedbackStats(shopId)
      setStats(data)
    } catch (error) {
      console.error('Error fetching feedback stats:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải thống kê phản hồi"
      })
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchReviews = async () => {
    if (!shopId) return
    
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        ...filters,
        rating: filters.rating !== "all" ? parseInt(filters.rating) : undefined,
        hasReply: filters.hasReply === "true" ? true : filters.hasReply === "false" ? false : undefined
      }
      
      const data = await shopFeedbackAPI.getShopFeedback(shopId, params)
      setReviews(data.reviews)
      setTotalPages(data.metadata.totalPages)
      setTotalItems(data.metadata.totalItems)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách phản hồi"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async () => {
    if (!selectedReview || !replyText.trim() || !shopId) return

    try {
      setReplyLoading(true)
      await shopFeedbackAPI.replyToReview(shopId, selectedReview._id, replyText)
      
      toast({
        title: "Thành công",
        description: "Phản hồi đã được gửi"
      })
      
      setReplyText("")
      setReplyDialogOpen(false)
      setSelectedReview(null)
      
      // Refresh data
      fetchReviews()
      fetchFeedbackStats()
    } catch (error) {
      console.error('Error replying to review:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể gửi phản hồi"
      })
    } finally {
      setReplyLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ))
  }

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return "Xuất sắc"
    if (rating >= 4) return "Tốt"
    if (rating >= 3) return "Khá"
    if (rating >= 2) return "Trung bình"
    return "Kém"
  }

  const getStatusBadge = (review: Review) => {
    if (review.shop_reply && review.shop_reply.reply) {
      return <Badge variant="outline">Đã phản hồi</Badge>
    }
    return <Badge variant="destructive">Chưa phản hồi</Badge>
  }

  const getUserBadge = (user: Review['user_id']) => {
    if (user.vip_status) {
      return <Badge variant="outline" className="flex items-center gap-1">
        <Crown className="h-3 w-3" />
        VIP
      </Badge>
    }
    return <Badge variant="secondary">Thường</Badge>
  }

  const formatDistanceToNow = (date: string) => {
    const now = new Date()
    const reviewDate = new Date(date)
    const diffInMs = now.getTime() - reviewDate.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`
    } else {
      return reviewDate.toLocaleDateString('vi-VN')
    }
  }

  // Show loading if shop is still loading
  if (shopLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phản hồi khách hàng</h1>
          <p className="text-muted-foreground">
            Quản lý và phản hồi ý kiến từ khách hàng
          </p>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-gray-500 mt-4">Đang tải thông tin quán...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show placeholder if no shop ID
  if (!shopId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phản hồi khách hàng</h1>
          <p className="text-muted-foreground">
            Quản lý và phản hồi ý kiến từ khách hàng
          </p>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy thông tin quán</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phản hồi khách hàng</h1>
          <p className="text-muted-foreground">
            Quản lý và phản hồi ý kiến từ khách hàng
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng phản hồi</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats?.overview.totalReviews || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Tất cả đánh giá
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chưa phản hồi</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats?.overview.pendingReplies || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Cần xử lý ngay
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đánh giá trung bình</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : `${stats?.overview.avgRating || 0}/5`}
            </div>
            <p className="text-xs text-muted-foreground">
              {statsLoading ? "" : getRatingLabel(stats?.overview.avgRating || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hài lòng</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : `${stats?.overview.satisfactionRate || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Khách hàng hài lòng
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm nội dung..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Đánh giá</label>
              <Select value={filters.rating} onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả đánh giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả đánh giá</SelectItem>
                  <SelectItem value="5">5 sao</SelectItem>
                  <SelectItem value="4">4 sao</SelectItem>
                  <SelectItem value="3">3 sao</SelectItem>
                  <SelectItem value="2">2 sao</SelectItem>
                  <SelectItem value="1">1 sao</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select value={filters.hasReply} onValueChange={(value) => setFilters(prev => ({ ...prev, hasReply: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="false">Chưa phản hồi</SelectItem>
                  <SelectItem value="true">Đã phản hồi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sắp xếp</label>
              <Select 
                value={`${filters.sortBy}-${filters.sortOrder}`} 
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('-')
                  setFilters(prev => ({ ...prev, sortBy, sortOrder: sortOrder as "asc" | "desc" }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Mới nhất</SelectItem>
                  <SelectItem value="createdAt-asc">Cũ nhất</SelectItem>
                  <SelectItem value="rating-desc">Đánh giá cao nhất</SelectItem>
                  <SelectItem value="rating-asc">Đánh giá thấp nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Đang tải...</div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.user_id.avatar} />
                      <AvatarFallback>{review.user_id.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{review.user_id.full_name}</p>
                        {getUserBadge(review.user_id)}
                      </div>
                      <div className="flex items-center mt-1">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-sm text-gray-500">{review.rating}/5</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(review)}
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(review.createdAt)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{review.comment}</p>
                
                {review.shop_reply && review.shop_reply.reply && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Reply className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Phản hồi của quán:</span>
                    </div>
                    <p className="text-sm text-blue-800">{review.shop_reply.reply}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-blue-600">
                      <span>Bởi {review.shop_reply.replied_by?.full_name || 'Unknown'}</span>
                      <span>
                        {formatDistanceToNow(review.shop_reply.replied_at)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedReview(review)
                      setReplyDialogOpen(true)
                    }}
                    disabled={!!(review.shop_reply && review.shop_reply.reply)}
                  >
                    <Reply className="mr-1 h-3 w-3" />
                    {review.shop_reply && review.shop_reply.reply ? "Đã phản hồi" : "Phản hồi"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có phản hồi nào</p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Hiển thị {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalItems)} trong tổng số {totalItems} phản hồi
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phản hồi đánh giá</DialogTitle>
            <DialogDescription>
              Viết phản hồi cho đánh giá của khách hàng
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedReview.user_id.avatar} />
                    <AvatarFallback>{selectedReview.user_id.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{selectedReview.user_id.full_name}</span>
                  <div className="flex items-center">
                    {renderStars(selectedReview.rating)}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{selectedReview.comment}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phản hồi của bạn:</label>
                <Textarea
                  placeholder="Nhập phản hồi cho khách hàng..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[100px]"
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500">
                  {replyText.length}/1000 ký tự
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReplyDialogOpen(false)
                setSelectedReview(null)
                setReplyText("")
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleReply}
              disabled={!replyText.trim() || replyLoading}
            >
              {replyLoading ? "Đang gửi..." : "Gửi phản hồi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 