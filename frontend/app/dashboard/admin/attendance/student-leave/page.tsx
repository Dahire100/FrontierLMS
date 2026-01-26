"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  CalendarDays,
  UserRound,
  Loader2,
  Check,
  X
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

export default function StudentLeave() {
  const { toast } = useToast()
  const [leaves, setLeaves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchLeaves()
  }, [])

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/leaves?requesterType=student`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const result = await res.json()
      if (result.success && Array.isArray(result.data)) {
        setLeaves(result.data)
      } else {
        setLeaves([])
        toast({ title: "No Data", description: "No leave requests found", variant: "default" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch leave requests", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem("token")
      const endpoint = action === 'approve' ? 'approve' : 'reject'
      const res = await fetch(`${API_URL}/api/leaves/${id}/${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(action === 'approve' ? { approvalRemarks: 'Approved by admin' } : { rejectionReason: 'Rejected by admin' })
      })
      const result = await res.json()
      if (result.success) {
        toast({ title: "Success", description: `Leave request ${action}ed` })
        fetchLeaves()
      } else {
        toast({ title: "Error", description: result.error || `Failed to ${action} request`, variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: `Failed to ${action} request`, variant: "destructive" })
    }
  }

  const filteredLeaves = leaves.filter(leave => {
    const matchesSearch = leave.requesterId?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      leave.requesterId?.lastName?.toLowerCase().includes(search.toLowerCase())
    if (filter === 'all') return matchesSearch
    return matchesSearch && leave.status === filter
  })

  return (
    <DashboardLayout title="Student Leave">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-end text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="text-blue-900">Attendance</span>
            <span>/</span>
            <span>Student Leave</span>
          </span>
        </div>

        <Card>
          <CardHeader className="bg-pink-50 border-b border-pink-100">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <UserRound className="h-5 w-5" />
                Student Leave List
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {/* Export buttons mockups */}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-end">
                <div className="w-32">
                  <Label>Status</Label>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-72">
                  <Label>Search Student:</Label>
                  <Input
                    placeholder="Search by name..."
                    className="bg-white border-gray-200"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-pink-50 hover:bg-pink-50">
                    <TableHead className="font-bold text-gray-700 uppercase">Name</TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase">Apply Date</TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase">Leave Date</TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase">Days</TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase">Status</TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase">Description</TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredLeaves.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No leave requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeaves.map((leave) => (
                      <TableRow key={leave._id}>
                        <TableCell className="font-medium">
                          {leave.requesterId?.firstName} {leave.requesterId?.lastName}
                        </TableCell>
                        <TableCell>{new Date(leave.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{leave.totalDays}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                              leave.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                            }`}>
                            {leave.status}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[18rem] truncate" title={leave.reason}>{leave.reason}</TableCell>
                        <TableCell className="text-right">
                          {leave.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                className="h-8 bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleStatusUpdate(leave._id, 'approve')}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handleStatusUpdate(leave._id, 'reject')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
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
    </DashboardLayout>
  )
}
