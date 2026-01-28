"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertTriangle, MessageSquare, Shield, ListChecks, ArrowRight, LayoutGrid, FilePen, FileChartColumn } from "lucide-react"
import Link from "next/link"

export default function Disciplinary() {
  const modules = [
    { title: "Student Complaints", description: "Log and track complaints", icon: <MessageSquare className="h-8 w-8 text-red-600" />, href: "/dashboard/admin/disciplinary/student-complaints", color: "bg-red-50 border-red-100" },
    { title: "Remarks", description: "Record behaviour remarks", icon: <Shield className="h-8 w-8 text-blue-600" />, href: "/dashboard/admin/disciplinary/remarks", color: "bg-blue-50 border-blue-100" },
    { title: "Actions Taken", description: "Disciplinary actions", icon: <AlertTriangle className="h-8 w-8 text-orange-600" />, href: "/dashboard/admin/disciplinary/actions-taken", color: "bg-orange-50 border-orange-100" },
    { title: "Behaviour Log", description: "Overall behaviour history", icon: <ListChecks className="h-8 w-8 text-emerald-600" />, href: "/dashboard/admin/disciplinary/behaviour-log", color: "bg-emerald-50 border-emerald-100" },
    { title: "Parameter", description: "Manage disciplinary parameters", icon: <LayoutGrid className="h-8 w-8 text-purple-600" />, href: "/dashboard/admin/disciplinary/parameter", color: "bg-purple-50 border-purple-100" },
    { title: "Assessment", description: "Student behaviour assessment", icon: <FilePen className="h-8 w-8 text-pink-600" />, href: "/dashboard/admin/disciplinary/assessment", color: "bg-pink-50 border-pink-100" },
    { title: "Disciplinary Report", description: "View disciplinary reports", icon: <FileChartColumn className="h-8 w-8 text-indigo-600" />, href: "/dashboard/admin/disciplinary/disciplinary-report", color: "bg-indigo-50 border-indigo-100" },
  ]

  return (
    <DashboardLayout title="Disciplinary">
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

