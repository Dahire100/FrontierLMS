"use client"

import { useMemo } from "react"

interface MiniChartProps {
  data: number[]
  color?: string
  height?: number
  width?: number
}

export function MiniChart({ data, color = "#3b82f6", height = 40, width = 100 }: MiniChartProps) {
  const points = useMemo(() => {
    if (data.length === 0) return ""
    
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    
    return data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * width
        const y = height - ((value - min) / range) * height
        return `${x},${y}`
      })
      .join(" ")
  }, [data, height, width])

  if (data.length === 0) return null

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
