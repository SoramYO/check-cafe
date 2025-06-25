
export interface Review {
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
    replied_by: {
      _id: string;
      full_name: string;
    };
    replied_at: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackStats {
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

export interface FeedbackResponse {
  reviews: Review[];
  metadata: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
} 