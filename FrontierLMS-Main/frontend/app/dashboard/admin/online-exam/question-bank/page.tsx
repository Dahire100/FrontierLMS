"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  FileQuestion,
  Plus,
  Search,
  BookOpen,
  Filter,
  Eye,
  Trash2,
  FileText,
  Loader2,
  Save
} from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

export default function QuestionBank() {
  const [papers, setPapers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterClass, setFilterClass] = useState("all")
  const [filterExamType, setFilterExamType] = useState("all")

  const [form, setForm] = useState({
    title: "",
    subject: "",
    class: "",
    examType: "unit-test",
    duration: "60",
    totalMarks: "100",
    academicYear: new Date().getFullYear().toString(),
    instructions: ""
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchPapers()
  }, [])

  const fetchPapers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/question-papers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const result = await response.json()
        // Support both {data: []} and direct [] responses
        const papersData = Array.isArray(result) ? result : (result.data && Array.isArray(result.data) ? result.data : [])
        setPapers(papersData)
      }
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to fetch question papers", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/question-papers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        toast({ title: "Success", description: "Question Paper Draft Created" })
        fetchPapers()
        setShowForm(false)
        setForm({
          title: "",
          subject: "",
          class: "",
          examType: "unit-test",
          duration: "60",
          totalMarks: "100",
          academicYear: new Date().getFullYear().toString(),
          instructions: ""
        })
      } else {
        const err = await response.json()
        toast({ title: "Error", description: err.error || "Failed to create paper", variant: "destructive" })
      }
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredPapers = papers.filter(paper => {
    const matchesSearch = paper.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesClass = !filterClass || filterClass === "all" || paper.class === filterClass
    const matchesExamType = !filterExamType || filterExamType === "all" || paper.examType === filterExamType
    return matchesSearch && matchesClass && matchesExamType
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question paper?")) return
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/question-papers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        toast({ title: "Success", description: "Paper deleted" })
        setPapers(papers.filter(p => p._id !== id))
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <DashboardLayout title="Question Bank">
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-end text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <FileQuestion className="h-4 w-4" />
            <span className="text-blue-900">Online Exam</span>
            <span>/</span>
            <span>Question Bank</span>
          </span>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Question Bank</h2>
            <p className="text-muted-foreground mt-1">Manage question papers and repositories.</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md">
            {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Create Paper</>}
          </Button>
        </div>

        {showForm && (
          <Card className="border-gray-100 shadow-md bg-white/50 backdrop-blur-sm animate-in slide-in-from-top-4">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-800">
                <FileText className="h-5 w-5 text-blue-600" />
                New Question Paper
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Paper Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Mid Term Mathematics"
                    className="bg-white border-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Subject *</Label>
                  <Input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. Mathematics"
                    className="bg-white border-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Class *</Label>
                  <Select onValueChange={(val) => setForm({ ...form, class: val })}>
                    <SelectTrigger className="bg-white border-gray-200">
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
                  <Label className="text-gray-700 font-medium">Exam Type *</Label>
                  <Select onValueChange={(val) => setForm({ ...form, examType: val })} defaultValue="unit-test">
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unit-test">Unit Test</SelectItem>
                      <SelectItem value="half-yearly">Half Yearly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="practice">Practice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Duration (mins) *</Label>
                  <Input
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    type="number"
                    className="bg-white border-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Total Marks *</Label>
                  <Input
                    value={form.totalMarks}
                    onChange={(e) => setForm({ ...form, totalMarks: e.target.value })}
                    type="number"
                    className="bg-white border-gray-200"
                    required
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 shadow-sm px-8">
                    {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Create Paper
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6">
          <Card className="border-gray-100 shadow-md bg-white overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-lg font-medium text-gray-800">All Question Papers</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search by title or subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white"
                  />
                </div>
                <Select value={filterClass} onValueChange={setFilterClass}>
                  <SelectTrigger className="bg-white w-full sm:w-40">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="1">Class 1</SelectItem>
                    <SelectItem value="2">Class 2</SelectItem>
                    <SelectItem value="10">Class 10</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterExamType} onValueChange={setFilterExamType}>
                  <SelectTrigger className="bg-white w-full sm:w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="unit-test">Unit Test</SelectItem>
                    <SelectItem value="half-yearly">Half Yearly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="practice">Practice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">Title</TableHead>
                    <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                    <TableHead className="font-semibold text-gray-700">Class</TableHead>
                    <TableHead className="font-semibold text-gray-700">Type</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8"><Loader2 className="mx-auto animate-spin" /></TableCell>
                    </TableRow>
                  ) : filteredPapers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No question papers found.</TableCell>
                    </TableRow>
                  ) : (
                    filteredPapers.map((paper) => (
                      <TableRow key={paper._id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-500" />
                            {paper.title}
                          </div>
                        </TableCell>
                        <TableCell>{paper.subject}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-gray-50">{paper.class}</Badge>
                        </TableCell>
                        <TableCell className="capitalize text-gray-600">{paper.examType}</TableCell>
                        <TableCell>
                          <Badge className={
                            paper.status === 'published' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                              paper.status === 'approved' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          }>
                            {paper.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:bg-gray-100">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(paper._id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

