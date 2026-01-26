"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  CalendarDays,
  Plus,
  Search,
  BookMarked,
  Loader2,
  Trash2,
  CheckCircle2,
  Library,
  BookOpen
} from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"

interface ClassItem {
  _id: string
  name: string
  section: string
  subjects?: any[]
}

interface Subject {
  _id: string
  name: string
  code: string
  type: string
}

export default function AssignSubjects() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setFetching(true)
      const token = localStorage.getItem("token")
      const headers = { "Authorization": `Bearer ${token}` }

      const [classesRes, subjectsRes] = await Promise.all([
        fetch(`${API_URL}/api/classes`, { headers }),
        fetch(`${API_URL}/api/subjects`, { headers })
      ])

      const classesData = await classesRes.json()
      const subjectsData = await subjectsRes.json()

      if (classesRes.ok) setClasses(classesData.data || [])
      if (subjectsRes.ok) setSubjects(subjectsData.data || [])
    } catch (error) {
      toast.error("Failed to load data")
    } finally {
      setFetching(false)
    }
  }

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId)
    const selectedClass = classes.find(c => c._id === classId)
    if (selectedClass && selectedClass.subjects) {
      setSelectedSubjectIds(selectedClass.subjects.map(s => typeof s === 'string' ? s : s._id))
    } else {
      setSelectedSubjectIds([])
    }
  }

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjectIds(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    )
  }

  const handleSave = async () => {
    if (!selectedClassId) {
      toast.error("Please select a class")
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/classes/${selectedClassId}/subjects`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ subjects: selectedSubjectIds })
      })

      if (res.ok) {
        toast.success("Subjects assigned successfully")
        fetchInitialData() // Refresh list
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to assign subjects")
      }
    } catch (error) {
      toast.error("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Assign Subjects">
      <div className="space-y-6 max-w-full pb-10">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border-l-[6px] border-l-indigo-600">
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tighter uppercase italic">Curriculum Mapping</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Academics / Subject Allocation Engine</p>
          </div>
          <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm animate-pulse">
            <Library className="h-6 w-6" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 border-none shadow-xl rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-indigo-600 p-6 text-white border-none">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                <Search className="h-5 w-5" />
                Target Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Class & Section</Label>
                <Select value={selectedClassId} onValueChange={handleClassChange}>
                  <SelectTrigger className="h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/30 hover:bg-white transition-all shadow-inner focus:border-indigo-600 text-sm font-bold">
                    <SelectValue placeholder="Identify class cluster" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl border-2">
                    {classes.map((cls) => (
                      <SelectItem key={cls._id} value={cls._id} className="h-12 font-bold uppercase tracking-tight">
                        {cls.name} - {cls.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedClassId && (
                <div className="pt-4 border-t border-dashed">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Subjects</Label>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{selectedSubjectIds.length} Selected</span>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {subjects.map((sub) => (
                      <div
                        key={sub._id}
                        className={`flex items-center space-x-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedSubjectIds.includes(sub._id)
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-md translate-x-1'
                          : 'border-gray-50 hover:border-indigo-200'
                          }`}
                        onClick={() => toggleSubject(sub._id)}
                      >
                        <Checkbox
                          checked={selectedSubjectIds.includes(sub._id)}
                          onCheckedChange={() => toggleSubject(sub._id)}
                          className="h-5 w-5 rounded-md border-2 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-black text-gray-800 uppercase tracking-tight leading-none">{sub.name}</p>
                          <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{sub.code} • {sub.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full mt-6 h-14 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 group"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <CheckCircle2 className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />}
                    Authorize Mapping
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-10 bg-gray-900 text-white border-b border-gray-800">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter italic">Live Enrollment Matrix</CardTitle>
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-1">Cross-referencing Class to Subject Allocation</p>
                </div>
                <div className="bg-white/10 px-5 py-2 rounded-xl border border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">Real-time DB Sync</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b-2">
                      <TableHead className="p-8 font-black text-gray-400 uppercase tracking-[0.2em] text-[10px]">Class Identity</TableHead>
                      <TableHead className="p-8 font-black text-gray-400 uppercase tracking-[0.2em] text-[10px]">Active Curriculum</TableHead>
                      <TableHead className="p-8 font-black text-gray-400 uppercase tracking-[0.2em] text-[10px] text-right">Audit Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fetching ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-64 text-center">
                          <Loader2 className="h-10 w-10 animate-spin mx-auto text-indigo-600 opacity-20" />
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-4">Synthesizing records...</p>
                        </TableCell>
                      </TableRow>
                    ) : classes.map((cls) => (
                      <TableRow key={cls._id} className="hover:bg-indigo-50/20 transition-colors border-b last:border-0 group">
                        <TableCell className="p-8 border-r">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                              {cls.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-800 uppercase tracking-tight">{cls.name}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Section {cls.section}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="p-8">
                          <div className="flex flex-wrap gap-2">
                            {cls.subjects && cls.subjects.length > 0 ? (
                              cls.subjects.map((sub: any, i: number) => (
                                <span key={i} className="inline-flex items-center bg-white border-2 border-gray-100 px-4 py-1.5 rounded-full text-[9px] font-black text-gray-600 uppercase tracking-tighter shadow-sm hover:border-indigo-400 transition-colors">
                                  <BookOpen className="h-3 w-3 mr-2 text-indigo-500" />
                                  {typeof sub === 'string' ? sub : sub.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] font-bold text-gray-300 italic uppercase">Curriculum Vacant</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="p-8 text-right">
                          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 text-[9px] font-black uppercase tracking-widest ${cls.subjects && cls.subjects.length > 0
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                            {cls.subjects && cls.subjects.length > 0 ? 'Verified' : 'Incomplete'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
