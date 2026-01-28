"use client"

import { useState } from "react"
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
import { CalendarDays, Search, Save, ClipboardList, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

interface Student {
  _id: string
  firstName: string
  lastName: string
  studentId: string
}

interface AssessmentData {
  [studentId: string]: {
    reading: string
    writing: string
    speaking: string
    listening: string
    grade: string
  }
}

export default function PrimaryEvaluationAssessment() {
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({})
  const { toast } = useToast()

  const [criteria, setCriteria] = useState({
    className: "",
    section: "",
    subject: "",
    term: ""
  })

  const handleSearch = async () => {
    if (!criteria.className || !criteria.section || !criteria.subject) {
      toast({
        title: "Validation Error",
        description: "Please select class, section, and subject",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Fetch students based on criteria
      const params = new URLSearchParams({
        class: criteria.className,
        section: criteria.section
      })
      const response = await api.get<{ students: Student[] }>(`/api/students?${params.toString()}`)
      setStudents(response.students || [])
      
      // Initialize assessment data
      const initialData: AssessmentData = {}
      response.students?.forEach((student: Student) => {
        initialData[student._id] = {
          reading: "",
          writing: "",
          speaking: "",
          listening: "",
          grade: ""
        }
      })
      setAssessmentData(initialData)

      toast({
        title: "Success",
        description: `Found ${response.students?.length || 0} students`
      })
    } catch (error) {
      console.error("Failed to fetch students:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load students",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const evaluations = Object.entries(assessmentData).map(([studentId, data]) => ({
        studentId,
        ...criteria,
        skills: [
          { name: "Reading", rating: data.reading },
          { name: "Writing", rating: data.writing },
          { name: "Speaking", rating: data.speaking },
          { name: "Listening", rating: data.listening }
        ],
        overallGrade: data.grade
      }))

      await api.post("/api/primary-evaluation/bulk", {
        classId: criteria.className,
        subject: criteria.subject,
        term: criteria.term,
        evaluations
      })

      toast({
        title: "Success",
        description: "Assessments saved successfully"
      })
    } catch (error) {
      console.error("Failed to save assessments:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save assessments",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateAssessment = (studentId: string, field: string, value: string) => {
    setAssessmentData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }))
  }

  const grades = ["A+", "A", "B+", "B", "C+", "C", "D", "E"]
  const ratings = ["Excellent", "Very Good", "Good", "Satisfactory", "Needs Improvement"]

  return (
    <DashboardLayout title="Assessment">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Student Assessment
            </h1>
            <p className="text-gray-500 mt-1">Evaluate student skills and performance</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border">
            <CalendarDays className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-600">Primary Evaluation</span>
            <span>/</span>
            <span className="text-gray-700">Assessment</span>
          </div>
        </div>

        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 border-0">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Search className="h-5 w-5" />
              </div>
              Select Criteria to Load Students
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 bg-gradient-to-br from-white to-gray-50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <Label className="text-red-500">Subject *</Label>
                <Select
                  value={criteria.subject}
                  onValueChange={(value) => setCriteria({ ...criteria, subject: value })}
                >
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {["English", "Hindi", "Mathematics", "Science", "Social Studies", "EVS"].map(sub => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Term</Label>
                <Select
                  value={criteria.term}
                  onValueChange={(value) => setCriteria({ ...criteria, term: value })}
                >
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Term 1">Term 1</SelectItem>
                    <SelectItem value="Term 2">Term 2</SelectItem>
                    <SelectItem value="Final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSearch}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all"
                disabled={loading}
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? (
                  <><span className="animate-spin mr-2">⏳</span> Loading...</>
                ) : (
                  "🔍 Search Students"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {students.length > 0 && (
          <Card className="border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 border-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div>
                    <div>Student Assessment Form</div>
                    <div className="text-sm font-normal text-white/80">{students.length} students loaded</div>
                  </div>
                </CardTitle>
                <Button
                  onClick={handleSave}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-0 shadow-lg"
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "💾 Save All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 bg-gradient-to-br from-white to-gray-50">
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-pink-50">
                      <TableHead className="font-bold">Student ID</TableHead>
                      <TableHead className="font-bold">Name</TableHead>
                      <TableHead className="font-bold">Reading</TableHead>
                      <TableHead className="font-bold">Writing</TableHead>
                      <TableHead className="font-bold">Speaking</TableHead>
                      <TableHead className="font-bold">Listening</TableHead>
                      <TableHead className="font-bold">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student, idx) => (
                      <TableRow key={student._id} className={idx % 2 === 1 ? "bg-blue-50/30" : undefined}>
                        <TableCell className="font-medium">{student.studentId}</TableCell>
                        <TableCell>{student.firstName} {student.lastName}</TableCell>
                        <TableCell>
                          <Select
                            value={assessmentData[student._id]?.reading || ""}
                            onValueChange={(value) => updateAssessment(student._id, "reading", value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {ratings.map(r => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={assessmentData[student._id]?.writing || ""}
                            onValueChange={(value) => updateAssessment(student._id, "writing", value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {ratings.map(r => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={assessmentData[student._id]?.speaking || ""}
                            onValueChange={(value) => updateAssessment(student._id, "speaking", value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {ratings.map(r => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={assessmentData[student._id]?.listening || ""}
                            onValueChange={(value) => updateAssessment(student._id, "listening", value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {ratings.map(r => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={assessmentData[student._id]?.grade || ""}
                            onValueChange={(value) => updateAssessment(student._id, "grade", value)}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Grade" />
                            </SelectTrigger>
                            <SelectContent>
                              {grades.map(g => (
                                <SelectItem key={g} value={g}>{g}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && students.length === 0 && (
          <Card>
            <CardContent className="py-16">
              <div className="text-center text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No students found</p>
                <p className="text-sm">Select criteria and click search to load students</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
