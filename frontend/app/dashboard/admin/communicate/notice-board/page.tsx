"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Menu, ChevronDown, Pin, Edit2, Trash2, Loader2, Eye, Printer, Download, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface Notice {
    _id: string
    title: string
    description: string
    isPinned: boolean
    createdAt: string
    postedBy?: { firstName: string, lastName: string }
}

export default function NoticeBoardPage() {
    const { toast } = useToast()
    const [notices, setNotices] = useState<Notice[]>([])
    const [loading, setLoading] = useState(true)

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isViewOpen, setIsViewOpen] = useState(false)
    const [viewItem, setViewItem] = useState<Notice | null>(null)

    const [saving, setSaving] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState({ title: "", description: "" })

    useEffect(() => {
        fetchNotices()
    }, [])

    const fetchNotices = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/notices`, {
                headers: { "Authorization": `Bearer ${token}` }
            })

            if (res.status === 401 || res.status === 403) {
                window.location.href = '/login'
                return
            }

            if (res.ok) {
                const data = await res.json()
                setNotices(Array.isArray(data) ? data : data.data || [])
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to fetch notices", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!form.title.trim()) {
            toast({ title: "Required", description: "Title is required", variant: "destructive" })
            return
        }

        setSaving(true)
        try {
            const token = localStorage.getItem("token")
            const url = editingId ? `${API_URL}/api/notices/${editingId}` : `${API_URL}/api/notices`
            const method = editingId ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(form)
            })

            if (res.status === 401 || res.status === 403) {
                window.location.href = '/login'
                return
            }

            if (res.ok) {
                toast({ title: "Success", description: editingId ? "Notice updated" : "Notice posted" })
                setIsModalOpen(false)
                setForm({ title: "", description: "" })
                setEditingId(null)
                fetchNotices()
            } else {
                const err = await res.json()
                toast({ title: "Error", description: err.error || "Failed to save", variant: "destructive" })
            }
        } catch {
            toast({ title: "Error", description: "Network error", variant: "destructive" })
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this notice?")) return
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/notices/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (res.ok) {
                toast({ title: "Deleted", description: "Notice removed" })
                fetchNotices()
            }
        } catch {
            toast({ title: "Error", description: "Delete failed", variant: "destructive" })
        }
    }

    const handleTogglePin = async (id: string) => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/notices/${id}/toggle-pin`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (res.ok) {
                fetchNotices()
            }
        } catch {
            toast({ title: "Error", description: "Pin toggle failed", variant: "destructive" })
        }
    }

    const handleExportPDF = () => {
        const doc = new jsPDF()
        doc.text("Notice Board Report", 14, 15)
        doc.setFontSize(10)
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22)

        const tableData = notices.map(n => [
            n.title,
            new Date(n.createdAt).toLocaleString(),
            n.isPinned ? "Yes" : "No",
            n.description.substring(0, 50) + (n.description.length > 50 ? "..." : "")
        ])

        autoTable(doc, {
            head: [["Title", "Published Date", "Pinned", "Preview"]],
            body: tableData,
            startY: 30,
        })

        doc.save("NoticeBoard_Report.pdf")
    }

    const handleExportCSV = () => {
        const headers = ["Title", "Description", "Published At", "Pinned"];
        const csvContent = [
            headers.join(","),
            ...notices.map(n => [
                `"${n.title}"`,
                `"${n.description.replace(/"/g, '""')}"`,
                new Date(n.createdAt).toLocaleString(),
                n.isPinned ? "Yes" : "No"
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "notices_export.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handlePrintSingle = (notice: Notice) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Notice: ${notice.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; }
                        h1 { color: #1a237e; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                        .meta { color: #666; font-size: 0.9em; margin-bottom: 20px; }
                        .content { line-height: 1.6; white-space: pre-wrap; }
                    </style>
                </head>
                <body>
                    <h1>${notice.title}</h1>
                    <div class="meta">
                        Published: ${new Date(notice.createdAt).toLocaleString()}
                    </div>
                    <div class="content">${notice.description}</div>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    }

    const openEditModal = (notice: Notice) => {
        setEditingId(notice._id)
        setForm({ title: notice.title, description: notice.description })
        setIsModalOpen(true)
    }

    return (
        <DashboardLayout title="Notice Board">
            <div className="space-y-6">
                <Card className="shadow-sm border-t-4 border-t-[#1a237e]">
                    <CardHeader className="bg-pink-50/50 border-b pb-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-[#1a237e]">
                            <Menu className="h-4 w-4" /> Notice Board List
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleExportCSV} title="Export CSV">
                                <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleExportPDF} title="Download Report">
                                <Download className="h-4 w-4" />
                            </Button>
                            <Button
                                className="bg-[#1a237e] hover:bg-[#1a237e]/90 text-white gap-2 h-9"
                                onClick={() => {
                                    setEditingId(null)
                                    setForm({ title: "", description: "" })
                                    setIsModalOpen(true)
                                }}
                            >
                                <Plus className="h-4 w-4" /> Post Notice
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        {loading ? (
                            <div className="text-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                            </div>
                        ) : notices.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">No notices found.</div>
                        ) : (
                            notices.map((notice) => (
                                <div key={notice._id} className="flex items-center justify-between p-4 bg-[#eff0f6] rounded-lg">
                                    <div className="flex items-center gap-3 flex-1">
                                        {notice.isPinned && <Pin className="h-4 w-4 text-rose-500" />}
                                        <div className="flex-1">
                                            <div className="flex justify-between w-full pr-4">
                                                <span className="text-[#1a237e] font-medium block">{notice.title}</span>
                                            </div>
                                            <span className="text-xs text-gray-500 flex items-center gap-2">
                                                {new Date(notice.createdAt).toLocaleDateString()} at {new Date(notice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => { setViewItem(notice); setIsViewOpen(true); }}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Eye className="h-4 w-4 text-blue-600" />
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="sm" className="bg-[#1a237e] hover:bg-[#1a237e]/90 h-8">
                                                    Action <ChevronDown className="h-4 w-4 ml-1" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEditModal(notice)}>
                                                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleTogglePin(notice._id)}>
                                                    <Pin className="h-4 w-4 mr-2" /> {notice.isPinned ? "Unpin" : "Pin"}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handlePrintSingle(notice)}>
                                                    <Printer className="h-4 w-4 mr-2" /> Print
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(notice._id)} className="text-red-600">
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Create/Edit Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Edit Notice" : "Post New Notice"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Title *</Label>
                                <Input
                                    placeholder="Notice title"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Content</Label>
                                <Textarea
                                    placeholder="Notice content..."
                                    rows={4}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={saving} className="bg-[#1a237e]">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingId ? "Update" : "Post")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* View Modal */}
                <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-[#1a237e] text-xl">{viewItem?.title}</DialogTitle>
                        </DialogHeader>
                        {viewItem && (
                            <div className="space-y-4 py-2">
                                <div className="text-sm text-gray-500 border-b pb-2 flex justify-between">
                                    <span>Posted: {new Date(viewItem.createdAt).toLocaleString()}</span>
                                    {viewItem.isPinned && <span className="flex items-center text-rose-500"><Pin className="h-3 w-3 mr-1" /> Pinned</span>}
                                </div>
                                <div className="text-gray-800 whitespace-pre-wrap leading-relaxed min-h-[100px]">
                                    {viewItem.description}
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => handlePrintSingle(viewItem!)}>
                                <Printer className="h-4 w-4 mr-2" /> Print
                            </Button>
                            <Button onClick={() => setIsViewOpen(false)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    )
}
