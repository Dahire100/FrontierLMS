"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pencil,
  Trash2,
  Save,
  Search,
  Plus,
  ArrowRight,
  Loader2
} from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { useToast } from "@/components/ui/use-toast"

export default function Division() {
  const [divisions, setDivisions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [form, setForm] = useState({
    name: "",
    percentFrom: "",
    percentUpto: "",
    description: "",
  })

  useEffect(() => {
    fetchDivisions()
  }, [])

  const fetchDivisions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/divisions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setDivisions(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.name || !form.percentFrom || !form.percentUpto) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const url = isEditing ? `${API_URL}/api/divisions/${editingId}` : `${API_URL}/api/divisions`
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        toast({ title: "Success", description: `Division ${isEditing ? 'updated' : 'added'} successfully` })
        fetchDivisions()
        resetForm()
      } else {
        toast({ title: "Error", description: "Operation failed", variant: "destructive" })
      }
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (division: any) => {
    setForm({
      name: division.name,
      percentFrom: division.percentFrom,
      percentUpto: division.percentUpto,
      description: division.description || ""
    })
    setIsEditing(true)
    setEditingId(division._id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/divisions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        toast({ title: "Success", description: "Division deleted" })
        fetchDivisions()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const resetForm = () => {
    setForm({ name: "", percentFrom: "", percentUpto: "", description: "" })
    setIsEditing(false)
    setEditingId(null)
  }

  return (
    <DashboardLayout title="Division">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Division Configuration</h2>
          <p className="text-muted-foreground mt-1">Define examination divisions based on percentage ranges.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Form Section */}
          <Card className="xl:col-span-1 border-gray-100 shadow-md bg-white/50 backdrop-blur-sm h-fit">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-800">
                {isEditing ? <Pencil className="h-5 w-5 text-blue-600" /> : <Plus className="h-5 w-5 text-blue-600" />}
                {isEditing ? "Edit Division" : "Add New Division"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">Division Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g. 1st Division"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="percentFrom" className="text-gray-700 font-medium">From (%) <span className="text-red-500">*</span></Label>
                  <Input
                    id="percentFrom"
                    type="number"
                    value={form.percentFrom}
                    onChange={(e) => setForm({ ...form, percentFrom: e.target.value })}
                    className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-100"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="percentUpto" className="text-gray-700 font-medium">Upto (%) <span className="text-red-500">*</span></Label>
                  <Input
                    id="percentUpto"
                    type="number"
                    value={form.percentUpto}
                    onChange={(e) => setForm({ ...form, percentUpto: e.target.value })}
                    className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-100"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700 font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-100"
                  rows={3}
                  placeholder="Comments or remarks..."
                />
              </div>

              <div className="pt-2 flex gap-2">
                {isEditing && (
                  <Button variant="outline" className="w-full" onClick={resetForm}>Cancel</Button>
                )}
                <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {isEditing ? 'Update' : 'Save'} Division
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* List Section */}
          <Card className="xl:col-span-2 border-gray-100 shadow-md bg-white overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium text-gray-800">Division List</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-700">Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Percent Range</TableHead>
                      <TableHead className="font-semibold text-gray-700">Description</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8"><Loader2 className="mx-auto animate-spin" /></TableCell>
                      </TableRow>
                    ) : divisions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No divisions found</TableCell>
                      </TableRow>
                    ) : (
                      divisions.map((row) => (
                        <TableRow key={row._id} className="hover:bg-gray-50/50 transition-colors">
                          <TableCell className="font-bold text-gray-900">{row.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded w-fit">
                              <span>{row.percentFrom}%</span>
                              <ArrowRight className="w-3 h-3" />
                              <span>{row.percentUpto}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">{row.description}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => handleEdit(row)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(row._id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
    </DashboardLayout>
  )
}
