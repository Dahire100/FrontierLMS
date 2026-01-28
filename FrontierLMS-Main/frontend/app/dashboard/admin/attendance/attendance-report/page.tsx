"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import {
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  Grid,
  UserX,
} from "lucide-react"

const items = [
  {
    title: "ATTENDANCE REPORT",
    subtitle: "Attendance Report",
    href: "/dashboard/admin/attendance/consolidated-report",
    icon: <CalendarCheck className="h-7 w-7 text-orange-600" />,
    bg: "bg-orange-100",
  },
  {
    title: "CLASS WISE REPORT",
    subtitle: "Class Wise Report",
    href: "/dashboard/admin/attendance/monthly-attendance",
    icon: <Grid className="h-7 w-7 text-indigo-600" />,
    bg: "bg-indigo-100",
  },
  {
    title: "ATTENDANCE BY DATE",
    subtitle: "Attendance By Date",
    href: "/dashboard/admin/attendance/daily-attendance",
    icon: <CalendarDays className="h-7 w-7 text-cyan-600" />,
    bg: "bg-cyan-100",
  },
  {
    title: "ABSENT STUDENT REPORT",
    subtitle: "Absent Student Report",
    href: "/dashboard/admin/attendance/monthly-attendance",
    icon: <UserX className="h-7 w-7 text-red-600" />,
    bg: "bg-red-100",
  },
  {
    title: "UNMARKED ATTENDANCE",
    subtitle: "Unmarked Attendance",
    href: "/dashboard/admin/attendance/attendance-register",
    icon: <ClipboardList className="h-7 w-7 text-emerald-600" />,
    bg: "bg-emerald-100",
  },
  {
    title: "CUSTOM ATTENDANCE REPORT",
    subtitle: "Custom Attendance Report",
    href: "/dashboard/admin/attendance/export",
    icon: <CalendarRange className="h-7 w-7 text-blue-600" />,
    bg: "bg-blue-100",
  },
]

export default function AttendanceReport() {
  return (
    <DashboardLayout title="Attendance Report">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-end text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="text-blue-900">Attendance</span>
            <span>/</span>
            <span>Attendance Report</span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <Link key={item.title} href={item.href} className="block focus-visible:outline-none">
              <Card className="group transition-all hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-slate-400">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-full ${item.bg} flex items-center justify-center`}>
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-blue-900 underline truncate group-hover:no-underline">
                      {item.title}
                    </div>
                    <div className="text-sm text-gray-500 truncate">{item.subtitle}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
