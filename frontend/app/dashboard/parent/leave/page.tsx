"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarIcon, Send, Clock, Users, ChevronDown } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function ParentLeaveApply() {
    const [selectedChild, setSelectedChild] = useState<string>("")
    const [children, setChildren] = useState<any[]>([])
    const [leaveHistory, setLeaveHistory] = useState<any[]>([])

    // Form States
    const [fromDate, setFromDate] = useState<Date>()
    const [toDate, setToDate] = useState<Date>()
    const [reason, setReason] = useState("")
    const [leaveType, setLeaveType] = useState("")
    const [loading, setLoading] = useState(true)

    // Fetch children on mount
    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`${API_URL}/api/parent/dashboard`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await res.json()
                if (data.success && data.data.children.length > 0) {
                    setChildren(data.data.children)
                    setSelectedChild(data.data.children[0]._id)
                } else {
                    setLoading(false)
                }
            } catch (error) {
                console.error("Failed to fetch children", error)
                setLoading(false)
            }
        }
        fetchChildren()
    }, [])

    // Fetch leave history when selected child changes
    useEffect(() => {
        if (!selectedChild) return

        const fetchLeaves = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`${API_URL}/api/parent/child/${selectedChild}/leaves`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await res.json()

                if (data.success) {
                    setLeaveHistory(data.data)
                } else {
                    setLeaveHistory([])
                }
            } catch (error) {
                console.error("Failed to fetch leaves", error)
            } finally {
                setLoading(false)
            }
        }
        fetchLeaves()
    }, [selectedChild])


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!fromDate || !toDate || !reason || !leaveType) {
            toast.error("Missing Information", { description: "Please fill in all required fields." })
            return
        }

        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/parent/child/${selectedChild}/leave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    leaveType,
                    startDate: fromDate.toISOString(),
                    endDate: toDate.toISOString(),
                    reason,
                    totalDays: Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24)) + 1
                })
            })
            const data = await res.json()

            if (data.success) {
                toast.success("Leave Application Submitted", {
                    description: `Application has been sent for approval.`
                })

                // Refresh history or optimistically add
                const newLeave = {
                    _id: Date.now().toString(), // Temp ID
                    leaveType, // Note: backend uses 'leaveType', frontend display might vary
                    type: leaveType,
                    startDate: fromDate.toISOString(),
                    endDate: toDate.toISOString(),
                    status: "Pending",
                    reason: reason,
                    createdAt: new Date().toISOString()
                }
                setLeaveHistory([newLeave, ...leaveHistory])
                // Reset form
                setReason("")
                setLeaveType("")
                setFromDate(undefined)
                setToDate(undefined)

            } else {
                toast.error("Application Failed", { description: data.error || "Could not submit leave application." })
            }

        } catch (error) {
            console.error("Leave submission error", error)
            toast.error("Network Error", { description: "Please try again later." })
        }
    }

    const getSelectedChildName = () => {
        const child = children.find((c: any) => c._id === selectedChild)
        return child ? `${child.firstName} ${child.lastName}` : "Loading..."
    }

    if (loading) {
        return (
            <DashboardLayout title="Apply Leave">
                <div className="flex h-screen items-center justify-center">Loading...</div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Apply Leave">
            <div className="space-y-6 animate-in fade-in-50 duration-500">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Apply Leave
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            Submit leave request for {getSelectedChildName()}
                        </p>
                    </div>

                    {children.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="min-w-[180px] justify-between shadow-sm">
                                    <span className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-blue-600" />
                                        {getSelectedChildName()}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px]">
                                {children.map((child: any) => (
                                    <DropdownMenuItem key={child._id} onClick={() => setSelectedChild(child._id)}>
                                        {child.firstName} {child.lastName}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Application Form */}
                    <Card className="lg:col-span-2 border-none shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Send className="h-5 w-5 text-blue-600" /> New Application
                            </CardTitle>
                            <CardDescription>Fill in the details below</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Leave Type</Label>
                                        <Select onValueChange={setLeaveType} value={leaveType}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                                                <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                                                <SelectItem value="Emergency">Emergency</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Reason</Label>
                                        <Input placeholder="Brief reason" value={reason} onChange={e => setReason(e.target.value)} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2 flex flex-col">
                                        <Label>From Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !fromDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2 flex flex-col">
                                        <Label>To Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !toDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                                    <Textarea placeholder="More details about the leave request..." className="min-h-[100px]" />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Submit Request</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {/* Application History */}
                    <Card className="border-none shadow-md h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-orange-600" /> Recent History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {leaveHistory.length > 0 ? leaveHistory.map((item: any) => (
                                <div key={item._id} className="p-3 border rounded-lg bg-gray-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold capitalize ${(item.status || 'pending').toLowerCase() === 'approved' ? 'bg-green-100 text-green-700' :
                                                (item.status || 'pending').toLowerCase() === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-orange-100 text-orange-700'
                                            }`}>
                                            {item.status || 'Pending'}
                                        </span>
                                        <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="font-bold text-gray-800">{item.leaveType || "Leave"}</h4>
                                    <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                        <CalendarIcon className="h-3 w-3" />
                                        {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center text-gray-500 py-4">No past leaves found.</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
