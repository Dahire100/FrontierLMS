"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Users,
  PhoneCall,
  Mail,
  MessageSquare,
  ClipboardList,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Settings2,
  SendHorizontal
} from "lucide-react"

import Link from "next/link"

export default function FrontOffice() {
  const modules = [
    {
      title: "Visitor Log",
      description: "Track visitors entering and leaving campus",
      icon: <Users className="h-8 w-8 text-emerald-600" />,
      href: "/dashboard/admin/front-office/visitor-log",
      color: "bg-emerald-50 border-emerald-100"
    },
    {
      title: "Enquiry Management",
      description: "Manage admission and general enquiries",
      icon: <ClipboardList className="h-8 w-8 text-blue-600" />,
      href: "/dashboard/admin/front-office/enquiry-management",
      color: "bg-blue-50 border-blue-100"
    },
    {
      title: "Phone Call Log",
      description: "Log inbound/outbound calls",
      icon: <PhoneCall className="h-8 w-8 text-orange-600" />,
      href: "/dashboard/admin/front-office/phone-call-log",
      color: "bg-orange-50 border-orange-100"
    },
    {
      title: "Complaint Register",
      description: "Register and track complaints",
      icon: <MessageSquare className="h-8 w-8 text-red-600" />,
      href: "/dashboard/admin/front-office/complaint-register",
      color: "bg-red-50 border-red-100"
    },
    {
      title: "Postal Receive/Dispatch",
      description: "Manage incoming and outgoing mail",
      icon: <Mail className="h-8 w-8 text-purple-600" />,
      href: "/dashboard/admin/front-office/postal-receive-dispatch",
      color: "bg-purple-50 border-purple-100"
    },
    {
      title: "Legacy Visitors Book",
      description: "Existing visitors book (optional)",
      icon: <BookOpen className="h-8 w-8 text-cyan-600" />,
      href: "/dashboard/admin/front-office/visitors-book",
      color: "bg-cyan-50 border-cyan-100"
    },
    {
      title: "Gate Pass",
      description: "Issue and track entry/exit passes",
      icon: <ShieldCheck className="h-8 w-8 text-indigo-600" />,
      href: "/dashboard/admin/front-office/gate-pass",
      color: "bg-indigo-50 border-indigo-100"
    },
    {
      title: "Entrance Exam",
      description: "Manage candidate entrance forms",
      icon: <GraduationCap className="h-8 w-8 text-orange-600" />,
      href: "/dashboard/admin/front-office/entrance-exam",
      color: "bg-orange-50 border-orange-100"
    },
    {
      title: "Postal Exchange",
      description: "Outgoing/Incoming postal logs",
      icon: <SendHorizontal className="h-8 w-8 text-sky-600" />,
      href: "/dashboard/admin/front-office/postal-exchange",
      color: "bg-sky-50 border-sky-100"
    },
    {
      title: "Front Office Setup",
      description: "Configure purposes, types and sources",
      icon: <Settings2 className="h-8 w-8 text-slate-600" />,
      href: "/dashboard/admin/front-office/setup",
      color: "bg-slate-50 border-slate-100"
    }

  ]

  return (
    <DashboardLayout title="Front Office">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
