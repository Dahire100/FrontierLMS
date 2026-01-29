"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, Award, Clock, BookOpen, FileText, Download } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function StudentExaminations() {
  const [upcomingExams, setUpcomingExams] = useState<any[]>([])
  const [recentResults, setRecentResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [examApplications, setExamApplications] = useState<any[]>([])
  const [admitCards, setAdmitCards] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = { 'Authorization': `Bearer ${token}` }

        const [examsRes, resultsRes, appsRes, cardsRes] = await Promise.all([
          fetch(`${API_URL}/api/student/exams`, { headers }),
          fetch(`${API_URL}/api/student/results`, { headers }),
          fetch(`${API_URL}/api/student/exams/applications`, { headers }),
          fetch(`${API_URL}/api/student/exams/admit-cards`, { headers })
        ])

        const examsData = await examsRes.json()
        const resultsData = await resultsRes.json()
        const appsData = await appsRes.json()
        const cardsData = await cardsRes.json()

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

        if (appsRes.ok && appsData.success) {
          setExamApplications(appsData.data)
        }

        if (cardsRes.ok && cardsData.success) {
          setAdmitCards(cardsData.data)
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

  const handleApplyExam = async (examId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/student/exams/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          examId,
          selectedSubjects: ["Mathematics", "Physics", "Chemistry", "English"], // Mock: In real app, bind to checkbox state
          examFee: 500
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Registration Successful!");
        // Refresh data
        window.location.reload();
      } else {
        toast.error(data.error || "Failed to register");
      }
    } catch (e) {
      toast.error("Network error");
    }
  }

  const handleDownloadAdmitCard = async (id: string, name: string) => {
    try {
      toast.info("Downloading Admit Card...");
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/student/exams/admit-card/${id}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AdmitCard_${name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Download complete");
    } catch (e) {
      toast.error("Failed to download admit card");
    }
  }

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

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview & Results</TabsTrigger>
            <TabsTrigger value="forms">Exam Forms & Admit Cards</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="forms" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Exam Applications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" /> Exam Registration
                  </CardTitle>
                  <CardDescription>Register for upcoming semester exams</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {examApplications.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-4">No exams open for registration.</p>
                    ) : examApplications.map((app: any) => (
                      <div key={app._id} className="p-4 border rounded-lg bg-white hover:border-indigo-200 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{app.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">Date: {new Date(app.examDate).toLocaleDateString()}</p>
                          </div>
                          <Badge variant={app.applicationStatus === 'approved' ? "default" : app.applicationStatus === 'pending' ? "secondary" : "outline"}
                            className={app.applicationStatus === 'pending' ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                              app.applicationStatus === 'approved' ? "bg-green-50 text-green-700 border-green-200" : ""}
                          >
                            {app.applicationStatus === 'open' ? 'Open' : app.applicationStatus}
                          </Badge>
                        </div>

                        <div className="mb-4 p-3 bg-gray-50 rounded-md text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Exam Fee:</span>
                            <span className="font-medium">₹ 500.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Late Fee:</span>
                            <span className="font-medium">₹ 0.00</span>
                          </div>
                          <div className="border-t pt-1 mt-1 flex justify-between font-bold">
                            <span>Total:</span>
                            <span>₹ 500.00</span>
                          </div>
                        </div>

                        {app.applicationStatus === 'open' ? (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <p className="text-xs font-medium">Select Subjects:</p>
                              <div className="flex flex-wrap gap-1">
                                {["Mathematics", "Physics", "Chemistry", "English"].map(sub => (
                                  <Badge key={sub} variant="outline" className="bg-white text-xs font-normal">
                                    {sub}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2"
                              onClick={() => handleApplyExam(app._id)}
                            >
                              Pay & Register
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" className="w-full" disabled>
                            {app.applicationStatus === 'pending' ? 'Verification Pending' : 'Registration Complete'}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Admit Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Download className="h-5 w-5 text-blue-600" /> Admit Cards
                  </CardTitle>
                  <CardDescription>Download approved admit cards for exams</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {admitCards.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-4">No admit cards available yet.</p>
                    ) : admitCards.map((card: any) => (
                      <div key={card._id} className="flex flex-col p-4 border rounded-lg hover:border-blue-200 transition-colors bg-white">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{card.examId.name}</p>
                              <p className="text-xs text-muted-foreground">Date: {new Date(card.examId.examDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4 bg-gray-50 p-3 rounded-md">
                          <div>
                            <span className="text-muted-foreground block">Center:</span>
                            <span className="font-medium">{card.examCenter || "Main Hall"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Time:</span>
                            <span className="font-medium">{card.examId.startTime}</span>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                          onClick={() => handleDownloadAdmitCard(card._id, card.examId.name)}
                        >
                          <Download className="h-4 w-4 mr-2" /> Download Admit Card
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
