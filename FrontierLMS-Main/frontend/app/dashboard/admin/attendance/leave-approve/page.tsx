"use client"

import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlaneLanding, Loader2, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface LeaveRequest {
    _id: string
    student?: { firstName: string; lastName: string }
    leaveType?: { name: string }
    startDate: string
    endDate: string
    reason?: string
    status: string
}

export default function LeaveApprove() {
    const { toast } = useToast()
    const [requests, setRequests] = useState<LeaveRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/leaves`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                // Filter for pending requests
                const allRequests = Array.isArray(data) ? data : data.data || []
                setRequests(allRequests.filter((r: LeaveRequest) => r.status === 'pending'))
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to load leave requests", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (id: string) => {
        setActionLoading(id)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/leaves/${id}/approve`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token}` }
            })

            if (res.ok) {
                toast({ title: "Approved", description: "Leave request approved successfully" })
                fetchRequests()
            } else {
                const err = await res.json()
                toast({ title: "Error", description: err.error || "Failed to approve", variant: "destructive" })
            }
        } catch {
            toast({ title: "Error", description: "Network error", variant: "destructive" })
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (id: string) => {
        setActionLoading(id)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/leaves/${id}/reject`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token}` }
            })

            if (res.ok) {
                toast({ title: "Rejected", description: "Leave request rejected" })
                fetchRequests()
            } else {
                const err = await res.json()
                toast({ title: "Error", description: err.error || "Failed to reject", variant: "destructive" })
            }
        } catch {
            toast({ title: "Error", description: "Network error", variant: "destructive" })
        } finally {
            setActionLoading(null)
        }
    }

    const filteredRequests = requests.filter(r => {
        const studentName = `${r.student?.firstName || ''} ${r.student?.lastName || ''}`.toLowerCase()
        return studentName.includes(searchTerm.toLowerCase())
    })

    return (
        <DashboardLayout title="Leave Approve">
            <div className="space-y-6">
                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <PlaneLanding className="h-5 w-5" />
                            Pending Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Search Student</Label>
                                <Input
                                    placeholder="Name / ID"
                                    className="bg-white border-gray-200"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Input value="Pending" readOnly className="bg-white border-gray-200" />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={fetchRequests} className="bg-blue-900 hover:bg-blue-800">
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg text-gray-800">Requests ({filteredRequests.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-pink-50 hover:bg-pink-50">
                                            <TableHead className="font-bold text-gray-700 uppercase">Student</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Type</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">From</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">To</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Reason</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRequests.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    No pending leave requests.
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredRequests.map((r) => (
                                            <TableRow key={r._id}>
                                                <TableCell className="font-medium">
                                                    {r.student?.firstName} {r.student?.lastName}
                                                </TableCell>
                                                <TableCell>{r.leaveType?.name || 'N/A'}</TableCell>
                                                <TableCell>{new Date(r.startDate).toLocaleDateString()}</TableCell>
                                                <TableCell>{new Date(r.endDate).toLocaleDateString()}</TableCell>
                                                <TableCell className="max-w-[200px] truncate">{r.reason || '-'}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={() => handleApprove(r._id)}
                                                        disabled={actionLoading === r._id}
                                                    >
                                                        {actionLoading === r._id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <><CheckCircle className="h-4 w-4 mr-1" /> Approve</>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-red-500 text-red-600 hover:bg-red-50"
                                                        onClick={() => handleReject(r._id)}
                                                        disabled={actionLoading === r._id}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" /> Reject
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
