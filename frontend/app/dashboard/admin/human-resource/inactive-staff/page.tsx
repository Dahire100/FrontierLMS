"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, UserX, Eye, Home, Loader2 } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { StatusBadge } from "@/components/super-admin/status-badge"

export default function InactiveStaffPage() {
    const [staff, setStaff] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState("all")
    const [searchKeyword, setSearchKeyword] = useState("")

    useEffect(() => {
        fetchInactiveStaff()
    }, [])

    const fetchInactiveStaff = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const query = new URLSearchParams({
                isActive: 'false',
                ...(role !== 'all' && { role }),
                limit: '100'
            })
            const response = await fetch(`${API_URL}/api/staff?${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setStaff(data.staff || [])
            }
        } catch (error) {
            console.error("Fetch inactive staff error:", error)
        } finally {
            setLoading(false)
        }
    }

    const columns = [
        {
            key: "staffId",
            label: "STAFF ID",
            sortable: true,
            render: (value: string) => <span className="font-bold text-blue-600 text-xs">{value}</span>
        },
        {
            key: "name",
            label: "NAME",
            sortable: true,
            render: (_: any, row: any) => <span className="font-bold text-gray-800 text-xs">{row.firstName} {row.lastName}</span>
        },
        {
            key: "role",
            label: "ROLE",
            sortable: true,
            render: (value: string) => <span className="text-gray-500 text-[10px] font-bold uppercase">{value}</span>
        },
        {
            key: "department",
            label: "DEPARTMENT",
            sortable: true,
            render: (value: string) => <span className="text-gray-700 text-xs">{value || "-"}</span>
        },
        {
            key: "mobileNumber",
            label: "MOBILE",
            render: (value: string) => <span className="text-gray-700 text-xs">{value || "-"}</span>
        },
        {
            key: "updatedAt",
            label: "INACTIVE SINCE",
            render: (value: string) => <span className="text-gray-500 text-xs">{new Date(value).toLocaleDateString()}</span>
        },
        {
            key: "status",
            label: "STATUS",
            render: () => <StatusBadge status="Inactive" />
        }
    ]

    return (
        <DashboardLayout title="Inactive Faculty">
            <div className="space-y-6 max-w-full pb-10">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-gray-400">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Inactive Staff Archive</h1>
                        <p className="text-xs text-gray-500 font-medium">Records of former employees and deactivated staff accounts.</p>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Home className="h-4 w-4" /> Human Resource <span className="mx-1">/</span> <span className="text-gray-400 font-bold">Inactive Staff</span>
                    </div>
                </div>

                <Card className="border-t-4 border-t-gray-400 shadow-sm">
                    <CardHeader className="py-3 bg-gray-50/50 border-b">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-gray-600">
                            <Search className="h-4 w-4" /> Filter Archive
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-600 uppercase">Search by Keyword</Label>
                                <Input
                                    placeholder="Staff ID, Name..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-600 uppercase">Filter by Role</Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="All Roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="teacher">Teacher</SelectItem>
                                        <SelectItem value="driver">Driver</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button
                                    onClick={fetchInactiveStaff}
                                    className="w-full bg-gray-800 hover:bg-gray-900 h-10 shadow-lg shadow-gray-100"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                                    Refresh List
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-sm font-bold flex items-center gap-2 text-gray-700 uppercase tracking-wider">
                            <UserX className="h-4 w-4 text-gray-500" />
                            Archived Staff Records
                        </h3>
                    </div>

                    <AdvancedTable
                        columns={columns}
                        data={staff}
                        loading={loading}
                        searchable={true}
                        searchPlaceholder="Search within archived records..."
                        headerClassName="bg-gray-100 text-gray-600 font-bold uppercase text-[10px] tracking-widest"
                        actions={[
                            {
                                label: "View Profile",
                                onClick: () => { },
                                icon: <Eye className="h-4 w-4 mr-2" />
                            }
                        ]}
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}

