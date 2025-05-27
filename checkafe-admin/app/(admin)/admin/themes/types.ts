export interface Theme {
  _id: string;
  name: string;
  description: string;
  theme_image: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeResponse {
  message: string;
  status: number;
  data: {
    themes: Theme[];
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
} 