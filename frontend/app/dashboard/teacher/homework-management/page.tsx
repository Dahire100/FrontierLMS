"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Search,
  Loader2,
  Calendar,
  BookOpen,
  GraduationCap,
  Sparkles,
  Clock,
  CheckCircle2,
  FileUp,
  X
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

interface ClassItem {
  _id: string;
  name: string;
  section: string;
}

interface Homework {
  _id: string;
  title: string;
  subject: string;
  classId: {
    _id: string;
    name: string;
    section: string;
  };
  dueDate: string;
  status: 'active' | 'closed' | 'draft';
  description: string;
}

export default function HomeworkManagement() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [homeworkList, setHomeworkList] = useState<Homework[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    classId: "",
    subject: "",
    dueDate: "",
    description: ""
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const [hwRes, classRes] = await Promise.all([
        fetch(`${API_URL}/api/teacher/homework`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/teacher/classes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      const hwData = await hwRes.json()
      const classData = await classRes.json()

      if (hwData.success) setHomeworkList(hwData.data)
      if (classData.success) setClasses(classData.data)
    } catch (err) {
      toast({ title: "Error", description: "Failed to sync data", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/homework`, { // Assuming base homework endpoint for saving
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (data.success) {
        toast({ title: "Assignment Released", description: "New homework has been dispatched to student portals." })
        setIsDialogOpen(false)
        fetchData()
        setFormData({ title: "", classId: "", subject: "", dueDate: "", description: "" })
      }
    } catch (err) {
      toast({ title: "Broadcast Failed", description: "Failed to assign homework", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Academic Assignments">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Academic Dispatch">
      <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Homework Orchestration</h2>
            <p className="text-muted-foreground font-medium">Design and deploy learning challenges across your assigned batches.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 h-14 px-8 rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all active:scale-95 text-white">
                <Plus className="h-5 w-5 mr-2" /> Dispatch Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] p-0 rounded-3xl overflow-hidden border-none shadow-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader className="bg-gray-50/50 p-8 border-b">
                  <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-indigo-600" /> Draft New Assignment
                  </DialogTitle>
                  <DialogDescription className="text-gray-500 font-medium pt-1">Configure evaluation metrics and delivery parameters.</DialogDescription>
                </DialogHeader>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Assignment Identifier</Label>
                      <Input
                        placeholder="e.g. Advanced Calculus - Weekly Challenge #12"
                        className="h-14 rounded-xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-100 font-bold transition-all"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Target Cohort</Label>
                      <Select value={formData.classId} onValueChange={(v) => setFormData({ ...formData, classId: v })}>
                        <SelectTrigger className="h-14 rounded-xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-100 font-bold transition-all">
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map(c => (
                            <SelectItem key={c._id} value={c._id} className="font-medium">Class {c.name}-{c.section}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Deadline Registry</Label>
                      <Input
                        type="date"
                        className="h-14 rounded-xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-100 font-bold transition-all"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Knowledge Domain (Subject)</Label>
                      <Input
                        placeholder="e.g. Mathematics"
                        className="h-14 rounded-xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-100 font-bold transition-all"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Instructional Brief</Label>
                      <Textarea
                        placeholder="Outline the learning objectives and task specifications..."
                        className="min-h-[150px] rounded-2xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-100 font-medium p-4 transition-all"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="bg-gray-50/50 p-8 border-t">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-12 px-6 font-black uppercase tracking-widest text-xs text-gray-400">Cancel Draft</Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-12 px-10 bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-100 rounded-xl"
                  >
                    {submitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                    Confirm & Dispatch
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none shadow-xl shadow-indigo-100/30 ring-1 ring-gray-100 rounded-2xl bg-white overflow-hidden p-6 space-y-2">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-indigo-600" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Active Assignments</p>
            <h4 className="text-3xl font-black text-gray-900">{homeworkList.filter(h => h.status === 'active').length}</h4>
          </Card>
          <Card className="border-none shadow-xl shadow-indigo-100/30 ring-1 ring-gray-100 rounded-2xl bg-white overflow-hidden p-6 space-y-2">
            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Closing Soon (48h)</p>
            <h4 className="text-3xl font-black text-gray-900">
              {homeworkList.filter(h => {
                const due = new Date(h.dueDate).getTime();
                const now = Date.now();
                return due > now && (due - now) < 172800000;
              }).length}
            </h4>
          </Card>
        </div>

        <Card className="border-none shadow-2xl shadow-indigo-100/30 ring-1 ring-gray-100 rounded-2xl bg-white overflow-hidden">
          <CardHeader className="bg-white border-b py-8 px-8">
            <CardTitle className="text-xl font-black tracking-tight text-gray-800">Dispatch History</CardTitle>
            <CardDescription className="font-medium italic">Audit log of all assignments released to students.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {homeworkList.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b">
                      <TableHead className="w-[300px] font-black text-[10px] uppercase tracking-widest text-gray-500 pl-8 h-16">Assignment Specs</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 h-16">Target Audience</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 h-16">Due Registry</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 h-16">Status</TableHead>
                      <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-gray-500 h-16 pr-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {homeworkList.map((hw) => (
                      <TableRow key={hw._id} className="group hover:bg-indigo-50/30 transition-all border-b border-gray-50">
                        <TableCell className="pl-8 py-5">
                          <div className="space-y-1">
                            <span className="font-black text-gray-800 uppercase tracking-tight block group-hover:text-indigo-600 transition-colors">{hw.title}</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                              <BookOpen className="h-3 w-3" /> {hw.subject}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-white border-gray-200 text-gray-500 font-black h-7 rounded-lg">
                            Batch {hw.classId.name}-{hw.classId.section}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-black text-gray-700 text-xs">{new Date(hw.dueDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                            <span className="text-[10px] font-bold text-gray-400">Expiry Log</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {hw.status === 'active' ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black h-6 rounded-lg">LIVE</Badge>
                          ) : (
                            <Badge variant="secondary" className="font-black h-6 rounded-lg uppercase">{hw.status}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-10 w-10 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-10 w-10 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-20 text-center space-y-4">
                <div className="h-20 w-20 bg-gray-50 rounded-3xl mx-auto flex items-center justify-center">
                  <FileUp className="h-10 w-10 text-gray-300" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-black text-gray-900 tracking-tight">Vast Silence</h4>
                  <p className="text-muted-foreground font-medium max-w-sm mx-auto">No assignments have been dispatched yet. Initiate a new session to begin.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


