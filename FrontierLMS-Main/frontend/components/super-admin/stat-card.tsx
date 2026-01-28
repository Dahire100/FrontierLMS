"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon | any
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  description?: string
  iconColor?: string
  iconBgColor?: string
  loading?: boolean
}

export function StatCard({ title, value, icon: IconOrElement, trend, description, iconColor = "text-blue-600", iconBgColor = "bg-blue-100", loading = false }: StatCardProps) {
  const Icon = IconOrElement;
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            {loading ? (
              <div className="space-y-2">
                <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold tracking-tight mb-2">{value}</p>
                {trend ? (
                  <div className="flex items-center gap-1">
                    <span className={cn(
                      "text-xs font-medium",
                      trend.isPositive ? "text-green-600" : "text-red-600"
                    )}>
                      {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                    </span>
                    <span className="text-xs text-muted-foreground">{trend.label || "vs last month"}</span>
                  </div>
                ) : description && (
                  <p className="text-xs text-muted-foreground">{description}</p>
                )}
              </>
            )}
          </div>
          <div className={cn("p-3 rounded-lg", iconBgColor, loading && "opacity-50")}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
