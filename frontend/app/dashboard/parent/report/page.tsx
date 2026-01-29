"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileText, Award, TrendingUp, Download, Calendar, Users, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function ParentReport() {
  const [selectedChild, setSelectedChild] = useState<string>("")
  const [children, setChildren] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch children on mount
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_URL}/api/parent/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success && data.data.children.length > 0) {
          setChildren(data.data.children)
          setSelectedChild(data.data.children[0]._id)
        }
      } catch (error) {
        console.error("Failed to fetch children", error)
        toast.error("Failed to load children list")
      } finally {
        setLoading(false)
      }
    }
    fetchChildren()
  }, [])

  // Fetch results when selected child changes
  useEffect(() => {
    if (!selectedChild) return

    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_URL}/api/parent/child/${selectedChild}/results`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()

        if (data.success) {
          setResults(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch results", error)
        toast.error("Failed to load exam results")
      }
    }
    fetchResults()
  }, [selectedChild])

  const getSelectedChildName = () => {
    const child = children.find(c => c._id === selectedChild)
    return child ? `${child.firstName} ${child.lastName}` : "Loading..."
  }

  // Calculate stats
  const averagePercentage = results.length > 0
    ? (results.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / results.length).toFixed(1)
    : "0"

  const latestResult = results.length > 0 ? results[0] : null
  const latestGrade = latestResult ? latestResult.grade : "-"

  const handleDownloadReport = () => {
    toast.success("Download Started", { description: `Generating report PDF...` })
  }

  return (
    <DashboardLayout title="Report">
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        {/* Header with Child Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Academic Report
            </h2>
            <p className="text-muted-foreground mt-1">
              View academic performance for {getSelectedChildName()}
            </p>
          </div>

          {children.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[180px] justify-between shadow-sm">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    {getSelectedChildName()}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {children.map(child => (
                  <DropdownMenuItem key={child._id} onClick={() => setSelectedChild(child._id)}>
                    {child.firstName} {child.lastName}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Latest Grade"
            value={latestGrade}
            icon={Award}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Avg Percentage"
            value={`${averagePercentage}%`}
            icon={TrendingUp}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Exams Taken"
            value={results.length.toString()}
            icon={FileText}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatCard // Placeholder for Rank since API doesn't compute it yet
            title="Class Rank"
            value="N/A"
            icon={Award}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Results List */}
          <div className="md:col-span-2">
            <Card className="border-none shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Recent Results
                    </CardTitle>
                    <CardDescription>Performance in recent examinations</CardDescription>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md" onClick={handleDownloadReport}>
                    <Download className="h-4 w-4 mr-1" />
                    Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No exam results found for this student.</div>
                  ) : (
                    results.map((result, index) => (
                      <div key={index} className="p-4 border rounded-xl hover:shadow-sm transition-all hover:bg-gray-50 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-bold text-gray-800">{result.examId?.examName || "Exam"}</p>
                            <p className="text-xs text-muted-foreground">{result.examId?.subject || "Subject"} - {new Date(result.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">{result.grade}</p>
                            <p className="text-sm text-gray-500">{result.obtainedMarks}/{result.totalMarks}</p>
                          </div>
                        </div>
                        <Progress value={result.percentage} className={`h-2 ${result.percentage >= 90 ? 'bg-green-100' : 'bg-blue-100'}`} />
                      </div>
                    ))
                  )}

                  {results.length > 0 && (
                    <div className="pt-4 border-t mt-4">
                      <div className="flex items-center justify-between p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div>
                          <p className="text-sm font-semibold text-blue-900">Performance Summary</p>
                          <p className="text-xs text-blue-700 mt-1">Based on {results.length} exams</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-blue-900">{averagePercentage}%</p>
                          <p className="text-sm font-medium text-blue-700">Average</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* History / Trends */}
          <div>
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  History
                </CardTitle>
                <CardDescription>Past performance trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.slice(0, 5).map((result, index) => (
                    <div key={index} className="p-4 border rounded-xl bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-700 line-clamp-1">{result.examId?.examName || "Exam"}</span>
                        <span className="text-lg font-bold text-purple-600">{result.grade}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Percentage</span>
                          <span>{result.percentage}%</span>
                        </div>
                        <Progress value={result.percentage} className="h-1.5 bg-purple-100" />
                      </div>
                    </div>
                  ))}

                  {results.length === 0 && <div className="text-center text-sm text-muted-foreground">No history available</div>}

                  <div className="pt-4 mt-2">
                    <div className="flex items-center gap-2 text-sm p-3 bg-green-50 text-green-700 rounded-lg">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-semibold">Track your progress</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 space-y-3">
              <Button className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex justify-between group" variant="outline">
                <span>Detailed Analysis</span>
                <Download className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
