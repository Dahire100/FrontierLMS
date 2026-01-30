"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BedDouble, Loader2, UserX } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

interface Hostel {
  _id: string
  name: string
}

interface Room {
  _id: string
  roomNumber: string
  capacity: number
  occupiedBeds: number
}

interface Student {
  _id: string
  firstName: string
  lastName: string
  rollNumber: string
  class: string
}

interface Allocation {
  _id: string
  hostelId: {
    _id: string
    name: string
  }
  roomId: {
    _id: string
    roomNumber: string
  }
  studentId: {
    _id: string
    firstName: string
    lastName: string
    rollNumber: string
    class: string
  }
  bedNumber?: string
  monthlyFee: number
  status: string
  allocationDate: string
  expiryDate?: string
  remarks?: string
}

export default function BedAllocation() {
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    hostelId: "",
    roomId: "",
    studentId: "",
    bedNumber: "",
    monthlyFee: "",
    expiryDate: "",
    remarks: ""
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

  const fetchRooms = async (hostelId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/hostel/${hostelId}/rooms`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await response.json()

      if (data.success) {
        setRooms(data.data)
      }
    } catch (error) {
      console.error("Error fetching rooms:", error)
    }
  }

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/students`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await response.json()

      // The students API returns an array directly, not { success: true, data: ... }
      if (Array.isArray(data)) {
        setStudents(data)
      } else if (data.success && Array.isArray(data.data)) {
        // Fallback in case API changes
        setStudents(data.data)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const fetchAllocations = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/hostel/allocations`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await response.json()

      if (data.success) {
        setAllocations(data.data)
      } else {
        toast.error("Failed to fetch allocations")
      }
    } catch (error) {
      console.error("Error fetching allocations:", error)
      toast.error("Failed to fetch allocations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHostels()
    fetchStudents()
    fetchAllocations()
  }, [])

  useEffect(() => {
    if (form.hostelId) {
      fetchRooms(form.hostelId)
    } else {
      setRooms([])
    }
  }, [form.hostelId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.hostelId || !form.roomId || !form.studentId || !form.monthlyFee) {
      toast.error("Hostel, room, student, and monthly fee are required")
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem("token")

      const payload = {
        hostelId: form.hostelId,
        roomId: form.roomId,
        studentId: form.studentId,
        bedNumber: form.bedNumber,
        monthlyFee: parseFloat(form.monthlyFee),
        expiryDate: form.expiryDate || undefined,
        remarks: form.remarks
      }

      const response = await fetch(`${API_URL}/api/hostel/allocations`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Student allocated successfully")
        setForm({
          hostelId: "",
          roomId: "",
          studentId: "",
          bedNumber: "",
          monthlyFee: "",
          expiryDate: "",
          remarks: ""
        })
        fetchAllocations()
      } else {
        toast.error(data.error || "Failed to allocate student")
      }
    } catch (error) {
      console.error("Error allocating student:", error)
      toast.error("Failed to allocate student")
    } finally {
      setSubmitting(false)
    }
  }

  const handleVacate = async (allocationId: string) => {
    if (!confirm("Are you sure you want to vacate this student?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/hostel/allocations/${allocationId}/vacate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ remarks: "Vacated by admin" })
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Student vacated successfully")
        fetchAllocations()
      } else {
        toast.error(data.error || "Failed to vacate student")
      }
    } catch (error) {
      console.error("Error vacating student:", error)
      toast.error("Failed to vacate student")
    }
  }

  return (
    <DashboardLayout title="Bed Allocation">
      <div className="space-y-6">
        <Card>
          <CardHeader className="bg-pink-50 border-b border-pink-100">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <BedDouble className="h-5 w-5" />
              Allocate Bed
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-red-500">Hostel *</Label>
                  <Select value={form.hostelId} onValueChange={(value) => setForm({ ...form, hostelId: value, roomId: "" })}>
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
                  <Label className="text-red-500">Room *</Label>
                  <Select value={form.roomId} onValueChange={(value) => setForm({ ...form, roomId: value })} disabled={!form.hostelId}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room._id} value={room._id}>
                          {room.roomNumber} ({room.occupiedBeds}/{room.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-red-500">Student *</Label>
                  <Select value={form.studentId} onValueChange={(value) => setForm({ ...form, studentId: value })}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student._id} value={student._id}>
                          {student.firstName} {student.lastName} ({student.rollNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Bed Number</Label>
                  <Input
                    placeholder="Bed slot"
                    className="bg-white border-gray-200"
                    value={form.bedNumber}
                    onChange={(e) => setForm({ ...form, bedNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-500">Monthly Fee *</Label>
                  <Input
                    type="number"
                    placeholder="Amount"
                    className="bg-white border-gray-200"
                    value={form.monthlyFee}
                    onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    className="bg-white border-gray-200"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Remarks</Label>
                  <Input
                    placeholder="Optional notes"
                    className="bg-white border-gray-200"
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-blue-900 hover:bg-blue-800"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Allocating...
                    </>
                  ) : (
                    "Allocate"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-pink-50 border-b border-pink-100">
            <CardTitle className="text-gray-800 text-lg">Allocations</CardTitle>
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
                      <TableHead className="font-bold text-gray-700 uppercase">Student</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Roll No</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Hostel</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Room</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Bed</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase text-right">Monthly Fee</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Status</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                          No allocations found. Allocate your first student above.
                        </TableCell>
                      </TableRow>
                    ) : (
                      allocations.map((allocation) => (
                        <TableRow key={allocation._id}>
                          <TableCell className="font-medium">
                            {allocation.studentId.firstName} {allocation.studentId.lastName}
                          </TableCell>
                          <TableCell>{allocation.studentId.rollNumber}</TableCell>
                          <TableCell>{allocation.hostelId.name}</TableCell>
                          <TableCell>{allocation.roomId.roomNumber}</TableCell>
                          <TableCell>{allocation.bedNumber || "-"}</TableCell>
                          <TableCell className="text-right">₹{allocation.monthlyFee}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${allocation.status === "active"
                              ? "bg-green-100 text-green-800"
                              : allocation.status === "vacated"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-yellow-100 text-yellow-800"
                              }`}>
                              {allocation.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-center">
                              {allocation.status === "active" && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleVacate(allocation._id)}
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              )}
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
