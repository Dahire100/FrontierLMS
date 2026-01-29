"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Home, Pencil, Trash2, Loader2 } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

interface Hostel {
  _id: string
  name: string
  type: "boys" | "girls" | "mixed"
  address?: string
  warden?: {
    name?: string
    phone?: string
    email?: string
  }
  totalRooms: number
  totalCapacity: number
  totalOccupied: number
  occupancyRate: number
  isActive: boolean
}

export default function HostelList() {
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: "",
    type: "boys" as "boys" | "girls" | "mixed",
    address: "",
    wardenName: "",
    wardenPhone: "",
    wardenEmail: ""
  })

  const fetchHostels = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/hostel`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await response.json()

      if (data.success) {
        setHostels(data.data)
      } else {
        toast.error("Failed to fetch hostels")
      }
    } catch (error) {
      console.error("Error fetching hostels:", error)
      toast.error("Failed to fetch hostels")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHostels()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.type) {
      toast.error("Name and type are required")
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem("token")

      const payload = {
        name: form.name,
        type: form.type,
        address: form.address,
        warden: {
          name: form.wardenName,
          phone: form.wardenPhone,
          email: form.wardenEmail
        }
      }

      const url = editingId
        ? `${API_URL}/api/hostel/${editingId}`
        : `${API_URL}/api/hostel`

      const method = editingId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        toast.success(editingId ? "Hostel updated successfully" : "Hostel created successfully")
        setForm({
          name: "",
          type: "boys",
          address: "",
          wardenName: "",
          wardenPhone: "",
          wardenEmail: ""
        })
        setEditingId(null)
        fetchHostels()
      } else {
        toast.error(data.error || "Failed to save hostel")
      }
    } catch (error) {
      console.error("Error saving hostel:", error)
      toast.error("Failed to save hostel")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (hostel: Hostel) => {
    setForm({
      name: hostel.name,
      type: hostel.type,
      address: hostel.address || "",
      wardenName: hostel.warden?.name || "",
      wardenPhone: hostel.warden?.phone || "",
      wardenEmail: hostel.warden?.email || ""
    })
    setEditingId(hostel._id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hostel?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/hostel/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Hostel deleted successfully")
        fetchHostels()
      } else {
        toast.error(data.error || "Failed to delete hostel")
      }
    } catch (error) {
      console.error("Error deleting hostel:", error)
      toast.error("Failed to delete hostel")
    }
  }

  const cancelEdit = () => {
    setForm({
      name: "",
      type: "boys",
      address: "",
      wardenName: "",
      wardenPhone: "",
      wardenEmail: ""
    })
    setEditingId(null)
  }

  return (
    <DashboardLayout title="Hostel List">
      <div className="space-y-6">
        <Card>
          <CardHeader className="bg-pink-50 border-b border-pink-100">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Home className="h-5 w-5" />
              {editingId ? "Edit Hostel" : "Add Hostel"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-red-500">Name *</Label>
                  <Input
                    placeholder="Hostel name"
                    className="bg-white border-gray-200"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-500">Type *</Label>
                  <Select value={form.type} onValueChange={(value: any) => setForm({ ...form, type: value })}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boys">Boys</SelectItem>
                      <SelectItem value="girls">Girls</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    placeholder="Address"
                    className="bg-white border-gray-200"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Warden Name</Label>
                  <Input
                    placeholder="Warden name"
                    className="bg-white border-gray-200"
                    value={form.wardenName}
                    onChange={(e) => setForm({ ...form, wardenName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Warden Phone</Label>
                  <Input
                    placeholder="Phone number"
                    className="bg-white border-gray-200"
                    value={form.wardenPhone}
                    onChange={(e) => setForm({ ...form, wardenPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Warden Email</Label>
                  <Input
                    placeholder="Email address"
                    className="bg-white border-gray-200"
                    value={form.wardenEmail}
                    onChange={(e) => setForm({ ...form, wardenEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                {editingId && (
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  className="bg-blue-900 hover:bg-blue-800"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingId ? "Update" : "Save"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-pink-50 border-b border-pink-100">
            <CardTitle className="text-gray-800 text-lg">Hostels</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-pink-50 hover:bg-pink-50">
                      <TableHead className="font-bold text-gray-700 uppercase">Name</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Type</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Warden</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase text-right">Rooms</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase text-right">Capacity</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase text-right">Occupied</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase text-right">Occupancy</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hostels.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                          No hostels found. Add your first hostel above.
                        </TableCell>
                      </TableRow>
                    ) : (
                      hostels.map((hostel) => (
                        <TableRow key={hostel._id}>
                          <TableCell className="font-medium">{hostel.name}</TableCell>
                          <TableCell className="capitalize">{hostel.type}</TableCell>
                          <TableCell>{hostel.warden?.name || "-"}</TableCell>
                          <TableCell className="text-right">{hostel.totalRooms}</TableCell>
                          <TableCell className="text-right">{hostel.totalCapacity}</TableCell>
                          <TableCell className="text-right">{hostel.totalOccupied}</TableCell>
                          <TableCell className="text-right">{hostel.occupancyRate}%</TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(hostel)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(hostel._id)}
                              >
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
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

