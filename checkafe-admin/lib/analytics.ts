import authorizedAxiosInstance from './axios'

export interface SessionData {
  sessionId?: string
  analyticsId?: string
}

export interface DeviceInfo {
  platform: string
  browser: string
  device_type: string
  os: string
  screen_resolution: string
  user_agent: string
}

export interface LocationInfo {
  ip_address?: string
  country?: string
  city?: string
  region?: string
  continent?: string
  latitude?: number
  longitude?: number
  isp?: string
  timezone?: string
}

export interface ReferrerInfo {
  source: string
  medium: string
  campaign?: string
  referrer_url?: string
}

export interface ActivityData {
  action_type: 'page_view' | 'click' | 'search' | 'filter' | 'booking' | 'review' | 'favorite' | 'logout'
  page_url?: string
  element_clicked?: string
  search_query?: string
  booking_id?: string
  shop_id?: string
  metadata?: Record<string, any>
}

class AnalyticsTracker {
  private sessionData: SessionData = {}
  private isInitialized = false
  private isInitializing = false

  // Kiểm tra xem user có đăng nhập không và không phải admin
  private isUserAuthenticated(): boolean {
    try {
      // Check if there's a valid auth token in localStorage
      const token = localStorage.getItem('access_token')
      const user = localStorage.getItem('user')
      
      // Cần cả token và user data
      if (!token || !user || token === 'null' || user === 'null') {
        console.log('Authentication check failed: missing token or user data')
        return false
      }
      
      // Parse user to check if it's valid JSON
      try {
        const userData = JSON.parse(user)
        if (!userData || !userData.id) {
          console.log('Authentication check failed: invalid user data')
          return false
        }
        
        // Skip analytics tracking for admin users
        if (userData.role === 'ADMIN') {
          console.log('Authentication check: admin user detected, skipping analytics')
          return false
        }
      } catch (parseError) {
        console.log('Authentication check failed: invalid user JSON')
        return false
      }
      
      console.log('Authentication check passed')
      return true
    } catch (error) {
      console.log('Authentication check failed with error:', error)
      return false
    }
  }

  // Khởi tạo session tracking (chỉ khi user đã đăng nhập)
  async initializeSession(forceInit: boolean = false): Promise<void> {
    console.log('🔍 initializeSession called with forceInit:', forceInit)
    
    if (this.isInitialized) {
      console.log('Analytics session already initialized')
      return
    }

    if (this.isInitializing) {
      console.log('Session initialization already in progress, skipping...')
      return
    }

    // Chỉ init khi user đã đăng nhập hoặc force init
    const isAuth = this.isUserAuthenticated()
    console.log('🔍 Authentication status:', isAuth)
    
    if (!forceInit && !isAuth) {
      console.log('User not authenticated, skipping analytics session initialization')
      return
    }

    this.isInitializing = true
    
    try {
      console.log('Initializing analytics session...')
      const deviceInfo = this.getDeviceInfo()
      const locationInfo = await this.getLocationInfo()
      const referrerInfo = this.getReferrerInfo()

      const response = await authorizedAxiosInstance.post('/v1/analytics/session/create', {
        deviceInfo,
        locationInfo,
        referrerInfo
      })

      console.log('Session create response:', response.data)

      if (response.data.status === 201 && response.data.data) {
        // Backend returns { sessionId, analyticsId } in data
        const { sessionId, analyticsId } = response.data.data
        
        if (sessionId) {
          this.sessionData = { sessionId, analyticsId }
          this.isInitialized = true
          
          console.log('Session initialized with data:', this.sessionData)
          
          // Lưu session vào localStorage để persistent
          localStorage.setItem('analytics_session', JSON.stringify(this.sessionData))
          
          // Lắng nghe sự kiện beforeunload để kết thúc session
          window.addEventListener('beforeunload', () => this.endSession())
          
          // Track page view đầu tiên sau khi session đã được thiết lập hoàn toàn
          setTimeout(() => {
            this.trackPageView(window.location.pathname)
          }, 100)
        } else {
          console.error('No sessionId in response data:', response.data.data)
        }
      } else {
        console.error('Session create failed with status:', response.data.status)
      }
    } catch (error) {
      console.error('Failed to initialize analytics session:', error)
      // Không throw error để không break app
    } finally {
      this.isInitializing = false
    }
  }

  // Lấy thông tin thiết bị
  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent
    
