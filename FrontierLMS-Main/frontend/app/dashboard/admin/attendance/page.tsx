"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    CalendarCheck,
    CalendarRange,
    Grid,
    Users2,
    PlaneTakeoff,
    PlaneLanding,
    ClipboardList,
    BookOpenCheck,
    Download,
    ArrowRight
} from "lucide-react"
import Link from "next/link"

export default function Attendance() {
    const modules = [
        {
            category: "Mark Attendance",
            items: [
                {
                    title: "Daily Attendance",
                    description: "Mark daily attendance",
                    icon: <CalendarCheck className="h-6 w-6 text-green-600" />,
                    href: "/dashboard/admin/attendance/daily-attendance",
                    color: "bg-green-50 border-green-100 hover:border-green-300"
                },
                {
                    title: "Class/Section-wise",
                    description: "Quick mark by class",
                    icon: <Users2 className="h-6 w-6 text-amber-600" />,
                    href: "/dashboard/admin/attendance/class-attendance",
                    color: "bg-amber-50 border-amber-100 hover:border-amber-300"
                }
            ]
        },
        {
            category: "Leave Management",
            items: [
                {
                    title: "Apply Leave",
                    description: "Submit leave requests",
                    icon: <PlaneTakeoff className="h-6 w-6 text-cyan-600" />,
                    href: "/dashboard/admin/attendance/leave-apply",
                    color: "bg-cyan-50 border-cyan-100 hover:border-cyan-300"
                },
                {
                    title: "Approve Leave",
                    description: "Review leave requests",
                    icon: <PlaneLanding className="h-6 w-6 text-red-600" />,
                    href: "/dashboard/admin/attendance/leave-approve",
                    color: "bg-red-50 border-red-100 hover:border-red-300"
                },
                {
                    title: "Leave Summary",
                    description: "Track leave balances",
                    icon: <ClipboardList className="h-6 w-6 text-indigo-600" />,
                    href: "/dashboard/admin/attendance/leave-summary",
                    color: "bg-indigo-50 border-indigo-100 hover:border-indigo-300"
                }
            ]
        },
        {
            category: "Reports & Analysis",
            items: [
                {
                    title: "Monthly Attendance",
                    description: "Month view & summaries",
                    icon: <CalendarRange className="h-6 w-6 text-blue-600" />,
                    href: "/dashboard/admin/attendance/monthly-attendance",
                    color: "bg-blue-50 border-blue-100 hover:border-blue-300"
                },
                {
                    title: "Consolidated Report",
                    description: "Roll-up by class/section",
                    icon: <Grid className="h-6 w-6 text-purple-600" />,
                    href: "/dashboard/admin/attendance/consolidated-report",
                    color: "bg-purple-50 border-purple-100 hover:border-purple-300"
                },
                {
                    title: "Attendance Register",
                    description: "Historical register",
                    icon: <BookOpenCheck className="h-6 w-6 text-emerald-600" />,
                    href: "/dashboard/admin/attendance/attendance-register",
                    color: "bg-emerald-50 border-emerald-100 hover:border-emerald-300"
                },
                {
                    title: "Export Data",
                    description: "Download Excel/PDF",
                    icon: <Download className="h-6 w-6 text-slate-600" />,
                    href: "/dashboard/admin/attendance/export",
                    color: "bg-slate-50 border-slate-100 hover:border-slate-300"
                }
            ]
        }
    ]

    return (
        <DashboardLayout title="Attendance Management">
            <div className="max-w-7xl mx-auto space-y-10">
                {modules.map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
                            {group.category}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {group.items.map((module, index) => (
                                <Link key={index} href={module.href}>
                                    <Card className={`h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer border ${module.color}`}>
                                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                            <div className="p-2 bg-white rounded-lg shadow-sm ring-1 ring-gray-100">
                                                {module.icon}
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </CardHeader>
                                        <CardContent>
                                            <CardTitle className="text-base font-semibold text-gray-900 mb-1">
                                                {module.title}
                                            </CardTitle>
                                            <CardDescription className="text-xs text-gray-600">
                                                {module.description}
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    )
}

