"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileQuestion, ClipboardList, Users2, PlayCircle, Gauge, GraduationCap, ListChecks, BarChart2, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function OnlineExam() {
  const modules = [
    {
      title: "Question Bank",
      description: "Manage questions & tags",
      icon: <FileQuestion className="h-8 w-8 text-purple-600" />,
      href: "/dashboard/admin/online-exam/question-bank",
      color: "bg-purple-50 border-purple-100"
    },
    {
      title: "Create Exam",
      description: "Define online exams",
      icon: <ClipboardList className="h-8 w-8 text-blue-600" />,
      href: "/dashboard/admin/online-exam/create-exam",
      color: "bg-blue-50 border-blue-100"
    },
    {
      title: "Assign Exam",
      description: "Assign to classes / students",
      icon: <Users2 className="h-8 w-8 text-emerald-600" />,
      href: "/dashboard/admin/online-exam/assign-exam",
      color: "bg-emerald-50 border-emerald-100"
    },
    {
      title: "Conduct Exam",
      description: "Exam session controls",
      icon: <PlayCircle className="h-8 w-8 text-orange-600" />,
      href: "/dashboard/admin/online-exam/conduct-exam",
      color: "bg-orange-50 border-orange-100"
    },
    {
      title: "Auto-Grading",
      description: "Evaluate objective answers",
      icon: <Gauge className="h-8 w-8 text-indigo-600" />,
      href: "/dashboard/admin/online-exam/auto-grading",
      color: "bg-indigo-50 border-indigo-100"
    },
    {
      title: "Student Result",
      description: "View individual scores",
      icon: <GraduationCap className="h-8 w-8 text-cyan-600" />,
      href: "/dashboard/admin/online-exam/student-result",
      color: "bg-cyan-50 border-cyan-100"
    },
    {
      title: "Attempt Log",
      description: "Track attempts & events",
      icon: <ListChecks className="h-8 w-8 text-amber-600" />,
      href: "/dashboard/admin/online-exam/attempt-log",
      color: "bg-amber-50 border-amber-100"
    },
    {
      title: "Exam Reports",
      description: "Performance analytics",
      icon: <BarChart2 className="h-8 w-8 text-emerald-700" />,
      href: "/dashboard/admin/online-exam/exam-reports",
      color: "bg-emerald-50 border-emerald-100"
    }
  ]

  return (
    <DashboardLayout title="Online Exam">
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

