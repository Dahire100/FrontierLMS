"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    Plus,
    Search,
    Copy,
    FileSpreadsheet,
    FileText,
    Printer,
    MoreVertical,
    Settings,
    Edit2,
    Loader2,
    Info,
    Trash
} from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { ActionMenu } from "@/components/action-menu"

interface DocumentMaster {
    _id: string
    title: string
    belongsTo: string
    description?: string
}

export default function DocumentMasterPage() {
    const [documents, setDocuments] = useState<DocumentMaster[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [editingDoc, setEditingDoc] = useState<DocumentMaster | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const [form, setForm] = useState({
        title: "",
        belongsTo: "",
        description: ""
    })

    useEffect(() => {
        fetchDocuments()
    }, [])

    const fetchDocuments = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/document-masters`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await response.json()
            if (result.success) {
                setDocuments(result.data)
            }
        } catch (err) {
            toast.error("Failed to load documents")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!form.title || !form.belongsTo) {
            toast.error("Title and Category are required")
            return
        }

        try {
            setSaving(true)
            const token = localStorage.getItem("token")
            const url = editingDoc
                ? `${API_URL}/api/document-masters/${editingDoc._id}`
                : `${API_URL}/api/document-masters`
            const method = editingDoc ? "PUT" : "POST"

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
                toast.success(editingDoc ? "Document updated" : "Document added")
                resetForm()
                fetchDocuments()
            } else {
                toast.error(result.error || "Save failed")
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (doc: DocumentMaster) => {
        setEditingDoc(doc)
        setForm({
            title: doc.title,
            belongsTo: doc.belongsTo,
            description: doc.description || ""
        })
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/document-masters/${deleteId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await response.json()
            if (result.success) {
                toast.success("Document deleted")
                fetchDocuments()
            }
        } catch (err) {
            toast.error("Delete failed")
        } finally {
            setDeleteId(null)
        }
    }

    const resetForm = () => {
        setEditingDoc(null)
        setForm({
            title: "",
            belongsTo: "",
            description: ""
        })
    }

    const filteredDocuments = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.belongsTo.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <span className="p-2 bg-primary/10 rounded-md">
                        <Settings className="w-5 h-5 text-primary" />
                    </span>
                    Document Master
                </h1>
                <div className="text-sm text-muted-foreground">
                    System Setting / Document Master
                </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <div className="flex items-center gap-3">
                    <Info className="text-blue-500 w-5 h-5" />
                    <div>
                        <h4 className="text-sm font-semibold text-blue-800">System Overview</h4>
                        <p className="text-xs text-blue-700">
                            Use this section to define required document types (e.g., Aadhar Card, Birth Certificate) that need to be collected from Students or Staff.
                            These definitions will appear as options in the Student Admission and Staff Recruitment modules.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Add Form */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader className="border-b pb-4">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <Edit2 size={18} />
                                {editingDoc ? "Edit Document Master" : "Add Document Master"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="doc-title">Document Title <span className="text-red-500">*</span></Label>
                                <Input
                                    id="doc-title"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. Aadhar Card"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="belongs-to">Belongs To <span className="text-red-500">*</span></Label>
                                <Select
                                    value={form.belongsTo}
                                    onValueChange={(v) => setForm({ ...form, belongsTo: v })}
                                >
                                    <SelectTrigger id="belongs-to">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="doc-desc">Short Description (Optional)</Label>
                                <Input
                                    id="doc-desc"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Purpose of this document"
                                />
                            </div>

                            <div className="text-xs text-red-500 mt-2">
                                *Please avoid using symbols like "/" or "\" in the title.
                            </div>

                            <div className="pt-4 flex gap-2 justify-end">
                                {editingDoc && (
                                    <Button variant="outline" onClick={resetForm}>Cancel</Button>
                                )}
                                <Button
                                    className="bg-[#1e1b4b] hover:bg-[#1e1b4b]/90"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                    {editingDoc ? "Update" : "Save"}
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
                                <Plus className="w-5 h-5" />
                                Document Master List
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
                                        placeholder="Search records..."
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
                                            <TableHead className="font-bold">DOCUMENT TITLE</TableHead>
                                            <TableHead className="font-bold">ENTITY TYPE</TableHead>
                                            <TableHead className="font-bold text-right px-6">ACTIONS</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-10">
                                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                                                    <span className="text-muted-foreground text-sm">Fetching document types...</span>
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredDocuments.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center h-32 text-muted-foreground">
                                                    No document types found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredDocuments.map((doc) => (
                                                <TableRow key={doc._id} className="hover:bg-muted/30">
                                                    <TableCell className="font-medium">
                                                        <div>{doc.title}</div>
                                                        {doc.description && <div className="text-[10px] text-muted-foreground">{doc.description}</div>}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${doc.belongsTo === 'student' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                            }`}>
                                                            {doc.belongsTo}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right px-6">
                                                        <ActionMenu
                                                            onEdit={() => handleEdit(doc)}
                                                            onDelete={() => setDeleteId(doc._id)}
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
                title="Delete Document Master"
                description="Are you sure you want to delete this document type? This might affect records that already reference it."
                variant="destructive"
            />
        </div>
    )
}
