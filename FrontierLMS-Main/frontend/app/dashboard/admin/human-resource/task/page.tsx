"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Edit2, Briefcase, Plus, Loader2, Home, CheckCircle2 } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import { StatusBadge } from "@/components/super-admin/status-badge"

export default function TaskPage() {
    const [tasks, setTasks] = useState<any[]>([])
    const [staffList, setStaffList] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        title: "",
        assignedTo: "",
        status: "pending",
        startDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        authorizedBy: "",
        remarks: "",
        summary: "",
        priority: "medium"
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const [tasksRes, staffRes] = await Promise.all([
                fetch(`${API_URL}/api/hr-module/tasks`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/api/staff`, { headers: { 'Authorization': `Bearer ${token}` } })
            ])

            if (tasksRes.ok) setTasks(await tasksRes.json())
            if (staffRes.ok) {
                const data = await staffRes.json()
                setStaffList(data.staff || data || [])
            }
        } catch (error) {
            toast.error("Failed to load task data")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/hr-module/tasks`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                toast.success("Task created successfully")
                setFormData({
                    title: "",
                    assignedTo: "",
                    status: "pending",
                    startDate: new Date().toISOString().split('T')[0],
                    dueDate: new Date().toISOString().split('T')[0],
                    authorizedBy: "",
                    remarks: "",
                    summary: "",
                    priority: "medium"
                })
                fetchData()
            }
        } catch (error) {
            toast.error("Failed to save task")
        } finally {
            setSubmitting(false)
        }
    }

    const columns = [
        {
            key: "title",
            label: "TASK TITLE",
            render: (v: string) => <span className="font-bold text-gray-800 text-xs">{v}</span>
        },
        {
            key: "assignedTo",
            label: "ASSIGNED TO",
            render: (v: any) => v ? <span className="text-blue-600 font-medium text-xs">{v.firstName} {v.lastName}</span> : '-'
        },
        {
            key: "dueDate",
            label: "DEADLINE",
            render: (v: string) => <span className="text-xs text-gray-500 font-mono italic">{new Date(v).toLocaleDateString()}</span>
        },
        {
            key: "priority",
            label: "PRIORITY",
            render: (v: string) => (
                <span className={`text-[9px] font-bold uppercase border px-1.5 py-0.5 rounded ${v === 'high' ? 'text-red-600 bg-red-50 border-red-100' :
                        v === 'medium' ? 'text-orange-600 bg-orange-50 border-orange-100' :
                            'text-blue-600 bg-blue-50 border-blue-100'
                    }`}>
                    {v}
                </span>
            )
        },
        {
            key: "status",
            label: "STATUS",
            render: (v: string) => <StatusBadge status={v.charAt(0).toUpperCase() + v.slice(1)} />
        }
    ]

    return (
        <DashboardLayout title="Institutional Task Management">
            <div className="space-y-6 max-w-full pb-10">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-pink-500">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Personnel Assignments</h1>
                        <p className="text-xs text-gray-500 font-medium">Coordinate and track departmental tasks and institutional objectives.</p>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1 border bg-gray-50 px-3 py-1.5 rounded-full">
                        <Home className="h-4 w-4" /> Human Resource <span className="mx-1 text-gray-300">/</span> <span className="text-pink-600 font-bold">Tasks</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-6">
                    {/* Add Task Form */}
                    <div className="lg:col-span-4 xl:col-span-3">
                        <Card className="border-t-4 border-t-pink-500 shadow-sm sticky top-6">
                            <CardHeader className="py-4 bg-gray-50/50 border-b">
                                <CardTitle className="text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest text-gray-600">
                                    <Edit2 className="h-4 w-4" /> Define New Objective
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-500 uppercase">Objective Title <span className="text-red-500">*</span></Label>
                                        <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Audit Annual Records" className="h-9 text-xs" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-500 uppercase">Assigned Personnel <span className="text-red-500">*</span></Label>
                                        <Select value={formData.assignedTo} onValueChange={v => setFormData({ ...formData, assignedTo: v })}>
                                            <SelectTrigger className="h-9 text-xs">
                                                <SelectValue placeholder="Select Staff" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {staffList.map(s => (
                                                    <SelectItem key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.staffId})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-gray-500 uppercase">Priority</Label>
                                            <Select value={formData.priority} onValueChange={v => setFormData({ ...formData, priority: v })}>
                                                <SelectTrigger className="h-9 text-xs font-bold uppercase">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-gray-500 uppercase">Deadline <span className="text-red-500">*</span></Label>
                                            <Input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} className="h-9 text-xs" required />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-500 uppercase">Objective Summary</Label>
                                        <Textarea value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })} className="min-h-[70px] text-xs resize-none" placeholder="Provide detailed brief..." />
                                    </div>
                                    <Button type="submit" className="w-full bg-[#0b1c48] hover:bg-[#1a2d65] font-bold uppercase text-[10px] tracking-widest h-10 shadow-lg shadow-blue-50" disabled={submitting}>
                                        {submitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Plus className="h-4 w-4 mr-2" />}
                                        Publish Task
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Task List */}
                    <div className="lg:col-span-8 xl:col-span-9">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden h-full">
                            <div className="p-4 border-b bg-white flex items-center justify-between">
                                <h3 className="text-sm font-bold flex items-center gap-2 text-gray-700 uppercase tracking-widest">
                                    <Briefcase className="h-4 w-4 text-pink-500" />
                                    Active Task Ledger
                                </h3>
                                <div className="text-[10px] font-bold text-gray-400 uppercase">
                                    Total: {tasks.length} Objectives
                                </div>
                            </div>
                            <AdvancedTable
                                columns={columns}
                                data={tasks}
                                loading={loading}
                                searchable={true}
                                headerClassName="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-widest h-12"
                                emptyMessage={
                                    <div className="p-10 text-center space-y-2">
                                        <CheckCircle2 className="h-10 w-10 mx-auto text-gray-200" />
                                        <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">All objectives clear</p>
                                    </div>
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

