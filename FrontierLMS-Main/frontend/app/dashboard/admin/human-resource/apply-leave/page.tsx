"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { Button } from "@/components/ui/button"
import { Plus, Users, Home, Calendar, Trash2 } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import FormModal, { FormField } from "@/components/form-modal"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"

export default function ApplyLeavePage() {
    const [leaves, setLeaves] = useState<any[]>([])
    const [leaveTypes, setLeaveTypes] = useState<any[]>([])
    const [staffList, setStaffList] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const [leavesRes, typesRes, staffRes] = await Promise.all([
                fetch(`${API_URL}/api/leaves`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/api/leave-types`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/api/staff`, { headers: { 'Authorization': `Bearer ${token}` } })
            ])

            if (leavesRes.ok) {
                const data = await leavesRes.json()
                setLeaves(data.data || [])
            }
            if (typesRes.ok) setLeaveTypes(await typesRes.json())
            if (staffRes.ok) {
                const data = await staffRes.json()
                // If it returns { staff: [...] } or just [...]
                setStaffList(data.staff || data || [])
            }
        } catch (error) {
            console.error("Data fetch error:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddLeave = async (data: any) => {
        try {
            const token = localStorage.getItem('token')
            // The backend expects userId (requesterId) if admin is applying for someone else?
            // Actually createLeaveRequest uses req.user.userId.
            // If admin applies for others, we might need a different endpoint or handle it in controller.
            // For now, let's assume it's for self or the backend handles selected staff.

            const response = await fetch(`${API_URL}/api/leaves`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            })

            if (response.ok) {
                toast.success("Leave application submitted")
                setIsModalOpen(false)
                fetchData()
            } else {
                const err = await response.json()
                toast.error(err.error || "Failed to submit leave")
            }
        } catch (error) {
            toast.error("An error occurred")
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/leaves/${deleteId}`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                toast.success("Leave request deleted")
                fetchData()
            }
        } catch (error) {
            toast.error("Failed to delete")
        } finally {
            setDeleteId(null)
        }
    }

    const columns = [
        {
            key: "staff",
            label: "STAFF",
            sortable: true,
            render: (_: any, row: any) => (
                <span className="font-bold text-blue-600">
                    {row.requesterId?.firstName} {row.requesterId?.lastName}
                </span>
            )
        },
        {
            key: "leaveType",
            label: "LEAVE TYPE",
            render: (val: string) => <span className="uppercase text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">{val}</span>
        },
        {
            key: "leaveDate",
            label: "LEAVE DATE",
            render: (_: any, row: any) => (
                <span className="text-blue-600 font-bold text-xs whitespace-nowrap">
                    {new Date(row.startDate).toLocaleDateString()} - {new Date(row.endDate).toLocaleDateString()}
                </span>
            )
        },
        {
            key: "totalDays",
            label: "DAYS",
            render: (val: number) => <span className="font-bold text-gray-700">{val}</span>
        },
        {
            key: "createdAt",
            label: "APPLY DATE",
            render: (val: string) => <span className="text-xs text-gray-500">{new Date(val).toLocaleDateString()}</span>
        },
        {
            key: "status",
            label: "STATUS",
            render: (value: string) => <StatusBadge status={value.charAt(0).toUpperCase() + value.slice(1)} />
        }
    ]

    const formFields: FormField[] = [
        {
            name: "leaveType",
            label: "Leave Type",
            type: "select",
            required: true,
            options: leaveTypes.map(t => ({ value: t.name, label: t.name }))
        },
        { name: "startDate", label: "Start Date", type: "date", required: true },
        { name: "endDate", label: "End Date", type: "date", required: true },
        { name: "reason", label: "Reason", type: "textarea", required: true }
    ]

    return (
        <DashboardLayout title="Leave Management">
            <div className="space-y-6 max-w-full pb-10">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-pink-500">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Leave Applications</h1>
                        <p className="text-xs text-gray-500 font-medium">View and manage leave requests history.</p>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Home className="h-4 w-4" /> Human Resource <span className="mx-1">/</span> <span className="text-pink-600 font-bold">Apply Leave</span>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-sm font-bold flex items-center gap-2 text-gray-700 uppercase tracking-wider">
                            <Calendar className="h-4 w-4 text-pink-500" />
                            Leave History
                        </h3>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            size="sm"
                            className="bg-[#0b1c48] hover:bg-[#1a2d65] shadow-lg shadow-blue-100"
                        >
                            <Plus className="h-4 w-4 mr-1" /> Apply For Leave
                        </Button>
                    </div>

                    <AdvancedTable
                        columns={columns}
                        data={leaves}
                        loading={loading}
                        searchable={true}
                        searchPlaceholder="Search history..."
                        headerClassName="bg-gray-100 text-gray-600 font-bold uppercase text-[10px] tracking-widest"
                        actions={[
                            {
                                label: "Delete",
                                onClick: (row) => setDeleteId(row._id || row.id),
                                icon: <Trash2 className="h-4 w-4 mr-2 text-red-600" />,
                                disabled: (row) => row.status !== 'pending'
                            }
                        ]}
                    />
                </div>

                <FormModal
                    isOpen={isModalOpen}
                    title="Apply for Leave"
                    description="Submit a new leave application for approval."
                    fields={formFields}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleAddLeave}
                />

                <ConfirmationDialog
                    open={!!deleteId}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                    title="Cancel Leave Request"
                    description="Are you sure you want to delete this leave request? This action can only be done for pending requests."
                    onConfirm={handleDelete}
                />
            </div>
        </DashboardLayout>
    )
}

