"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BookOpen, ClipboardList, FileText, Upload, Folder, ShieldCheck, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DownloadCenter() {
    const modules = [
        {
            title: "Study Material",
            description: "Notes, PPTs, reference docs",
            icon: <BookOpen className="h-8 w-8 text-blue-600" />,
            href: "/dashboard/admin/download-center/study-material",
            color: "bg-blue-50 border-blue-100"
        },
        {
            title: "Assignments",
            description: "Share downloadable assignments",
            icon: <ClipboardList className="h-8 w-8 text-emerald-600" />,
            href: "/dashboard/admin/download-center/assignments",
            color: "bg-emerald-50 border-emerald-100"
        },
        {
            title: "Syllabus",
            description: "Upload class syllabi",
            icon: <FileText className="h-8 w-8 text-purple-600" />,
            href: "/dashboard/admin/download-center/syllabus",
            color: "bg-purple-50 border-purple-100"
        },
        {
            title: "Upload Content",
            description: "Upload and manage files",
            icon: <Upload className="h-8 w-8 text-orange-600" />,
            href: "/dashboard/admin/download-center/upload-content",
            color: "bg-orange-50 border-orange-100"
        },
        {
            title: "File Categories",
            description: "Organize by subject/type",
            icon: <Folder className="h-8 w-8 text-amber-600" />,
            href: "/dashboard/admin/download-center/file-categories",
            color: "bg-amber-50 border-amber-100"
        },
        {
            title: "Role-wise Visibility",
            description: "Control who can view/download",
            icon: <ShieldCheck className="h-8 w-8 text-red-600" />,
            href: "/dashboard/admin/download-center/role-visibility",
            color: "bg-red-50 border-red-100"
        }
    ]

    return (
        <DashboardLayout title="Download Center">
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

