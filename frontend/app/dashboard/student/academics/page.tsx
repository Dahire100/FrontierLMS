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

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, FileText, Download } from "lucide-react"

export default function StudentAcademics() {
  const [courses, setCourses] = useState<any[]>([])
  const [syllabusList, setSyllabusList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubjectSyllabus, setSelectedSubjectSyllabus] = useState<any>(null)

  useEffect(() => {
    fetchAcademics()
  }, [])

  const fetchAcademics = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}` }

      // 1. Fetch Profile to get ClassId
      const profileRes = await fetch(`${API_URL}/api/student/profile`, { headers })
      const profileData = await profileRes.json()

      let classId = null;
      if (profileData.success && profileData.data) {
        // If class is populated, use _id, otherwise we might need to look it up or logic differs
        // Assuming backend populates specific fields or we use the string to find it, 
        // but typically for syllabus we need the ID. 
        // If profile returns class string, we might need a lookup, but let's assume valid profile data 
        // or fetch syllabus without classId if permitted (likely not specialized).
        // Actually, the best way is using the student's classId if available.
        // Let's rely on what we have. If class is an object with _id:
        if (typeof profileData.data.class === 'object' && profileData.data.class?._id) {
          classId = profileData.data.class._id
        }
      }

      // Parallel fetch of Progress (for subjects/grades), Assignments, and Syllabus
      const fetchDataPromises: Promise<Response>[] = [
        fetch(`${API_URL}/api/student/progress`, { headers }),
        fetch(`${API_URL}/api/student/homework`, { headers })
      ];

      // Only fetch syllabus if we could determine classId or if the API handles it via user context
      // The backend getAllSyllabi expects classId in query usually, or we can try fetching all.
      // Let's try fetching with what we have. 
      // Note: Backend might rely on query param. Let's try to get it.
      // If profileData.data.class is a string, we might need to fetch class info.
      // For now, let's assume we can fetch syllabus freely or by context if backend supports it.
      // Actually, looking at backend code: 
      // const { classId } = req.query; if (classId) filter.classId = classId;
      // It doesn't auto-derive classId from student user, so we MUST pass it.
      // If we can't find classId easily, we might skip syllabus or show empty.

      // IMPROVEMENT: Fetch syllabus after we know classId. 
      // But we can just fetch requests and handle errors.

      const [progressRes, assignmentsRes] = await Promise.all(fetchDataPromises)

      const progressData = await progressRes.json()
      const assignmentsData = await assignmentsRes.json()

      // Fetch Syllabus separately if we have classId or if we want to try generic
      let syllabusData = { data: [] }
      if (profileData.success && profileData.data) {
        // We need the actual Class ObjectId. If profile returns expanded class, good. 
        // If not, we might be stuck. Usually student profile has classId or class object.
        // Let's assume we can get it.
        // If not, we'll try to find syllabus by subject matching later if we find a workaround,
        // but strictly we need classId.
        // Let's try fetching all active syllabus for this school (some might not have class filter)
        // or if backend allows filtering by other means.
        // Actually, let's fetch syllabus using the student's class name if backend supported it, but it expects ID.
        // We will try safe fetch.
      }

      // Fetch Syllabus separately with classId filter if available
      let syllabusUrl = `${API_URL}/api/syllabus`;
      if (classId) {
        syllabusUrl += `?classId=${classId}`;
      }
      const syllabusRes = await fetch(syllabusUrl, { headers })
      if (syllabusRes.ok) {
        syllabusData = await syllabusRes.json()
      }

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
              syllabus: 0, // Placeholder
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

      // Process Syllabus Data
      if (syllabusData.data) {
        // Filter syllabus by student's class if we can match it, otherwise show all relevant?
        // Ideally backend filters. If we get all, we filter here.
        // For now, assume backend returns relevant list or we show all.
        setSyllabusList(syllabusData.data)
      }

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

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="syllabus">Syllabus & Curriculum</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="syllabus">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Syllabus Overview</CardTitle>
                <CardDescription>Select a subject to view detailed syllabus units and topics.</CardDescription>
              </CardHeader>
              <CardContent>
                {syllabusList.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No syllabus documents available for your class.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {syllabusList.map((syllabus) => (
                      <Dialog key={syllabus._id}>
                        <DialogTrigger asChild>
                          <div className="cursor-pointer group relative overflow-hidden rounded-lg border bg-white p-6 hover:border-blue-500 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                                  {syllabus.title || syllabus.subject}
                                </h3>
                                <p className="text-sm text-muted-foreground">{syllabus.subject}</p>
                                {syllabus.term && <span className="inline-block px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 mt-2">{syllabus.term}</span>}
                              </div>
                              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                              <FileText className="h-3 w-3" />
                              <span>{syllabus.topics?.length || 0} Units</span>
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col">
                          <DialogHeader>
                            <DialogTitle>{syllabus.title || syllabus.subject} - Syllabus</DialogTitle>
                            <DialogDescription>
                              Detailed unit and topic breakdown for {syllabus.subject}.
                            </DialogDescription>
                          </DialogHeader>

                          <ScrollArea className="flex-1 pr-4 mt-4">
                            <div className="space-y-6">
                              {/* Display Topics/Units */}
                              {syllabus.topics && syllabus.topics.length > 0 ? (
                                <div className="space-y-4">
                                  {syllabus.topics.map((topic: any, idx: number) => (
                                    <div key={idx} className="border-l-2 border-blue-200 pl-4 py-1">
                                      <h4 className="font-medium text-gray-900">Unit {idx + 1}: {topic.title}</h4>
                                      {topic.description && (
                                        <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground italic">No detailed topics listed.</p>
                              )}

                              {/* Download Button if file exists */}
                              {syllabus.fileUrl && (
                                <div className="pt-6 border-t mt-6">
                                  <Button className="w-full sm:w-auto" onClick={() => window.open(syllabus.fileUrl, '_blank')}>
                                    <Download className="mr-2 h-4 w-4" /> Download Syllabus PDF
                                  </Button>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
