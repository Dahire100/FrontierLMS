"use client"

import { useState, useEffect, useCallback } from "react"
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
import {
  ClipboardList,
  Loader2,
  RefreshCcw,
  Search,
  User,
  Book,
  Calendar,
  Clock,
  ArrowRightCircle,
  Package,
  GraduationCap,
  Users,
  Activity,
  Database,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { API_URL } from "@/lib/api-config"

export default function BookIssuePage() {
  const [issues, setIssues] = useState<any[]>([])
  const [books, setBooks] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const [form, setForm] = useState({
    bookId: "",
    userType: "student" as "student" | "teacher" | "staff",
    issuedToId: "",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    name: "",
    contactNumber: ""
  })

  const fetchData = useCallback(async () => {
    try {
      setFetching(true)
      const token = localStorage.getItem("token")
      const headers = { "Authorization": `Bearer ${token}` }

      const [issuesRes, booksRes, studentsRes, staffRes] = await Promise.all([
        fetch(`${API_URL}/api/library/issues`, { headers }),
        fetch(`${API_URL}/api/library/books`, { headers }),
        fetch(`${API_URL}/api/students`, { headers }),
        fetch(`${API_URL}/api/staff`, { headers })
      ])

      const issuesData = await issuesRes.json()
      const booksData = await booksRes.json()
      const studentsData = await studentsRes.json()
      const staffData = await staffRes.json()

      if (issuesData.success) setIssues(issuesData.data)
      if (booksData.success) setBooks(booksData.data)
      if (Array.isArray(studentsData)) setStudents(studentsData)
      if (Array.isArray(staffData)) setStaff(staffData)

    } catch (error) {
      console.error(error)
      toast.error("Failed to sync issuance ledger")
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleIssue = async () => {
    if (!form.bookId || !form.issuedToId || !form.dueDate) {
      toast.error("Target material, beneficiary identity, and return deadline are required")
      return
    }

    // Set name based on selection
    let beneficiaryName = ""
    if (form.userType === 'student') {
      const s = students.find(x => x._id === form.issuedToId)
      beneficiaryName = s ? `${s.firstName} ${s.lastName}` : ""
    } else {
      const s = staff.find(x => x._id === form.issuedToId)
      beneficiaryName = s ? `${s.firstName} ${s.lastName}` : ""
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/library/issue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...form, name: beneficiaryName })
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Failed to commit issuance")

      toast.success("Knowledge dispersion protocol completed")
      setForm({
        bookId: "",
        userType: "student",
        issuedToId: "",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        name: "",
        contactNumber: ""
      })
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: "bookId",
      label: "Material Payload",
      render: (val: any) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
            <Book size={18} />
          </div>
          <div>
            <span className="font-black text-gray-900 tracking-tight uppercase leading-none">{val?.title || 'Unknown Material'}</span>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {val?.bookNumber || 'N/A'}</div>
          </div>
        </div>
      )
    },
    {
      key: "issuedTo",
      label: "Beneficiary Vector",
      render: (val: any) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-400 border border-indigo-100 font-black text-[10px]">
            {val?.userType === 'student' ? <GraduationCap size={14} /> : <Users size={14} />}
          </div>
          <div>
            <span className="font-black text-gray-900 tracking-tight uppercase leading-none">{val?.name}</span>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{val?.userType}</div>
          </div>
        </div>
      )
    },
    {
      key: "dueDate",
      label: "Deadline",
      render: (val: string, row: any) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-gray-300" />
            <span className="text-xs font-black text-gray-600">{new Date(val).toLocaleDateString()}</span>
          </div>
          {new Date(val) < new Date() && row.status === 'issued' && (
            <div className="flex items-center gap-1 text-rose-500 animate-pulse">
              <AlertCircle size={10} />
              <span className="text-[8px] font-black uppercase">Overdue</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: "status",
      label: "Operational State",
      render: (val: string) => (
        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${val === 'returned'
            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
            : val === 'overdue'
              ? 'bg-rose-100 text-rose-700 border-rose-200 shadow-lg shadow-rose-100'
              : 'bg-amber-100 text-amber-700 border-amber-200'
          }`}>
          {val || 'issued'}
        </div>
      )
    }
  ]

  return (
    <DashboardLayout title="Knowledge Logistics: Material Issuance">
      <div className="max-w-[1700px] mx-auto space-y-10 pb-20">

        {/* Header Context */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
              <div className="h-12 w-12 bg-blue-900 rounded-2xl flex items-center justify-center shadow-xl text-white transform hover:rotate-12 transition-transform">
                <ArrowRightCircle size={24} />
              </div>
              Material Issuance Protocol
            </h1>
            <p className="text-gray-500 mt-2 text-lg italic font-medium">Orchestrate internal knowledge distribution and track institutional asset dispersion across sectors</p>
          </div>

          <Button variant="outline" onClick={fetchData} className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50">
            <RefreshCcw size={18} className={fetching ? 'animate-spin' : ''} /> Synchronize Ledger
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
          {/* Execution Center */}
          <div className="xl:col-span-4">
            <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden sticky top-8 rounded-[2.5rem] bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-white border-b border-gray-100 p-8">
                <CardTitle className="text-[10px] flex items-center gap-3 text-blue-900 uppercase tracking-[0.3em] font-black">
                  <Activity size={18} className="text-blue-600" /> Dispatch Initialization
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Material Payload <span className="text-rose-500">*</span></Label>
                    <Select value={form.bookId} onValueChange={(v) => setForm({ ...form, bookId: v })}>
                      <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-blue-500 font-bold">
                        <SelectValue placeholder="Identify Material Node" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl p-2 px-3">
                        {books.filter(b => b.availableQuantity > 0).map((b: any) => (
                          <SelectItem key={b._id} value={b._id} className="rounded-xl font-bold py-2.5 uppercase">
                            <div className="flex justify-between items-center w-full min-w-[250px]">
                              <span>{b.title}</span>
                              <span className="text-[9px] text-blue-500 bg-blue-50 px-2 rounded-full ml-2">BUF: {b.availableQuantity}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Beneficiary Sector <span className="text-rose-500">*</span></Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['student', 'teacher', 'staff'].map((type) => (
                        <Button
                          key={type}
                          type="button"
                          variant={form.userType === type ? 'default' : 'outline'}
                          onClick={() => setForm({ ...form, userType: type as any, issuedToId: "" })}
                          className={`h-10 rounded-xl font-black text-[9px] uppercase tracking-widest ${form.userType === type ? 'bg-blue-900 text-white' : 'border-gray-100 bg-gray-50/50 text-gray-400'
                            }`}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Beneficiary Identity <span className="text-rose-500">*</span></Label>
                    <Select value={form.issuedToId} onValueChange={(v) => setForm({ ...form, issuedToId: v })}>
                      <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-blue-500 font-bold">
                        <SelectValue placeholder={`Identify ${form.userType}`} />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl p-2 px-3">
                        {(form.userType === 'student' ? students : staff).map((u: any) => (
                          <SelectItem key={u._id} value={u._id} className="rounded-xl font-bold py-2.5 uppercase">
                            {u.firstName} {u.lastName} {u.admissionNumber ? `(${u.admissionNumber})` : `(${u.employeeId || 'ID_NULL'})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Return Threshold Date <span className="text-rose-500">*</span></Label>
                    <div className="relative group">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={16} />
                      <Input
                        type="date"
                        value={form.dueDate}
                        onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                        className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 pl-12 rounded-2xl focus:ring-blue-500 font-black"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleIssue}
                  disabled={loading}
                  className="w-full bg-blue-900 hover:bg-black text-white h-16 rounded-[1.5rem] shadow-2xl shadow-blue-100 font-black text-xs uppercase tracking-[0.3em] gap-3 transition-all hover:scale-[1.02] active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
                  Commit Issuance
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Matrix View */}
          <div className="xl:col-span-8 space-y-8">
            <div className="relative max-w-md group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
              <Input
                className="pl-16 h-16 bg-white border-none ring-1 ring-black/5 shadow-2xl rounded-[1.5rem] focus:ring-2 focus:ring-blue-500/20 text-lg font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Query issuance archives..."
              />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <AdvancedTable
                title="Validated Issuance Matrix"
                columns={columns}
                data={issues}
                loading={fetching}
                pagination
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
