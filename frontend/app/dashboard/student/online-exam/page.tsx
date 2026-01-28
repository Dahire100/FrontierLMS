"use client"

import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileText, CheckCircle, Clock, Award, Loader2 } from "lucide-react"

import { toast } from "sonner"

export default function StudentOnlineExam() {
  const [loading, setLoading] = useState(true)
  const [quizzes, setQuizzes] = useState<any[]>([])

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/student/quizzes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setQuizzes(data.data)
      }
    } catch (error) {
      console.error("Fetch quizzes error", error)
      toast.error("Failed to load examinations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const availableTests = quizzes.filter(q => !q.attempted && (q.status === 'active' || q.status === 'scheduled'))
  const completedTests = quizzes.filter(q => q.attempted)

  const averageScore = completedTests.length > 0
    ? completedTests.reduce((sum, q) => sum + (q.score || 0), 0) / completedTests.length
    : 0

  const handleStartTest = (quiz: any) => {
    if (quiz.status === 'scheduled') {
      toast.info("Exam not started yet", { description: `Scheduled for ${new Date(quiz.scheduledDate).toLocaleDateString()} at ${quiz.startTime}` })
      return
    }
    toast.success("Starting Test", { description: `Launching ${quiz.title}... Good luck!` })
    // In a real app, route to /dashboard/student/online-exam/take/[id]
  }

  return (
    <DashboardLayout title="Online Exam">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Online Examinations
          </h2>
          <p className="text-muted-foreground mt-1">
            Take online tests and view your scores
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Tests"
            value={quizzes.length.toString()}
            icon={FileText}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Available"
            value={availableTests.length.toString()}
            icon={Clock}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
          <StatCard
            title="Completed"
            value={completedTests.length.toString()}
            icon={CheckCircle}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Average Score"
            value={`${Math.round(averageScore)}%`}
            icon={Award}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Available Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Available Tests
                </CardTitle>
                <CardDescription>Tests ready to take</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableTests.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No available tests</p>
                  ) : availableTests.map((test) => (
                    <div key={test._id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">{test.title}</p>
                          <p className="text-xs text-muted-foreground">{test.subject}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${test.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {test.status === 'active' ? 'Live' : 'Scheduled'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                        <span>⏱️ Duration: {test.duration} min</span>
                        <span>📝 Points: {test.totalMarks}</span>
                        <span className="col-span-2">📅 Scheduled: {new Date(test.scheduledDate).toLocaleDateString()} at {test.startTime}</span>
                      </div>
                      <Button onClick={() => handleStartTest(test)} size="sm" className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                        Start Test
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Completed Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Completed Tests
                </CardTitle>
                <CardDescription>Your test results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedTests.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No completed tests</p>
                  ) : completedTests.map((test) => (
                    <div key={test._id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{test.title}</p>
                          <p className="text-xs text-muted-foreground">{test.subject}</p>
                        </div>
                        <span className={`text-2xl font-bold ${test.result === 'pass' ? 'text-green-600' : 'text-red-600'}`}>{test.score}%</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Result: <span className="uppercase font-bold">{test.result}</span></span>
                          <span>{test.score}/{test.totalMarks}</span>
                        </div>
                        <Progress value={(test.score / test.totalMarks) * 100} className="h-2" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Attempted on: {new Date(test.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
