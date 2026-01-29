"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PlusCircle, BarChart2, ClipboardCheck, Paperclip, MessageSquare, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Homework() {
    const modules = [
        {
            title: "Add Homework",
            description: "Create and assign homework",
            icon: <PlusCircle className="h-8 w-8 text-blue-600" />,
            href: "/dashboard/admin/homework/add-homework",
            color: "bg-blue-50 border-blue-100"
        },
        {
            title: "Homework Report",
            description: "Track submission status",
            icon: <BarChart2 className="h-8 w-8 text-emerald-600" />,
            href: "/dashboard/admin/homework/homework-report",
            color: "bg-emerald-50 border-emerald-100"
        },
        {
            title: "Homework Evaluation",
            description: "Review and grade submissions",
            icon: <ClipboardCheck className="h-8 w-8 text-purple-600" />,
            href: "/dashboard/admin/homework/homework-evaluation",
            color: "bg-purple-50 border-purple-100"
        },
        {
            title: "Attachments",
            description: "Manage homework files",
            icon: <Paperclip className="h-8 w-8 text-amber-600" />,
            href: "/dashboard/admin/homework/attachments",
            color: "bg-amber-50 border-amber-100"
        },
        {
            title: "Teacher Remarks",
            description: "Share feedback with students",
            icon: <MessageSquare className="h-8 w-8 text-red-600" />,
            href: "/dashboard/admin/homework/teacher-remarks",
            color: "bg-red-50 border-red-100"
        }
    ]

    return (
        <DashboardLayout title="Homework">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((module, index) => (
                        <Link key={index} href={module.href}>
                            <Card className={`h-full transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer border ${module.color}`}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 bg-white rounded-xl shadow-sm">
                                            {module.icon}
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-gray-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                                        {module.title}
                                    </CardTitle>
                                    <CardDescription className="text-sm text-gray-600">
                                        {module.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    )
}

