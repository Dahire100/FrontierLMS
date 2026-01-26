"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Plus,
    Search,
    Copy,
    FileSpreadsheet,
    Printer,
    Mail,
    Edit2,
    Loader2,
    Eye,
    Trash,
    Smartphone,
    MessageSquare,
    Globe
} from "lucide-react"
import { ActionMenu } from "@/components/action-menu"
import { toast } from "sonner"
import { API_URL } from "@/lib/api-config"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"

interface TemplateItem {
    _id: string
    event: string
    templateId: string
    ivrId: string
    smsWhatsapp: boolean
    email: boolean
    type: 'System' | 'Custom'
    category: 'SMS' | 'Email' | 'Notification' | 'WhatsApp'
    content: string
}

export default function TemplateSettingPage() {
    const [templates, setTemplates] = useState<TemplateItem[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [previewContent, setPreviewContent] = useState("")
    const [editingItem, setEditingItem] = useState<TemplateItem | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const [form, setForm] = useState({
        event: "",
        templateId: "",
        ivrId: "",
        smsWhatsapp: true,
        email: false,
        type: "Custom",
        category: "SMS",
        content: ""
    })

    useEffect(() => {
        fetchTemplates()
    }, [])

    const fetchTemplates = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/template-settings`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await response.json()
            if (result.success) setTemplates(result.data)
        } catch (err) {
            toast.error("Failed to load templates")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!form.event || !form.content || !form.category) {
            toast.error("Event, Category and Content are required")
            return
        }

        try {
            setSaving(true)
            const token = localStorage.getItem("token")
            const url = editingItem
                ? `${API_URL}/api/template-settings/${editingItem._id}`
                : `${API_URL}/api/template-settings`
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
                toast.success(editingItem ? "Template updated" : "Template created")
                setIsModalOpen(false)
                resetForm()
                fetchTemplates()
            }
        } catch (err) {
            toast.error("Save failed")
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (item: TemplateItem) => {
        setEditingItem(item)
        setForm({
            event: item.event,
            templateId: item.templateId || "",
            ivrId: item.ivrId || "",
            smsWhatsapp: item.smsWhatsapp,
            email: item.email,
            type: item.type,
            category: item.category,
            content: item.content
        })
        setIsModalOpen(true)
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/template-settings/${deleteId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await response.json()
            if (result.success) {
                toast.success("Template deleted")
                fetchTemplates()
            }
        } catch (err) {
            toast.error("Delete failed")
        } finally {
            setDeleteId(null)
        }
    }

    const resetForm = () => {
        setEditingItem(null)
        setForm({
            event: "",
            templateId: "",
            ivrId: "",
            smsWhatsapp: true,
            email: false,
            type: "Custom",
            category: "SMS",
            content: ""
        })
    }

    const handlePreview = (content: string) => {
        setPreviewContent(content)
        setIsPreviewOpen(true)
    }

    const filteredTemplates = templates.filter(item =>
        item.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case 'SMS': return <Smartphone size={14} className="text-orange-600" />
            case 'Email': return <Mail size={14} className="text-blue-600" />
            case 'WhatsApp': return <MessageSquare size={14} className="text-green-600" />
            default: return <Globe size={14} className="text-purple-600" />
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <span className="p-2 bg-primary/10 rounded-md">
                        <Mail className="w-5 h-5 text-primary" />
                    </span>
                    Template Setting
                </h1>
                <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-[#1e1b4b]">
                    <Plus className="w-4 h-4 mr-2" /> Add Template
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        Communication Templates
                    </CardTitle>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search templates..."
                            className="pl-9 w-48 sm:w-64"
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
                                    <TableHead className="font-bold pl-6">CATEGORY</TableHead>
                                    <TableHead className="font-bold">EVENT / NAME</TableHead>
                                    <TableHead className="font-bold">STATUS</TableHead>
                                    <TableHead className="font-bold">TYPE</TableHead>
                                    <TableHead className="font-bold text-right pr-6">ACTION</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredTemplates.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground text-sm">
                                            No templates found. Create one to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTemplates.map((item) => (
                                        <TableRow key={item._id} className="hover:bg-muted/10 transition-colors">
                                            <TableCell className="pl-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="p-1.5 rounded-md bg-muted">
                                                        {getCategoryIcon(item.category)}
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-700">{item.category}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-sm text-gray-900">{item.event}</div>
                                                <div className="text-[10px] text-muted-foreground">ID: {item.templateId || 'N/A'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {item.smsWhatsapp && <span className="bg-orange-50 text-orange-700 text-[10px] px-1.5 py-0.5 rounded border border-orange-100 font-bold">SMS</span>}
                                                    {item.email && <span className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded border border-blue-100 font-bold">EMAIL</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.type === 'System' ? 'bg-gray-100 text-gray-600' : 'bg-purple-50 text-purple-700'}`}>
                                                    {item.type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => handlePreview(item.content)} className="h-8 w-8 p-0 text-blue-600">
                                                        <Eye size={16} />
                                                    </Button>
                                                    <ActionMenu
                                                        onEdit={() => handleEdit(item)}
                                                        onDelete={() => setDeleteId(item._id)}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={(val) => { if (!val) setIsModalOpen(false); }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Template" : "Add New Template"}</DialogTitle>
                        <DialogDescription>Create a message template for automated communications.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2 col-span-2">
                            <Label>Event / Name <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="e.g. Absent Student Notification"
                                value={form.event}
                                onChange={(e) => setForm({ ...form, event: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Category <span className="text-red-500">*</span></Label>
                            <Select value={form.category} onValueChange={(v: any) => setForm({ ...form, category: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SMS">SMS</SelectItem>
                                    <SelectItem value="Email">Email</SelectItem>
                                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                                    <SelectItem value="Notification">System Notification</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Custom">Custom</SelectItem>
                                    <SelectItem value="System">System</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Template ID (Optional)</Label>
                            <Input
                                placeholder="DLT Template ID"
                                value={form.templateId}
                                onChange={(e) => setForm({ ...form, templateId: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>IVR ID (Optional)</Label>
                            <Input
                                placeholder="IVR Voice ID"
                                value={form.ivrId}
                                onChange={(e) => setForm({ ...form, ivrId: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Template Content <span className="text-red-500">*</span></Label>
                                <span className="text-[10px] text-muted-foreground italic text-right">Use {"{student_name}"}, {"{date}"} for dynamic data</span>
                            </div>
                            <Textarea
                                className="min-h-[150px] text-sm"
                                placeholder="Enter your template message here..."
                                value={form.content}
                                onChange={(e) => setForm({ ...form, content: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button variant="outline" className="border-blue-200 text-blue-700 bg-blue-50" onClick={() => handlePreview(form.content)}>Preview</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-[#1e1b4b]">
                            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            {editingItem ? "Update Template" : "Save Template"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Eye size={18} /> Message Preview
                        </DialogTitle>
                    </DialogHeader>
                    <div className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300 min-h-[100px] whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-serif italic">
                        {previewContent || "No content to preview."}
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground mt-2">
                        * Note: Placeholders will be replaced by actual data when sending.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmationDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Template"
                description="Are you sure? This template will no longer be available for automated messages."
                variant="destructive"
            />
        </div>
    )
}
