import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Các route public không cần authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/404', '/not-found', '/privacy', '/terms']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // Các route cần authentication
  const protectedRoutes = ['/admin', '/dashboard']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Nếu là route protected, để ProtectedRoute component xử lý
  // Middleware chỉ xử lý redirect từ trang chủ
  if (pathname === '/') {
    // Redirect về login nếu truy cập trang chủ
    // Logic kiểm tra token sẽ được xử lý trong component HomePage
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 