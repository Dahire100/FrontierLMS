"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    Clock,
    Edit2,
    Loader2,
    User,
    Trash,
    Timer
} from "lucide-react"
import { ActionMenu } from "@/components/action-menu"
import { toast } from "sonner"
import { API_URL } from "@/lib/api-config"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"

interface TimeSlotItem {
    _id: string
    name: string
    startTime: string
    endTime: string
}

export default function StaffTimeSlotsPage() {
    const [slots, setSlots] = useState<TimeSlotItem[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [editingItem, setEditingItem] = useState<TimeSlotItem | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const [form, setForm] = useState({
        name: "",
        startTime: "",
        endTime: ""
    })

    useEffect(() => {
        fetchSlots()
    }, [])

    const fetchSlots = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/staff-time-slots`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await response.json()
            if (result.success) setSlots(result.data)
        } catch (err) {
            toast.error("Failed to load time slots")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!form.name || !form.startTime || !form.endTime) {
            toast.error("All fields are required")
            return
        }

        if (form.startTime >= form.endTime) {
            toast.error("End time must be after start time")
            return
        }

        try {
            setSaving(true)
            const token = localStorage.getItem("token")
            const url = editingItem
                ? `${API_URL}/api/staff-time-slots/${editingItem._id}`
                : `${API_URL}/api/staff-time-slots`
            const method = editingItem ? "PUT" : "POST"

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
                toast.success(editingItem ? "Slot updated" : "Slot added")
                resetForm()
                fetchSlots()
            } else {
                toast.error(result.error || "Save failed")
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (item: TimeSlotItem) => {
        setEditingItem(item)
        setForm({
            name: item.name,
            startTime: item.startTime,
            endTime: item.endTime
        })
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/staff-time-slots/${deleteId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await response.json()
            if (result.success) {
                toast.success("Time slot deleted")
                fetchSlots()
            }
        } catch (err) {
            toast.error("Delete failed")
        } finally {
            setDeleteId(null)
        }
    }

    const resetForm = () => {
        setEditingItem(null)
        setForm({ name: "", startTime: "", endTime: "" })
    }

    const filteredSlots = slots.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Helper to format time for display (HH:MM to 12-hour)
    const formatTime = (timeStr: string) => {
        if (!timeStr) return "-"
        try {
            const [hours, mins] = timeStr.split(':')
            const h = parseInt(hours)
            const ampm = h >= 12 ? 'PM' : 'AM'
            const h12 = h % 12 || 12
            return `${h12}:${mins} ${ampm}`
        } catch {
            return timeStr
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <span className="p-2 bg-primary/10 rounded-md">
                        <User className="w-5 h-5 text-primary" />
                    </span>
                    Staff Time Slots
                </h1>
                <div className="text-sm text-muted-foreground">
                    System Setting / Staff Time Slots
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-1 border-primary/10">
                    <CardHeader className="border-b pb-4">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Clock size={18} className="text-primary" />
                            {editingItem ? "Edit Time Slot" : "Add Time Slot"}
                        </CardTitle>
                        <CardDescription>Define shift timings for staff</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Shift Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                placeholder="e.g. Morning Shift"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>

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

                        <div className="flex gap-2 pt-4">
                            {editingItem && (
                                <Button variant="outline" className="flex-1" onClick={resetForm}>Cancel</Button>
                            )}
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-[#1e1b4b] hover:bg-[#1e1b4b]/90 flex-1"
                            >
                                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                {editingItem ? "Update" : "Save"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                        <CardTitle className="text-lg font-medium">Time Slots List</CardTitle>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search shift name..."
                                className="pl-9 w-48 sm:w-64 h-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead className="font-bold py-4 pl-6">SHIFT NAME</TableHead>
                                        <TableHead className="font-bold">START TIME</TableHead>
                                        <TableHead className="font-bold">END TIME</TableHead>
                                        <TableHead className="font-bold text-center">DURATION</TableHead>
                                        <TableHead className="text-right pr-6 font-bold">ACTION</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10">
                                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredSlots.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                                                No staff time slots defined.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredSlots.map((item) => (
                                            <TableRow key={item._id} className="hover:bg-muted/10 transition-colors">
                                                <TableCell className="font-medium py-4 pl-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 rounded-full bg-blue-50 text-blue-600">
                                                            <Timer size={14} />
                                                        </div>
                                                        {item.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold text-gray-700">{formatTime(item.startTime)}</TableCell>
                                                <TableCell className="font-semibold text-gray-700">{formatTime(item.endTime)}</TableCell>
                                                <TableCell className="text-center">
                                                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 font-bold uppercase">
                                                        Standard Shift
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
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

            <ConfirmationDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Remove Time Slot"
                description="Are you sure you want to delete this shift timing? This may affect attendance and payroll tracking for assigned staff."
                variant="destructive"
            />
        </div>
    )
}
