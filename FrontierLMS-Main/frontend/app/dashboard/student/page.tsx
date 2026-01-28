"use client"

import { API_URL } from "@/lib/api-config"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BookOpen,
  FileText,
  Award,
  Calendar,
  Clock,
  Bell,
  CheckCircle,
  Laptop,
  Download,
  ClipboardList,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from "lucide-react"

export default function StudentDashboard() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentDashboardContent />
    </ProtectedRoute>
  )
}

function StudentDashboardContent() {
  const router = useRouter()
  const [studentInfo, setStudentInfo] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_URL}/api/student/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) {
          setDashboardData(data.data)
          setStudentInfo({
            name: `${data.data.student.firstName} ${data.data.student.lastName}`,
            rollNo: data.data.student.rollNumber,
            class: `${data.data.student.class?.name || ''}-${data.data.student.class?.section || ''}`,
            gpa: 3.8, // GPA calculation logic might be needed backend side or mocked for now
            attendance: data.data.attendance.percentage,
            img: "/placeholder-avatar.jpg"
          })
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
    return <div className="p-8 text-center">Loading dashboard...</div>
  }

  if (!studentInfo || !dashboardData) {
    return <div className="p-8 text-center">Failed to load student data.</div>
  }

  // Map API data to UI structures
  const courses = dashboardData.todaySchedule?.timetable?.periods?.map((p: any) => ({
    name: p.subject,
    grade: "A", // Placeholder as timetable doesn't have grades
    progress: 75, // Placeholder
    teacher: p.teacherId ? `${p.teacherId.firstName} ${p.teacherId.lastName}` : "Unknown",
    nextClass: `${p.startTime} - ${p.endTime}`,
    color: "text-blue-600 bg-blue-50"
  })) || []

  // Create empty arrays if undefined to avoid crashes
  // Map API data
  const assignments = dashboardData.academics.pendingWork?.map((work: any) => ({
    id: work._id,
    title: work.title,
    subject: work.subject,
    dueDate: work.dueDate,
    status: "Pending",
    priority: "High"
  })) || []

  const upcomingEvents = dashboardData.academics.upcomingExamsData?.map((exam: any) => ({
    title: exam.name || "Exam",
    date: exam.examDate,
    type: "Exam",
    color: "text-red-500"
  })) || []

  const pendingAssignmentsCount = (dashboardData.academics.pendingAssignments || 0) + (dashboardData.academics.pendingHomework || 0)

  const quickLinks = [
    { title: "Homework", icon: FileText, href: "/dashboard/student/homework", color: "text-blue-500" },
    { title: "Downloads", icon: Download, href: "/dashboard/student/download-center", color: "text-indigo-500" },
    { title: "Attendance", icon: Calendar, href: "/dashboard/student/attendance", color: "text-green-500" },
    { title: "Notices", icon: Bell, href: "/dashboard/student/notice-board", color: "text-yellow-500" },
    { title: "Results", icon: Award, href: "/dashboard/student/report", color: "text-purple-500" },
    { title: "Leave Apply", icon: ClipboardList, href: "/dashboard/student/leave-apply", color: "text-pink-500" },
    { title: "Online Class", icon: Laptop, href: "/dashboard/student/online-class", color: "text-cyan-500" },
    { title: "Messages", icon: MessageSquare, href: "/dashboard/student/communicate", color: "text-orange-500" },
  ]

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="space-y-8 p-1">

        {/* Welcome Section with Glassmorphism */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Welcome back, {studentInfo.name}! 👋</h2>
              <p className="text-blue-100 text-lg">
                You have <span className="font-semibold text-white">{pendingAssignmentsCount} pending tasks</span> and <span className="font-semibold text-white">2 upcoming classes</span> today.
              </p>
              <div className="flex gap-4 pt-4">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Award className="h-5 w-5 text-yellow-300" />
                  <span className="font-medium">Class {studentInfo.class}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span className="font-medium">Roll No: {studentInfo.rollNo}</span>
                </div>
              </div>
            </div>
            <Avatar className="h-24 w-24 border-4 border-white/20 shadow-lg">
              <AvatarImage src={studentInfo.img} />
              <AvatarFallback className="bg-white/10 text-3xl font-bold text-white backdrop-blur-md">
                {studentInfo.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current GPA</p>
                  <h3 className="text-3xl font-bold mt-1">{studentInfo.gpa}</h3>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" /> +0.2 from last term
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Courses</p>
                  <h3 className="text-3xl font-bold mt-1">{courses.length}</h3>
                  <p className="text-xs text-blue-600 mt-1 flex items-center">
                    All currently in progress
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                  <h3 className="text-3xl font-bold mt-1">{pendingAssignmentsCount}</h3>
                  <p className="text-xs text-orange-600 mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" /> Needs attention
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Attendance</p>
                  <h3 className="text-3xl font-bold mt-1">{studentInfo.attendance}%</h3>
                  <p className="text-xs text-purple-600 mt-1 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" /> Excellent
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column (Courses & Quick Links) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-500" /> Quick Actions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {quickLinks.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    className="group flex flex-col items-center justify-center p-4 bg-white border rounded-xl hover:shadow-md hover:border-indigo-200 transition-all duration-200"
                  >
                    <div className={`p-3 rounded-full bg-gray-50 group-hover:bg-white transition-colors mb-2 ${link.color}`}>
                      <link.icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">{link.title}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Courses List */}
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" /> My Courses
                  </span>
                  <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => router.push("/dashboard/student/academics")}>View All</Button>
                </CardTitle>
                <CardDescription>Your academic progress and schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.map((course: any) => (
                    <div key={course.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${course.color}`}>
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{course.name}</h4>
                          <p className="text-sm text-gray-500">{course.teacher}</p>
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-blue-600 font-medium">
                            <Clock className="h-3.5 w-3.5" /> {course.nextClass}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-[150px]">
                        <div className="w-full sm:w-32 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-medium">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 font-bold text-gray-700">
                          {course.grade}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (Assignments & Events) */}
          <div className="space-y-8">

            {/* Assignments */}
            <Card className="border-none shadow-md h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-500" /> Pending Work
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignments.slice(0, 3).map((assignment: any) => (
                  <div key={assignment.id} className="p-3 border rounded-xl hover:shadow-sm transition-shadow bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${assignment.priority === "High" ? "bg-red-50 text-red-700 border-red-100" :
                        "bg-yellow-50 text-yellow-700 border-yellow-100"
                        }`}>
                        {assignment.priority}
                      </span>
                      <span className="text-xs text-gray-400">{assignment.subject}</span>
                    </div>
                    <h4 className="text-sm font-semibold mb-1 line-clamp-1">{assignment.title}</h4>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                      <span className={`font-medium ${assignment.status === "Submitted" ? "text-green-600" : "text-orange-500"
                        }`}>
                        {assignment.status}
                      </span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full text-sm" onClick={() => router.push("/dashboard/student/homework")}>
                  View All Assignments <ArrowRight className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-indigo-500" /> Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
                  {upcomingEvents.map((event: any, index: number) => (
                    <div key={index} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white ${event.color?.split(' ')[0].replace('text-', 'bg-')}`}></div>
                      <h4 className="text-sm font-semibold">{event.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                      <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-medium ${event.color}`}>
                        {event.type}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
