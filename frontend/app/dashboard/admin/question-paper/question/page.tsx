"use client"

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CalendarDays, ChevronDown, ClipboardList, Copy, Download, Loader2, MoreVertical, Pencil, Plus, Printer, Search, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

export default function QuestionPaperQuestion() {
  const { toast } = useToast()
  const [questions, setQuestions] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [types, setTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    classId: "",
    subject: "",
    section: ""
  })

  // Edit/Add state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [formData, setFormData] = useState({
    question: "",
    classId: "",
    subject: "",
    questionType: "",
    level: "medium",
    marks: "1"
  })

  useEffect(() => {
    fetchInitialData()
    fetchQuestions()
  }, [])

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("token")
      const [classesRes, typesRes] = await Promise.all([
        fetch(`${API_URL}/api/classes`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_URL}/api/question-types`, { headers: { "Authorization": `Bearer ${token}` } })
      ])

      const classesData = await classesRes.json()
      const typesData = await typesRes.json()

      if (classesData?.[0] || Array.isArray(classesData)) setClasses(Array.isArray(classesData) ? classesData : [])
      if (typesData.success) setTypes(typesData.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const params = new URLSearchParams()
      if (filters.classId) params.append("classId", filters.classId)
      if (filters.subject) params.append("subject", filters.subject)

      const res = await fetch(`${API_URL}/api/question-bank?${params.toString()}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setQuestions(data.data)
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch questions", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.question || !formData.classId || !formData.subject || !formData.questionType) {
      toast({ title: "Required", description: "Please fill all required fields", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const url = currentQuestion
        ? `${API_URL}/api/question-bank/${currentQuestion._id}`
        : `${API_URL}/api/question-bank`

      const method = currentQuestion ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast({ title: "Success", description: "Question saved successfully" })
        setIsDialogOpen(false)
        fetchQuestions()
        setFormData({
          question: "",
          classId: "",
          subject: "",
          questionType: "",
          level: "medium",
          marks: "1"
        })
        setCurrentQuestion(null)
      } else {
        toast({ title: "Error", description: data.error || "Failed to save", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/question-bank/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        toast({ title: "Deleted", description: "Question removed" })
        fetchQuestions()
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" })
    }
  }

  const openEdit = (q: any) => {
    setCurrentQuestion(q)
    setFormData({
      question: q.question,
      classId: q.classId?._id || q.classId,
      subject: q.subject,
      questionType: q.questionType?._id || q.questionType,
      level: q.level || "medium",
      marks: q.marks?.toString() || "1"
    })
    setIsDialogOpen(true)
  }

  return (
    <DashboardLayout title="Question Bank">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-end text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="text-blue-900">Question Paper</span>
            <span>/</span>
            <span>Question Bank</span>
          </span>
        </div>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
                <Search className="h-5 w-5" />
                Filter Questions
              </CardTitle>
              <div className="flex items-center gap-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setCurrentQuestion(null); setFormData({ question: "", classId: "", subject: "", questionType: "", level: "medium", marks: "1" }) }} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{currentQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Class *</Label>
                          <Select value={formData.classId} onValueChange={(v) => setFormData({ ...formData, classId: v })}>
                            <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                            <SelectContent>
                              {classes.map((c) => (
                                <SelectItem key={c._id} value={c._id}>{c.name}-{c.section}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Subject *</Label>
                          <Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="e.g. Science" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Question Type *</Label>
                        <Select value={formData.questionType} onValueChange={(v) => setFormData({ ...formData, questionType: v })}>
                          <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                          <SelectContent>
                            {types.map((t) => (
                              <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Question *</Label>
                        <Input value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} placeholder="Enter question text" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Level</Label>
                          <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                            <SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Marks</Label>
                          <Input type="number" value={formData.marks} onChange={(e) => setFormData({ ...formData, marks: e.target.value })} />
                        </div>
                      </div>

                      <Button onClick={handleSave} disabled={saving} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save Question
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={filters.classId} onValueChange={(v) => setFilters({ ...filters, classId: v })}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="All Classes" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((c) => (
                      <SelectItem key={c._id} value={c._id}>{c.name}-{c.section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={filters.subject} onChange={(e) => setFilters({ ...filters, subject: e.target.value })} placeholder="Filter by subject" className="bg-white" />
              </div>

              <div className="flex items-end">
                <Button onClick={fetchQuestions} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <ClipboardList className="h-5 w-5 text-indigo-500" />
                Question List
              </CardTitle>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">{questions.length} Questions</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/80">
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead className="font-bold text-gray-600">QUESTION</TableHead>
                    <TableHead className="font-bold text-gray-600">CLASS</TableHead>
                    <TableHead className="font-bold text-gray-600">SUBJECT</TableHead>
                    <TableHead className="font-bold text-gray-600">TYPE</TableHead>
                    <TableHead className="font-bold text-gray-600">LEVEL</TableHead>
                    <TableHead className="font-bold text-gray-600">MARKS</TableHead>
                    <TableHead className="font-bold text-gray-600 text-right">ACTION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" />
                      </TableCell>
                    </TableRow>
                  ) : questions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground bg-gray-50/30">
                        No questions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    questions.map((q, idx) => (
                      <TableRow key={q._id} className="hover:bg-indigo-50/30 transition-colors">
                        <TableCell className="text-center text-gray-500">{idx + 1}</TableCell>
                        <TableCell className="font-medium text-gray-900 max-w-md truncate" title={q.question}>{q.question}</TableCell>
                        <TableCell>{q.classId ? `${q.classId.name}-${q.classId.section}` : '-'}</TableCell>
                        <TableCell>{q.subject}</TableCell>
                        <TableCell>{q.questionType?.name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            q.level === 'easy' ? 'text-green-600 border-green-200 bg-green-50' :
                              q.level === 'medium' ? 'text-blue-600 border-blue-200 bg-blue-50' :
                                'text-red-600 border-red-200 bg-red-50'
                          }>
                            {q.level}
                          </Badge>
                        </TableCell>
                        <TableCell>{q.marks}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(q)} className="cursor-pointer">
                                <Pencil className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(q._id)} className="text-rose-600 cursor-pointer">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
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

