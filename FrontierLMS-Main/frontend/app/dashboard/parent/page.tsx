"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Users,
  IndianRupee,
  Calendar,
  Bell,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  CreditCard,
  FileText,
  BookOpenCheck,
  GraduationCap,
  Bus,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Phone,
  Download,
  Book
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ParentDashboard() {
  return (
    <ProtectedRoute allowedRoles={["parent"]}>
      <ParentDashboardContent />
    </ProtectedRoute>
  )
}

function ParentDashboardContent() {
  const router = useRouter()
  const [children, setChildren] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("Parent")

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        if (userStr) {
          try {
            const user = JSON.parse(userStr)
            setUserName(user.name || "Parent")
          } catch (e) { }
        }

        const res = await fetch(`${API_URL}/api/parent/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) {
          setStats(data.data.stats)
          const mappedChildren = data.data.children.map((child: any) => ({
            id: child._id,
            name: `${child.firstName} ${child.lastName}`,
            class: child.class ? `${child.class.name}-${child.class.section}` : 'N/A',
            rollNo: child.rollNumber,
            avatar: "/placeholder-avatar.jpg",
            gpa: child.latestResult ? (child.latestResult.percentage / 25).toFixed(1) : "0.0", // Approx GPA from %
            attendance: child.attendance?.percentage || 0,
            nextExam: child.upcomingExamsList && child.upcomingExamsList.length > 0
              ? `${child.upcomingExamsList[0].name} (${new Date(child.upcomingExamsList[0].examDate).toLocaleDateString()})`
              : "No upcoming exams",
            pendingFees: child.pendingFees || 0,
            assignments: child.pendingHomework || 0,
            teacher: "Class Teacher" // Placeholder
          }))
          setChildren(mappedChildren)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <DashboardLayout title="Parent Dashboard">
        <div className="flex h-screen items-center justify-center">Loading dashboard...</div>
      </DashboardLayout>
    )
  }

  const notices = [
    { id: 1, title: "Winter Vacation Annual Notification", date: "2024-12-18", category: "Holiday", priority: "High" },
    { id: 2, title: "Parent-Teacher Meeting Schedule", date: "2024-12-15", category: "Meeting", priority: "Medium" },
    { id: 3, title: "Annual Sports Day Registration", date: "2024-12-10", category: "Events", priority: "Low" },
  ]


  const quickLinks = [
    { title: "Pay Fees", icon: CreditCard, href: "/dashboard/parent/fees", color: "text-green-600", bg: "bg-green-100" },
    { title: "Attendance", icon: Calendar, href: "/dashboard/parent/attendance", color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Homework", icon: BookOpenCheck, href: "/dashboard/parent/homework", color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Timetable", icon: Clock, href: "/dashboard/parent/class-timetable", color: "text-indigo-600", bg: "bg-indigo-100" },
    { title: "Transport", icon: Bus, href: "/dashboard/parent/transport", color: "text-teal-600", bg: "bg-teal-100" },
    { title: "Report Card", icon: FileText, href: "/dashboard/parent/report", color: "text-orange-600", bg: "bg-orange-100" },
    { title: "Downloads", icon: Download, href: "/dashboard/parent/download-center", color: "text-cyan-600", bg: "bg-cyan-100" },
    { title: "Library", icon: Book, href: "/dashboard/parent/library", color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "Messages", icon: MessageSquare, href: "/dashboard/parent/communicate", color: "text-pink-600", bg: "bg-pink-100" },
  ]

  const totalOutstandingFees = children.reduce((acc, child: any) => acc + (child.pendingFees || 0), 0)

  const handleQuickPay = (amount: number) => {
    // Navigate to fees page for payment
    router.push('/dashboard/parent/fees')
  }

  const navigateTo = (path: string) => {
    router.push(path)
  }

  return (
    <DashboardLayout title="Parent Dashboard">
      <div className="space-y-8 animate-in fade-in-50 duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{userName}</span>
            </h2>
            <p className="text-muted-foreground mt-1">
              Here is what's happening with your children today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="hidden md:flex gap-2">
              <Phone className="h-4 w-4" /> Contact School
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
              <Bell className="h-4 w-4 mr-2" /> Notifications <Badge className="ml-2 bg-blue-500 hover:bg-blue-500">3</Badge>
            </Button>
          </div>
        </div>

        {/* Children Overview Section */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Child Cards Column */}
            <div className="md:col-span-2 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                <Users className="h-5 w-5 text-blue-600" /> My Children
              </h3>
              {children.map((child: any) => (
                <Card key={child.id} className="border shadow-sm hover:shadow-md transition-all group overflow-hidden">
                  <CardContent className="p-5 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <Avatar className="h-20 w-20 border-2 border-gray-100">
                      <AvatarImage src={child.avatar} />
                      <AvatarFallback className="bg-blue-50 text-blue-600 text-2xl font-bold">
                        {child.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 text-center sm:text-left space-y-3">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{child.name}</h4>
                        <p className="text-sm text-gray-500">Class {child.class} • Roll No: {child.rollNo}</p>
                      </div>

                      <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                        <div className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-1.5 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{child.attendance}% Attendance</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-1.5 rounded-lg">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{child.assignments} Homework</span>
                        </div>
                      </div>

                      {child.pendingFees > 0 && (
                        <div className="flex items-center gap-2 text-sm text-red-600 font-medium bg-red-50 px-3 py-1.5 rounded-lg w-fit mx-auto sm:mx-0">
                          <AlertCircle className="h-4 w-4" /> Fees Due: ₹{child.pendingFees}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <Button variant="outline" size="sm" onClick={() => navigateTo(`/dashboard/parent/child-profile?id=${child.id}`)}>
                        Profile
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => navigateTo('/dashboard/parent/fees')}>
                        Pay Fees
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sidebar Column */}
            <div className="md:col-span-1 space-y-6">
              {/* Total Fees Summary - Compact */}
              {totalOutstandingFees > 0 ? (
                <Card className="bg-red-50 border-red-100 shadow-sm">
                  <CardContent className="p-5">
                    <h3 className="text-sm font-semibold text-red-800 uppercase tracking-wide">Total Dues</h3>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-3xl font-bold text-red-700">₹{totalOutstandingFees}</span>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 h-8" onClick={() => handleQuickPay(totalOutstandingFees)}>Pay Now</Button>
                    </div>
                    <p className="text-xs text-red-600 mt-2">Outstanding across all children</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-green-50 border-green-100 shadow-sm">
                  <CardContent className="p-5 flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-bold text-green-800">All Fees Paid</h3>
                      <p className="text-xs text-green-600">No outstanding dues.</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickLinks.slice(0, 6).map((link) => (
                    <div
                      key={link.title}
                      className="bg-white p-3 rounded-lg border shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center h-24"
                      onClick={() => navigateTo(link.href)}
                    >
                      <link.icon className={`h-6 w-6 ${link.color}`} />
                      <span className="text-xs font-medium text-gray-700">{link.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notices Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
              <Bell className="h-5 w-5 text-orange-600" /> Notice Board
            </h3>
            <Button variant="link" className="text-blue-600" onClick={() => navigateTo('/dashboard/parent/notice-board')}>View All</Button>
          </div>
          <Card className="border-none shadow-md">
            <CardContent className="p-0">
              <ScrollArea className="h-[250px]">
                <div className="divide-y">
                  {notices.map((notice: any) => (
                    <div key={notice.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4 cursor-pointer" onClick={() => navigateTo('/dashboard/parent/notice-board')}>
                      <div className="flex-shrink-0 mt-1">
                        <div className="flex flex-col items-center bg-gray-100 rounded-lg p-2 w-14">
                          <span className="text-xs font-bold text-gray-500 uppercase">{new Date(notice.date).toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-lg font-bold text-gray-900">{new Date(notice.date).getDate()}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{notice.category}</Badge>
                          {notice.priority === "High" && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Urgent</Badge>}
                        </div>
                        <h5 className="font-semibold text-gray-900 leading-tight">{notice.title}</h5>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">Click to view full details regarding this announcement.</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  )
}
