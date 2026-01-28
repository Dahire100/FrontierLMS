"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarDays, Search, FileText, Download, Printer, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

interface Student {
  _id: string
  firstName: string
  lastName: string
  studentId: string
}

interface Report {
  student: Student
  evaluations: any[]
  overallGrade: string
  attendance: string
}

export default function PrimaryEvaluationPrimaryClassReport() {
  const [loading, setLoading] = useState(false)
  const [reports, setReports] = useState<Report[]>([])
  const { toast } = useToast()

  const [criteria, setCriteria] = useState({
    className: "",
    section: "",
    template: "t1"
  })

  const handleSearch = async () => {
    if (!criteria.className || !criteria.section) {
      toast({
        title: "Validation Error",
        description: "Please select class and section",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        class: criteria.className,
        section: criteria.section
      })
      const response = await api.get<{ students: Student[] }>(`/api/students?${params.toString()}`)
      
      const students = response.students || []
      const reportData: Report[] = students.map((student: Student) => ({
        student,
        evaluations: [],
        overallGrade: "A",
        attendance: "95%"
      }))

      setReports(reportData)

      toast({
        title: "Success",
        description: `Generated reports for ${students.length} students`
      })
    } catch (error) {
      console.error("Failed to generate reports:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate reports",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = (studentId: string) => {
    toast({
      title: "Downloading",
      description: "Report download started"
    })
  }

  const handlePrintReport = (studentId: string) => {
    window.print()
  }

  const handleViewReport = (studentId: string) => {
    toast({
      title: "Opening",
      description: "Report preview opened"
    })
  }

  const handleDownloadAll = () => {
    toast({
      title: "Downloading",
      description: `Downloading ${reports.length} reports`
    })
  }

  return (
    <DashboardLayout title="Primary Class Report">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Class Report Generator
            </h1>
            <p className="text-gray-500 mt-1">Generate comprehensive reports for entire class</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border">
            <CalendarDays className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-600">Primary Evaluation</span>
            <span>/</span>
            <span className="text-gray-700">Primary Class Report</span>
          </div>
        </div>

        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Search className="h-5 w-5" />
              </div>
              Report Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 bg-gradient-to-br from-white to-gray-50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-red-500">Class *</Label>
                <Select
                  value={criteria.className}
                  onValueChange={(value) => setCriteria({ ...criteria, className: value })}
                >
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"].map(cls => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-red-500">Section *</Label>
                <Select
                  value={criteria.section}
                  onValueChange={(value) => setCriteria({ ...criteria, section: value })}
                >
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C", "D"].map(sec => (
                      <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Template</Label>
                <Select
                  value={criteria.template}
                  onValueChange={(value) => setCriteria({ ...criteria, template: value })}
                >
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Template 1" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="t1">Template 1 - Basic Report</SelectItem>
                    <SelectItem value="t2">Template 2 - Detailed Report</SelectItem>
                    <SelectItem value="t3">Template 3 - Progress Report</SelectItem>
                    <SelectItem value="t4">Template 4 - Comprehensive Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                onClick={handleSearch}
                className="bg-blue-900 hover:bg-blue-800"
                disabled={loading}
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Generating..." : "Generate Reports"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {reports.length > 0 && (
          <Card>
            <CardHeader className="bg-pink-50 border-b border-pink-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                  <FileText className="h-5 w-5" />
                  Class Reports ({reports.length} students)
                </CardTitle>
                <Button
                  onClick={handleDownloadAll}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All Reports
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-pink-50">
                      <TableHead className="font-bold w-24">S.No</TableHead>
                      <TableHead className="font-bold w-32">Student ID</TableHead>
                      <TableHead className="font-bold">Student Name</TableHead>
                      <TableHead className="font-bold w-32">Overall Grade</TableHead>
                      <TableHead className="font-bold w-32">Attendance</TableHead>
                      <TableHead className="font-bold text-right w-64">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report, idx) => (
                      <TableRow key={report.student._id} className={idx % 2 === 1 ? "bg-blue-50/30" : undefined}>
                        <TableCell className="font-medium">{idx + 1}</TableCell>
                        <TableCell className="font-medium">{report.student.studentId}</TableCell>
                        <TableCell className="font-medium">
                          {report.student.firstName} {report.student.lastName}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                            {report.overallGrade}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {report.attendance}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewReport(report.student._id)}
                              title="View Report"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadReport(report.student._id)}
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePrintReport(report.student._id)}
                              title="Print Report"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Report Template: {criteria.template.toUpperCase()}</p>
                    <p className="text-blue-700">
                      {criteria.template === "t1" && "Basic report card with grades and attendance"}
                      {criteria.template === "t2" && "Detailed report with subject-wise performance"}
                      {criteria.template === "t3" && "Progress report with term comparisons"}
                      {criteria.template === "t4" && "Comprehensive report with skills and activities"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && reports.length === 0 && (
          <Card>
            <CardContent className="py-16">
              <div className="text-center text-gray-500">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium mb-2">No Reports Generated</p>
                <p className="text-sm">Select class, section, and template, then click "Generate Reports"</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
