"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileText, CheckCircle, Clock, Plus, Loader2, Sparkles, ChevronRight, Users, Target, Edit, Trash2, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Quiz {
  _id: string;
  title: string;
  subject: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  status: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  attempts?: any[];
  classId?: {
    _id: string;
    name: string;
    section: string;
  };
  description?: string;
  questions?: any[];
}

interface ClassItem {
  _id: string;
  name: string;
  section: string;
}

export default function TeacherOnlineExam() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    classId: "",
    duration: 60,
    totalMarks: 100,
    passingMarks: 40,
    description: "",
    status: "draft",
    scheduledDate: new Date().toISOString().split('T')[0],
    startTime: "09:00",
    endTime: "10:00"
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const [quizRes, classRes] = await Promise.all([
        fetch(`${API_URL}/api/teacher/online-exams`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/teacher/classes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      const quizData = await quizRes.json()
      const classData = await classRes.json()

      if (quizData.success) setQuizzes(quizData.data)
      if (classData.success) setClasses(classData.data)
    } catch (err) {
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateQuiz = async () => {
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/teacher/online-exams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: "Assessment Created",
          description: "New online quiz has been initialized successfully.",
          className: "bg-green-50 text-green-800 border-green-200"
        })
        setIsCreateOpen(false)
        fetchData()
        resetForm()
      } else {
        throw new Error(data.error || "Failed to create quiz")
      }
    } catch (err: any) {
      toast({
        title: "Creation Failed",
        description: err.message || "Failed to create quiz",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditQuiz = async () => {
    if (!selectedQuiz) return
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/teacher/online-exams/${selectedQuiz._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: "Assessment Updated",
          description: "Quiz details have been modified successfully.",
          className: "bg-green-50 text-green-800 border-green-200"
        })
        setIsEditOpen(false)
        fetchData()
        resetForm()
      } else {
        throw new Error(data.error || "Failed to update quiz")
      }
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update quiz",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/teacher/online-exams/${quizId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: "Assessment Deleted",
          description: "Quiz has been removed from the system.",
          className: "bg-green-50 text-green-800 border-green-200"
        })
        fetchData()
      } else {
        throw new Error(data.error || "Failed to delete quiz")
      }
    } catch (err: any) {
      toast({
        title: "Deletion Failed",
        description: err.message || "Failed to delete quiz",
        variant: "destructive"
      })
    }
  }

  const handleViewQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setIsViewOpen(true)
  }

  const handleOpenEdit = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setFormData({
      title: quiz.title,
      subject: quiz.subject,
      classId: quiz.classId?._id || "",
      duration: quiz.duration,
      totalMarks: quiz.totalMarks,
      passingMarks: quiz.passingMarks,
      description: quiz.description || "",
      status: quiz.status,
      scheduledDate: quiz.scheduledDate ? new Date(quiz.scheduledDate).toISOString().split('T')[0] : "",
      startTime: quiz.startTime,
      endTime: quiz.endTime
    })
    setIsEditOpen(true)
  }

  const handleOpenCreate = () => {
    resetForm()
    setIsCreateOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      subject: "",
      classId: "",
      duration: 60,
      totalMarks: 100,
      passingMarks: 40,
      description: "",
      status: "draft",
      scheduledDate: new Date().toISOString().split('T')[0],
      startTime: "09:00",
      endTime: "10:00"
    })
    setSelectedQuiz(null)
  }

  const totalQuizzes = quizzes.length
  const activeQuizzes = quizzes.filter(q => q.status === "active" || q.status === 'scheduled').length
  const totalAttempts = quizzes.reduce((sum, q) => sum + (q.attempts?.length || 0), 0)

  if (loading) {
    return (
      <DashboardLayout title="Online Examination">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Evaluation Engine">
      <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight italic uppercase">Assessment Archives</h2>
            <p className="text-muted-foreground font-medium italic">Construct, manage and oversee digital evaluations across academic terms.</p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-700 h-14 px-8 rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all active:scale-95 text-white"
          >
            <Plus className="h-5 w-5 mr-3" /> Initialize New Assessment
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Total Quizzes" value={totalQuizzes.toString()} icon={FileText} iconColor="text-indigo-600" iconBgColor="bg-indigo-50" />
          <StatCard title="Active Protocols" value={activeQuizzes.toString()} icon={Clock} iconColor="text-orange-600" iconBgColor="bg-orange-50" />
          <StatCard title="Global Attempts" value={totalAttempts.toString()} icon={Users} iconColor="text-blue-600" iconBgColor="bg-blue-50" />
          <StatCard title="Precision Target" value="88%" icon={Target} iconColor="text-emerald-600" iconBgColor="bg-emerald-50" />
        </div>

        <Card className="border-none shadow-2xl shadow-indigo-100/30 ring-1 ring-gray-100 overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b py-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 font-black text-gray-800 uppercase tracking-wider italic">
                <FileText className="h-5 w-5 text-indigo-600" />
                Evaluative Inventory
              </CardTitle>
              <CardDescription className="italic font-medium">Full repository of current and historical digital assessments.</CardDescription>
            </div>
            <Sparkles className="h-5 w-5 text-indigo-400 opacity-50" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {quizzes.length > 0 ? quizzes.map((quiz, index) => (
                <div key={quiz._id || index} className="p-6 hover:bg-slate-50 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-xs shadow-sm group-hover:scale-110 transition-transform">
                        {quiz.subject[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-gray-900 italic uppercase">{quiz.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                          <span>{quiz.subject}</span>
                          <span>•</span>
                          <span>Capability: {quiz.totalMarks} pts</span>
                          <span>•</span>
                          <span>{quiz.duration} mins</span>
                          {quiz.classId && (
                            <>
                              <span>•</span>
                              <span>Class {quiz.classId.name}-{quiz.classId.section}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Participation</p>
                      <p className="text-lg font-black text-indigo-600">{quiz.attempts?.length || 0} Attempts</p>
                    </div>
                    <Badge className={`h-8 px-4 rounded-xl font-black uppercase text-[10px] border-none shadow-sm ${quiz.status === 'active' ? "bg-emerald-50 text-emerald-700" :
                      quiz.status === 'scheduled' ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"
                      }`}>
                      {quiz.status}
                    </Badge>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-blue-600 hover:bg-blue-50 rounded-xl"
                        onClick={() => handleViewQuiz(quiz)}
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-indigo-600 hover:bg-indigo-50 rounded-xl"
                        onClick={() => handleOpenEdit(quiz)}
                      >
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-red-600 hover:bg-red-50 rounded-xl"
                        onClick={() => handleDeleteQuiz(quiz._id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-32 text-center space-y-4">
                  <div className="h-24 w-24 bg-gray-50 rounded-[2rem] mx-auto flex items-center justify-center opacity-50 border-2 border-dashed border-gray-200">
                    <FileText className="h-10 w-10 text-gray-300" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest italic">No Assessments Found.</p>
                    <p className="text-xs text-gray-400 italic">Initiate a new assessment protocol to get started.</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create Quiz Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-gray-900">Initialize New Assessment</DialogTitle>
              <DialogDescription className="font-medium text-gray-500">Configure digital evaluation parameters and deployment settings.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
              <div className="col-span-3 space-y-2">
                <Label className="font-bold text-gray-700">Assessment Title</Label>
                <Input
                  placeholder="e.g. Mathematics Mid-Term Quiz"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Subject Area</Label>
                <Input
                  placeholder="e.g. Mathematics"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Target Class</Label>
                <Select value={formData.classId} onValueChange={(v) => setFormData({ ...formData, classId: v })}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c._id} value={c._id}>Class {c.name}-{c.section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Total Marks</Label>
                <Input
                  type="number"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Passing Marks</Label>
                <Input
                  type="number"
                  placeholder="e.g. 40"
                  value={formData.passingMarks}
                  onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Scheduled Date</Label>
                <Input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Start Time</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">End Time</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="col-span-3 space-y-2">
                <Label className="font-bold text-gray-700">Description</Label>
                <Textarea
                  placeholder="Assessment instructions and guidelines..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[80px] rounded-xl"
                />
              </div>
            </div>
            <DialogFooter className="bg-gray-50 p-6 -mx-6 -mb-6 rounded-b-lg border-t gap-3">
              <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="font-black text-gray-400">Cancel</Button>
              <Button
                onClick={handleCreateQuiz}
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 px-8 font-black shadow-lg shadow-indigo-100"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Create Assessment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Quiz Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-gray-900">Modify Assessment</DialogTitle>
              <DialogDescription className="font-medium text-gray-500">Update evaluation parameters and configuration.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
              <div className="col-span-3 space-y-2">
                <Label className="font-bold text-gray-700">Assessment Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Subject Area</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Target Class</Label>
                <Select value={formData.classId} onValueChange={(v) => setFormData({ ...formData, classId: v })}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c._id} value={c._id}>Class {c.name}-{c.section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Total Marks</Label>
                <Input
                  type="number"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Passing Marks</Label>
                <Input
                  type="number"
                  placeholder="e.g. 40"
                  value={formData.passingMarks}
                  onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Scheduled Date</Label>
                <Input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Start Time</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">End Time</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="col-span-3 space-y-2">
                <Label className="font-bold text-gray-700">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[80px] rounded-xl"
                />
              </div>
            </div>
            <DialogFooter className="bg-gray-50 p-6 -mx-6 -mb-6 rounded-b-lg border-t gap-3">
              <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="font-black text-gray-400">Cancel</Button>
              <Button
                onClick={handleEditQuiz}
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 px-8 font-black shadow-lg shadow-indigo-100"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Quiz Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-gray-900">{selectedQuiz?.title}</DialogTitle>
              <DialogDescription className="font-medium text-gray-500">Assessment Details & Statistics</DialogDescription>
            </DialogHeader>
            {selectedQuiz && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Subject</p>
                    <p className="text-lg font-bold text-gray-900">{selectedQuiz.subject}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Status</p>
                    <Badge className={`h-7 px-4 rounded-lg font-black uppercase text-[10px] ${selectedQuiz.status === 'active' ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {selectedQuiz.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Duration</p>
                    <p className="text-lg font-bold text-gray-900">{selectedQuiz.duration} minutes</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Marks</p>
                    <p className="text-lg font-bold text-gray-900">{selectedQuiz.totalMarks} points</p>
                  </div>
                  {selectedQuiz.classId && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Target Class</p>
                      <p className="text-lg font-bold text-gray-900">Class {selectedQuiz.classId.name}-{selectedQuiz.classId.section}</p>
                    </div>
                  )}
                  <div className="space-y-1 col-span-2">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Attempts</p>
                    <p className="text-lg font-bold text-indigo-600">{selectedQuiz.attempts?.length || 0} students</p>
                  </div>
                </div>
                {selectedQuiz.description && (
                  <div className="space-y-2">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Description</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border">{selectedQuiz.description}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="bg-gray-50 p-6 -mx-6 -mb-6 rounded-b-lg border-t">
              <Button variant="outline" onClick={() => setIsViewOpen(false)} className="font-black">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
