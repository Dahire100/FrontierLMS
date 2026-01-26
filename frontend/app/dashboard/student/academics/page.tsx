"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BookOpen, Award, Calendar, TrendingUp, User, Clock } from "lucide-react"
import { toast } from "sonner"

export default function StudentAcademics() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAcademics()
  }, [])

  const fetchAcademics = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}` }

      // Parallel fetch of Progress (for subjects/grades) and Assignments
      const [progressRes, assignmentsRes] = await Promise.all([
        fetch(`${API_URL}/api/student/progress`, { headers }),
        fetch(`${API_URL}/api/student/homework`, { headers }) // Using homework/assignments endpoint
      ])

      const progressData = await progressRes.json()
      const assignmentsData = await assignmentsRes.json()

      const subjectMap = new Map()

      // 1. Process Progress to identify Subjects and Grades
      if (progressData.success && progressData.data) {
        // Flatten all terms or just take the latest? Latest term usually.
        // Let's assume data[0] is latest or iterating to find latest.
        const latestReport = progressData.data.length > 0 ? progressData.data[0] : null
        if (latestReport) {
          latestReport.subjects.forEach((s: any) => {
            subjectMap.set(s.subjectName || s.subject || "Unknown", {
              id: s._id || Math.random(),
              subject: s.subjectName || s.subject || "Unknown",
              percentage: s.totalMarks ? Math.round((s.marksObtained / s.totalMarks) * 100) : 0,
              grade: s.grade || "-",
              teacher: "Class Teacher", // Placeholder as progress doesn't have teacher info
              attendance: 0, // Placeholder
              assignments: { completed: 0, total: 0 },
              syllabus: 50, // Placeholder
              nextClass: "Refer Timetable"
            })
          })
        }
      }

      // 2. Process Assignments to count stats
      if (assignmentsData.success && assignmentsData.data) {
        assignmentsData.data.forEach((hw: any) => {
          const subjName = hw.subject || "General"
          if (!subjectMap.has(subjName)) {
            // Add subject if not in progress report yet
            subjectMap.set(subjName, {
              id: hw._id,
              subject: subjName,
              percentage: 0, // No exams yet
              grade: "-",
              teacher: hw.teacherName || "Teacher",
              attendance: 0,
              assignments: { completed: 0, total: 0 },
              syllabus: 0,
              nextClass: "Refer Timetable"
            })
          }

          const subj = subjectMap.get(subjName)
          subj.assignments.total += 1
          if (hw.status === 'completed' || hw.status === 'submitted') {
            subj.assignments.completed += 1
          }
          // If teacher info available in homework, update it
          if (hw.teacherName) subj.teacher = hw.teacherName
        })
      }

      setCourses(Array.from(subjectMap.values()))

    } catch (error) {
      console.error("Failed to fetch academics", error)
      toast.error("Failed to load academic data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading academic data...</div>

  const avgPercentage = courses.length > 0 ? courses.reduce((sum, c) => sum + c.percentage, 0) / courses.length : 0
  const totalAssignments = courses.reduce((sum, c) => sum + c.assignments.total, 0)
  const completedAssignments = courses.reduce((sum, c) => sum + c.assignments.completed, 0)

  return (
    <DashboardLayout title="Academics">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            My Academics
          </h2>
          <p className="text-muted-foreground mt-1">
            Track your courses, grades, and academic progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Average Grade"
            value={`${Math.round(avgPercentage)}%`}
            icon={Award}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Total Courses"
            value={courses.length.toString()}
            icon={BookOpen}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Assignments"
            value={`${completedAssignments}/${totalAssignments}`}
            icon={TrendingUp}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatCard
            title="Attendance"
            value="View"
            icon={Calendar}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
        </div>

        {/* Course Cards */}
        {courses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No academic courses or data found found.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white font-semibold">
                          {course.subject.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{course.subject}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {course.teacher}
                        </CardDescription>
                      </div>
                    </div>
                    <span className={`text-3xl font-bold ${course.percentage >= 50 ? 'text-green-600' : 'text-red-500'}`}>{course.grade}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Performance */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Overall Score</span>
                      <span className="font-semibold">{course.percentage}%</span>
                    </div>
                    <Progress value={course.percentage} className="h-2" />
                  </div>

                  {/* Syllabus Progress - Placeholder in integration */}
                  {/* <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Syllabus Covered</span>
                    <span className="font-semibold">{course.syllabus}%</span>
                  </div>
                  <Progress value={course.syllabus} className="h-2" />
                </div> */}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Attendance</p>
                      <p className="text-lg font-bold">{course.attendance || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Assignments</p>
                      <p className="text-lg font-bold">{course.assignments.completed}/{course.assignments.total}</p>
                    </div>
                  </div>

                  {/* Next Class */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                    <Clock className="h-4 w-4" />
                    <span>Next class: {course.nextClass}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
