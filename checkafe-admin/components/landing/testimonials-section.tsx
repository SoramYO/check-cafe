"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Nguyễn Văn A",
    role: "Khách hàng thường xuyên",
    content:
      "ChecKafe giúp tôi tiết kiệm thời gian chờ đợi. Giờ đây tôi có thể đặt chỗ trước và đến đúng giờ mà không phải xếp hàng.",
    avatar: "NVA",
    rating: 5,
  },
  {
    name: "Trần Thị B",
    role: "Chủ quán cà phê",
    content:
      "Kể từ khi sử dụng ChecKafe, quán của tôi đã tăng lượng khách đáng kể. Hệ thống quản lý đơn đặt chỗ rất dễ sử dụng.",
    avatar: "TTB",
    rating: 5,
  },
  {
    name: "Lê Văn C",
    role: "Người yêu cà phê",
    content:
      "Tôi thích cách ứng dụng cho phép xem trước menu và không gian quán. Điều này giúp tôi chọn được quán phù hợp với sở thích.",
    avatar: "LVC",
    rating: 4,
  },
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="container mx-auto py-20 bg-secondary/30 rounded-3xl">
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold mb-4"
        >
          Khách hàng nói gì về chúng tôi
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg text-gray-600 max-w-2xl mx-auto"
        >
          Trải nghiệm thực tế từ người dùng ChecKafe
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < testimonial.rating ? "text-primary fill-primary" : "text-gray-300"}`}
                      />
                    ))}
                </div>
                <p className="text-gray-700">{testimonial.content}</p>
              </CardContent>
              <CardFooter>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary/20 text-primary">{testimonial.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
