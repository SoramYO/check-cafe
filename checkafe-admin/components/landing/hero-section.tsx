"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

export default function HeroSection() {
  return (
    <section className="container mx-auto py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Đặt chỗ <span className="text-primary">quán cà phê</span> chưa bao giờ dễ dàng hơn
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            ChecKafe giúp bạn đặt chỗ trước tại các quán cà phê yêu thích chỉ với vài thao tác đơn giản trên điện thoại.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary-dark">
              <Link href="#download">Tải ứng dụng</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#features">Tìm hiểu thêm</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          <div className="relative h-[500px] w-full">
            <Image
              src="/placeholder.svg?height=500&width=300"
              alt="ChecKafe App"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-secondary rounded-full blur-3xl opacity-50" />
        </motion.div>
      </div>
    </section>
  )
}
