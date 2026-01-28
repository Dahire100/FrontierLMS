"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Users,
    ChevronRight,
    RefreshCw,
    CheckCircle2,
    XCircle,
    ArrowUpCircle,
    Loader2,
    AlertCircle
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function StudentPromotion() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [promoting, setPromoting] = useState(false)
    const [students, setStudents] = useState<any[]>([])
    const [classes, setClasses] = useState<{ id: string, name: string }[]>([])
    const [selectedClass, setSelectedClass] = useState("")
    const [nextClass, setNextClass] = useState("")
    const [selectedStudents, setSelectedStudents] = useState<string[]>([])
    const [manualOverride, setManualOverride] = useState(false)

    useEffect(() => {
        fetchClasses()
    }, [])

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/classes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const resData = await res.json();
                const classesArray = Array.isArray(resData) ? resData : (Array.isArray(resData.data) ? resData.data : []);
                const uniqueClasses = Array.from(new Set(classesArray.map((c: any) => c.name))).map(name => ({
                    id: name as string,
                    name: name as string
                }));
                setClasses(uniqueClasses);
            }
        } catch (error) {
            console.error("Error fetching classes:", error);
        }
    }

    const fetchStudents = async () => {
        if (!selectedClass) return;
        setLoading(true)
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/students?class=${selectedClass}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
                // Pre-select all PASS students
                setSelectedStudents(data.filter((s: any) => s.resultStatus === 'PASS').map((s: any) => s._id));
            }
        } catch (error) {
            console.error("Fetch error:", error)
            toast({ title: "Error", description: "Failed to load students", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handlePromote = async () => {
        if (selectedStudents.length === 0) {
            toast({ title: "No Selection", description: "Please select students to promote", variant: "destructive" });
            return;
        }

        setPromoting(true)
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/students/promote`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    studentIds: selectedStudents,
                    nextClass: nextClass,
                    manualOverride: manualOverride
                })
            });

            if (response.ok) {
                const data = await response.json();
                toast({
                    title: "Promotion Complete",
                    description: `Successfully processed ${data.results.promoted} promotions.`
                });
                fetchStudents(); // Refresh list
            } else {
                const err = await response.json();
                throw new Error(err.error || "Promotion failed");
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setPromoting(false)
        }
    }

    const toggleStudent = (id: string) => {
        setSelectedStudents(prev =>
            prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
        );
    }

    return (
        <DashboardLayout title="Student Promotion">
            <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Academic Promotion</h1>
                        <p className="text-sm text-gray-500">Promote students to the next academic level based on results</p>
                    </div>
                </div>

                <Card className="border-none shadow-xl shadow-indigo-100/20 bg-white overflow-hidden ring-1 ring-gray-100">
                    <CardHeader className="bg-indigo-600 text-white p-6">
                        <div className="flex items-center gap-2">
                            <ArrowUpCircle className="h-6 w-6" />
                            <CardTitle className="text-lg">Promotion Criteria</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-gray-500">Current Class</Label>
                                <Select onValueChange={(v) => setSelectedClass(v)} value={selectedClass}>
                                    <SelectTrigger className="h-12 border-gray-100">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-gray-500">Promote To Class</Label>
                                <Select onValueChange={(v) => setNextClass(v)} value={nextClass}>
                                    <SelectTrigger className="h-12 border-gray-100">
                                        <SelectValue placeholder="Auto (Numeric + 1)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SKIP">Same Class (Retain)</SelectItem>
                                        {classes.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Button
                                    onClick={fetchStudents}
                                    className="h-12 w-full bg-indigo-600 hover:bg-indigo-700"
                                    disabled={!selectedClass || loading}
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : "Load Roster"}
                                </Button>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center space-x-2 bg-amber-50 p-4 rounded-xl border border-amber-100">
                            <Checkbox
                                id="manual"
                                checked={manualOverride}
                                onCheckedChange={(v) => setManualOverride(!!v)}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <label htmlFor="manual" className="text-sm font-bold text-amber-900 leading-none cursor-pointer">
                                    Manual Override (Admin Only)
                                </label>
                                <p className="text-xs text-amber-700">
                                    Ignore result status and promote selected students regardless of PASS/FAIL marks.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {students.length > 0 && (
                    <Card className="border-none shadow-xl shadow-indigo-100/20 overflow-hidden">
                        <CardHeader className="bg-white border-b py-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-bold">Promotion Roster</CardTitle>
                            <div className="flex items-center gap-4 text-xs font-bold">
                                <span className="text-emerald-600">Total Selected: {selectedStudents.length}</span>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedStudents([])} className="h-8 text-[10px] uppercase">Deselect All</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                                {students.map((student) => (
                                    <div key={student._id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-all">
                                        <div className="flex items-center gap-4">
                                            <Checkbox
                                                checked={selectedStudents.includes(student._id)}
                                                onCheckedChange={() => toggleStudent(student._id)}
                                            />
                                            <Avatar className="h-10 w-10 border shadow-sm">
                                                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold">
                                                    {student.firstName[0]}{student.lastName[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{student.firstName} {student.lastName}</p>
                                                <p className="text-[10px] text-gray-400 font-mono tracking-tighter">ID: {student.studentId}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {student.resultStatus === 'PASS' ? (
                                                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-[10px] font-black uppercase">
                                                    <CheckCircle2 className="h-3 w-3" /> PASS
                                                </div>
                                            ) : student.resultStatus === 'FAIL' ? (
                                                <div className="flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-1 rounded-full text-[10px] font-black uppercase">
                                                    <XCircle className="h-3 w-3" /> FAIL
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-[10px] font-black uppercase">
                                                    <AlertCircle className="h-3 w-3" /> PENDING
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="bg-gray-50 p-6 flex justify-end gap-4 border-t">
                            <Button variant="outline" className="h-12 px-8 uppercase tracking-widest text-xs font-bold">Cancel</Button>
                            <Button
                                onClick={handlePromote}
                                disabled={promoting || selectedStudents.length === 0}
                                className="h-12 bg-indigo-600 hover:bg-indigo-700 px-10 shadow-xl shadow-indigo-100 uppercase tracking-widest text-xs font-black"
                            >
                                {promoting ? <Loader2 className="animate-spin mr-2" /> : <ArrowUpCircle className="mr-2 h-4 w-4" />}
                                Finalize Promotion
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}
