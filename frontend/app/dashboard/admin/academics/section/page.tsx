"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import {
  Layers,
  Pencil,
  Plus,
  Search,
  Fingerprint,
  Network,
  Split,
  Cpu,
  Microscope,
  CalendarDays,
  Trash2,
  CheckCircle2,
  AlertTriangle
} from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

interface SectionItem {
  id: string
  name: string
  createdAt?: string
}

export default function SectionPage() {
  const [sections, setSections] = useState<SectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [sectionName, setSectionName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/sections`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setSections(result.data.map((s: any) => ({
          id: s._id,
          name: s.name,
          createdAt: s.createdAt
        })));
      }
    } catch (error) {
      toast.error("Sub-architecture retrieval failed")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!sectionName.trim()) {
      toast.error("Section designation is required")
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/api/sections/${editingId}` : `${API_URL}/api/sections`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: sectionName })
      });

      if (response.ok) {
        toast.success(editingId ? "Node Updated" : "Node Authorized")
        setSectionName("");
        setEditingId(null);
        fetchSections();
      } else {
        const errData = await response.json();
        toast.error(errData.error || "Execution error")
      }
    } catch (error) {
      toast.error("Neural sync interrupted")
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/sections/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success("Node Terminated")
        fetchSections();
      }
    } catch (error) {
      toast.error("Protocol failed")
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  }

  const columns = [
    {
      key: "name",
      label: "Node Designation",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center">
            <Split className="h-5 w-5 text-amber-600" />
          </div>
          <span className="font-black text-gray-800 uppercase italic tracking-tighter text-sm">{value}</span>
        </div>
      )
    },
    {
      key: "id",
      label: "Node Hash",
      render: (val: string) => (
        <div className="flex items-center gap-2">
          <Fingerprint className="h-3 w-3 text-gray-400" />
          <span className="font-mono text-[10px] text-gray-400 font-bold uppercase tracking-widest">{val.slice(-10)}</span>
        </div>
      )
    },
    {
      key: "createdAt",
      label: "Initialization Date",
      render: (val: string) => (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-black text-gray-500 uppercase">
          <CalendarDays className="h-3 w-3" />
          {val ? new Date(val).toLocaleDateString() : "PENDING"}
        </div>
      )
    }
  ]

  return (
    <DashboardLayout title="Divisional Hierarchy">
      <div className="space-y-6 max-w-full pb-10">

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-b-[6px] border-amber-500 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Divisional Matrix</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.3em] mt-1">Academics / Sub-Section Inventory</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 shadow-inner group">
              <Network className="h-7 w-7 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-1 space-y-6">
            <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="bg-gray-900 p-6 text-white border-none">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                  <Plus className="h-4 w-4 text-amber-400" />
                  {editingId ? "Modify Divisional Metadata" : "Initialize New Node"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 leading-none">Node Alias</Label>
                    {editingId && (
                      <Button variant="ghost" size="sm" className="h-6 text-[9px] font-black uppercase text-rose-500" onClick={() => { setEditingId(null); setSectionName("") }}>
                        Abort
                      </Button>
                    )}
                  </div>
                  <Input
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    placeholder="e.g. ALPHA-01"
                    className="h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/30 focus:border-amber-500 font-black uppercase italic italic shadow-inner tracking-widest"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  className="w-full h-16 bg-amber-500 hover:bg-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-amber-100 transition-all duration-300"
                >
                  {editingId ? <Pencil className="h-5 w-5 mr-3" /> : <CheckCircle2 className="h-5 w-5 mr-3" />}
                  {editingId ? "Sync Metadata" : "Authorize Node"}
                </Button>
              </CardContent>
            </Card>

            <div className="bg-amber-600 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-xl">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1 italic">Total Divisions</p>
              <h3 className="text-5xl font-black tracking-tighter italic">{sections.length}</h3>
              <p className="text-white text-[9px] font-bold uppercase tracking-widest mt-2 underline decoration-white/20 underline-offset-4 decoration-2">Active Hierarchy Components</p>
              <Layers className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 group-hover:scale-110 transition-transform" />
            </div>
          </div>

          <div className="xl:col-span-3">
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
              <AdvancedTable
                columns={columns}
                data={sections}
                loading={loading}
                searchable
                searchPlaceholder="Locate divisional assets..."
                pagination
                onEdit={(row) => {
                  setEditingId(row.id);
                  setSectionName(row.name);
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
          title="Archive Division?"
          description="DANGER: Terminating this node will disrupt all class-section linkages. This protocol is irreversible and will impact asset allocation throughout the academic cluster."
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
