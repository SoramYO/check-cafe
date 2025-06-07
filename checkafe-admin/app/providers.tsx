"use client"

import { Provider } from "react-redux"
import { store } from "@/lib/store"
import { Toaster } from "sonner"
import { useEffect } from "react"
import { restoreAuth } from "@/lib/store/slices/authSlice"
import AnalyticsProvider from "@/components/providers/AnalyticsProvider"

function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Khôi phục auth từ localStorage khi app khởi động
    store.dispatch(restoreAuth())
  }, [])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AnalyticsProvider>
          {children}
          <Toaster position="top-right" />
        </AnalyticsProvider>
      </AuthProvider>
    </Provider>
  )
} 