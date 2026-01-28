"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart2, Filter, Loader2, Download, Search } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "@/components/ui/use-toast"

export default function ExamReports() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterClass, setFilterClass] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/quiz`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        const quizzes = data.quizzes || []

        // Calculate report data from quizzes
        const calculatedReports = quizzes.map((quiz: any) => {
          const attempts = quiz.attempts || []
          const totalAttempts = attempts.length

          if (totalAttempts === 0) {
            return {
              id: quiz._id,
              exam: quiz.title,
              class: quiz.classId?.name || 'N/A',
              subject: quiz.subject,
              avg: 0,
              highest: 0,
              attempts: 0
            }
          }

          const scores = attempts.map((a: any) => a.percentage || 0)
          const highest = Math.max(...scores)
          const sum = scores.reduce((a: number, b: number) => a + b, 0)
          const avg = sum / totalAttempts

          return {
            id: quiz._id,
            exam: quiz.title,
            class: quiz.classId?.name || 'N/A',
            subject: quiz.subject,
            avg: avg.toFixed(1),
            highest: highest.toFixed(1),
            attempts: totalAttempts
          }
        })

        setReports(calculatedReports)
      }
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to load reports", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.exam?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesClass = filterClass === "all" || !filterClass ||
      (report.class && report.class.includes(filterClass)) // Simple match since class name might vary
    return matchesSearch && matchesClass
  })

  return (
    <DashboardLayout title="Exam Reports">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Exam Reports</h2>
            <p className="text-muted-foreground mt-1">Analyze exam performance and statistics.</p>
          </div>
        </div>

        <Card className="border-gray-100 shadow-md bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
              <Filter className="h-5 w-5 text-blue-600" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-gray-700 font-medium">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search by exam or subject..."
                    className="pl-9 bg-white border-gray-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Class</Label>
                <Select onValueChange={setFilterClass} value={filterClass}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="All classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="1">Class 1</SelectItem>
                    <SelectItem value="2">Class 2</SelectItem>
                    <SelectItem value="10">Class 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex items-end">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={fetchReports}>
                  Generate Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-md bg-white overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row justify-between items-center">
            <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-emerald-600" />
              Performance Summary
            </CardTitle>
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">Exam</TableHead>
                    <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                    <TableHead className="font-semibold text-gray-700">Class</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Avg Score</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Highest</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Attempts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                        <p className="mt-2 text-sm text-gray-500">Calculating reports...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        No reports found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReports.map((row) => (
                      <TableRow key={row.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-900">{row.exam}</TableCell>
                        <TableCell>{row.subject}</TableCell>
                        <TableCell>{row.class}</TableCell>
                        <TableCell className="text-right font-medium">{row.avg}%</TableCell>
                        <TableCell className="text-right text-emerald-600">{row.highest}%</TableCell>
                        <TableCell className="text-right">{row.attempts}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

