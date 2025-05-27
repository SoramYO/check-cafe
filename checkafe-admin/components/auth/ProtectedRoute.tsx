"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/lib/store'
import { logout } from '@/lib/store/slices/authSlice'
import { toast } from 'sonner'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('ADMIN' | 'SHOP_OWNER')[]
  requireAuth?: boolean
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  requireAuth = true 
}: ProtectedRouteProps) {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user, token } = useSelector((state: RootState) => state.auth)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      // Kiểm tra token trong localStorage nếu Redux store chưa có
      const storedToken = localStorage.getItem('accessToken')
      const storedUser = localStorage.getItem('user')
      
      if (!requireAuth) {
        setIsAuthorized(true)
        setIsLoading(false)
        return
      }

      // Nếu không có token, redirect về login
      if (!token && !storedToken) {
        toast.error('Vui lòng đăng nhập để tiếp tục')
        router.push('/login')
        setIsLoading(false)
        return
      }

      // Lấy thông tin user từ localStorage nếu Redux store chưa có
      let currentUser = user
      if (!currentUser && storedUser) {
        try {
          currentUser = JSON.parse(storedUser)
        } catch (error) {
          console.error('Error parsing stored user:', error)
          dispatch(logout())
          router.push('/login')
          setIsLoading(false)
          return
        }
      }

      // Kiểm tra role nếu có yêu cầu
      if (allowedRoles.length > 0 && currentUser) {
        if (!allowedRoles.includes(currentUser.role as 'ADMIN' | 'SHOP_OWNER')) {
          toast.error('Bạn không có quyền truy cập trang này')
          // Redirect về trang 404 hoặc trang phù hợp với role
          router.push('/404')
          setIsLoading(false)
          return
        }
      }

      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [user, token, allowedRoles, requireAuth, router, dispatch])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
          <p className="text-amber-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
} 