"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CalendarDays, ClipboardList, Copy, Download, Loader2, MoreVertical, Pencil, Printer, Search, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function QuestionPaperType() {
  const { toast } = useToast()
  const [types, setTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [newType, setNewType] = useState({ name: "", description: "" })
  const [editingType, setEditingType] = useState<any>(null)

  useEffect(() => {
    fetchTypes()
  }, [])

  const fetchTypes = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/question-types`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setTypes(data.data)
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load types", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!newType.name) {
      toast({ title: "Required", description: "Name is required", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const url = editingType
        ? `${API_URL}/api/question-types/${editingType._id}`
        : `${API_URL}/api/question-types`

      const method = editingType ? "PUT" : "POST"
      const body = editingType ? { ...editingType, ...newType } : newType

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast({ title: "Success", description: `Type ${editingType ? 'updated' : 'created'} successfully` })
        setNewType({ name: "", description: "" })
        setEditingType(null)
        fetchTypes()
      } else {
        toast({ title: "Error", description: data.error || "Operation failed", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Operation failed", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this type?")) return

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/question-types/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (res.ok) {
        toast({ title: "Success", description: "Type deleted successfully" })
        fetchTypes()
      } else {
        toast({ title: "Error", description: "Failed to delete type", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete type", variant: "destructive" })
    }
  }

  const filteredTypes = types.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Use selectedType purely for the edit function scope if needed, but here we use newType state directly
  // Just a helper to populate edit
  const startEdit = (type: any) => {
    setEditingType(type)
    setNewType({ name: type.name, description: type.description || "" })
  }

  const cancelEdit = () => {
    setEditingType(null)
    setNewType({ name: "", description: "" })
  }

  return (
    <DashboardLayout title="Question Types">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Question Types</h2>
            <p className="text-muted-foreground mt-1">Manage categories for exam questions (e.g., MCQ, Theory).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add/Edit Form */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm sticky top-6">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100">
                <CardTitle className="text-lg flex items-center gap-2 text-indigo-900 font-bold">
                  <Pencil className="h-5 w-5" />
                  {editingType ? 'Edit Question Type' : 'Add Question Type'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Name <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="e.g. Multiple Choice"
                    value={newType.name}
                    onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                    className="bg-white border-gray-200 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Description</Label>
                  <Input
                    placeholder="Optional description"
                    value={newType.description}
                    onChange={(e) => setNewType({ ...newType, description: e.target.value })}
                    className="bg-white border-gray-200"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  {editingType && (
                    <Button variant="outline" onClick={cancelEdit} className="border-gray-200 text-gray-600">
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {editingType ? 'Update Type' : 'Save Type'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* List */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                  <ClipboardList className="h-5 w-5 text-indigo-500" />
                  Type List
                </CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search types..."
                    className="pl-9 bg-white border-gray-300 rounded-xl focus:ring-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50/80">
                      <TableRow>
                        <TableHead className="w-12 text-center font-bold text-gray-600">#</TableHead>
                        <TableHead className="font-bold text-gray-600">NAME</TableHead>
                        <TableHead className="font-bold text-gray-600">DESCRIPTION</TableHead>
                        <TableHead className="text-right font-bold text-gray-600 pr-6">ACTION</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" />
                          </TableCell>
                        </TableRow>
                      ) : filteredTypes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-12 text-muted-foreground bg-gray-50/30">
                            No question types found. Add one to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTypes.map((type, idx) => (
                          <TableRow key={type._id} className="hover:bg-indigo-50/30 transition-colors group">
                            <TableCell className="text-center font-medium text-gray-500">{idx + 1}</TableCell>
                            <TableCell className="font-semibold text-gray-900">{type.name}</TableCell>
                            <TableCell className="text-gray-500">{type.description || '-'}</TableCell>
                            <TableCell className="text-right pr-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-gray-100">
                                  <DropdownMenuItem onClick={() => startEdit(type)} className="text-gray-700 focus:text-indigo-600 focus:bg-indigo-50 cursor-pointer">
                                    <Pencil className="h-4 w-4 mr-2" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDelete(type._id)} className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer">
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

