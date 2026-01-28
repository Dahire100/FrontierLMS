"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BookOpen, CheckCircle, Clock, Plus, Filter, Search, MoreHorizontal, Loader2, Trash2, Edit2, AlertTriangle } from "lucide-react"

interface Assignment {
  _id: string;
  title: string;
  classId: {
    _id: string;
    name: string;
    section: string;
  };
  subject: string;
  assignedDate: string;
  dueDate: string;
  totalMarks: number;
  description: string;
  status: string;
  attachments?: { filename: string; url: string; uploadedAt: string }[];
  submissions: any[];
}

interface ClassItem {
  _id: string;
  name: string;
  section: string;
}

export default function TeacherHomework() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    classId: "",
    subject: "",
    dueDate: "",
    totalMarks: "100",
    description: "",
    attachments: [] as { filename: string; url: string; uploadedAt: string }[],
    assignedDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const [hwRes, classRes] = await Promise.all([
        fetch(`${API_URL}/api/teacher/homework`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/teacher/classes`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ])

      const hwResult = await hwRes.json()
      const classResult = await classRes.json()

      if (hwResult.success) setAssignments(hwResult.data)
      if (classResult.success) setClasses(classResult.data)
    } catch (err) {
      console.error("Error fetching homework data:", err)
      toast({ title: "Error", description: "Failed to load homework", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      classId: "",
      subject: "",
      dueDate: "",
      totalMarks: "100",
      description: "",
      attachments: [],
      assignedDate: new Date().toISOString().split('T')[0]
    })
    setIsEditing(false)
    setCurrentAssignment(null)
  }

  const handleOpenCreate = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (assignment: Assignment) => {
    setIsEditing(true)
    setCurrentAssignment(assignment)
    setFormData({
      title: assignment.title,
      classId: assignment.classId?._id || "",
      subject: assignment.subject,
      dueDate: assignment.dueDate ? assignment.dueDate.split('T')[0] : "",
      totalMarks: assignment.totalMarks.toString(),
      description: assignment.description || "",
      attachments: assignment.attachments || [],
      assignedDate: assignment.assignedDate ? assignment.assignedDate.split('T')[0] : new Date().toISOString().split('T')[0]
    })
    setIsDialogOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          attachments: [{
            filename: file.name,
            url: reader.result as string,
            uploadedAt: new Date().toISOString()
          }]
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/homework/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (response.ok) {
        setAssignments(assignments.filter(a => a._id !== id))
        toast({ title: "Deleted", description: "Assignment removed successfully" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete assignment", variant: "destructive" })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const url = isEditing
        ? `${API_URL}/api/homework/${currentAssignment?._id}`
        : `${API_URL}/api/homework`

      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      if (result.success) {
        toast({
          title: isEditing ? "Updated" : "Created",
          description: `Assignment ${isEditing ? "updated" : "assigned"} successfully`,
          className: "bg-green-50 border-green-200 text-green-800"
        })
        fetchInitialData()
        setIsDialogOpen(false)
      } else {
        throw new Error(result.error || "Failed to save")
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const totalAssignments = assignments.length
  const activeAssignments = assignments.filter(a => a.status === "active").length
  const totalSubmissions = assignments.reduce((sum, a) => sum + (a.submissions?.length || 0), 0)
  const totalPendingGrading = assignments.reduce((sum, a) =>
    sum + (a.submissions?.filter((s: any) => s.status === 'submitted').length || 0), 0
  )

  return (
    <DashboardLayout title="Homework Management">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Homework & Classwork</h2>
            <p className="text-muted-foreground font-medium mt-1">Design assignments and monitor student academic progress.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-bold" onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Assign New Work
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">{isEditing ? "Modify Assignment" : "New Assignment"}</DialogTitle>
                <DialogDescription className="font-medium text-gray-500">Provide clear instructions and deadlines for your students.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-12 gap-6 py-4">
                <div className="col-span-12 md:col-span-4 space-y-2">
                  <Label className="font-bold text-gray-700">Target Class</Label>
                  <Select value={formData.classId} onValueChange={(val) => setFormData({ ...formData, classId: val })}>
                    <SelectTrigger className="h-12"><SelectValue placeholder="Select Class" /></SelectTrigger>
                    <SelectContent>
                      {classes.map(c => (
                        <SelectItem key={c._id} value={c._id}>Class {c.name} - {c.section}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-12 md:col-span-4 space-y-2">
                  <Label className="font-bold text-gray-700">Subject Area</Label>
                  <Input
                    placeholder="e.g. Mathematics"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div className="col-span-12 md:col-span-4 space-y-2">
                  <Label className="font-bold text-gray-700">Weightage (Points)</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div className="col-span-12 space-y-2">
                  <Label className="font-bold text-gray-700">Assignment Title</Label>
                  <Input
                    placeholder="e.g. Quadratic Equations Practice"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-12 font-bold"
                  />
                </div>

                <div className="col-span-12 md:col-span-6 space-y-2">
                  <Label className="font-bold text-gray-700">Assign Date</Label>
                  <Input
                    type="date"
                    value={formData.assignedDate}
                    onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div className="col-span-12 md:col-span-6 space-y-2">
                  <Label className="font-bold text-gray-700">Due Date</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div className="col-span-12 space-y-2">
                  <Label className="font-bold text-gray-700">Attach Materials (PDF, IMG)</Label>
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {formData.attachments.length > 0 && (
                    <p className="text-xs text-emerald-600 font-bold mt-1">File attached: {formData.attachments[0].filename}</p>
                  )}
                </div>

                <div className="col-span-12 space-y-2">
                  <Label className="font-bold text-gray-700">Instructions & Resources</Label>
                  <Textarea
                    placeholder="Describe the assignment in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[120px] resize-none"
                  />
                </div>
              </div>
              <DialogFooter className="border-t pt-6">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="font-bold text-gray-500">Discard</Button>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 font-black px-8"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="animate-spin h-4 w-4" /> : isEditing ? "Save Changes" : "Assign Now"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Assigned" value={totalAssignments.toString()} icon={BookOpen} iconColor="text-indigo-600" iconBgColor="bg-indigo-50" />
          <StatCard title="Active Work" value={activeAssignments.toString()} icon={Clock} iconColor="text-blue-600" iconBgColor="bg-blue-50" />
          <StatCard title="Submissions" value={totalSubmissions.toString()} icon={CheckCircle} iconColor="text-emerald-600" iconBgColor="bg-emerald-50" />
          <StatCard title="To Grade" value={totalPendingGrading.toString()} icon={AlertTriangle} iconColor="text-orange-600" iconBgColor="bg-orange-50" />
        </div>

        <Card className="border-none shadow-2xl shadow-indigo-100/30 overflow-hidden ring-1 ring-gray-100">
          <CardHeader className="bg-gray-50/50 border-b py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 font-black text-gray-800">
                  <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  Assignment Roster
                </CardTitle>
                <CardDescription className="font-medium">Curated list of all assignments assigned to classes</CardDescription>
              </div>
              <div className="w-full sm:w-80 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search assignments..." className="pl-10 h-11 bg-white border-gray-200 rounded-xl shadow-sm" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-20 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto mb-4" />
                <p className="text-muted-foreground font-black text-sm uppercase tracking-widest">Compiling assignment history...</p>
              </div>
            ) : assignments.length > 0 ? (
              <div className="divide-y divide-gray-100 bg-white">
                {assignments.map((assignment) => (
                  <div key={assignment._id} className="p-6 hover:bg-indigo-50/20 transition-all group">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex gap-5">
                        <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <BookOpen className="h-7 w-7" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-xl text-gray-900 group-hover:text-indigo-600 transition-colors">{assignment.title}</h4>
                            <Badge className={assignment.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}>
                              {assignment.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-500">
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">Class {assignment.classId?.name}-{assignment.classId?.section}</span>
                            <span className="capitalize">{assignment.subject}</span>
                            <span className="flex items-center gap-1.5 text-gray-500 font-bold">
                              <span className="text-xs uppercase tracking-wider text-gray-400">Issued:</span>
                              {assignment.assignedDate ? new Date(assignment.assignedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                            </span>
                            <span className="flex items-center gap-1.5 text-rose-600 font-black">
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(assignment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <div className="text-right hidden sm:block min-w-[120px]">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Submission Rate</p>
                          <div className="flex items-center gap-2">
                            <Progress value={((assignment.submissions?.length || 0) / 40) * 100} className="h-2 w-24" />
                            <span className="text-sm font-black text-gray-700">{assignment.submissions?.length || 0}/40</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="ghost" className="h-10 w-10 text-indigo-600 hover:bg-indigo-50" onClick={() => handleOpenEdit(assignment)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-10 w-10 text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(assignment._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button className="bg-gray-900 hover:bg-black text-white px-6 font-bold h-10 shadow-lg">Grade Subs</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center space-y-4">
                <p className="text-xl font-black text-gray-300 uppercase tracking-widest">No Assignments Published</p>
                <Button onClick={handleOpenCreate} variant="outline" className="border-2 border-dashed border-gray-200 text-gray-400 hover:border-indigo-200 hover:text-indigo-600 px-8">
                  Assign Your First Work
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${className}`}>
      {children}
    </span>
  )
}



