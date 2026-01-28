"use client"

import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  variant?: "default" | "success" | "warning" | "danger" | "info"
  className?: string
}

const variantStyles = {
  default: "bg-gray-100 text-gray-800 border-gray-200",
  success: "bg-green-100 text-green-800 border-green-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  danger: "bg-red-100 text-red-800 border-red-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
}

const statusVariantMap: Record<string, keyof typeof variantStyles> = {
  active: "success",
  inactive: "default",
  pending: "warning",
  paid: "success",
  overdue: "danger",
  open: "info",
  "in progress": "warning",
  resolved: "success",
  closed: "default",
  high: "danger",
  medium: "warning",
  low: "info",
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase()
  const badgeVariant = variant || statusVariantMap[normalizedStatus] || "default"
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      variantStyles[badgeVariant],
      className
    )}>
      {status}
    </span>
  )
}
