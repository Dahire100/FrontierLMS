"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CalendarClock, Link2, Users, History, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function OnlineClass() {
  const modules = [
    {
      title: "Class Schedule",
      description: "Plan upcoming live classes",
      icon: <CalendarClock className="h-8 w-8 text-blue-600" />,
      href: "/dashboard/admin/online-class/class-schedule",
      color: "bg-blue-50 border-blue-100"
    },
    {
      title: "Class Join Link",
      description: "Share Zoom/Meet links",
      icon: <Link2 className="h-8 w-8 text-emerald-600" />,
      href: "/dashboard/admin/online-class/class-join-link",
      color: "bg-emerald-50 border-emerald-100"
    },
    {
      title: "Attendee Tracking",
      description: "Track attendance for live classes",
      icon: <Users className="h-8 w-8 text-purple-600" />,
      href: "/dashboard/admin/online-class/attendee-tracking",
      color: "bg-purple-50 border-purple-100"
    },
    {
      title: "Past Class Logs",
      description: "Review history and recordings",
      icon: <History className="h-8 w-8 text-orange-600" />,
      href: "/dashboard/admin/online-class/past-class-logs",
      color: "bg-orange-50 border-orange-100"
    }
  ]

  return (
    <DashboardLayout title="Online Class">
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

