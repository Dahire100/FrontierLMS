"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Plus, Book, ChevronDown, Edit2, Trash2, Loader2, Eye, Printer, Download, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface DiaryEntry {
    _id: string
    title: string
    description: string
    createdAt: string
    postedBy?: { firstName: string, lastName: string }
}

export default function SchoolDiaryPage() {
    const { toast } = useToast()
    const [entries, setEntries] = useState<DiaryEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isViewOpen, setIsViewOpen] = useState(false)
    const [viewItem, setViewItem] = useState<DiaryEntry | null>(null)

    const [saving, setSaving] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState({ title: "", description: "" })

    useEffect(() => {
        fetchEntries()
    }, [])

    const fetchEntries = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/notices?type=diary`, {
                headers: { "Authorization": `Bearer ${token}` }
            })

            if (res.status === 401 || res.status === 403) {
                window.location.href = '/login'
                return
            }

            if (res.ok) {
                const data = await res.json()
                setEntries(Array.isArray(data) ? data : data.data || [])
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to fetch diary entries", variant: "destructive" })
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

            const payload = { ...form, type: 'diary' }

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (res.status === 401 || res.status === 403) {
                window.location.href = '/login'
                return
            }

            if (res.ok) {
                toast({ title: "Success", description: editingId ? "Entry updated" : "Entry posted" })
                setIsModalOpen(false)
                setForm({ title: "", description: "" })
                setEditingId(null)
                fetchEntries()
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
        if (!confirm("Are you sure you want to delete this entry?")) return
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/notices/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (res.ok) {
                toast({ title: "Deleted", description: "Entry removed" })
                fetchEntries()
            }
        } catch {
            toast({ title: "Error", description: "Delete failed", variant: "destructive" })
        }
    }

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Delete ${selectedIds.length} entries?`)) return;

        // Parallel delete (not efficient but standard given existing API)
        try {
            const token = localStorage.getItem("token")
            await Promise.all(selectedIds.map(id =>
                fetch(`${API_URL}/api/notices/${id}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                })
            ));
            toast({ title: "Deleted", description: "Selected entries deleted" })
            setSelectedIds([])
            fetchEntries()
        } catch {
            toast({ title: "Error", description: "Bulk delete failed", variant: "destructive" })
        }
    }

    const handleExportPDF = () => {
        const doc = new jsPDF()
        doc.text("School Diary Report", 14, 15)
        doc.setFontSize(10)
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22)

        const exportData = selectedIds.length > 0
            ? entries.filter(e => selectedIds.includes(e._id))
            : entries;

        const tableData = exportData.map(n => [
            n.title,
            new Date(n.createdAt).toLocaleString(),
            n.description.substring(0, 50) + (n.description.length > 50 ? "..." : "")
        ])

        autoTable(doc, {
            head: [["Title", "Date", "Content"]],
            body: tableData,
            startY: 30,
        })

        doc.save("SchoolDiary_Report.pdf")
    }

    const handleExportCSV = () => {
        const exportData = selectedIds.length > 0
            ? entries.filter(e => selectedIds.includes(e._id))
            : entries;

        const headers = ["Title", "Content", "Date"];
        const csvContent = [
            headers.join(","),
            ...exportData.map(n => [
                `"${n.title}"`,
                `"${n.description.replace(/"/g, '""')}"`,
                new Date(n.createdAt).toLocaleString(),
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "school_diary_export.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const openEditModal = (entry: DiaryEntry) => {
        setEditingId(entry._id)
        setForm({ title: entry.title, description: entry.description })
        setIsModalOpen(true)
    }

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (selectedIds.length === entries.length) setSelectedIds([])
        else setSelectedIds(entries.map(e => e._id))
    }

    return (
        <DashboardLayout title="School Diary">
            <div className="space-y-6">
                <Card className="shadow-sm border-t-4 border-t-[#1a237e]">
                    <CardHeader className="bg-pink-50/50 border-b pb-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-[#1a237e]">
                            <Book className="h-4 w-4" /> Diary Entries
                        </CardTitle>
                        <div className="flex gap-2">
                            {selectedIds.length > 0 && (
                                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete ({selectedIds.length})
                                </Button>
                            )}
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
                                <Plus className="h-4 w-4" /> Post Entry
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-2 mb-4 px-4">
                            <Checkbox
                                id="select-all"
                                checked={entries.length > 0 && selectedIds.length === entries.length}
                                onCheckedChange={toggleSelectAll}
                            />
                            <Label htmlFor="select-all" className="text-sm font-medium text-gray-500 cursor-pointer">
                                Select All ({entries.length})
                            </Label>
                        </div>

                        {loading ? (
                            <div className="text-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                            </div>
                        ) : entries.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">No diary entries found.</div>
                        ) : (
                            entries.map((entry) => (
                                <div key={entry._id} className={`flex items-start justify-between p-4 rounded-lg border ${selectedIds.includes(entry._id) ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-transparent'}`}>
                                    <div className="flex items-start gap-3 flex-1">
                                        <Checkbox
                                            checked={selectedIds.includes(entry._id)}
                                            onCheckedChange={() => toggleSelect(entry._id)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between w-full pr-4">
                                                <span className="text-[#1a237e] font-bold block text-lg">{entry.title}</span>
                                            </div>
                                            <span className="text-xs text-gray-500 flex items-center gap-2 mb-1">
                                                {new Date(entry.createdAt).toLocaleDateString()} at {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <p className="text-sm text-gray-700 line-clamp-2">{entry.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-start">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => { setViewItem(entry); setIsViewOpen(true); }}
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
                                                <DropdownMenuItem onClick={() => openEditModal(entry)}>
                                                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(entry._id)} className="text-red-600">
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
                            <DialogTitle>{editingId ? "Edit Diary Entry" : "Post New Entry"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Title *</Label>
                                <Input
                                    placeholder="Topic / Title"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Message *</Label>
                                <Textarea
                                    placeholder="Write your message here..."
                                    rows={6}
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
                                <div className="text-sm text-gray-500 border-b pb-2">
                                    <span>{new Date(viewItem.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="text-gray-800 whitespace-pre-wrap leading-relaxed min-h-[100px] text-base p-4 bg-gray-50 rounded-lg">
                                    {viewItem.description}
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button onClick={() => setIsViewOpen(false)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    )
}
