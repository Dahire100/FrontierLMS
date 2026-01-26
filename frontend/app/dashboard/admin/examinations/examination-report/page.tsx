"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { FileBarChart2, FileSpreadsheet, UsersRound, ArrowRight, BarChart3, PieChart, TrendingUp } from "lucide-react"

const reports = [
  {
    title: "Term Wise Report",
    description: "Comprehensive performance analysis per term",
    href: "/dashboard/admin/examinations/examination-report?type=term-wise",
    icon: FileBarChart2,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100"
  },
  {
    title: "Subject Wise Report",
    description: "Detailed breakdown of subject performance",
    href: "/dashboard/admin/examinations/examination-report?type=subject-wise",
    icon: FileSpreadsheet,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100"
  },
  {
    title: "Fail Students Report",
    description: "List of students requiring attention",
    href: "/dashboard/admin/examinations/examination-report?type=fail-students",
    icon: UsersRound,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100"
  },
  {
    title: "Class Average",
    description: "Overall class performance metrics",
    href: "/dashboard/admin/examinations/examination-report?type=class-average",
    icon: BarChart3,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100"
  },
  {
    title: "Grade Distribution",
    description: "Visual analysis of grade spread",
    href: "/dashboard/admin/examinations/examination-report?type=grade-dist",
    icon: PieChart,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100"
  },
  {
    title: "Trend Analysis",
    description: "Year-over-year performance growth",
    href: "/dashboard/admin/examinations/examination-report?type=trend",
    icon: TrendingUp,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100"
  },
]

export default function ExaminationReport() {
  return (
    <DashboardLayout title="Examination Reports">
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Examination Reports</h2>
          <p className="text-muted-foreground mt-1">Access detailed analytics and performance reports.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((item) => (
            <Link key={item.title} href={item.href} className="group block h-full">
              <Card className={`h-full border ${item.border} shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="w-8 h-8" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-900 transition-colors mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {item.description}
                    </p>
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
