import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ChecKafe - Hệ thống quản lý đặt chỗ quán cà phê",
  description: "Quản lý quán cà phê, đặt chỗ, nhân viên, ưu đãi, menu và khu vực",
  generator: 'v0.dev',
  applicationName: 'ChecKafe Admin',
  authors: [{ name: 'ChecKafe Team' }],
  keywords: ['quán cà phê', 'đặt chỗ', 'quản lý', 'admin', 'checkafe'],
  creator: 'ChecKafe Team',
  publisher: 'ChecKafe',
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  metadataBase: new URL('https://checkafe.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://checkafe.com',
    title: 'ChecKafe - Hệ thống quản lý đặt chỗ quán cà phê',
    description: 'Quản lý quán cà phê, đặt chỗ, nhân viên, ưu đãi, menu và khu vực',
    siteName: 'ChecKafe',
    images: [{
      url: '/logo.png',
      width: 180,
      height: 180,
      alt: 'ChecKafe Admin Dashboard'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChecKafe - Quản lý cà phê',
    description: 'Hệ thống quản lý đặt chỗ quán cà phê',
    images: ['/logo.png'],
  },
  appleWebApp: {
    title: 'ChecKafe Admin',
    statusBarStyle: 'black-translucent',
    capable: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1e293b' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
