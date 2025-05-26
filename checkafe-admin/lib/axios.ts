import axios from 'axios'
import { toast } from 'sonner'

let axiosReduxStore: any

export const injectStore = (mainStore: any) => {
  axiosReduxStore = mainStore
}

// Khởi tạo đối tượng axios
let authorizedAxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

// Thời gian chờ tối đa mỗi request
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 5

// Interceptor Request
authorizedAxiosInstance.interceptors.request.use(
  (config) => {
    // Kỹ thuật chăn click spam

    // Thêm access token vào header nếu có
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor Response
let refreshTokenPromise: any = null
authorizedAxiosInstance.interceptors.response.use(
  (response) => {
    // Kỹ thuật chăn click spam

    // Lưu tokens nếu có trong response
    if (response.data?.data?.tokens) {
      const { accessToken, refreshToken } = response.data.data.tokens
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
    }

    // Lưu user nếu có trong response
    if (response.data?.data?.user) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user))
    }

    return response
  },
  (error) => {
    // Kỹ thuật chăn click spam

    // Trường hợp 1: Nếu nhận mã 401 thì đăng xuất luôn
    if (error?.response?.status === 401) {
      // Xóa tokens và user khỏi localStorage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }

    // Trường hợp 2: Nếu nhận mã 410 thì refresh token
    const originalRequest = error?.config
    if (error?.response?.status === 410 && !originalRequest._retry) {
      originalRequest._retry = true
     
      toast.error('Token hết hạn, vui lòng đăng nhập lại')

      return refreshTokenPromise.then((accessToken: any) => {
        // Gọi lại request cũ
        return authorizedAxiosInstance(originalRequest)
      })
    }

    let errorMessage = error?.message
    if (error?.response?.data?.message) {
      errorMessage = error?.response?.data?.message
    }
    
    // Ngoại trừ mã lỗi 410 - GONE, thì tất cả các mã lỗi khác đều hiển thị thông báo
    if (error?.response?.status !== 410) {
      toast.error(errorMessage)
    }
    
    return Promise.reject(error)
  }
)

export default authorizedAxiosInstance 