"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Wallet, Loader2, Pencil } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

interface Hostel {
  _id: string
  name: string
}

interface FeeAllocation {
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
  monthlyFee: number
  status: string
  allocationDate: string
}

export default function HostelFees() {
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [fees, setFees] = useState<FeeAllocation[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFee, setEditFee] = useState("")

  const [filters, setFilters] = useState({
    hostelId: "",
    status: "active"
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

  const fetchFees = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      const queryParams = new URLSearchParams()
      if (filters.hostelId) queryParams.append("hostelId", filters.hostelId)
      if (filters.status) queryParams.append("status", filters.status)

      const response = await fetch(`${API_URL}/api/hostel/fees?${queryParams}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await response.json()

      if (data.success) {
        setFees(data.data)
      } else {
        toast.error("Failed to fetch hostel fees")
      }
    } catch (error) {
      console.error("Error fetching fees:", error)
      toast.error("Failed to fetch hostel fees")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHostels()
    fetchFees()
  }, [])

  useEffect(() => {
    fetchFees()
  }, [filters.hostelId, filters.status])

  const handleEdit = (allocation: FeeAllocation) => {
    setEditingId(allocation._id)
    setEditFee(allocation.monthlyFee.toString())
  }

  const handleUpdateFee = async (allocationId: string) => {
    if (!editFee) {
      toast.error("Please enter a valid fee amount")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/hostel/fees/${allocationId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ monthlyFee: parseFloat(editFee) })
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Fee updated successfully")
        setEditingId(null)
        setEditFee("")
        fetchFees()
      } else {
        toast.error(data.error || "Failed to update fee")
      }
    } catch (error) {
      console.error("Error updating fee:", error)
      toast.error("Failed to update fee")
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditFee("")
  }

  const totalFees = fees.reduce((sum, fee) => sum + fee.monthlyFee, 0)
  const activeFees = fees.filter(f => f.status === "active")

  return (
    <DashboardLayout title="Hostel Fees">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">{fees.length}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Active Allocations</p>
                  <p className="text-3xl font-bold text-green-600">{activeFees.length}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Monthly Fees</p>
                  <p className="text-3xl font-bold text-purple-600">₹{totalFees.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="bg-pink-50 border-b border-pink-100">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Wallet className="h-5 w-5" />
              Filter Hostel Fees
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hostel</Label>
                <Select value={filters.hostelId || undefined} onValueChange={(value) => setFilters({ ...filters, hostelId: value })}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="All hostels" />
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
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="vacated">Vacated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fee List */}
        <Card>
          <CardHeader className="bg-pink-50 border-b border-pink-100">
            <CardTitle className="text-lg text-gray-800">Hostel Fee List</CardTitle>
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
                      <TableHead className="font-bold text-gray-700 uppercase">Roll No</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Student</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Class</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Hostel</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Room</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase text-right">Monthly Fee</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Status</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                          No fee records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      fees.map((fee) => (
                        <TableRow key={fee._id}>
                          <TableCell>{fee.studentId.rollNumber}</TableCell>
                          <TableCell className="font-medium">
                            {fee.studentId.firstName} {fee.studentId.lastName}
                          </TableCell>
                          <TableCell>{fee.studentId.class}</TableCell>
                          <TableCell>{fee.hostelId.name}</TableCell>
                          <TableCell>{fee.roomId.roomNumber}</TableCell>
                          <TableCell className="text-right">
                            {editingId === fee._id ? (
                              <div className="flex gap-2 items-center justify-end">
                                <Input
                                  type="number"
                                  value={editFee}
                                  onChange={(e) => setEditFee(e.target.value)}
                                  className="w-24"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateFee(fee._id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEdit}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <span>₹{fee.monthlyFee.toFixed(2)}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${fee.status === "active"
                              ? "bg-green-100 text-green-800"
                              : fee.status === "vacated"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-yellow-100 text-yellow-800"
                              }`}>
                              {fee.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-center">
                              {editingId !== fee._id && fee.status === "active" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(fee)}
                                >
                                  <Pencil className="h-4 w-4" />
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
