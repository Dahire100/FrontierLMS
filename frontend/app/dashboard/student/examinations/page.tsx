"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, Award, Clock, BookOpen } from "lucide-react"
import { toast } from "sonner"

export default function StudentExaminations() {
  const [upcomingExams, setUpcomingExams] = useState<any[]>([])
  const [recentResults, setRecentResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = { 'Authorization': `Bearer ${token}` }

        const [examsRes, resultsRes] = await Promise.all([
          fetch(`${API_URL}/api/student/exams`, { headers }), // filtered by backend logic potentially
          fetch(`${API_URL}/api/student/results`, { headers })
        ])

        const examsData = await examsRes.json()
        const resultsData = await resultsRes.json()

        if (examsData.success) {
          // Filter for upcoming future exams
          const today = new Date()
          const upcoming = examsData.data.filter((e: any) => new Date(e.examDate) >= today).map((e: any) => {
            const examDate = new Date(e.examDate)
            const diffTime = Math.abs(examDate.getTime() - today.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return {
              id: e._id,
              subject: e.name || "General", // Exam name or subject
              date: e.examDate,
              time: e.startTime || "09:00 AM", // Fallback
              duration: e.duration ? `${e.duration} mins` : "3 hours",
              syllabus: e.description || "N/A",
              daysLeft: diffDays
            }
          }).slice(0, 5) // Limit to 5
          setUpcomingExams(upcoming)
        }

        if (resultsData.success) {
          const results = resultsData.data.map((r: any) => ({
            subject: r.examId?.name || "Result",
            marks: r.marksObtained,
            total: r.examId?.totalMarks || 100,
            grade: r.grade || calculateGrade(r.marksObtained, r.examId?.totalMarks || 100),
            percentage: ((r.marksObtained / (r.examId?.totalMarks || 100)) * 100).toFixed(1)
          })).slice(0, 5)
          setRecentResults(results)
        }

      } catch (error) {
        console.error("Failed to fetch examination data", error)
        toast.error("Failed to load examination data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const calculateGrade = (marks: number, total: number) => {
    const p = (marks / total) * 100
    if (p >= 90) return "A+"
    if (p >= 80) return "A"
    if (p >= 70) return "B+"
    if (p >= 60) return "B"
    return "C"
  }

  const averagePercentage = recentResults.length > 0
    ? recentResults.reduce((sum, r) => sum + Number(r.percentage), 0) / recentResults.length
    : 0

  const handleDownloadReport = () => {
    toast.success("Downloading Report Card", { description: "Your report card download has started." })
  }

  const handleViewSchedule = () => {
    toast.info("Opening Schedule", { description: "Redirecting to full exam schedule..." })
  }

  if (loading) {
    return <div className="p-8 text-center">Loading Examinations...</div>
  }

  return (
    <DashboardLayout title="Examinations">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Examinations
          </h2>
          <p className="text-muted-foreground mt-1">
            Track exam schedules and view results
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Upcoming Exams"
            value={upcomingExams.length.toString()}
            icon={Calendar}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Average Score"
            value={`${Math.round(averagePercentage)}%`}
            icon={Award}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Subjects"
            value={recentResults.length.toString()}
            icon={BookOpen}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatCard
            title="Next Exam In"
            value={upcomingExams.length > 0 ? `${upcomingExams[0]?.daysLeft} days` : "N/A"}
            icon={Clock}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Exams */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Exams
              </CardTitle>
              <CardDescription>Scheduled examinations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingExams.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No upcoming exams</p>
                ) : upcomingExams.map((exam) => (
                  <div key={exam.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{exam.subject}</p>
                        <p className="text-xs text-muted-foreground">{exam.syllabus}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                        {exam.daysLeft} days left
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <span>📅 {new Date(exam.date).toLocaleDateString()}</span>
                      <span>🕐 {exam.time}</span>
                      <span className="col-span-2">⏱️ Duration: {exam.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Results
              </CardTitle>
              <CardDescription>Latest exam performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentResults.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No recent results</p>
                ) : recentResults.map((result, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{result.subject}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">{result.grade}</span>
                        <span className="text-sm text-muted-foreground">{result.marks}/{result.total}</span>
                      </div>
                    </div>
                    <Progress value={Number(result.percentage)} className="h-2" />
                  </div>
                ))}
                {recentResults.length > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Average</span>
                      <span className="text-2xl font-bold text-green-600">{Math.round(averagePercentage)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Button onClick={handleViewSchedule} className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                <Calendar className="h-4 w-4 mr-2" />
                View Full Schedule
              </Button>
              <Button onClick={handleDownloadReport} variant="outline" className="flex-1">
                <Award className="h-4 w-4 mr-2" />
                Download Report Card
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
