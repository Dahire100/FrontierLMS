"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, UserCheck, Loader2, Save, CheckCircle2 } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function StaffAttendancePage() {
    const [role, setRole] = useState("all")
    const [department, setDepartment] = useState("all")
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [departments, setDepartments] = useState<any[]>([])
    const [staffList, setStaffList] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [searching, setSearching] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchDepartments()
    }, [])

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/departments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) setDepartments(await response.json())
        } catch (error) {
            console.error("Fetch departments error:", error)
        }
    }

    const handleSearch = async () => {
        setSearching(true)
        try {
            const token = localStorage.getItem('token')
            const query = new URLSearchParams({
                date,
                ...(role !== 'all' && { role }),
                ...(department !== 'all' && { department })
            })
            const response = await fetch(`${API_URL}/api/staff-attendance?${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setStaffList(data.map((s: any) => ({ ...s, status: s.status || 'present' })))
            }
        } catch (error) {
            toast.error("Failed to fetch staff list")
        } finally {
            setSearching(false)
        }
    }

    const handleStatusChange = (id: string, status: string) => {
        setStaffList(prev => prev.map(s => s._id === id ? { ...s, status } : s))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/staff-attendance`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    date,
                    attendanceRecords: staffList.map(s => ({
                        staffId: s._id,
                        status: s.status,
                        remarks: s.remarks
                    }))
                })
            })

            if (response.ok) {
                toast.success("Attendance saved successfully")
            } else {
                toast.error("Failed to save attendance")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setSaving(false)
        }
    }

    const columns = [
        {
            key: "staffId",
            label: "STAFF ID",
            render: (_: any, row: any) => <span className="font-bold text-xs text-gray-500">{row.staffId || "N/A"}</span>
        },
        {
            key: "name",
            label: "NAME",
            render: (_: any, row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-sm">{row.firstName} {row.lastName}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{row.role}</span>
                </div>
            )
        },
        {
            key: "attendance",
            label: "ATTENDANCE",
            render: (_: any, row: any) => (
                <RadioGroup
                    value={row.status}
                    onValueChange={(val) => handleStatusChange(row._id, val)}
                    className="flex gap-4"
                >
                    <div className="flex items-center gap-1.5 hover:bg-emerald-50 p-1 px-2 rounded-md transition-all cursor-pointer">
                        <RadioGroupItem value="present" id={`p-${row._id}`} className="text-emerald-600 border-emerald-200" />
                        <Label htmlFor={`p-${row._id}`} className="text-[11px] font-bold text-emerald-700 cursor-pointer">PRESENT</Label>
                    </div>
                    <div className="flex items-center gap-1.5 hover:bg-orange-50 p-1 px-2 rounded-md transition-all cursor-pointer">
                        <RadioGroupItem value="late" id={`l-${row._id}`} className="text-orange-600 border-orange-200" />
                        <Label htmlFor={`l-${row._id}`} className="text-[11px] font-bold text-orange-700 cursor-pointer">LATE</Label>
                    </div>
                    <div className="flex items-center gap-1.5 hover:bg-red-50 p-1 px-2 rounded-md transition-all cursor-pointer">
                        <RadioGroupItem value="absent" id={`a-${row._id}`} className="text-red-600 border-red-200" />
                        <Label htmlFor={`a-${row._id}`} className="text-[11px] font-bold text-red-700 cursor-pointer">ABSENT</Label>
                    </div>
                    <div className="flex items-center gap-1.5 hover:bg-blue-50 p-1 px-2 rounded-md transition-all cursor-pointer">
                        <RadioGroupItem value="half_day" id={`h-${row._id}`} className="text-blue-600 border-blue-200" />
                        <Label htmlFor={`h-${row._id}`} className="text-[11px] font-bold text-blue-700 cursor-pointer">HALF DAY</Label>
                    </div>
                </RadioGroup>
            )
        }
    ]

    return (
        <DashboardLayout title="Faculty Attendance">
            <div className="space-y-6 max-w-full pb-10">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-pink-500">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Staff Attendance Master</h1>
                        <p className="text-xs text-gray-500 font-medium">Daily attendance tracking for teachers, administrative and support staff.</p>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                        <UserCheck className="h-4 w-4" /> Human Resource <span className="mx-1">/</span> <span className="text-pink-600 font-bold">Attendance</span>
                    </div>
                </div>

                <Card className="border-t-4 border-t-[#0b1c48] shadow-sm">
                    <CardHeader className="py-3 bg-gray-50/50 border-b">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-gray-600">
                            <Search className="h-4 w-4" /> Filter Staff Criteria
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label className="font-bold text-xs text-gray-600">Employee Role</Label>
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
                            <div className="space-y-2">
                                <Label className="font-bold text-xs text-gray-600">Department</Label>
                                <Select value={department} onValueChange={setDepartment}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="All Departments" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Departments</SelectItem>
                                        {departments.map(d => (
                                            <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-xs text-gray-600">Attendance Date <span className="text-red-500">*</span></Label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="h-10"
                                />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    onClick={handleSearch}
                                    className="w-full bg-[#0b1c48] hover:bg-[#1a2d65] h-10 shadow-lg shadow-blue-50"
                                    disabled={searching}
                                >
                                    {searching ? <Loader2 className="animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                                    Search Staff
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {staffList.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Attendance List
                                </h3>
                                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                    {date}
                                </span>
                            </div>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-50"
                            >
                                {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Submit Attendance
                            </Button>
                        </div>
                        <AdvancedTable
                            columns={columns}
                            data={staffList}
                            pagination={false}
                            searchable={false}
                            headerClassName="bg-gray-100 text-gray-600 font-bold uppercase text-[10px] tracking-widest"
                        />
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

