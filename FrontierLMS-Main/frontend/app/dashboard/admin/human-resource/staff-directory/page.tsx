"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, User, Mail, Phone, ShoppingBag, Trash2, Home, Loader2, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { StatusBadge } from "@/components/super-admin/status-badge"

export default function StaffDirectoryPage() {
    const [staffList, setStaffList] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState("all")
    const [keyword, setKeyword] = useState("")
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalRecords, setTotalRecords] = useState(0)

    const fetchStaff = useCallback(async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const query = new URLSearchParams({
                isActive: 'true',
                ...(role !== 'all' && { role }),
                limit: '100' // Get a good batch for local filtering or search
            })
            const response = await fetch(`${API_URL}/api/staff?${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setStaffList(data.staff || [])
                setTotalRecords(data.total || (data.staff?.length || 0))
            }
        } catch (error) {
            console.error("Error fetching staff:", error)
            toast.error("Failed to load staff directory")
        } finally {
            setLoading(false)
        }
    }, [role])

    useEffect(() => {
        fetchStaff()
    }, [fetchStaff])

    const handleDelete = async () => {
        if (!deleteId) return

        try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/staff/${deleteId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })

            if (response.ok) {
                toast.success("Staff member deleted successfully")
                fetchStaff()
            } else {
                throw new Error("Failed to delete staff")
            }
        } catch (error) {
            toast.error("Failed to delete staff member")
        } finally {
            setDeleteId(null)
        }
    }

    const filteredStaff = staffList.filter(staff => {
        const searchLower = keyword.toLowerCase()
        return (
            (staff.firstName?.toLowerCase().includes(searchLower)) ||
            (staff.lastName?.toLowerCase().includes(searchLower)) ||
            (staff.email?.toLowerCase().includes(searchLower)) ||
            (staff.staffId?.toLowerCase().includes(searchLower)) ||
            (staff.phone?.includes(searchLower)) ||
            (staff.mobileNumber?.includes(searchLower))
        )
    })

    const columns = [
        {
            key: "staffId",
            label: "ID",
            sortable: true,
            render: (value: string) => <span className="font-bold text-blue-600 text-xs">{value}</span>
        },
        {
            key: "name",
            label: "STAFF NAME",
            sortable: true,
            render: (_: any, row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-sm">{row.firstName} {row.lastName}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter italic">{row.qualification || "N/A"}</span>
                </div>
            )
        },
        {
            key: "role",
            label: "ROLE",
            render: (val: string) => (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    <ShieldCheck size={10} /> {val}
                </span>
            )
        },
        {
            key: "department",
            label: "DEPARTMENT",
            render: (val: string) => <span className="text-gray-600 text-xs font-medium">{val || "-"}</span>
        },
        {
            key: "designation",
            label: "DESIGNATION",
            render: (val: string) => <span className="text-gray-500 text-xs italic">{val || "-"}</span>
        },
        {
            key: "mobileNumber",
            label: "CONTACT",
            render: (_: any, row: any) => (
                <div className="flex flex-col gap-0.5 text-[11px] text-gray-600 font-medium">
                    <div className="flex items-center gap-1.5 ">
                        <Mail size={12} className="text-gray-400" />
                        <span className="max-w-[120px] truncate">{row.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 ">
                        <Phone size={12} className="text-gray-400" />
                        <span>{row.mobileNumber || row.phone || "N/A"}</span>
                    </div>
                </div>
            )
        }
    ]

    return (
        <DashboardLayout title="Human Capital Directory">
            <div className="space-y-6 max-w-full pb-10">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-pink-500">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Active Faculty & Staff</h1>
                        <p className="text-xs text-gray-500 font-medium">Browse and manage all institutional personnel records.</p>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1 border bg-gray-50 px-3 py-1.5 rounded-full">
                        <Home className="h-4 w-4" /> Human Resource <span className="mx-1 text-gray-300">/</span> <span className="text-pink-600 font-bold">Directory</span>
                    </div>
                </div>

                <Card className="border-t-4 border-t-[#0b1c48] shadow-sm border-x-0 border-b-0">
                    <CardHeader className="flex flex-row items-center justify-between py-3 bg-gray-50/50 border-b">
                        <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-gray-600">
                            <Search className="h-4 w-4" /> Filter Personnel
                        </CardTitle>
                        <Link href="/dashboard/admin/human-resource/staff-directory/add">
                            <Button size="sm" className="bg-[#0b1c48] hover:bg-[#1a2d65] shadow-lg shadow-blue-100 h-8 text-[11px] font-bold uppercase tracking-wider">
                                <Plus className="h-4 w-4 mr-1" /> Register Staff
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-gray-500 uppercase">Employment Role</Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger className="bg-white h-10 border-gray-200">
                                        <SelectValue placeholder="All Roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="teacher">Teacher</SelectItem>
                                        <SelectItem value="driver">Driver</SelectItem>
                                        <SelectItem value="accountant">Accountant</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-[10px] font-bold text-gray-500 uppercase">Search Keywords</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Staff ID, Name, Email or Phone Number..."
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        className="pl-9 bg-white h-10 border-gray-200"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b flex items-center justify-between bg-white">
                        <h3 className="text-sm font-bold flex items-center gap-2 text-gray-700 uppercase tracking-widest">
                            <User className="h-4 w-4 text-pink-500" />
                            Staff Records Ledger
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 uppercase">Showing</span>
                            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100">
                                {filteredStaff.length} / {totalRecords} Records
                            </span>
                        </div>
                    </div>

                    <AdvancedTable
                        columns={columns}
                        data={filteredStaff}
                        loading={loading}
                        searchable={false}
                        headerClassName="bg-gray-100 text-gray-600 font-bold uppercase text-[10px] tracking-widest h-12"
                        pagination={true}
                        pageSize={10}
                        actions={[
                            {
                                label: "Delete Permanent",
                                onClick: (row) => setDeleteId(row._id),
                                icon: <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                            }
                        ]}
                        emptyMessage={
                            <div className="p-10 text-center space-y-2">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-300" />
                                <p className="text-gray-400 text-sm font-medium">No personnel matches found...</p>
                            </div>
                        }
                    />
                </div>

                <ConfirmationDialog
                    open={!!deleteId}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                    title="Terminate Staff Record"
                    description="This action is irreversible. The staff dossier and associated user account will be permanently expunged from the system."
                    onConfirm={handleDelete}
                />
            </div>
        </DashboardLayout>
    )
}

