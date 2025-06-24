export interface Notification {
  _id: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  category: "system" | "user" | "shop" | "booking" | "payment" | "verification"
  read: boolean
  priority: "low" | "medium" | "high" | "urgent"
  createdAt: string
  user_id?: {
    _id: string
    full_name: string
    email: string
    avatar?: string
  }
  shop_id?: {
    _id: string
    name: string
    address: string
  }
  related_id?: string
  related_type?: "booking" | "payment" | "verification" | "user" | "shop"
  action_url?: string
  action_text?: string
  expires_at?: string
  metadata?: Record<string, any>
}

export interface NotificationStats {
  summary: {
    total: number
    unread: number
    read: number
    today: number
    thisWeek: number
    thisMonth: number
  }
  breakdown: {
    byType: Record<string, number>
    byCategory: Record<string, number>
    byPriority: Record<string, number>
  }
}

export interface NotificationFilters {
  page?: number
  limit?: number
  type?: string
  category?: string
  read?: boolean
  priority?: string
  startDate?: string
  endDate?: string
}

export interface CreateNotificationData {
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  category: "system" | "user" | "shop" | "booking" | "payment" | "verification"
  priority: "low" | "medium" | "high" | "urgent"
  user_id?: string
  shop_id?: string
  related_id?: string
  related_type?: "booking" | "payment" | "verification" | "user" | "shop"
  action_url?: string
  action_text?: string
  expires_at?: string
  metadata?: Record<string, any>
}

export interface NotificationResponse {
  code: string
  message: string
  metadata: {
    notifications: Notification[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    summary: {
      total: number
      unread: number
      read: number
    }
  }
}

export interface NotificationStatsResponse {
  code: string
  message: string
  metadata: NotificationStats
} 