    // Detect platform
    let platform = 'web'
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      platform = 'mobile'
    } else if (/Electron/.test(userAgent)) {
      platform = 'desktop'
    }

    // Detect browser
    let browser = 'unknown'
    if (userAgent.includes('Chrome')) {
      browser = 'Chrome'
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox'
    } else if (userAgent.includes('Safari')) {
      browser = 'Safari'
    } else if (userAgent.includes('Edge')) {
      browser = 'Edge'
    }

    // Detect device type
    let deviceType = 'desktop'
    if (/Mobile|Android|iPhone/.test(userAgent)) {
      deviceType = 'mobile'
    } else if (/iPad|Tablet/.test(userAgent)) {
      deviceType = 'tablet'
    }

    // Detect OS
    let os = 'unknown'
    if (userAgent.includes('Windows')) {
      os = 'Windows'
    } else if (userAgent.includes('Mac')) {
      os = 'macOS'
    } else if (userAgent.includes('Linux')) {
      os = 'Linux'
    } else if (userAgent.includes('Android')) {
      os = 'Android'
    } else if (userAgent.includes('iOS')) {
      os = 'iOS'
    }

    return {
      platform,
      browser,
      device_type: deviceType,
      os,
      screen_resolution: `${screen.width}x${screen.height}`,
      user_agent: userAgent
    }
  }

  // Lấy thông tin vị trí (có thể dùng IP geolocation service)
  private async getLocationInfo(): Promise<LocationInfo> {
    try {
      // Sử dụng ipleak.net để lấy thông tin IP và location
      const response = await fetch('https://ipleak.net/json/')
      const data = await response.json()
      
      return {
        ip_address: data.ip,
        country: data.country_name,
        city: data.city_name,
        region: data.region_name,
        continent: data.continent_name,
        latitude: data.latitude,
        longitude: data.longitude,
        isp: data.isp_name,
        timezone: data.time_zone
      }
    } catch (error) {
      console.error('Failed to get location info:', error)
      return {}
    }
  }

  // Lấy thông tin referrer
  private getReferrerInfo(): ReferrerInfo {
    const referrer = document.referrer
    const urlParams = new URLSearchParams(window.location.search)
    
    let source = 'direct'
    let medium = 'none'
    
    if (referrer) {
      const referrerUrl = new URL(referrer)
      const hostname = referrerUrl.hostname
      
      if (hostname.includes('google')) {
        source = 'google'
        medium = 'organic'
      } else if (hostname.includes('facebook')) {
        source = 'facebook'
        medium = 'social'
      } else if (hostname.includes('twitter')) {
        source = 'twitter'
        medium = 'social'
      } else {
        source = hostname
        medium = 'referral'
      }
    }
    
    // Check UTM parameters
    const utmSource = urlParams.get('utm_source')
    const utmMedium = urlParams.get('utm_medium')
    const utmCampaign = urlParams.get('utm_campaign')
    
    if (utmSource) source = utmSource
    if (utmMedium) medium = utmMedium

    return {
      source,
      medium,
      campaign: utmCampaign || undefined,
      referrer_url: referrer || undefined
    }
  }

  // Track hoạt động  
  async trackActivity(activityData: ActivityData): Promise<void> {
    // Analytics bị disable cho admin dashboard - return early
    if (!this.isUserAuthenticated()) {
      // console.log('Analytics disabled or user not authenticated for tracking')
      return
    }

    if (!this.isInitialized || !this.sessionData.sessionId) {
      // Thử khôi phục session từ localStorage
      const savedSession = localStorage.getItem('analytics_session')
      if (savedSession && savedSession !== 'undefined') {
        try {
          this.sessionData = JSON.parse(savedSession)
          // Validate session data
          if (this.sessionData.sessionId) {
            this.isInitialized = true
          } else {
            console.warn('Invalid session data in localStorage, initializing new session')
            await this.initializeSession()
          }
        } catch (parseError) {
          console.error('Failed to parse saved session:', parseError)
          await this.initializeSession()
        }
      } else {
        await this.initializeSession()
      }
    }

    // Kiểm tra lại sessionId sau khi khôi phục hoặc khởi tạo
    if (!this.sessionData.sessionId) {
      console.warn('Session ID is still undefined after initialization, cannot track activity')
      return
    }

    try {
      await authorizedAxiosInstance.post('/v1/analytics/activity/record', {
        sessionId: this.sessionData.sessionId,
        activityData
      })
    } catch (error: any) {
      console.error('Failed to track activity:', error)
      // Nếu session expired hoặc invalid, clear và thử tạo lại
      if (error.response?.status === 401 || error.response?.status === 404) {
        console.log('Session expired, clearing and reinitializing...')
        this.clearSession()
        // Không thử lại ngay để tránh infinite loop
      }
    }
  }

  // Track page view
  async trackPageView(pagePath: string): Promise<void> {
    await this.trackActivity({
      action_type: 'page_view',
      page_url: pagePath,
      metadata: {
        timestamp: new Date().toISOString(),
        title: document.title
      }
    })
  }

  // Track click
  async trackClick(element: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackActivity({
      action_type: 'click',
      element_clicked: element,
      page_url: window.location.pathname,
      metadata
    })
  }

  // Track search
  async trackSearch(query: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackActivity({
      action_type: 'search',
      search_query: query,
      page_url: window.location.pathname,
      metadata
    })
  }

  // Track filter
  async trackFilter(metadata?: Record<string, any>): Promise<void> {
    await this.trackActivity({
      action_type: 'filter',
      page_url: window.location.pathname,
      metadata
    })
  }

  // Track booking
  async trackBooking(bookingId: string, shopId?: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackActivity({
      action_type: 'booking',
      booking_id: bookingId,
      shop_id: shopId,
      page_url: window.location.pathname,
      metadata
    })
  }

  // Track review
  async trackReview(shopId?: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackActivity({
      action_type: 'review',
      shop_id: shopId,
      page_url: window.location.pathname,
      metadata
    })
  }

  // Track favorite
  async trackFavorite(shopId?: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackActivity({
      action_type: 'favorite',
      shop_id: shopId,
      page_url: window.location.pathname,
      metadata
    })
  }

  // Kết thúc session
  async endSession(): Promise<void> {
    if (!this.sessionData || !this.sessionData.sessionId) {
      // Cleanup anyway
      localStorage.removeItem('analytics_session')
      this.sessionData = {}
      this.isInitialized = false
      this.isInitializing = false
      return
    }

    try {
      await authorizedAxiosInstance.post('/v1/analytics/session/end', {
        sessionId: this.sessionData.sessionId
      })
      
      // Cleanup
      localStorage.removeItem('analytics_session')
      this.sessionData = {}
      this.isInitialized = false
      this.isInitializing = false
    } catch (error) {
      console.error('Failed to end session:', error)
      // Cleanup anyway even if API call fails
      localStorage.removeItem('analytics_session')
      this.sessionData = {}
      this.isInitialized = false
      this.isInitializing = false
    }
  }

  // Get current session data
  getSessionData(): SessionData {
    return this.sessionData
  }

  // Check if tracking is initialized
  isTrackingInitialized(): boolean {
    return this.isInitialized
  }

  // Method để manually init session sau khi user login
  async initializeAfterLogin(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeSession(true) // Force init
    }
  }

  // Method để clear session khi user logout
  clearSession(): void {
    this.sessionData = {}
    this.isInitialized = false
    this.isInitializing = false
    localStorage.removeItem('analytics_session')
    console.log('Analytics session cleared')
  }

  // Method để force clear tất cả analytics data (kể cả khi có stale token)
  forceClearAll(): void {
    this.sessionData = {}
    this.isInitialized = false
    this.isInitializing = false
    localStorage.removeItem('analytics_session')
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    console.log('All analytics and auth data cleared')
  }
}

