export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface Advertisement {
  _id: string;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  shop_id?: string;
  redirect_url?: string;
  start_date: string | null;
  end_date: string | null;
  type: string;
  status?: "Approved" | "Rejected" | "Pending";
  features?: FeatureItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AdvertisementResponse {
  message: string;
  status: number;
  data: {
    data: Advertisement[];
    metadata: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  }
}

export interface FilterParams {
  page: number;
  limit: number;
  search?: string;
  type?: string;
} 