"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bed, Pencil, Trash2, Loader2 } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

interface Hostel {
  _id: string
  name: string
}

interface Room {
  _id: string
  hostelId: {
    _id: string
    name: string
  }
  roomNumber: string
  floor?: string
  capacity: number
  occupiedBeds: number
  roomType: string
  facilities: string[]
  isActive: boolean
}

export default function Rooms() {
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    hostelId: "",
    roomNumber: "",
    floor: "",
    capacity: "4",
    roomType: "dormitory",
    facilities: ""
  })

  const fetchHostels = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/hostel`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await response.json()

      if (data.success) {
        setHostels(data.data)
      }
    } catch (error) {
      console.error("Error fetching hostels:", error)
    }
  }

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      // Fetch rooms for all hostels
      const hostelResponse = await fetch(`${API_URL}/api/hostel`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const hostelData = await hostelResponse.json()

      if (hostelData.success && hostelData.data.length > 0) {
        const allRooms: Room[] = []

        for (const hostel of hostelData.data) {
          const roomResponse = await fetch(`${API_URL}/api/hostel/${hostel._id}/rooms`, {
            headers: { "Authorization": `Bearer ${token}` }
          })
          const roomData = await roomResponse.json()

          if (roomData.success) {
            allRooms.push(...roomData.data.map((room: any) => ({
              ...room,
              hostelId: { _id: hostel._id, name: hostel.name }
            })))
          }
        }

        setRooms(allRooms)
      }
    } catch (error) {
      console.error("Error fetching rooms:", error)
      toast.error("Failed to fetch rooms")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHostels()
    fetchRooms()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.hostelId || !form.roomNumber || !form.capacity) {
      toast.error("Hostel, room number, and capacity are required")
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem("token")

      const payload = {
        hostelId: form.hostelId,
        roomNumber: form.roomNumber,
        floor: form.floor,
        capacity: parseInt(form.capacity),
        roomType: form.roomType,
        facilities: form.facilities ? form.facilities.split(",").map(f => f.trim()) : []
      }

      const url = editingId
        ? `${API_URL}/api/hostel/rooms/${editingId}`
        : `${API_URL}/api/hostel/rooms`

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
        toast.success(editingId ? "Room updated successfully" : "Room created successfully")
        setForm({
          hostelId: "",
          roomNumber: "",
          floor: "",
          capacity: "4",
          roomType: "dormitory",
          facilities: ""
        })
        setEditingId(null)
        fetchRooms()
      } else {
        toast.error(data.error || "Failed to save room")
      }
    } catch (error) {
      console.error("Error saving room:", error)
      toast.error("Failed to save room")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (room: Room) => {
    setForm({
      hostelId: room.hostelId._id,
      roomNumber: room.roomNumber,
      floor: room.floor || "",
      capacity: room.capacity.toString(),
      roomType: room.roomType,
      facilities: room.facilities.join(", ")
    })
    setEditingId(room._id)
  }

  const cancelEdit = () => {
    setForm({
      hostelId: "",
      roomNumber: "",
      floor: "",
      capacity: "4",
      roomType: "dormitory",
      facilities: ""
    })
    setEditingId(null)
  }

  return (
    <DashboardLayout title="Hostel Rooms">
      <div className="space-y-6">
        <Card>
          <CardHeader className="bg-pink-50 border-b border-pink-100">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Bed className="h-5 w-5" />
              {editingId ? "Edit Room" : "Add Room"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-red-500">Hostel *</Label>
                  <Select value={form.hostelId} onValueChange={(value) => setForm({ ...form, hostelId: value })}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select hostel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostels.map((hostel) => (
                        <SelectItem key={hostel._id} value={hostel._id}>
                          {hostel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-red-500">Room No *</Label>
                  <Input
                    placeholder="Room number"
                    className="bg-white border-gray-200"
                    value={form.roomNumber}
                    onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Floor</Label>
                  <Input
                    placeholder="Floor"
                    className="bg-white border-gray-200"
                    value={form.floor}
                    onChange={(e) => setForm({ ...form, floor: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-red-500">Room Type *</Label>
                  <Select value={form.roomType} onValueChange={(value) => setForm({ ...form, roomType: value })}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                      <SelectItem value="triple">Triple</SelectItem>
                      <SelectItem value="dormitory">Dormitory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-red-500">Capacity *</Label>
                  <Input
                    type="number"
                    placeholder="Beds"
                    className="bg-white border-gray-200"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Facilities</Label>
                  <Input
                    placeholder="AC, WiFi, Attached Bath (comma separated)"
                    className="bg-white border-gray-200"
                    value={form.facilities}
                    onChange={(e) => setForm({ ...form, facilities: e.target.value })}
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
            <CardTitle className="text-gray-800 text-lg">Rooms</CardTitle>
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
                      <TableHead className="font-bold text-gray-700 uppercase">Hostel</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Room</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Floor</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Type</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase text-right">Capacity</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase text-right">Occupied</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Facilities</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                          No rooms found. Add your first room above.
                        </TableCell>
                      </TableRow>
                    ) : (
                      rooms.map((room) => (
                        <TableRow key={room._id}>
                          <TableCell>{room.hostelId.name}</TableCell>
                          <TableCell className="font-medium">{room.roomNumber}</TableCell>
                          <TableCell>{room.floor || "-"}</TableCell>
                          <TableCell className="capitalize">{room.roomType}</TableCell>
                          <TableCell className="text-right">{room.capacity}</TableCell>
                          <TableCell className="text-right">{room.occupiedBeds}</TableCell>
                          <TableCell>{room.facilities.length > 0 ? room.facilities.join(", ") : "-"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(room)}
                              >
                                <Pencil className="h-4 w-4" />
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
