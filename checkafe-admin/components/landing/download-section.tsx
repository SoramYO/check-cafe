"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function DownloadSection() {
  return (
    <section id="download" className="container mx-auto py-20">
      <div className="bg-primary rounded-3xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="p-8 md:p-12 lg:p-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-6 text-white"
            >
              Tải ứng dụng ChecKafe ngay hôm nay
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-white/90 mb-8"
            >
              Trải nghiệm đặt chỗ tại quán cà phê một cách thuận tiện và nhanh chóng. Tải xuống ứng dụng ChecKafe ngay
              bây giờ!
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" variant="secondary" className="bg-white hover:bg-gray-100 text-primary">
                <Image
                  src="/placeholder.svg?height=24&width=24"
                  alt="Google Play"
                  width={24}
                  height={24}
                  className="mr-2"
                />
                Google Play
              </Button>
              <Button size="lg" variant="secondary" className="bg-white hover:bg-gray-100 text-primary">
                <Image
                  src="/placeholder.svg?height=24&width=24"
                  alt="App Store"
                  width={24}
                  height={24}
                  className="mr-2"
                />
                App Store
              </Button>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative h-[400px] md:h-[500px]"
          >
            <Image
              src="/placeholder.svg?height=500&width=300"
              alt="ChecKafe App Screenshot"
              fill
              className="object-contain"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
