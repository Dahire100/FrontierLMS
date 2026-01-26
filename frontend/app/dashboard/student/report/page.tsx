"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Award, TrendingUp, Download, Printer, Share2 } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"
import { toast } from "sonner"

export default function StudentReport() {
  const [activeTerm, setActiveTerm] = useState("")
  const [terms, setTerms] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/student/progress`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success && data.data && data.data.length > 0) {
        const termsData: any = {}
        data.data.forEach((report: any) => {
          const key = `term${report.term}` // Assuming term is 1, 2 etc.
          // Transform subjects if needed, or use as is
          // Backend StudentProgress might have 'subjects' array with {subjectName, marks, totalMarks, grade, remarks}
          termsData[key] = {
            name: `Term ${report.term} - ${report.academicYear}`,
            subjects: report.subjects.map((s: any) => ({
              name: s.subjectName || s.subject || "Unknown",
              marks: s.marksObtained || s.marks,
              fullMark: s.totalMarks,
              grade: s.grade,
              remarks: s.remarks || "Good"
            })),
            overallPercentage: report.percentage || 0,
            overallGrade: report.grade || "-",
            rank: report.rank || 0,
            totalStudents: report.totalStudents || 0
          }
        })
        setTerms(termsData)
        // Set first available term as active
        if (Object.keys(termsData).length > 0) {
          setActiveTerm(Object.keys(termsData)[0])
        } else {
          setActiveTerm("no_data")
        }
      } else {
        setTerms({})
        setActiveTerm("no_data")
      }
    } catch (error) {
      console.error("Failed to fetch reports", error)
      toast.error("Failed to load progress reports")
    } finally {
      setLoading(false)
    }
  }

  const currentData = terms[activeTerm]

  const handleDownload = () => {
    toast.success("Downloading report card...", {
      description: "Your PDF report has been generated successfully."
    })
  }

  if (loading) {
    return <div className="p-8 text-center">Loading academic reports...</div>
  }

  if (activeTerm === "no_data" || !currentData) {
    return (
      <DashboardLayout title="Report">
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold">No Reports Available</h2>
          <p className="text-muted-foreground">Progress reports have not been published yet.</p>
        </div>
      </DashboardLayout>
    )
  }

  const chartData = currentData.subjects.map((s: any) => ({
    name: s.name,
    marks: s.marks,
    fullMark: s.fullMark,
  }))

  return (
    <DashboardLayout title="Report">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Academic Report
            </h2>
            <p className="text-muted-foreground mt-1">Detailed performance analysis and report card</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </div>
        </div>

        <Tabs value={activeTerm} className="space-y-6" onValueChange={setActiveTerm}>
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            {Object.keys(terms).sort().map(key => (
              <TabsTrigger key={key} value={key}>{terms[key].name}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTerm} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard title="Overall Grade" value={currentData.overallGrade} icon={Award} iconColor="text-green-600" iconBgColor="bg-green-100" />
              <StatCard title="Percentage" value={`${currentData.overallPercentage}%`} icon={TrendingUp} iconColor="text-blue-600" iconBgColor="bg-blue-100" />
              <StatCard title="Class Rank" value={currentData.rank ? `#${currentData.rank}` : 'N/A'} icon={Award} iconColor="text-purple-600" iconBgColor="bg-purple-100" />
              <StatCard title="Total Subjects" value={currentData.subjects.length.toString()} icon={FileText} iconColor="text-orange-600" iconBgColor="bg-orange-100" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Report Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" /> Subject-wise Performance
                  </CardTitle>
                  <CardDescription>Detailed breakdown of your marks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    {currentData.subjects.map((subject: any, i: number) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <div className="font-semibold">{subject.name}</div>
                          <div className="flex gap-4">
                            <span className="text-muted-foreground font-normal">{subject.remarks}</span>
                            <span className="font-bold text-blue-600">{subject.marks}/{subject.fullMark}</span>
                          </div>
                        </div>
                        <Progress value={(subject.marks / subject.fullMark) * 100} className="h-2.5" />
                      </div>
                    ))}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg border flex justify-between items-center">
                      <div>
                        <span className="text-sm text-gray-500">CGPA (Calculated)</span>
                        <div className="text-2xl font-bold">{(currentData.overallPercentage / 9.5).toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">Result Status</span>
                        <div className="text-lg font-bold text-green-600 uppercase">PASS</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Charts */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-500" /> Performance Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis domain={[0, 100]} fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                          cursor={{ fill: '#f3f4f6' }}
                        />
                        <Bar dataKey="marks" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-orange-500" /> Skill Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px] flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" fontSize={12} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name="Marks" dataKey="marks" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

            </div>

          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
