"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Plus,
    Calendar,
    FileText,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Trash2,
    Loader2,
    ChevronRight,
    MapPin,
    Clock,
    User,
    ArrowRight,
    Search,
    Filter,
    LifeBuoy
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
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
import { useToast } from "@/components/ui/use-toast"

interface LeaveRecord {
    _id: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    createdAt: string;
}

export default function ApplyLeavePage() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [leaveHistory, setLeaveHistory] = useState<LeaveRecord[]>([])
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: ""
    })

    useEffect(() => {
        fetchLeaveHistory()
    }, [])

    const fetchLeaveHistory = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/teacher/leaves`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setLeaveHistory(data.data)
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to fetch leave history", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/teacher/leaves`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            const data = await res.json()
            if (data.success) {
                toast({ title: "Application Decoupled", description: "Your leave request has been queued for administrative review." })
                setIsDialogOpen(false)
                fetchLeaveHistory()
                setFormData({ leaveType: "", startDate: "", endDate: "", reason: "" })
            }
        } catch (err) {
            toast({ title: "Submission Failed", description: "Failed to apply for leave", variant: "destructive" })
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancelLeave = async (id: string) => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/teacher/leaves/${id}/cancel`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                toast({ title: "Request Terminated", description: "The leave application has been cancelled successfully." })
                fetchLeaveHistory()
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to cancel request", variant: "destructive" })
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved": return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black h-6 rounded-lg">APPROVED</Badge>
            case "pending": return <Badge className="bg-amber-50 text-amber-700 border-amber-100 font-black h-6 rounded-lg">PENDING</Badge>
            case "rejected": return <Badge className="bg-red-50 text-red-700 border-red-100 font-black h-6 rounded-lg">REJECTED</Badge>
            case "cancelled": return <Badge variant="secondary" className="font-black h-6 rounded-lg text-gray-400">CANCELLED</Badge>
            default: return <Badge variant="outline" className="font-black h-6 rounded-lg">{status.toUpperCase()}</Badge>
        }
    }

    if (loading) {
        return (
            <DashboardLayout title="Occupancy Registry">
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Presence Governance">
            <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Leave Audit & Governance</h2>
                        <p className="text-muted-foreground font-medium">Request, track and manage your institutional absence records.</p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 h-14 px-8 rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all active:scale-95 text-white">
                                <Plus className="w-5 h-5 mr-3" /> Execute Leave Request
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] p-0 rounded-3xl overflow-hidden border-none shadow-2xl">
                            <form onSubmit={handleSubmit}>
                                <DialogHeader className="bg-gray-50/50 p-8 border-b">
                                    <DialogTitle className="text-2xl font-black tracking-tight text-gray-900">Application Dispatch</DialogTitle>
                                    <DialogDescription className="text-gray-500 font-medium">Configure your absence parameters for administrative auditing.</DialogDescription>
                                </DialogHeader>
                                <div className="p-8 space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Leave Taxonomy</Label>
                                            <Select value={formData.leaveType} onValueChange={(val) => setFormData({ ...formData, leaveType: val })}>
                                                <SelectTrigger className="h-14 rounded-xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-100 font-bold">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="casual" className="font-medium">Casual Leave</SelectItem>
                                                    <SelectItem value="sick" className="font-medium">Sick Leave</SelectItem>
                                                    <SelectItem value="medical" className="font-medium">Medical Leave</SelectItem>
                                                    <SelectItem value="emergency" className="font-medium">Emergency Leave</SelectItem>
                                                    <SelectItem value="vacation" className="font-medium">Vacation</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Balance Integrity</Label>
                                            <div className="h-14 flex items-center px-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />
                                                <span className="text-sm font-black text-emerald-700 uppercase tracking-tighter">Verified Active</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Inception Date</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-4.5 h-5 w-5 text-gray-300 pointer-events-none" />
                                                <Input
                                                    type="date"
                                                    className="h-14 pl-12 rounded-xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-100 font-bold"
                                                    value={formData.startDate}
                                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Termination Date</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-4.5 h-5 w-5 text-gray-300 pointer-events-none" />
                                                <Input
                                                    type="date"
                                                    className="h-14 pl-12 rounded-xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-100 font-bold"
                                                    value={formData.endDate}
                                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Evaluative Rationale (Reason)</Label>
                                        <Textarea
                                            placeholder="Provide comprehensive detail for leave audit..."
                                            className="min-h-[120px] rounded-2xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-100 font-medium p-4"
                                            value={formData.reason}
                                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <DialogFooter className="bg-gray-50/50 p-8 border-t">
                                    <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-12 px-6 font-black uppercase tracking-widest text-xs text-gray-400">Abort Request</Button>
                                    <Button type="submit" disabled={submitting} className="h-12 px-10 bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-100 rounded-xl">
                                        {submitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <LifeBuoy className="h-4 w-4 mr-2" />}
                                        Release for Approval
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="border-none shadow-xl shadow-indigo-100/30 ring-1 ring-gray-100 rounded-2xl bg-white p-6 space-y-2">
                        <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-orange-600" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Awaiting Decision</p>
                        <h4 className="text-3xl font-black text-gray-900">{leaveHistory.filter(l => l.status === 'pending').length}</h4>
                    </Card>
                    <Card className="border-none shadow-xl shadow-indigo-100/30 ring-1 ring-gray-100 rounded-2xl bg-white p-6 space-y-2">
                        <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Approved</p>
                        <h4 className="text-3xl font-black text-gray-900">{leaveHistory.filter(l => l.status === 'approved').length}</h4>
                    </Card>
                </div>

                <Card className="border-none shadow-2xl shadow-indigo-100/30 ring-1 ring-gray-100 rounded-2xl bg-white overflow-hidden">
                    <CardHeader className="bg-white border-b py-8 px-8 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black tracking-tight text-gray-800 uppercase">Absence Registry</CardTitle>
                            <CardDescription className="font-medium italic">Complete transactional logs of your institutional leave requests.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {leaveHistory.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b">
                                            <TableHead className="w-[160px] font-black text-[10px] uppercase tracking-widest text-gray-500 pl-8 h-16">Transaction Date</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 h-16">Leave Parameters</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 h-16">Evaluative Reason</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 h-16">Audit Status</TableHead>
                                            <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-gray-500 h-16 pr-8">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {leaveHistory.map((leave) => (
                                            <TableRow key={leave._id} className="group hover:bg-indigo-50/30 transition-all border-b border-gray-50">
                                                <TableCell className="pl-8 py-6 font-black text-gray-400 text-xs">
                                                    {new Date(leave.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <span className="font-black text-gray-800 uppercase tracking-tight block">{leave.leaveType} Leave</span>
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                                            <Calendar className="w-3 h-3 text-indigo-400" />
                                                            {new Date(leave.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            <ArrowRight className="w-2 h-2" />
                                                            {new Date(leave.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            <Badge variant="outline" className="ml-1 h-5 px-1.5 font-black bg-gray-50 group-hover:bg-white">{leave.totalDays}D</Badge>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[300px]">
                                                    <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-relaxed" title={leave.reason}>
                                                        {leave.reason}
                                                    </p>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(leave.status)}</TableCell>
                                                <TableCell className="text-right pr-8">
                                                    {leave.status === 'pending' ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100"
                                                            onClick={() => handleCancelLeave(leave._id)}
                                                        >
                                                            Abort Request
                                                        </Button>
                                                    ) : (
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl">
                                                            <LifeBuoy className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="p-20 text-center space-y-4">
                                <div className="h-20 w-20 bg-gray-50 rounded-3xl mx-auto flex items-center justify-center">
                                    <LifeBuoy className="h-10 w-10 text-gray-300" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xl font-black text-gray-900 tracking-tight">Clean Slate</h4>
                                    <p className="text-muted-foreground font-medium max-w-sm mx-auto">No absence records found in the institutional registry.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

