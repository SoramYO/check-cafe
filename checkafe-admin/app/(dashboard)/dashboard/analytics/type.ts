export interface AnalyticsOverview {
  overview: {
    totalReservations: number;
    totalCustomers: number;
    totalRevenue: number;
    avgRating: number;
    totalReviews: number;
  };
  changes: {
    reservations: {
      current: number;
      previous: number;
      change: number;
      trend: 'up' | 'down';
    };
    customers: {
      current: number;
      previous: number;
      change: number;
      trend: 'up' | 'down';
    };
    revenue: {
      current: number;
      previous: number;
      change: number;
      trend: 'up' | 'down';
    };
  };
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

export interface RevenueAnalytics {
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    count: number;
  }>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    count: number;
  }>;
  revenueByPackage: Array<{
    _id: string;
    revenue: number;
    count: number;
  }>;
  summary: {
    totalRevenue: number;
    totalTransactions: number;
    avgTransactionValue: number;
  };
  period: {
    months: number;
    startDate: string;
    endDate: string;
  };
}

export interface CustomerAnalytics {
  summary: {
    totalCustomers: number;
    totalReservations: number;
    totalPeople: number;
    avgReservationsPerCustomer: string;
  };
  segments: {
    new: number;
    returning: number;
    loyal: number;
    vip: number;
  };
  monthlyCustomers: Array<{
    month: string;
    customerCount: number;
  }>;
  topCustomers: Array<{
    user: {
      _id: string;
      full_name: string;
      email: string;
      avatar: string;
      vip_status: boolean;
    };
    reservationCount: number;
    totalPeople: number;
    firstVisit: string;
    lastVisit: string;
  }>;
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

export interface ReservationAnalytics {
  summary: {
    totalReservations: number;
    confirmedReservations: number;
    completedReservations: number;
    cancelledReservations: number;
  };
  byStatus: Array<{
    _id: string;
    count: number;
  }>;
  byType: Array<{
    _id: string;
    count: number;
  }>;
  byDayOfWeek: Array<{
    day: number;
    dayName: string;
    count: number;
  }>;
  byHour: Array<{
    _id: number;
    count: number;
  }>;
  monthly: Array<{
    month: string;
    count: number;
  }>;
  popularSeats: Array<{
    seatName: string;
    count: number;
  }>;
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

export interface PopularItemsAnalytics {
  summary: {
    totalItems: number;
    availableItems: number;
    avgRating: number;
    totalReviews: number;
  };
  popularItemsByRating: Array<{
    item: {
      _id: string;
      name: string;
      description: string;
      price: number;
      category: {
        _id: string;
        name: string;
      };
      images: Array<{
        url: string;
        publicId: string;
      }>;
    };
    rating: number;
    reviewCount: number;
  }>;
  itemsByCategory: Array<{
    categoryName: string;
    count: number;
    avgPrice: number;
  }>;
  priceStats: {
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    totalItems: number;
  } | null;
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

export interface TimeBasedAnalytics {
  hourly: Array<{
    hour: string;
    label: string;
    count: number;
  }>;
  daily: Array<{
    day: number;
    dayName: string;
    count: number;
  }>;
  monthly: Array<{
    month: string;
    count: number;
  }>;
  dailyTrend: Array<{
    date: string;
    count: number;
  }>;
  advanceBooking: {
    avgAdvanceDays: number;
    minAdvanceDays: number;
    maxAdvanceDays: number;
  } | null;
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
} 