// Export singleton instance
export const analyticsTracker = new AnalyticsTracker()

// Hook cho React components
export function useAnalytics() {
  return {
    trackPageView: (path: string) => analyticsTracker.trackPageView(path),
    trackClick: (element: string, metadata?: Record<string, any>) => 
      analyticsTracker.trackClick(element, metadata),
    trackSearch: (query: string, metadata?: Record<string, any>) => 
      analyticsTracker.trackSearch(query, metadata),
    trackFilter: (metadata?: Record<string, any>) => 
      analyticsTracker.trackFilter(metadata),
    trackBooking: (bookingId: string, shopId?: string, metadata?: Record<string, any>) => 
      analyticsTracker.trackBooking(bookingId, shopId, metadata),
    trackReview: (shopId?: string, metadata?: Record<string, any>) => 
      analyticsTracker.trackReview(shopId, metadata),
    trackFavorite: (shopId?: string, metadata?: Record<string, any>) => 
      analyticsTracker.trackFavorite(shopId, metadata),
    initializeSession: () => analyticsTracker.initializeSession(),
    initializeAfterLogin: () => analyticsTracker.initializeAfterLogin(),
    clearSession: () => analyticsTracker.clearSession(),
    forceClearAll: () => analyticsTracker.forceClearAll(),
    endSession: () => analyticsTracker.endSession(),
    getSessionData: () => analyticsTracker.getSessionData(),
    isInitialized: () => analyticsTracker.isTrackingInitialized()
  }
} 