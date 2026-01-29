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
import { Plus, Menu, ChevronDown, Pin, Edit2, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Notice {
    _id: string
    title: string
    description: string
    isPinned: boolean
    createdAt: string
}

export default function NoticeBoardPage() {
    const { toast } = useToast()
    const [notices, setNotices] = useState<Notice[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
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
                        <Button
                            className="bg-[#1a237e] hover:bg-[#1a237e]/90 text-white gap-2 h-9"
                            onClick={() => {
                                setEditingId(null)
                                setForm({ title: "", description: "" })
                                setIsModalOpen(true)
                            }}
                        >
                            <Plus className="h-4 w-4" /> Post New Message
                        </Button>
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
                                    <div className="flex items-center gap-3">
                                        {notice.isPinned && <Pin className="h-4 w-4 text-rose-500" />}
                                        <div>
                                            <span className="text-[#1a237e] font-medium block">{notice.title}</span>
                                            <span className="text-xs text-gray-500">{new Date(notice.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
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
                                            <DropdownMenuItem onClick={() => handleDelete(notice._id)} className="text-red-600">
                                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

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
            </div>
        </DashboardLayout>
    )
}
