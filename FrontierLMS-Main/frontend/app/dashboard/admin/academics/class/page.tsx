"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Plus,
  GraduationCap,
  Users,
  Layers,
  Layout,
  BookOpen,
  Search,
  School,
  Building2,
  Settings2,
  ChevronRight,
  MonitorPlay,
  Shapes,
  Boxes,
  MapPin,
  Pencil,
  Trash2,
  ScanSearch
} from "lucide-react"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import FormModal, { FormField } from "@/components/form-modal"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

interface ClassItem {
  id: string
  className: string
  group: string
  sections: string[]
  studentCount?: number
  roomNumber?: string
}

export default function ClassPage() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteData, setDeleteData] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/classes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        const items = Array.isArray(result) ? result : (result.data || []);

        const mappedData = items.map((item: any) => ({
          id: item._id,
          className: item.name || item.className,
          group: item.group || "Standard",
          sections: item.section ? [item.section] : (item.sections || []),
          studentCount: item.studentCount || 0,
          roomNumber: item.room || "Lab-01"
        }));
        setClasses(mappedData);
      }
    } catch (error) {
      toast.error("Resource fetch failed")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: data.className,
          className: data.className,
          group: data.group,
          sections: data.sections ? data.sections.split(',').map((s: string) => s.trim()) : [],
          room: data.roomNumber
        })
      });

      if (response.ok) {
        toast.success("Structural Unit Created")
        fetchClasses();
        setIsModalOpen(false);
      } else {
        throw new Error("Architecture validation failed")
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleEdit = async (id: string, data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/classes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: data.className,
          className: data.className,
          group: data.group,
          sections: data.sections ? data.sections.split(',').map((s: string) => s.trim()) : [],
          room: data.roomNumber
        })
      });

      if (response.ok) {
        toast.success("Architecture Updated")
        fetchClasses();
        setIsModalOpen(false);
        setEditingId(null);
      } else {
        throw new Error("Update synchronization failed")
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const confirmDelete = async () => {
    if (!deleteData.id) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/classes/${deleteData.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success("Unit Decommissioned")
        fetchClasses();
      } else {
        throw new Error("Decommissioning protocol interrupted")
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setDeleteData({ open: false, id: null });
    }
  }

  const columns = [
    {
      key: "className",
      label: "Unit Designation",
      sortable: true,
      render: (val: string) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center">
            <School className="h-5 w-5 text-rose-500" />
          </div>
          <span className="font-black text-gray-800 uppercase italic tracking-tighter">{val}</span>
        </div>
      )
    },
    {
      key: "group",
      label: "Cluster / Group",
      sortable: true,
      render: (val: string) => (
        <span className="px-3 py-1 bg-gray-50 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100">
          {val}
        </span>
      )
    },
    {
      key: "roomNumber",
      label: "Physical Hub",
      sortable: true,
      render: (val: string) => (
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="h-3 w-3 text-rose-400" />
          <span className="text-xs font-bold font-mono">{val}</span>
        </div>
      )
    },
    {
      key: "sections",
      label: "Divisional Nodes",
      render: (val: string[]) => (
        <div className="flex flex-wrap gap-2">
          {val.map((s, i) => (
            <span key={i} className="h-6 w-6 flex items-center justify-center bg-rose-600 text-white rounded-md text-[10px] font-black shadow-sm">
              {s}
            </span>
          ))}
        </div>
      )
    },
    {
      key: "studentCount",
      label: "Unit Population",
      sortable: true,
      render: (val: number) => (
        <div className="flex items-center gap-3">
          <div className="text-xl font-black text-gray-900 leading-none">{val}</div>
          <div className="text-[9px] font-black text-gray-300 uppercase leading-none tracking-tighter">
            Registered<br />Assets
          </div>
        </div>
      )
    }
  ]

  const formFields: FormField[] = [
    {
      name: "className",
      label: "Unit Name",
      type: "text",
      placeholder: "e.g. GRADE 12 QUANTUM",
      required: true
    },
    {
      name: "group",
      label: "Academic Group",
      type: "text",
      placeholder: "e.g. ADVANCED SCIENCE",
      required: false
    },
    {
      name: "roomNumber",
      label: "Assigned Room No",
      type: "text",
      placeholder: "e.g. HUB-404",
      required: false
    },
    {
      name: "sections",
      label: "Divisions (Comma Separated)",
      type: "text",
      placeholder: "e.g. ALPHA, BETA, GAMMA",
      required: true
    }
  ]

  return (
    <DashboardLayout title="Structural Assets">
      <div className="space-y-6 max-w-full pb-10">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 bg-white rounded-[2rem] shadow-sm border border-gray-100 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-500 rounded-lg shadow-lg shadow-rose-200">
                <Shapes className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Faculty Structure</h1>
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] ml-1">Academic Unit & Infrastructure Management</p>
          </div>
          <Button
            onClick={() => {
              setEditingId(null);
              setIsModalOpen(true);
            }}
            className="h-14 px-8 bg-rose-600 hover:bg-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-rose-100 transition-all duration-300 gap-3"
          >
            <Plus size={20} /> Initialize New Unit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
            <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mb-1">Structural Layers</p>
            <div className="flex items-end gap-3">
              <h3 className="text-5xl font-black tracking-tighter italic">{classes.length}</h3>
              <p className="text-white/40 text-[10px] font-black uppercase mb-2 tracking-tighter">Active Levels</p>
            </div>
            <Boxes className="absolute -right-6 -bottom-6 h-32 w-32 text-white/5 group-hover:rotate-12 transition-transform duration-700" />
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-50 shadow-xl relative overflow-hidden group">
            <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mb-1">Divisional Clusters</p>
            <div className="flex items-end gap-3">
              <h3 className="text-5xl font-black tracking-tighter italic">{classes.reduce((acc, curr) => acc + curr.sections.length, 0)}</h3>
              <p className="text-gray-300 text-[10px] font-black uppercase mb-2 tracking-tighter">Active Nodes</p>
            </div>
            <Layers className="absolute -right-6 -bottom-6 h-32 w-32 text-gray-50" />
          </div>
          <div className="md:col-span-2 bg-rose-600 p-8 rounded-[2.5rem] text-white flex justify-between items-center group">
            <div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1 italic">Population Metrics</p>
              <h3 className="text-5xl font-black tracking-tighter italic">{classes.reduce((acc, curr) => acc + (curr.studentCount || 0), 0)}</h3>
              <p className="text-white text-[10px] font-black uppercase mt-1 tracking-widest">Enrolled Academic Assets</p>
            </div>
            <div className="h-20 w-20 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-50 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-900 rounded-full flex items-center justify-center">
                <ScanSearch className="h-5 w-5 text-rose-500" />
              </div>
              <h2 className="text-lg font-black uppercase tracking-tighter text-gray-800 italic">Inventory Records</h2>
            </div>
            <div className="flex gap-2">
              <div className="h-2 w-2 bg-rose-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Live Structural Sync</span>
            </div>
          </div>
          <AdvancedTable
            columns={columns}
            data={classes}
            loading={loading}
            searchable
            searchPlaceholder="Query structural database..."
            searchFields={['className', 'group', 'roomNumber']}
            pagination
            onEdit={(row) => {
              setEditingId(row.id);
              setIsModalOpen(true);
            }}
            onDelete={(row) => {
              setDeleteData({ open: true, id: row.id });
            }}
          />
        </div>

        <FormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingId(null);
          }}
          title={editingId ? "Modify Structural Metadata" : "Initialize Base Unit"}
          fields={formFields}
          initialData={editingId ? {
            ...classes.find(c => c.id === editingId),
            sections: classes.find(c => c.id === editingId)?.sections.join(', ')
          } : undefined}
          onSubmit={(data: any) => editingId ? handleEdit(editingId, data) : handleAdd(data)}
        />

        <ConfirmationDialog
          open={deleteData.open}
          onOpenChange={(open) => setDeleteData({ open, id: null })}
          onConfirm={confirmDelete}
          title="Decommission Structural Unit?"
          description="WARNING: This protocol will permanently eliminate the specified unit from the faculty architecture. This may impact associated timetable nodes and asset assignments."
        />
      </div>
    </DashboardLayout>
  )
}
