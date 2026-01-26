"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckSquare, Loader2 } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

interface Hostel {
  _id: string
  name: string
}

interface Room {
  _id: string
  roomNumber: string
}

interface Allocation {
  _id: string
  studentId: {
    _id: string
    firstName: string
    lastName: string
    rollNumber: string
  }
  hostelId: {
    _id: string
    name: string
  }
  roomId: {
    _id: string
    roomNumber: string
  }
}

interface AttendanceRecord {
  _id: string
  studentId: {
    _id: string
    firstName: string
    lastName: string
    rollNumber: string
  }
  hostelId: {
    _id: string
    name: string
  }
  roomId?: {
    _id: string
    roomNumber: string
  }
  date: string
  status: string
}

export default function HostelAttendance() {
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [filters, setFilters] = useState({
    hostelId: "",
    roomId: "",
    date: new Date().toISOString().split('T')[0]
  })

  const [attendanceData, setAttendanceData] = useState<{ [key: string]: string }>({})

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

  const fetchAllocations = async () => {
    if (!filters.hostelId) return

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const queryParams = new URLSearchParams({
        hostelId: filters.hostelId,
        status: "active"
      })
      if (filters.roomId) queryParams.append("roomId", filters.roomId)

      const response = await fetch(`${API_URL}/api/hostel/allocations?${queryParams}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await response.json()

      if (data.success) {
        setAllocations(data.data)

        // Initialize attendance data with default "present" status
        const initialAttendance: { [key: string]: string } = {}
        data.data.forEach((allocation: Allocation) => {
          initialAttendance[allocation.studentId._id] = "present"
        })
        setAttendanceData(initialAttendance)
      }
    } catch (error) {
      console.error("Error fetching allocations:", error)
      toast.error("Failed to fetch students")
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendance = async () => {
    if (!filters.date) return

    try {
      const token = localStorage.getItem("token")
      const queryParams = new URLSearchParams({ date: filters.date })
      if (filters.hostelId) queryParams.append("hostelId", filters.hostelId)
      if (filters.roomId) queryParams.append("roomId", filters.roomId)

      const response = await fetch(`${API_URL}/api/hostel/attendance?${queryParams}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await response.json()

      if (data.success) {
        setAttendance(data.data)
      }
    } catch (error) {
      console.error("Error fetching attendance:", error)
    }
  }

  useEffect(() => {
    fetchHostels()
  }, [])

  useEffect(() => {
    if (filters.hostelId) {
      fetchRooms(filters.hostelId)
    } else {
      setRooms([])
    }
  }, [filters.hostelId])

  const handleLoad = () => {
    fetchAllocations()
    fetchAttendance()
  }

  const handleMarkAttendance = async () => {
    if (!filters.hostelId || !filters.date) {
      toast.error("Please select hostel and date")
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem("token")

      const attendanceRecords = allocations.map(allocation => ({
        studentId: allocation.studentId._id,
        hostelId: allocation.hostelId._id,
        roomId: allocation.roomId._id,
        date: filters.date,
        status: attendanceData[allocation.studentId._id] || "present",
        remarks: ""
      }))

      const response = await fetch(`${API_URL}/api/hostel/attendance/bulk`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ attendanceRecords })
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Attendance marked successfully")
        fetchAttendance()
      } else {
        toast.error(data.error || "Failed to mark attendance")
      }
    } catch (error) {
      console.error("Error marking attendance:", error)
      toast.error("Failed to mark attendance")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Hostel Attendance">
      <div className="space-y-6">
        <Card>
          <CardHeader className="bg-pink-50 border-b border-pink-100">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <CheckSquare className="h-5 w-5" />
              Mark Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-red-500">Date *</Label>
                <Input
                  type="date"
                  className="bg-white border-gray-200"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-500">Hostel *</Label>
                <Select value={filters.hostelId} onValueChange={(value) => setFilters({ ...filters, hostelId: value, roomId: "" })}>
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
                <Label>Room (Optional)</Label>
                <Select value={filters.roomId || undefined} onValueChange={(value) => setFilters({ ...filters, roomId: value })} disabled={!filters.hostelId}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="All rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room._id} value={room._id}>
                        {room.roomNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleLoad} className="bg-blue-900 hover:bg-blue-800 w-full">
                  Load Students
                </Button>
              </div>
            </div>

            {allocations.length > 0 && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-pink-50 hover:bg-pink-50">
                        <TableHead className="font-bold text-gray-700 uppercase">Roll No</TableHead>
                        <TableHead className="font-bold text-gray-700 uppercase">Student</TableHead>
                        <TableHead className="font-bold text-gray-700 uppercase">Room</TableHead>
                        <TableHead className="font-bold text-gray-700 uppercase">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allocations.map((allocation) => (
                        <TableRow key={allocation._id}>
                          <TableCell>{allocation.studentId.rollNumber}</TableCell>
                          <TableCell className="font-medium">
                            {allocation.studentId.firstName} {allocation.studentId.lastName}
                          </TableCell>
                          <TableCell>{allocation.roomId.roomNumber}</TableCell>
                          <TableCell>
                            <Select
                              value={attendanceData[allocation.studentId._id] || "present"}
                              onValueChange={(value) => setAttendanceData({
                                ...attendanceData,
                                [allocation.studentId._id]: value
                              })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="present">Present</SelectItem>
                                <SelectItem value="absent">Absent</SelectItem>
                                <SelectItem value="leave">Leave</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleMarkAttendance}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Mark Attendance"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {attendance.length > 0 && (
          <Card>
            <CardHeader className="bg-pink-50 border-b border-pink-100">
              <CardTitle className="text-gray-800 text-lg">Attendance Records</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-pink-50 hover:bg-pink-50">
                      <TableHead className="font-bold text-gray-700 uppercase">Student</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Hostel</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Room</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Date</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell>
                          {record.studentId.firstName} {record.studentId.lastName}
                        </TableCell>
                        <TableCell>{record.hostelId.name}</TableCell>
                        <TableCell>{record.roomId?.roomNumber || "-"}</TableCell>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${record.status === "present"
                            ? "bg-green-100 text-green-800"
                            : record.status === "absent"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                            }`}>
                            {record.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
