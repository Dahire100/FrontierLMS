"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import {
  BookOpen,
  Pencil,
  Plus,
  Search,
  Hash,
  Sparkles,
  Library,
  GraduationCap,
  Clock,
  FlaskConical,
  Trash2,
  CheckCircle2,
  FileText,
  LayoutGrid
} from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

interface SubjectItem {
  id: string
  name: string
  code: string
  type: 'theory' | 'practical' | 'both'
  createdAt?: string
}

export default function Subject() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", code: "", theory: true, practical: false })
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/subjects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setSubjects(result.data.map((s: any) => ({
          id: s._id,
          name: s.name,
          code: s.code,
          type: s.type,
          createdAt: s.createdAt
        })));
      }
    } catch (error) {
      toast.error("Network connectivity issue")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Subject name and code are mandatory")
      return;
    }

    let resolvedType: 'theory' | 'practical' | 'both' = 'theory';
    if (form.theory && form.practical) resolvedType = 'both';
    else if (form.practical) resolvedType = 'practical';
    else resolvedType = 'theory';

    try {
      const token = localStorage.getItem('token');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/api/subjects/${editingId}` : `${API_URL}/api/subjects`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          code: form.code,
          type: resolvedType
        })
      });

      if (response.ok) {
        toast.success(editingId ? "Subject Updated" : "Subject Authorized")
        setForm({ name: "", code: "", theory: true, practical: false });
        setEditingId(null);
        fetchSubjects();
      } else {
        const errData = await response.json();
        toast.error(errData.error || "Execution failed")
      }
    } catch (error) {
      toast.error("System synchronization error")
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/subjects/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success("Subject Decommissioned")
        fetchSubjects();
      }
    } catch (error) {
      toast.error("Deletion protocol failed")
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  }

  const columns = [
    {
      key: "name",
      label: "Scientific Subject",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-indigo-600" />
          </div>
          <span className="font-black text-gray-800 uppercase tracking-tight text-sm leading-none">{value}</span>
        </div>
      )
    },
    {
      key: "code",
      label: "Registry Code",
      sortable: true,
      render: (value: string) => (
        <span className="px-3 py-1 bg-gray-900 text-white rounded-lg text-[10px] font-black font-mono tracking-widest border border-gray-800">
          {value}
        </span>
      )
    },
    {
      key: "type",
      label: "Pedagogical Type",
      sortable: true,
      render: (value: string) => (
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 text-[9px] font-black uppercase tracking-widest ${value === 'theory' ? 'bg-blue-50 text-blue-600 border-blue-100' :
          value === 'practical' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
            'bg-amber-50 text-amber-600 border-amber-100'
          }`}>
          {value === 'theory' ? <FileText className="h-3 w-3" /> : value === 'practical' ? <FlaskConical className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
          {value}
        </div>
      )
    }
  ]

  return (
    <DashboardLayout title="Subject Curriculum">
      <div className="space-y-6 max-w-full pb-10">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border-l-[6px] border-l-indigo-600">
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tighter uppercase italic">Curriculum Blueprint</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Academics / Subject Inventory Control</p>
          </div>
          <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm animate-pulse">
            <Library className="h-6 w-6" />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <Card className="xl:col-span-1 border-none shadow-xl rounded-[2rem] overflow-hidden sticky top-8 h-fit">
            <CardHeader className="bg-indigo-600 p-6 text-white border-none">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                <Pencil className="h-5 w-5" />
                {editingId ? "Modify Module" : "New Curriculum Unit"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6 bg-white">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject Nomenclature</Label>
                <div className="relative">
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. ADVANCED CALCULUS"
                    className="h-14 pl-4 rounded-2xl border-2 border-gray-100 bg-gray-50/30 hover:bg-white transition-all shadow-inner focus:border-indigo-600 font-bold placeholder:text-gray-300 uppercase italic"
                  />
                  {editingId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 h-10 px-3 text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50"
                      onClick={() => { setEditingId(null); setForm({ name: "", code: "", theory: true, practical: false }) }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unique Subject ID</Label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
                  <Input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="MTH-101-X"
                    className="h-14 pl-12 rounded-2xl border-2 border-gray-100 bg-gray-50/30 hover:bg-white transition-all shadow-inner focus:border-indigo-600 font-mono font-black placeholder:text-gray-300 uppercase tracking-widest"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assessment Categories</Label>
                <div className="grid grid-cols-1 gap-3 p-2 bg-gray-50 rounded-[1.5rem] border-2 border-gray-100">
                  <label className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${form.theory ? 'bg-white shadow-md' : 'hover:bg-white/50 opacity-60'}`}>
                    <Checkbox
                      checked={form.theory}
                      onCheckedChange={(checked) => setForm({ ...form, theory: Boolean(checked) })}
                      className="h-5 w-5 rounded-md border-2 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-black text-gray-800 uppercase italic">Theory Protocol</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Cognitive evaluation</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${form.practical ? 'bg-white shadow-md' : 'hover:bg-white/50 opacity-60'}`}>
                    <Checkbox
                      checked={form.practical}
                      onCheckedChange={(checked) => setForm({ ...form, practical: Boolean(checked) })}
                      className="h-5 w-5 rounded-md border-2 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-black text-gray-800 uppercase italic">Practical Deck</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Hands-on assessment</p>
                    </div>
                  </label>
                </div>
              </div>

              <Button
                onClick={handleSave}
                className="w-full h-16 bg-indigo-600 hover:bg-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-100 group transition-all duration-300"
              >
                {editingId ? <Pencil className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" /> : <CheckCircle2 className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />}
                {editingId ? "Update Metadata" : "Authorize Subject"}
              </Button>
            </CardContent>
          </Card>

          <div className="xl:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1 italic">Knowledge Base</p>
                  <h3 className="text-4xl font-black tracking-tighter">{subjects.length}</h3>
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-tighter mt-1">Active Academic Records</p>
                </div>
                <BookOpen className="absolute -right-4 -bottom-4 h-32 w-32 text-white/5 group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="bg-white rounded-[2rem] p-8 border-2 border-gray-100 shadow-xl group">
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1 italic">Practical Units</p>
                <h3 className="text-4xl font-black tracking-tighter text-emerald-600">{subjects.filter(s => s.type !== 'theory').length}</h3>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-tighter mt-1 underline decoration-emerald-500/30 decoration-4">Requires Lab Access</p>
              </div>
              <div className="bg-indigo-600 rounded-[2rem] p-8 text-white group">
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1 italic">Registry Status</p>
                <h3 className="text-4xl font-black tracking-tighter italic">LIVE</h3>
                <div className="flex gap-2 mt-2">
                  <div className="h-1.5 w-6 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-white animate-pulse" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">Sync Active</span>
                </div>
              </div>
            </div>

            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
              <AdvancedTable
                columns={columns}
                data={subjects}
                loading={loading}
                searchable
                searchPlaceholder="Query the knowledge graph..."
                pagination
                onEdit={(row) => {
                  setEditingId(row.id);
                  setForm({
                    name: row.name,
                    code: row.code,
                    theory: row.type === 'theory' || row.type === 'both',
                    practical: row.type === 'practical' || row.type === 'both'
                  });
                }}
                onDelete={(row) => setDeleteConfirm({ open: true, id: row.id })}
              />
            </Card>
          </div>
        </div>

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          onConfirm={confirmDelete}
          title="Decommission Knowledge Unit?"
          description="Are you absolutely certain? This protocol will archive the subject metadata and impact all dependent timetable nodes across the faculty network."
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
