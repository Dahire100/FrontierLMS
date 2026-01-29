"use client"

import { useState, useEffect } from "react"
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
import { Search, Download, User, Loader2 } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { useToast } from "@/components/ui/use-toast"

export default function AdmitCard() {
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(false)
  const [exams, setExams] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [filters, setFilters] = useState({
    examName: "",
    class: "",
    section: ""
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/exams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        // Extract unique exam names
        const uniqueParams = Array.from(new Set(data.map((e: any) => e.examName)))
        setExams(uniqueParams.map(name => ({ examName: name })))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleSearch = async () => {
    if (!filters.examName || !filters.class) {
      toast({ title: "Error", description: "Please select Exam and Class", variant: "destructive" })
      return
    }

    setLoading(true)
    setShowResult(false)
    try {
      const token = localStorage.getItem('token')
      const query = new URLSearchParams({
        examName: filters.examName,
        class: filters.class,
        ...(filters.section && { section: filters.section })
      })

      const response = await fetch(`${API_URL}/api/exams/admit-cards?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
        setShowResult(true)
        if (data.students?.length === 0) {
          toast({ title: "Info", description: "No students found for criteria", variant: "default" })
        }
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.error || "Failed to fetch admit cards", variant: "destructive" })
      }
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Admit Card">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Admit Card Generation</h2>
            <p className="text-muted-foreground mt-1">Generate and print student admit cards for examinations.</p>
          </div>
        </div>

        <Card className="border-gray-100 shadow-md bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-800">
              <Search className="h-5 w-5 text-blue-600" />
              Select Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Exam <span className="text-red-500">*</span></Label>
                <Select onValueChange={(val) => setFilters({ ...filters, examName: val })}>
                  <SelectTrigger className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-100">
                    <SelectValue placeholder="Select Exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((exam, i) => (
                      <SelectItem key={i} value={exam.examName}>{exam.examName}</SelectItem>
                    ))}
                    {exams.length === 0 && <SelectItem value="disabled" disabled>No exams found</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Class <span className="text-red-500">*</span></Label>
                <Select onValueChange={(val) => setFilters({ ...filters, class: val })}>
                  <SelectTrigger className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-100">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Class 1</SelectItem>
                    <SelectItem value="2">Class 2</SelectItem>
                    <SelectItem value="10">Class 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Section</Label>
                <Select onValueChange={(val) => setFilters({ ...filters, section: val })}>
                  <SelectTrigger className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-100">
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSearch} disabled={loading} className="bg-blue-600 hover:bg-blue-700 shadow-sm px-8">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {showResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {students.map((student, i) => (
              <Card key={i} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 overflow-hidden">
                        {student.profilePicture ? (
                          <img src={student.profilePicture} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{student.firstName} {student.lastName}</h3>
                        <p className="text-sm text-gray-500">{student.studentId}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Class:</span>
                      <span className="font-medium text-gray-900">{student.class}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Section:</span>
                      <span className="font-medium text-gray-900">{student.section}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Roll No:</span>
                      <span className="font-medium text-gray-900">{student.rollNumber}</span>
                    </div>
                  </div>

                  <Button className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                    <Download className="w-4 h-4 mr-2" />
                    Download Admit Card
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
