"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
 
interface RemarkData {
  [studentId: string]: string
}

export default function PrimaryEvaluationEvaluationRemark() {
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [remarkData, setRemarkData] = useState<RemarkData>({})
  const { toast } = useToast()

  const [criteria, setCriteria] = useState({
    className: "",
    section: ""
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
      setStudents(response.students || [])
      
      const initialData: RemarkData = {}
      response.students?.forEach((student: Student) => {
        initialData[student._id] = ""
      })
      setRemarkData(initialData)

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
      const remarks = Object.entries(remarkData)
        .filter(([_, remark]) => remark.trim())
        .map(([studentId, remark]) => ({
          studentId,
          ...criteria,
          remark
        }))

      await api.post("/api/primary-evaluation/bulk", {
        classId: criteria.className,
        remarks
      })

      toast({
        title: "Success",
        description: "Remarks saved successfully"
      })
    } catch (error) {
      console.error("Failed to save remarks:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save remarks",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateRemark = (studentId: string, value: string) => {
    setRemarkData(prev => ({
      ...prev,
      [studentId]: value
    }))
  }

  return (
    <DashboardLayout title="Evaluation Remark">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Evaluation Remarks
            </h1>
            <p className="text-gray-500 mt-1">Add personalized remarks for each student</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border">
            <CalendarDays className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-600">Primary Evaluation</span>
            <span>/</span>
            <span className="text-gray-700">Evaluation Remark</span>
          </div>
        </div>

        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 border-0">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Search className="h-5 w-5" />
              </div>
              Select Class & Section
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 bg-gradient-to-br from-white to-gray-50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSearch}
                className="bg-blue-900 hover:bg-blue-800"
                disabled={loading}
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Loading..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {students.length > 0 && (
          <Card>
            <CardHeader className="bg-pink-50 border-b border-pink-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                  <ClipboardList className="h-5 w-5" />
                  Student Remarks ({students.length} students)
                </CardTitle>
                <Button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save All Remarks
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-pink-50">
                      <TableHead className="font-bold w-32">Student ID</TableHead>
                      <TableHead className="font-bold w-48">Name</TableHead>
                      <TableHead className="font-bold">Evaluation Remark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student, idx) => (
                      <TableRow key={student._id} className={idx % 2 === 1 ? "bg-blue-50/30" : undefined}>
                        <TableCell className="font-medium">{student.studentId}</TableCell>
                        <TableCell className="font-medium">{student.firstName} {student.lastName}</TableCell>
                        <TableCell>
                          <Textarea
                            className="min-h-[80px] bg-white border-gray-200 resize-none"
                            placeholder="Enter evaluation remark for this student..."
                            value={remarkData[student._id] || ""}
                            onChange={(e) => updateRemark(student._id, e.target.value)}
                          />
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
                <p className="text-sm">Select class and section, then click search to load students</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
