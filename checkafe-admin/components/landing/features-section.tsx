"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Calendar, Coffee, Map, Star, Clock } from "lucide-react"

const features = [
  {
    icon: <Search className="h-10 w-10 text-primary" />,
    title: "Tìm kiếm dễ dàng",
    description: "Tìm kiếm quán cà phê gần bạn với bộ lọc thông minh theo vị trí, đánh giá và tiện ích.",
  },
  {
    icon: <Calendar className="h-10 w-10 text-primary" />,
    title: "Đặt chỗ nhanh chóng",
    description: "Đặt bàn trước chỉ với vài thao tác, không cần gọi điện hay chờ đợi.",
  },
  {
    icon: <Coffee className="h-10 w-10 text-primary" />,
    title: "Xem menu trước",
    description: "Xem trước menu của quán để chuẩn bị đặt món ngay khi đến.",
  },
  {
    icon: <Map className="h-10 w-10 text-primary" />,
    title: "Bản đồ chỉ đường",
    description: "Tích hợp bản đồ chỉ đường giúp bạn dễ dàng tìm đến quán cà phê.",
  },
  {
    icon: <Star className="h-10 w-10 text-primary" />,
    title: "Đánh giá và nhận xét",
    description: "Chia sẻ trải nghiệm của bạn và tham khảo đánh giá từ người dùng khác.",
  },
  {
    icon: <Clock className="h-10 w-10 text-primary" />,
    title: "Ưu đãi giờ vàng",
    description: "Nhận thông báo về các ưu đãi đặc biệt và giờ vàng tại các quán cà phê.",
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="container mx-auto py-20">
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold mb-4"
        >
          Tính năng nổi bật
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg text-gray-600 max-w-2xl mx-auto"
        >
          ChecKafe mang đến trải nghiệm đặt chỗ tại quán cà phê hoàn toàn mới
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="h-full border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
