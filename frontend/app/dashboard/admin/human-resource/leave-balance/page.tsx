"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users, Home, Loader2, Plus, Calculator } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

const LeaveCell = ({ value }: { value: any }) => {
    if (value === undefined || value === null) return <div className="h-full bg-gray-50/50 rounded-md min-h-[50px]"></div>

    return (
        <div className="flex flex-col gap-1 items-center justify-center p-1">
            <div className="bg-blue-50 text-blue-700 w-full py-1 text-center text-xs font-bold rounded border border-blue-100 shadow-sm">
                {value}
            </div>
            <button className="text-[9px] uppercase font-bold text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-0.5 mt-0.5">
                <Plus size={8} /> Assign
            </button>
        </div>
    )
}

export default function LeaveBalancePage() {
    const [staff, setStaff] = useState<any[]>([])
    const [leaveTypes, setLeaveTypes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState("all")

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const [staffRes, typesRes] = await Promise.all([
                fetch(`${API_URL}/api/staff?limit=100`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/api/leave-types`, { headers: { 'Authorization': `Bearer ${token}` } })
            ])

            if (staffRes.ok && typesRes.ok) {
                const staffData = await staffRes.json()
                const typesData = await typesRes.json()
                setStaff(staffData.staff || [])
                setLeaveTypes(typesData)
            }
        } catch (error) {
            console.error("Error fetching leave balance data:", error)
            toast.error("Failed to load leave data")
        } finally {
            setLoading(false)
        }
    }

    const dynamicColumns = [
        {
            key: "staffId",
            label: "ID",
            sortable: true,
            render: (value: string) => <span className="font-bold text-blue-600 text-[10px]">{value}</span>
        },
        {
            key: "name",
            label: "NAME",
            sortable: true,
            render: (_: any, row: any) => <span className="text-gray-800 font-bold text-xs truncate max-w-[120px] block">{row.firstName} {row.lastName}</span>
        },
        {
            key: "role",
            label: "ROLE",
            sortable: true,
            render: (value: string) => <span className="text-gray-400 text-[9px] font-bold uppercase tracking-tighter">{value}</span>
        },
        ...leaveTypes.map(type => ({
            key: `leave_${type._id}`,
            label: type.name.toUpperCase(),
            render: () => <LeaveCell value={type.allottedDays} />
        }))
    ]

    return (
        <DashboardLayout title="Leave Entitlement Matrix">
            <div className="space-y-6 max-w-full pb-10">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-indigo-500">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Staff Leave Balance</h1>
                        <p className="text-xs text-gray-500 font-medium">Tracking and managing leave quotas for all institutional employees.</p>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1 border bg-gray-50 px-3 py-1.5 rounded-full">
                        <Home className="h-4 w-4" /> Human Resource <span className="mx-1 text-gray-300">/</span> <span className="text-indigo-600 font-bold">Leave Balance</span>
                    </div>
                </div>

                <Card className="border-t-4 border-t-indigo-500 shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between py-3 bg-gray-50/50 border-b">
                        <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-gray-600">
                            <Calculator className="h-4 w-4" /> Quota Calculation Criteria
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6 items-end">
                            <div className="space-y-2 flex-1 max-w-xs">
                                <Label className="text-[10px] font-bold text-gray-500 uppercase">Employment Role</Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="All Roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="teacher">Teacher</SelectItem>
                                        <SelectItem value="principal">Principal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={fetchData}
                                className="bg-[#0b1c48] hover:bg-[#1a2d65] h-10 px-8 text-xs font-bold uppercase tracking-widest"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Search className="h-4 w-4 mr-2" />}
                                Refresh Matrix
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b bg-white flex items-center justify-between">
                        <h3 className="text-sm font-bold flex items-center gap-2 text-gray-700 uppercase tracking-widest">
                            <Users className="h-4 w-4 text-indigo-500" />
                            Leave Entitlement Overview
                        </h3>
                    </div>

                    <div className="p-0 overflow-x-auto">
                        <AdvancedTable
                            columns={dynamicColumns}
                            data={staff.filter(s => role === 'all' || s.role === role)}
                            loading={loading}
                            searchable={true}
                            searchPlaceholder="Search staff name or ID..."
                            headerClassName="bg-gray-50 text-gray-500 font-bold uppercase text-[9px] tracking-widest h-14 border-b"
                            pagination={true}
                            pageSize={15}
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

