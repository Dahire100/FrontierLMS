"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    MoreVertical,
    Clock,
    Edit2,
    Loader2,
    Check,
    Trash,
    ChevronDown
} from "lucide-react"
import { toast } from "sonner"
import { API_URL } from "@/lib/api-config"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { ActionMenu } from "@/components/action-menu"

interface SessionItem {
    _id: string
    name: string
    display: string
    isActive: boolean
}

export default function SessionSettingPage() {
    const [sessions, setSessions] = useState<SessionItem[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [editingSession, setEditingSession] = useState<SessionItem | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        display: "",
        isActive: false
    })

    useEffect(() => {
        fetchSessions()
    }, [])

    const fetchSessions = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/academic-sessions`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await response.json()
            if (result.success) {
                setSessions(result.data)
            }
        } catch (err) {
            toast.error("Failed to load sessions")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!formData.name || !formData.display) {
            toast.error("Session Name and Display Name are required")
            return
        }

        // Validate YYYY-YY or YYYY-YYYY format
        const sessionRegex = /^\d{4}-\d{2,4}$/
        if (!sessionRegex.test(formData.name)) {
            toast.error("Format should be YYYY-YY (e.g., 2024-25)")
            return
        }

        try {
            setSaving(true)
            const token = localStorage.getItem("token")
            const url = editingSession
                ? `${API_URL}/api/academic-sessions/${editingSession._id}`
                : `${API_URL}/api/academic-sessions`
            const method = editingSession ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            })

            const result = await response.json()
            if (result.success) {
                toast.success(editingSession ? "Session updated" : "Session added")
                resetForm()
                fetchSessions()
            } else {
                toast.error(result.error || "Save failed")
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (session: SessionItem) => {
        setEditingSession(session)
        setFormData({
            name: session.name,
            display: session.display,
            isActive: session.isActive
        })
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/academic-sessions/${deleteId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await response.json()
            if (result.success) {
                toast.success("Session deleted")
                fetchSessions()
            }
        } catch (err) {
            toast.error("Delete failed")
        } finally {
            setDeleteId(null)
        }
    }

    const resetForm = () => {
        setEditingSession(null)
        setFormData({
            name: "",
            display: "",
            isActive: false
        })
    }

    const filteredSessions = sessions.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.display.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <span className="p-2 bg-primary/10 rounded-md">
                        <Clock className="w-5 h-5 text-primary" />
                    </span>
                    Session Setting
                </h1>
                <div className="text-sm text-muted-foreground">
                    System Setting / Session Setting
                </div>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader className="border-b pb-4">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Edit2 size={18} />
                            {editingSession ? "Edit Session Setting" : "Add Session Setting"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. 2024-25"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="display-name">Display Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="display-name"
                                    placeholder="e.g. Session 2024-2025"
                                    value={formData.display}
                                    onChange={(e) => setFormData({ ...formData, display: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-8">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                />
                                <Label htmlFor="isActive">Set as Active Session</Label>
                            </div>

                            <div className="flex items-end gap-2">
                                {editingSession && (
                                    <Button variant="outline" onClick={resetForm}>Cancel</Button>
                                )}
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-[#1e1b4b] hover:bg-[#1e1b4b]/90 min-w-[100px]"
                                >
                                    {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                    {editingSession ? "Update" : "Save"}
                                </Button>
                            </div>
                        </div>

                        <div className="text-[10px] text-muted-foreground mt-4 italic">
                            * Note: Please enter session name in YYYY-YY format (e.g., 2024-25). Only one session can be active at a time.
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b pb-4">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Session Setting List
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
                                <span className="text-[10px] text-muted-foreground flex items-center italic">(Tools coming soon)</span>
                            </div>

                            <div className="flex items-center gap-2 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search sessions..."
                                    className="pl-9 w-48 sm:w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 font-bold">
                                        <TableHead className="w-[80px]">#</TableHead>
                                        <TableHead>NAME</TableHead>
                                        <TableHead>DISPLAY</TableHead>
                                        <TableHead>STATUS</TableHead>
                                        <TableHead className="text-right px-6">ACTION</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredSessions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground text-sm">
                                                No sessions found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredSessions.map((item, index) => (
                                            <TableRow key={item._id} className="hover:bg-muted/10">
                                                <TableCell className="text-xs text-muted-foreground">{index + 1}</TableCell>
                                                <TableCell className="font-medium text-gray-900">{item.name}</TableCell>
                                                <TableCell className="text-sm">{item.display}</TableCell>
                                                <TableCell>
                                                    {item.isActive ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                                                            <Check size={10} /> ACTIVE
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold">
                                                            INACTIVE
                                                        </span>
                                                    )}
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

            <ConfirmationDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Session"
                description="Are you sure you want to delete this session? This will not affect existing records but might impact future registrations."
                variant="destructive"
            />
        </div>
    )
}
