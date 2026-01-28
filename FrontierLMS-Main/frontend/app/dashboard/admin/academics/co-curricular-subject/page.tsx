"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CalendarDays,
  Pencil,
  Trash2,
  CheckCircle2,
  Loader2,
  Music,
  Palette,
  Trophy,
  Medal,
  Search,
  Plus
} from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

interface Subject {
  _id: string
  name: string
  code: string
  type: string
  description?: string
  classes: any[]
}

const initialFormState = {
  name: "",
  code: "",
  type: "co-curricular" as string,
  description: ""
}

export default function CoCurricularSubject() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [form, setForm] = useState(initialFormState)
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  // Dialogs
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      setFetching(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/subjects?type=co-curricular`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setSubjects(data.data)
      }
    } catch (error) {
      toast.error("Failed to load activities")
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.name || !form.code) {
      toast.error("Name and Code are required")
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const url = isEditing
        ? `${API_URL}/api/subjects/${editId}`
        : `${API_URL}/api/subjects`

      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (data.success) {
        toast.success(isEditing ? "Activity updated" : "Activity created")
        setForm(initialFormState)
        setIsEditing(false)
        setEditId(null)
        fetchSubjects()
      } else {
        toast.error(data.error || "Operation failed")
      }
    } catch (error) {
      toast.error("Network error")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm.id) return

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/subjects/${deleteConfirm.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (res.ok) {
        toast.success("Activity removed")
        fetchSubjects()
      } else {
        toast.error("Delete failed")
      }
    } catch (error) {
      toast.error("Error deleting activity")
    } finally {
      setDeleteConfirm({ open: false, id: null })
    }
  }

  const handleEdit = (subject: Subject) => {
    setForm({
      name: subject.name,
      code: subject.code,
      type: subject.type,
      description: subject.description || ""
    })
    setIsEditing(true)
    setEditId(subject._id)
  }

  const columns = [
    {
      key: "name",
      label: "Activity Name",
      render: (val: string) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-purple-600" />
          </div>
          <span className="font-bold text-gray-700">{val}</span>
        </div>
      )
    },
    {
      key: "code",
      label: "Code",
      render: (val: string) => <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">{val}</span>
    },
    {
      key: "description",
      label: "Category/Description",
      render: (val: string) => <span className="text-gray-500 text-sm">{val || "N/A"}</span>
    }
  ]

  return (
    <DashboardLayout title="Co-Curricular Activities">
      <div className="space-y-6 max-w-full pb-10">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-2 bg-pink-500 rounded-full animate-ping" />
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">Holistic Development</h1>
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] ml-1">Academics / Extra-Curricular Management</p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
            <Medal className="h-64 w-64 rotate-12" />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form Section */}
          <Card className="xl:col-span-1 border-none shadow-xl rounded-[2rem] overflow-hidden bg-white h-fit sticky top-6">
            <CardHeader className="bg-purple-600 p-6 text-white border-none">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                {isEditing ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {isEditing ? "Edit Activity" : "New Activity"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-5">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Activity Name</Label>
                <div className="relative">
                  <Palette className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Music, Karate"
                    className="h-12 pl-12 rounded-xl bg-gray-50 border-gray-100 focus:border-purple-500 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Activity Code</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. CCA-001"
                  className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:border-purple-500 font-bold"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description..."
                  className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:border-purple-500 font-bold"
                />
              </div>

              <div className="pt-4 flex gap-3">
                {isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setForm(initialFormState);
                      setEditId(null);
                    }}
                    className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-purple-200"
                >
                  {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (isEditing ? "Update" : "Create")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* List Section */}
          <Card className="xl:col-span-2 border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-8 bg-white border-b border-gray-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-gray-800 uppercase tracking-tighter">Activity Registry</CardTitle>
                <p className="text-purple-400 text-[10px] font-black uppercase tracking-widest mt-1">Managed Co-Curricular Programs</p>
              </div>
              <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Music className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <AdvancedTable
                columns={columns}
                data={subjects}
                searchable={true}
                searchPlaceholder="Search activities..."
                loading={fetching}
                onEdit={handleEdit}
                onDelete={(item) => setDeleteConfirm({ open: true, id: item._id })}
                headerClassName="bg-gray-50/50"
                className="shadow-none border-none"
              />
            </CardContent>
          </Card>
        </div>

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}
          onConfirm={handleDelete}
          title="Delete Activity?"
          description="This will permanently remove this co-curricular activity. Existing records may be affected."
        />
      </div>
    </DashboardLayout>
  )
}
