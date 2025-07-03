import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '@/lib/axios'

interface User {
  _id: string
  email: string
  role: 'ADMIN' | 'SHOP_OWNER'
  full_name: string
  avatar?: string
  // Thêm các trường khác nếu cần
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

// Helper function to safely access localStorage
const getStoredToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken')
  }
  return null
}

const getStoredUser = () => {
  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        return JSON.parse(storedUser)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        return null
      }
    }
  }
  return null
}

const initialState: AuthState = {
  user: getStoredUser(),
  token: getStoredToken(),
  loading: false,
  error: null,
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/v1/access/sign-in', credentials)
      const { user, tokens } = response.data.data
      
      // Lưu token vào localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', tokens.accessToken)
        localStorage.setItem('refreshToken', tokens.refreshToken)
        localStorage.setItem('user', JSON.stringify(user))
      }
      
      return { user, tokens }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Đăng nhập thất bại')
    }
  }
)

export const register = createAsyncThunk(
  'owners/register',
  async (registerData: {
    name: string;
    description: string;
    address: string;
    phone: string;
    website: string;
    latitude: number;
    longitude: number;
    owner_name: string;
    email: string;
    password: string;
    city: string;
    city_code: string;
    district?: string;
    district_code?: string;
    ward?: string;
    category: string;
    amenities: string[];
    theme_ids: string[];
    opening_hours: {
      day: number;
      is_closed: boolean;
      hours?: { open: string; close: string }[];
    }[];
  }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/v1/owners/register', registerData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Đăng ký thất bại')
    }
  }
)

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post('/v1/access/sign-out')
      
      // Xóa token khỏi localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
      
      return true
    } catch (error: any) {
      // Vẫn xóa token local ngay cả khi API thất bại
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
      return rejectWithValue(error.response?.data?.message || 'Đăng xuất thất bại')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.error = null
      // Xóa token khỏi localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
    },
    clearError: (state) => {
      state.error = null
    },
    restoreAuth: (state) => {
      // Khôi phục auth từ localStorage
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('accessToken')
        const storedUser = localStorage.getItem('user')
        
        if (storedToken && storedUser) {
          try {
            state.token = storedToken
            state.user = JSON.parse(storedUser)
          } catch (error) {
            console.error('Error restoring auth:', error)
            state.user = null
            state.token = null
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.tokens.accessToken
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(logoutAsync.pending, (state) => {
        state.loading = true
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.loading = false
        state.user = null
        state.token = null
        state.error = null
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.loading = false
        // Vẫn clear user data ngay cả khi logout API thất bại
        state.user = null
        state.token = null
        state.error = action.payload as string
      })
  },
})

export const { logout, clearError, restoreAuth } = authSlice.actions
export default authSlice.reducer 