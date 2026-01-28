"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Search,
    Copy,
    FileSpreadsheet,
    Printer,
    Calendar,
    Edit2,
    MoreVertical,
    Trash,
    Loader2
} from "lucide-react"
import { toast } from "sonner"
import { API_URL } from "@/lib/api-config"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { ActionMenu } from "@/components/action-menu"

interface ClassItem {
    _id: string
    className: string
}

interface SchoolTimeItem {
    _id: string
    srNo: string
    period: string
    classId: {
        _id: string
        className: string
    }
    startTime: string
    endTime: string
    isBreak: boolean
}

export default function SchoolTimesPage() {
    const [times, setTimes] = useState<SchoolTimeItem[]>([])
    const [classes, setClasses] = useState<ClassItem[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [editingTime, setEditingTime] = useState<SchoolTimeItem | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const [form, setForm] = useState({
        classId: "",
        srNo: "",
        period: "",
        startTime: "",
        endTime: "",
        isBreak: false
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        const token = localStorage.getItem("token")
        try {
            const [timesRes, classesRes] = await Promise.all([
                fetch(`${API_URL}/api/school-times`, { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(`${API_URL}/api/classes`, { headers: { "Authorization": `Bearer ${token}` } })
            ])
            const timesData = await timesRes.json()
            const classesData = await classesRes.json()

            if (timesData.success) setTimes(timesData.data)
            if (classesData.success) setClasses(classesData.data)
        } catch (err) {
            toast.error("Failed to load data")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!form.classId || !form.srNo || !form.period || !form.startTime || !form.endTime) {
            toast.error("Please fill all required fields")
            return
        }

        try {
            setSaving(true)
            const token = localStorage.getItem("token")
            const url = editingTime
                ? `${API_URL}/api/school-times/${editingTime._id}`
                : `${API_URL}/api/school-times`
            const method = editingTime ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            })

            const result = await response.json()
            if (result.success) {
                toast.success(editingTime ? "Time updated" : "Time added")
                resetForm()
                fetchData() // Refresh list
            } else {
                toast.error(result.error || "Save failed")
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (item: SchoolTimeItem) => {
        setEditingTime(item)
        setForm({
            classId: item.classId?._id || "",
            srNo: item.srNo,
            period: item.period,
            startTime: item.startTime,
            endTime: item.endTime,
            isBreak: item.isBreak
        })
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/school-times/${deleteId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await response.json()
            if (result.success) {
                toast.success("School time deleted")
                fetchData()
            }
        } catch (err) {
            toast.error("Delete failed")
        } finally {
            setDeleteId(null)
        }
    }

    const resetForm = () => {
        setEditingTime(null)
        setForm({
            classId: "",
            srNo: "",
            period: "",
            startTime: "",
            endTime: "",
            isBreak: false
        })
    }

    const filteredTimes = times.filter(item => {
        const className = item.classId?.className?.toLowerCase() || "";
        const period = item.period?.toLowerCase() || "";
        const search = searchTerm.toLowerCase();

        return className.includes(search) || period.includes(search);
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <span className="p-2 bg-primary/10 rounded-md">
                        <Calendar className="w-5 h-5 text-primary" />
                    </span>
                    School Times
                </h1>
                <div className="text-sm text-muted-foreground">
                    System Setting / School Times
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Form */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader className="border-b pb-4">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <Edit2 size={18} />
                                {editingTime ? "Edit School Times" : "Add School Times"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="class">Class <span className="text-red-500">*</span></Label>
                                <Select
                                    value={form.classId}
                                    onValueChange={(v) => setForm({ ...form, classId: v })}
                                >
                                    <SelectTrigger id="class">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map(cls => (
                                            <SelectItem key={cls._id} value={cls._id}>{cls.className}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sr-no">Sr. No <span className="text-red-500">*</span></Label>
                                <Input
                                    id="sr-no"
                                    placeholder="e.g. 1"
                                    value={form.srNo}
                                    onChange={(e) => setForm({ ...form, srNo: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="period">Period <span className="text-red-500">*</span></Label>
                                <Input
                                    id="period"
                                    placeholder="e.g. 1st Period or Break"
                                    value={form.period}
                                    onChange={(e) => setForm({ ...form, period: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start-time">Start Time <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="start-time"
                                        type="time"
                                        value={form.startTime}
                                        onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end-time">End Time <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="end-time"
                                        type="time"
                                        value={form.endTime}
                                        onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox
                                    id="is-break"
                                    checked={form.isBreak}
                                    onCheckedChange={(checked) => setForm({ ...form, isBreak: !!checked })}
                                />
                                <Label htmlFor="is-break" className="text-sm font-medium leading-none cursor-pointer">Is Break / Interval</Label>
                            </div>

                            <div className="pt-4 flex gap-2 justify-end">
                                {editingTime && (
                                    <Button variant="outline" onClick={resetForm}>Cancel</Button>
                                )}
                                <Button
                                    className="bg-[#1e1b4b] hover:bg-[#1e1b4b]/90 min-w-[100px]"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                    {editingTime ? "Update" : "Save"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: List */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                School Times List
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="outline" size="sm" className="gap-2 opacity-50 cursor-not-allowed">
                                        <Copy size={16} /> Copy
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2 opacity-50 cursor-not-allowed">
                                        <FileSpreadsheet size={16} /> Excel
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2 opacity-50 cursor-not-allowed">
                                        <Printer size={16} /> Print
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input
                                        placeholder="Search class or period..."
                                        className="pl-9 w-48 sm:w-64"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="font-bold">SR. NO</TableHead>
                                            <TableHead className="font-bold">PERIOD</TableHead>
                                            <TableHead className="font-bold">CLASS</TableHead>
                                            <TableHead className="font-bold text-center">TIME RANGE</TableHead>
                                            <TableHead className="font-bold text-right px-6">ACTION</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-10">
                                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredTimes.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                                                    No schedule records found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredTimes.map((item) => (
                                                <TableRow key={item._id} className="hover:bg-muted/10">
                                                    <TableCell className="text-xs text-muted-foreground">{item.srNo}</TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-gray-900">{item.period}</div>
                                                        {item.isBreak && <span className="text-[10px] text-orange-600 font-bold uppercase">Break</span>}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">
                                                            {item.classId?.className || "Unknown Class"}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-md">
                                                            {item.startTime} - {item.endTime}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right px-6">
                                                        <ActionMenu
                                                            onEdit={() => handleEdit(item)}
                                                            onDelete={() => setDeleteId(item._id)}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ConfirmationDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Schedule Entry"
                description="Are you sure you want to delete this class time slot?"
                variant="destructive"
            />
        </div>
    )
}
