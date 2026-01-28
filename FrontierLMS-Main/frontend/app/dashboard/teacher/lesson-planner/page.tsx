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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  Calendar,
  BookOpen,
  CheckCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Clock,
  Target,
  FileText,
  MoreHorizontal,
  CalendarDays,
  Sparkles,
  Upload
} from "lucide-react"
import { useRouter } from "next/navigation"

interface LessonPlan {
  _id: string;
  classId: {
    _id: string;
    name: string;
    section: string;
  };
  subject: string;
  lessonDate: string;
  topic: string;
  objectives: string[];
  activities: string;
  resources: string;
  homework: string;
  notes: string;
  duration: number;
  status: 'planned' | 'completed' | 'cancelled';
}

export default function LessonPlanner() {
  const router = useRouter()
  const [lessons, setLessons] = useState<LessonPlan[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  // Form State
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [resourceForm, setResourceForm] = useState({
    title: '',
    type: 'other',
    subject: '',
    description: '',
    fileUrl: '',
    classId: ''
  })
  const [formData, setFormData] = useState({
    classId: '',
    subject: '',
    lessonDate: new Date().toISOString().split('T')[0],
    topic: '',
    objectives: '',
    activities: '',
    resources: '',
    duration: 45
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const [lessonsRes, classesRes] = await Promise.all([
        fetch(`${API_URL}/api/teacher/lesson-plans`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/teacher/classes`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ])

      const lessonsData = await lessonsRes.json()
      const classesData = await classesRes.json()

      if (lessonsData.success) setLessons(lessonsData.data)
      if (classesData.success) setClasses(classesData.data)
    } catch (err) {
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLesson = async () => {
    setCreating(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/teacher/lesson-plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          objectives: formData.objectives.split('\n').filter(o => o.trim() !== '')
        })
      })

      const result = await response.json()
      if (result.success) {
        setLessons([result.data, ...lessons])
        setIsCreateModalOpen(false)
        resetForm()
        toast({ title: "Success", description: "Lesson plan created successfully", className: "bg-green-50 text-green-800 border-green-200" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to create lesson plan", variant: "destructive" })
    } finally {
      setCreating(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/teacher/lesson-plans/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      const result = await response.json()
      if (result.success) {
        setLessons(lessons.map(l => l._id === id ? result.data : l))
        toast({ title: "Status Updated", description: `Lesson marked as ${status}`, className: "bg-indigo-50 text-indigo-800 border-indigo-200" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setFormData({
      classId: '',
      subject: '',
      lessonDate: new Date().toISOString().split('T')[0],
      topic: '',
      objectives: '',
      activities: '',
      resources: '',
      duration: 45
    })
  }

  const handleResourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setResourceForm(prev => ({ ...prev, fileUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadResource = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/teacher/downloads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...resourceForm,
          classes: resourceForm.classId ? [resourceForm.classId] : []
        })
      })

      const result = await response.json()
      if (result.success) {
        setIsUploadOpen(false)
        setResourceForm({ title: '', type: 'other', subject: '', description: '', fileUrl: '', classId: '' })
        toast({ title: "Success", description: "Resource uploaded successfully" })
      } else {
        toast({ title: "Error", description: "Failed to upload resource", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to upload resource", variant: "destructive" })
    }
  }

  const totalLessons = lessons.length
  const completedLessons = lessons.filter(l => l.status === "completed").length
  const plannedLessons = lessons.filter(l => l.status === "planned").length
  const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  if (loading) {
    return (
      <DashboardLayout title="Lesson Planner">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Lesson Planner">
      <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Academic Blueprint</h2>
            <p className="text-muted-foreground font-medium">Strategize and archive your pedagogical roadmap for excellence.</p>
          </div>
          <div className="flex gap-4">
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-12 px-6 font-black border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 rounded-xl">
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Notes
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl border-none shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">Upload Study Material</DialogTitle>
                  <DialogDescription>Share notes or resources with your students.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4 py-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">Material Title</Label>
                    <Input value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} placeholder="e.g. Chapter 5 Notes" className="h-12" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-gray-700">Resource Type</Label>
                      <Select value={resourceForm.type} onValueChange={v => setResourceForm({ ...resourceForm, type: v })}>
                        <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="syllabus">Syllabus</SelectItem>
                          <SelectItem value="book">Book</SelectItem>
                          <SelectItem value="circular">Circular</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-gray-700">Subject</Label>
                      <Input value={resourceForm.subject} onChange={e => setResourceForm({ ...resourceForm, subject: e.target.value })} placeholder="e.g. Physics" className="h-12" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">Target Class (Optional)</Label>
                    <Select onValueChange={v => setResourceForm({ ...resourceForm, classId: v })}>
                      <SelectTrigger className="h-12"><SelectValue placeholder="All Classes" /></SelectTrigger>
                      <SelectContent>
                        {classes.map(c => <SelectItem key={c._id} value={c._id}>Class {c.name}-{c.section}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">Attach File</Label>
                    <Input type="file" onChange={handleResourceFileChange} className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">Description</Label>
                    <Textarea value={resourceForm.description} onChange={e => setResourceForm({ ...resourceForm, description: e.target.value })} placeholder="Brief description of the content..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                  <Button onClick={handleUploadResource} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100">Upload</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 font-black shadow-xl shadow-indigo-100 rounded-xl">
                  <Plus className="h-5 w-5 mr-2" />
                  Draft New Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-none shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-gray-900">Configure Lesson Strategy</DialogTitle>
                  <DialogDescription className="font-medium text-gray-500">Define the objectives and structure for your next session.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-y my-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">Target Class</Label>
                    <Select onValueChange={(v) => setFormData({ ...formData, classId: v })}>
                      <SelectTrigger className="h-12 rounded-xl focus:ring-4 focus:ring-indigo-100">
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c._id} value={c._id}>Class {c.name}-{c.section}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">Subject Discipline</Label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Mathematics"
                      className="h-12 rounded-xl border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">Date of Execution</Label>
                    <Input
                      type="date"
                      value={formData.lessonDate}
                      onChange={(e) => setFormData({ ...formData, lessonDate: e.target.value })}
                      className="h-12 rounded-xl border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">Duration (Minutes)</Label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="h-12 rounded-xl border-gray-200"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="font-bold text-gray-700">Lesson Topic</Label>
                    <Input
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      placeholder="e.g. Introduction to Quantum Theory"
                      className="h-12 rounded-xl border-gray-200 font-black"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="font-bold text-gray-700">Core Objectives (One per line)</Label>
                    <Textarea
                      value={formData.objectives}
                      onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                      placeholder="Students will be able to..."
                      className="rounded-xl border-gray-200 min-h-[100px]"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="font-bold text-gray-700">Instructional Activities</Label>
                    <Textarea
                      value={formData.activities}
                      onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                      placeholder="Outline the steps of the lesson..."
                      className="rounded-xl border-gray-200 min-h-[100px]"
                    />
                  </div>
                </div>
                <DialogFooter className="gap-3">
                  <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="font-black text-gray-400">Abort</Button>
                  <Button
                    onClick={handleCreateLesson}
                    disabled={creating}
                    className="bg-indigo-600 hover:bg-indigo-700 px-8 font-black shadow-lg shadow-indigo-100"
                  >
                    {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Deploy Plan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Total Plans" value={totalLessons.toString()} icon={BookOpen} iconColor="text-indigo-600" iconBgColor="bg-indigo-50" />
          <StatCard title="Executed" value={completedLessons.toString()} icon={CheckCircle} iconColor="text-emerald-600" iconBgColor="bg-emerald-50" />
          <StatCard title="In Waiting" value={plannedLessons.toString()} icon={Calendar} iconColor="text-blue-600" iconBgColor="bg-blue-50" />
          <StatCard title="Progress" value={`${completionRate}%`} icon={Sparkles} iconColor="text-purple-600" iconBgColor="bg-purple-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-2xl shadow-indigo-100/30 overflow-hidden ring-1 ring-gray-100">
              <CardHeader className="bg-gray-50/50 border-b py-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 font-black text-gray-800">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    Plan Repository
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 rounded-lg font-bold text-[10px] uppercase">Filter</Button>
                    <Button variant="outline" size="sm" className="h-8 rounded-lg font-bold text-[10px] uppercase">Export</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {lessons.length > 0 ? (
                    lessons.map((lesson) => (
                      <div key={lesson._id} className="p-6 hover:bg-indigo-50/20 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-1">
                            <h4 className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{lesson.topic}</h4>
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                              <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {lesson.subject}</span>
                              <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {new Date(lesson.lessonDate).toLocaleDateString()}</span>
                              <span className="px-2 py-0.5 bg-gray-100 rounded-md text-gray-600">Batch {lesson.classId?.name}-{lesson.classId?.section}</span>
                            </div>
                          </div>
                          <Select
                            defaultValue={lesson.status}
                            onValueChange={(v) => updateStatus(lesson._id, v)}
                          >
                            <SelectTrigger className={`w-[130px] h-8 rounded-lg text-[10px] font-black uppercase tracking-widest border-none ${lesson.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                              lesson.status === 'planned' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
                              }`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="planned">Planned</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 mb-4">
                          <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-tight flex items-center gap-1">
                            <Target className="h-3 w-3" /> Core Objectives
                          </p>
                          <ul className="space-y-1">
                            {lesson.objectives.map((obj, i) => (
                              <li key={i} className="text-xs font-medium text-gray-700 flex items-start gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-indigo-300 mt-1" />
                                {obj}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center justify-between text-xs font-bold">
                          <div className="flex items-center gap-4 text-gray-400">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {lesson.duration}m</span>
                            {lesson.status === 'completed' && <span className="text-emerald-600">Archived ✓</span>}
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-black text-gray-400">Edit Deeply</Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center">
                      <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                        <BookOpen className="h-8 w-8 text-gray-300" />
                      </div>
                      <h3 className="font-black text-gray-400 uppercase tracking-widest text-sm">Vault is Empty</h3>
                      <p className="text-xs text-gray-400 font-medium">No lesson plans have been synchronized yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-indigo-600 text-white border-none shadow-xl shadow-indigo-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Clock className="h-24 w-24" />
              </div>
              <CardHeader className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Upcoming Session</p>
                <CardTitle className="text-3xl font-black mt-2 tracking-tighter">10:00 AM</CardTitle>
                <CardDescription className="text-indigo-200 font-bold">Live in 15 Minutes</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <div className="space-y-1">
                  <p className="text-lg font-black leading-tight">Advanced Thermodynamics</p>
                  <p className="text-xs font-medium opacity-80">Batch 12-A • Hall 402</p>
                </div>
                <Button variant="secondary" className="w-full bg-white text-indigo-700 hover:bg-indigo-50 font-black rounded-xl">
                  Inspect Materials
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl ring-1 ring-gray-100 overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-500">Resource Quick-Access</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {["Calculus_CheatSheet.v2", "AtomicStructure_3D_Model", "Lab_Safety_Protocol"].map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-black text-gray-800">{file}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Oct 12 • 2.4 MB</p>
                      </div>
                    </div>
                    <MoreHorizontal className="h-4 w-4 text-gray-300" />
                  </div>
                ))}
                <Button variant="ghost" className="w-full text-indigo-600 font-black text-[10px] uppercase tracking-widest mt-2" onClick={() => router.push('/dashboard/teacher/library')}>Library Portal</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

