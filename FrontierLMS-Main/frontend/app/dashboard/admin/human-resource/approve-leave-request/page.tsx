"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { Users, CheckCircle, XCircle, Home, Clock, Info } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import { StatusBadge } from "@/components/super-admin/status-badge"

export default function ApproveLeaveRequestPage() {
    const [leaveRequests, setLeaveRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLeaveRequests()
    }, [])

    const fetchLeaveRequests = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/leaves`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const resData = await response.json()
                setLeaveRequests(resData.data || [])
            }
        } catch (error) {
            console.error("Fetch error:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/leaves/${id}/${action}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    approvalRemarks: action === 'approve' ? 'Approved by Admin' : 'Rejected by Admin',
                    rejectionReason: action === 'reject' ? 'Not feasible' : ''
                })
            })

            if (response.ok) {
                toast.success(`Leave request ${action}ed`)
                fetchLeaveRequests()
            } else {
                toast.error("Failed to update leave request")
            }
        } catch (error) {
            toast.error("An error occurred")
        }
    }

    const columns = [
        {
            key: "staff",
            label: "STAFF MEMBER",
            sortable: true,
            render: (_: any, row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{row.requesterId?.firstName} {row.requesterId?.lastName}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{row.requesterType}</span>
                </div>
            )
        },
        {
            key: "leaveType",
            label: "CATEGORY",
            render: (value: string) => <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[11px] font-bold uppercase">{value}</span>
        },
        {
            key: "leaveDate",
            label: "DURATION",
            render: (_: any, row: any) => (
                <div className="flex flex-col">
                    <span className="text-blue-600 font-bold text-xs whitespace-nowrap">
                        {new Date(row.startDate).toLocaleDateString()} - {new Date(row.endDate).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">{row.totalDays} Day(s)</span>
                </div>
            )
        },
        {
            key: "applyDate",
            label: "APPLIED ON",
            render: (_: any, row: any) => (
                <div className="flex items-center gap-1 text-gray-500">
                    <Clock size={12} />
                    <span className="text-xs">{new Date(row.createdAt).toLocaleDateString()}</span>
                </div>
            )
        },
        {
            key: "reason",
            label: "REASON",
            render: (value: string) => (
                <div className="max-w-[200px] truncate text-xs text-gray-600 italic" title={value}>
                    "{value || "No reason provided"}"
                </div>
            )
        },
        {
            key: "status",
            label: "STATUS",
            render: (value: string) => <StatusBadge status={value.charAt(0).toUpperCase() + value.slice(1)} />
        }
    ]

    return (
        <DashboardLayout title="Leave Approvals">
            <div className="space-y-6 max-w-full pb-10">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-pink-500">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Approve Leave Requests</h1>
                        <p className="text-xs text-gray-500 font-medium">Review and process leave applications from faculty and staff members.</p>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Home className="h-4 w-4" /> Human Resource <span className="mx-1">/</span> <span className="text-pink-600 font-bold">Approve Leave</span>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-sm font-bold flex items-center gap-2 text-gray-700 uppercase tracking-wider">
                            <Info className="h-4 w-4 text-pink-500" />
                            Pending & Processed Leaves
                        </h3>
                        <div className="text-xs font-bold text-gray-400">
                            TOTAL: {leaveRequests.length}
                        </div>
                    </div>

                    <AdvancedTable
                        columns={columns}
                        data={leaveRequests}
                        loading={loading}
                        searchable={true}
                        searchPlaceholder="Search by staff name or leave type..."
                        headerClassName="bg-gray-100 text-gray-600 font-bold uppercase text-[10px] tracking-widest"
                        actions={[
                            {
                                label: "Approve",
                                onClick: (row) => handleAction(row._id, 'approve'),
                                icon: <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />,
                                disabled: (row) => row.status !== 'pending'
                            },
                            {
                                label: "Reject",
                                onClick: (row) => handleAction(row._id, 'reject'),
                                icon: <XCircle className="h-4 w-4 mr-2 text-red-600" />,
                                disabled: (row) => row.status !== 'pending'
                            }
                        ]}
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}

