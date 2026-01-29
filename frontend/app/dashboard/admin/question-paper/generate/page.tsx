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
import { CalendarDays, ClipboardList, Download, Plus, Printer, Search, Copy, ChevronDown, Loader2, MoreVertical, FileText, Trash2, Eye } from "lucide-react"
import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

export default function QuestionPaperGenerate() {
  const { toast } = useToast()
  const [papers, setPapers] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    classId: "",
    subject: "",
    academicYear: ""
  })

  // New Paper State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    class: "", // classId in backend is 'class' field due to schema naming in questionPaperController
    subject: "",
    examType: "",
    duration: "", // minutes
    totalMarks: "",
    academicYear: new Date().getFullYear().toString()
  })

  useEffect(() => {
    fetchInitialData()
    fetchPapers()
  }, [])

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("token")
      const classesRes = await fetch(`${API_URL}/api/classes`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const classesData = await classesRes.json()
      if (Array.isArray(classesData)) setClasses(classesData)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchPapers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const params = new URLSearchParams()
      if (filters.subject) params.append("subject", filters.subject)
      // Note: Backend expects 'class' not 'classId' for paper query
      if (filters.classId) {
        // Find the class name to send, or if backend expects ID. 
        // Checking controller: query.class = className. It expects CLASS NAME or ID? 
        // The controller says: if (className) query.class = className;
        // The model likely stores class ID or Name. Usually IDs are better. 
        // Looking at controller create: paperData.class is required. 
        // Let's assume it stores ID now for better relation, but if it was legacy string, we might have issues.
        // I will send the selected value from dropdown.
        params.append("class", filters.classId)
      }

      const res = await fetch(`${API_URL}/api/question-papers?${params.toString()}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.papers) {
        setPapers(data.papers)
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load papers", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.title || !formData.class || !formData.subject || !formData.examType || !formData.totalMarks) {
      toast({ title: "Required", description: "Please fill all required fields", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/question-papers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (res.ok) {
        toast({ title: "Success", description: "Paper created successfully" })
        setIsDialogOpen(false)
        fetchPapers()
        setFormData({
          title: "",
          class: "",
          subject: "",
          examType: "",
          duration: "",
          totalMarks: "",
          academicYear: new Date().getFullYear().toString()
        })
      } else {
        toast({ title: "Error", description: data.error || "Failed to create paper", variant: "destructive" })
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
      const res = await fetch(`${API_URL}/api/question-papers/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        toast({ title: "Success", description: "Paper deleted" })
        fetchPapers()
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" })
    }
  }

  return (
    <DashboardLayout title="Generate Paper">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-end text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="text-blue-900">Question Paper</span>
            <span>/</span>
            <span>Paper List</span>
          </span>
        </div>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-100">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-lg flex items-center gap-2 text-teal-900">
                <Search className="h-5 w-5" />
                Filter Papers
              </CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-md">
                    <Plus className="h-4 w-4 mr-2" />
                    New Paper
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Generate New Question Paper</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input placeholder="e.g. Mid-Term Math Exam" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Class *</Label>
                        <Select value={formData.class} onValueChange={(v) => setFormData({ ...formData, class: v })}>
                          <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                          <SelectContent>
                            {classes.map(c => (
                              <SelectItem key={c._id} value={c._id}>{c.name}-{c.section}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Subject *</Label>
                        <Input placeholder="e.g. Mathematics" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Exam Type *</Label>
                        <Input placeholder="e.g. Quarterly" value={formData.examType} onChange={(e) => setFormData({ ...formData, examType: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Total Marks *</Label>
                        <Input type="number" value={formData.totalMarks} onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Duration (mins) *</Label>
                        <Input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Academic Year</Label>
                        <Input value={formData.academicYear} onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })} />
                      </div>
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="w-full mt-4 bg-teal-600 hover:bg-teal-700">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Create Paper Structure
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={filters.classId} onValueChange={(v) => setFilters({ ...filters, classId: v })}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {classes.map(c => (
                      <SelectItem key={c._id} value={c._id}>{c.name}-{c.section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={filters.subject} onChange={(e) => setFilters({ ...filters, subject: e.target.value })} className="bg-white" />
              </div>
              <div className="flex items-end">
                <Button onClick={fetchPapers} className="w-full bg-teal-600 hover:bg-teal-700">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
              <ClipboardList className="h-5 w-5 text-teal-500" />
              Question Paper List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/80">
                  <TableRow>
                    <TableHead className="font-bold text-gray-600 uppercase">Title</TableHead>
                    <TableHead className="font-bold text-gray-600 uppercase">Class</TableHead>
                    <TableHead className="font-bold text-gray-600 uppercase">Subject</TableHead>
                    <TableHead className="font-bold text-gray-600 uppercase">Exam Type</TableHead>
                    <TableHead className="font-bold text-gray-600 uppercase">Marks</TableHead>
                    <TableHead className="font-bold text-gray-600 uppercase">Duration</TableHead>
                    <TableHead className="font-bold text-gray-600 uppercase text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-500" />
                      </TableCell>
                    </TableRow>
                  ) : papers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground bg-gray-50/30">
                        No papers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    papers.map((row, idx) => (
                      <TableRow key={row._id} className="hover:bg-teal-50/30 transition-colors">
                        <TableCell className="font-medium text-gray-900">{row.title}</TableCell>
                        <TableCell>
                          {/* If class stored is ID, we might just show ID unless we populate. 
                                Controller doesn't populate 'class' field in basic query maybe? 
                                Actually model likely stores string if not Ref. 
                                Let's assume it might not be populated correctly if Schema was loose. 
                                But if I used ID from dropdown, it shows ID. 
                                Ideally I should find Class Name from 'classes' state map. 
                            */}
                          {classes.find(c => c._id === row.class)?.name || row.class}
                        </TableCell>
                        <TableCell>{row.subject}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{row.examType}</Badge>
                        </TableCell>
                        <TableCell>{row.totalMarks}</TableCell>
                        <TableCell>{row.duration} mins</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-teal-600">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="h-4 w-4 mr-2" /> View Questions
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer" onClick={() => handleDelete(row._id)}>
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

