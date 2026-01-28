"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"

export default function Drivers() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: "", phone: "", license: "", route: "" })

  const fetchDrivers = async () => {
    try {
      const res = await apiFetch(`${API_ENDPOINTS.TRANSPORT}/drivers`)
      if (res.ok) {
        const data = await res.json()
        setRows(data)
      }
    } catch (error) {
      console.error("Failed to fetch drivers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDrivers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.license) {
      toast.error("Name, phone and license are required")
      return
    }

    try {
      const res = await apiFetch(`${API_ENDPOINTS.TRANSPORT}/drivers`, {
        method: "POST",
        body: JSON.stringify(form)
      })

      if (res.ok) {
        toast.success("Driver added")
        setForm({ name: "", phone: "", license: "", route: "" })
        fetchDrivers()
      } else {
        toast.error("Failed to add driver")
      }
    } catch (error) {
      toast.error("Error submitting form")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await apiFetch(`${API_ENDPOINTS.TRANSPORT}/drivers/${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        toast.success("Driver deleted")
        fetchDrivers()
      }
    } catch (error) {
      toast.error("Failed to delete")
    }
  }

  return (
    <DashboardLayout title="Drivers">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="bg-pink-50 border-b border-pink-100">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <User className="h-5 w-5" />
                Add Driver
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-red-500">Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-white border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-500">Phone *</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-white border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-500">License No *</Label>
                  <Input value={form.license} onChange={(e) => setForm({ ...form, license: e.target.value })} className="bg-white border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label>Route</Label>
                  <Input value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} className="bg-white border-gray-200" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="bg-blue-900 hover:bg-blue-800 px-6">Save</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="bg-pink-50 border-b border-pink-100">
              <CardTitle className="text-lg text-gray-800">Driver List</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-pink-50 hover:bg-pink-50">
                      <TableHead className="font-bold text-gray-700 uppercase">Name</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Phone</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">License</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Route</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow> :
                      rows.length === 0 ? <TableRow><TableCell colSpan={5}>No drivers found</TableCell></TableRow> :
                        rows.map((row) => (
                          <TableRow key={row._id}>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.phone}</TableCell>
                            <TableCell>{row.licenseNumber}</TableCell>
                            <TableCell>{row.route || "-"}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(row._id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
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
