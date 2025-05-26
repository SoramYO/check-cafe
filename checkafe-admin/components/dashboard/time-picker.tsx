"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Input } from "@/components/ui/input"

interface TimePickerDemoProps {
  defaultValue?: string
}

export function TimePickerDemo({ defaultValue = "12:00" }: TimePickerDemoProps) {
  const [time, setTime] = React.useState(defaultValue)

  return (
    <div className="flex items-center space-x-2">
      <div className="grid gap-1.5 grow">
        <div className="relative">
          <Input type="time" value={time} className="pl-8" onChange={(e) => setTime(e.target.value)} />
          <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        </div>
      </div>
    </div>
  )
}
