"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    PlusCircle,
    Search,
    Wallet,
    ArrowRight
} from "lucide-react"
import Link from "next/link"

export default function Income() {
    const modules = [
        {
            title: "Add Income",
            description: "Add new income entries",
            icon: <PlusCircle className="h-8 w-8 text-green-600" />,
            href: "/dashboard/admin/income/add-income",
            color: "bg-green-50 border-green-100"
        },
        {
            title: "Search Income",
            description: "Search and filter income records",
            icon: <Search className="h-8 w-8 text-blue-600" />,
            href: "/dashboard/admin/income/search-income",
            color: "bg-blue-50 border-blue-100"
        },
        {
            title: "Income Head",
            description: "Manage income heads and categories",
            icon: <Wallet className="h-8 w-8 text-purple-600" />,
            href: "/dashboard/admin/income/income-head",
            color: "bg-purple-50 border-purple-100"
        },
        {
            title: "Income List",
            description: "View all income entries",
            icon: <Search className="h-8 w-8 text-amber-600" />,
            href: "/dashboard/admin/income/income-list",
            color: "bg-amber-50 border-amber-100"
        },
        {
            title: "Income Report",
            description: "Summaries and totals",
            icon: <ArrowRight className="h-8 w-8 text-indigo-600" />,
            href: "/dashboard/admin/income/income-report",
            color: "bg-indigo-50 border-indigo-100"
        }
    ]

    return (
        <DashboardLayout title="Income">
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
