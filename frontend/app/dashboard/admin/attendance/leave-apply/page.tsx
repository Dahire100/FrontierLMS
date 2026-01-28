"use client"

import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { PlaneTakeoff, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface LeaveType {
    _id: string
    name: string
}

interface Student {
    _id: string
    firstName: string
    lastName: string
}

export default function LeaveApply() {
    const { toast } = useToast()
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState({
        studentId: "",
        leaveTypeId: "",
        fromDate: "",
        toDate: "",
        reason: ""
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const headers = { "Authorization": `Bearer ${token}` }

            const [typesRes, studentsRes] = await Promise.all([
                fetch(`${API_URL}/api/leave-types`, { headers }),
                fetch(`${API_URL}/api/students`, { headers })
            ])

            if (typesRes.ok) {
                const data = await typesRes.json()
                setLeaveTypes(Array.isArray(data) ? data : data.data || [])
            }
            if (studentsRes.ok) {
                const data = await studentsRes.json()
                setStudents(Array.isArray(data) ? data : data.data || [])
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to load data", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.studentId || !form.leaveTypeId || !form.fromDate || !form.toDate) {
            toast({ title: "Required", description: "Please fill required fields", variant: "destructive" })
            return
        }

        setSubmitting(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/leaves`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentId: form.studentId,
                    leaveTypeId: form.leaveTypeId,
                    startDate: form.fromDate,
                    endDate: form.toDate,
                    reason: form.reason
                })
            })

            if (res.ok) {
                toast({ title: "Success", description: "Leave request submitted successfully" })
                setForm({ studentId: "", leaveTypeId: "", fromDate: "", toDate: "", reason: "" })
            } else {
                const err = await res.json()
                toast({ title: "Error", description: err.error || "Failed to submit leave request", variant: "destructive" })
            }
        } catch {
            toast({ title: "Error", description: "Network error", variant: "destructive" })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <DashboardLayout title="Leave Apply">
            <div className="space-y-6">
                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <PlaneTakeoff className="h-5 w-5" />
                            Apply for Leave
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-red-500">Student *</Label>
                                <Select disabled={loading} value={form.studentId} onValueChange={(val) => setForm({ ...form, studentId: val })}>
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <SelectValue placeholder="Select student" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map((s) => (
                                            <SelectItem key={s._id} value={s._id}>
                                                {s.firstName} {s.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-500">Leave Type *</Label>
                                <Select disabled={loading} value={form.leaveTypeId} onValueChange={(val) => setForm({ ...form, leaveTypeId: val })}>
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leaveTypes.length === 0 ? (
                                            <>
                                                <SelectItem value="sick">Sick Leave</SelectItem>
                                                <SelectItem value="casual">Casual Leave</SelectItem>
                                            </>
                                        ) : leaveTypes.map((t) => (
                                            <SelectItem key={t._id} value={t._id}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-500">From Date *</Label>
                                <Input
                                    type="date"
                                    value={form.fromDate}
                                    onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                                    className="bg-white border-gray-200"
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-500">To Date *</Label>
                                <Input
                                    type="date"
                                    value={form.toDate}
                                    onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                                    className="bg-white border-gray-200"
                                    disabled={loading}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label>Reason</Label>
                                <Textarea
                                    value={form.reason}
                                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                                    rows={3}
                                    className="bg-white border-gray-200"
                                    placeholder="Enter reason for leave..."
                                    disabled={loading}
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-end">
                                <Button type="submit" disabled={submitting || loading} className="bg-blue-900 hover:bg-blue-800 px-8">
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {submitting ? "Submitting..." : "Submit"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
