"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { AlertTriangle, Gavel, FileWarning, Plus, Search, Flag, Loader2, User, MapPin, Calendar, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Student {
    _id: string;
    firstName: string;
    lastName: string;
    rollNumber: string;
    class: string;
    section: string;
}

interface Incident {
    _id: string;
    studentId: Student;
    incidentDate: string;
    location: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
    actionTaken?: string;
}

export default function DisciplinaryPage() {
    const { toast } = useToast()
    const [isReportOpen, setIsReportOpen] = useState(false)
    const [incidents, setIncidents] = useState<Incident[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const [classes, setClasses] = useState<any[]>([])
    const [selectedClass, setSelectedClass] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        studentId: '',
        severity: 'medium',
        incidentDate: new Date().toISOString().split('T')[0],
        location: '',
        description: ''
    })

    useEffect(() => {
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }

            const [incRes, classRes] = await Promise.all([
                fetch(`${API_URL}/api/teacher/disciplinary`, { headers }),
                fetch(`${API_URL}/api/teacher/classes`, { headers })
            ])

            const incData = await incRes.json()
            const classData = await classRes.json()

            if (incData.success) setIncidents(incData.data)
            if (classData.success) setClasses(classData.data)
        } catch (error) {
            console.error("Failed to fetch data", error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchStudents = async (classId: string) => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/teacher/classes/${classId}/students`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setStudents(data.data.students)
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to load students", variant: "destructive" })
        }
    }

    const handleInputChange = (e: any) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmitReport = async () => {
        if (!formData.studentId || !formData.description || !formData.severity) {
            toast({ title: "Missing Fields", description: "Please fill in all required fields", variant: "destructive" })
            return
        }

        setSubmitting(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/teacher/disciplinary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.success) {
                toast({
                    title: "Incident Reported",
                    description: "The disciplinary incident has been logged successfully.",
                    className: "bg-red-50 text-red-800 border-red-200"
                })
                setIsReportOpen(false)
                setIncidents([data.data, ...incidents])
                setFormData({ studentId: '', severity: 'medium', incidentDate: new Date().toISOString().split('T')[0], location: '', description: '' })
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to submit report", variant: "destructive" })
        } finally {
            setSubmitting(false)
        }
    }

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'high':
            case 'critical': return 'bg-red-100 text-red-700 border-red-200'
            case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200'
            default: return 'bg-blue-100 text-blue-700 border-blue-200'
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            case 'investigating': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    if (isLoading) {
        return (
            <DashboardLayout title="Disciplinary Management">
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="h-10 w-10 animate-spin text-red-600" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Conduct Registry">
            <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Behavioral Governance</h2>
                        <p className="text-muted-foreground font-medium">Record and monitor institutional conduct standards and incident reports.</p>
                    </div>

                    <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-red-600 hover:bg-red-700 h-12 px-8 font-black shadow-xl shadow-red-100 rounded-xl">
                                <Flag className="w-5 h-5 mr-2" /> Report Breach
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl border-none shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-gray-900">Conduct Infraction Report</DialogTitle>
                                <DialogDescription className="font-medium text-gray-500">Document a behavioral incident for administrative review.</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-y my-4">
                                <div className="space-y-2">
                                    <Label className="font-bold text-gray-700">Target Class</Label>
                                    <Select onValueChange={(v) => {
                                        setSelectedClass(v)
                                        fetchStudents(v)
                                    }}>
                                        <SelectTrigger className="h-12 rounded-xl focus:ring-4 focus:ring-red-50">
                                            <SelectValue placeholder="Select batch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map(c => (
                                                <SelectItem key={c._id} value={c._id}>Class {c.name}-{c.section}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-gray-700">Student Involved</Label>
                                    <Select onValueChange={(v) => setFormData({ ...formData, studentId: v })}>
                                        <SelectTrigger className="h-12 rounded-xl focus:ring-4 focus:ring-red-50">
                                            <SelectValue placeholder="Identify student" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.map(s => (
                                                <SelectItem key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.rollNumber})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-gray-700">Severity Metric</Label>
                                    <Select defaultValue="medium" onValueChange={(v: any) => setFormData({ ...formData, severity: v })}>
                                        <SelectTrigger className="h-12 rounded-xl focus:ring-4 focus:ring-red-50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low (Minor disruption)</SelectItem>
                                            <SelectItem value="medium">Medium (Standard breach)</SelectItem>
                                            <SelectItem value="high">High (Serious violation)</SelectItem>
                                            <SelectItem value="critical">Critical (Immediate action)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-gray-700">Incident Date</Label>
                                    <Input
                                        type="date"
                                        name="incidentDate"
                                        value={formData.incidentDate}
                                        onChange={handleInputChange}
                                        className="h-12 rounded-xl border-gray-200"
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label className="font-bold text-gray-700">Location of Event</Label>
                                    <Input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Science Lab, Cafeteria..."
                                        className="h-12 rounded-xl border-gray-200"
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label className="font-bold text-gray-700">Detailed Narrative</Label>
                                    <Textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Describe the sequence of events and behavioral breach..."
                                        className="rounded-xl border-gray-200 min-h-[120px]"
                                    />
                                </div>
                            </div>
                            <DialogFooter className="gap-3">
                                <Button variant="ghost" onClick={() => setIsReportOpen(false)} className="font-black text-gray-400">Abort</Button>
                                <Button
                                    className="bg-red-600 hover:bg-red-700 px-8 font-black shadow-lg shadow-red-100"
                                    onClick={handleSubmitReport}
                                    disabled={submitting}
                                >
                                    {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                    Finalize Report
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-2xl shadow-red-100/40 bg-white ring-1 ring-red-50">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Unresolved</p>
                                <div className="p-2 bg-red-50 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
                            </div>
                            <p className="text-4xl font-black text-gray-900 tracking-tighter">{incidents.filter(i => i.status === 'pending').length}</p>
                            <p className="text-xs font-bold text-gray-400 mt-2 italic px-1">Awaiting review from administration</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-2xl shadow-indigo-100/40 bg-white ring-1 ring-indigo-50">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Total Logged</p>
                                <div className="p-2 bg-indigo-50 rounded-lg"><Gavel className="w-5 h-5 text-indigo-500" /></div>
                            </div>
                            <p className="text-4xl font-black text-gray-900 tracking-tighter">{incidents.length}</p>
                            <p className="text-xs font-bold text-gray-400 mt-2 px-1">Cumulative incidents this session</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-none shadow-2xl shadow-indigo-100/30 overflow-hidden ring-1 ring-gray-100">
                    <CardHeader className="bg-gray-50/50 border-b py-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="font-black text-gray-800 text-xl tracking-tight">Infraction Chronology</CardTitle>
                                <CardDescription className="font-medium">Audit trail of conduct reports issued by your department.</CardDescription>
                            </div>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                <Input placeholder="Search records..." className="h-11 pl-10 rounded-xl bg-white border-gray-200" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                            {incidents.length === 0 ? (
                                <div className="py-24 text-center">
                                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                                        <CheckCircle className="h-8 w-8 text-emerald-300" />
                                    </div>
                                    <h3 className="font-black text-gray-400 uppercase tracking-widest text-sm">Clear Record</h3>
                                    <p className="text-xs text-gray-400 font-medium">No behavioral breaches have been archived yet.</p>
                                </div>
                            ) : incidents.map((item) => (
                                <div key={item._id} className="p-6 hover:bg-red-50/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                                    <div className="flex gap-6 items-start flex-1">
                                        <div className="h-14 w-14 bg-white border-2 border-red-50 rounded-2xl flex flex-col items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                                            <span className="text-[10px] font-black text-red-300 uppercase leading-none mb-0.5">{new Date(item.incidentDate).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-xl font-black text-red-600 leading-none">{new Date(item.incidentDate).getDate()}</span>
                                        </div>
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-black text-lg text-gray-900 leading-none">
                                                    {item.studentId?.firstName} {item.studentId?.lastName}
                                                </h4>
                                                <Badge className={`rounded-xl h-5 text-[8px] font-black uppercase tracking-tighter ${getSeverityBadge(item.severity)}`}>
                                                    {item.severity} Risk
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                <span className="flex items-center gap-1 text-indigo-500 font-black"><User className="h-3 w-3" /> Batch {item.studentId?.class}-{item.studentId?.section}</span>
                                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.location}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 font-medium line-clamp-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-3 shrink-0">
                                        <Badge className={`rounded-lg h-7 px-4 text-[10px] font-black uppercase tracking-widest border ${getStatusBadge(item.status)}`}>
                                            {item.status}
                                        </Badge>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="h-8 rounded-lg font-black text-[10px] uppercase text-gray-500" onClick={() => toast({ title: "Action Recorded", description: "Redirecting to remark entry module..." })}>Add Remark</Button>
                                            <Button size="sm" variant="ghost" className="h-8 font-black text-indigo-600 text-[10px] uppercase" onClick={() => toast({ title: "Archived", description: "Incident moved to archives." })}>Archive View</Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

