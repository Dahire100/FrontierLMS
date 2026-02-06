"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { PlusCircle, Loader2, Eye, Pencil, Trash2, Printer, Download, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

export default function AddHomework() {
    const { toast: toastHook } = useToast()
    const [classes, setClasses] = useState<any[]>([])
    const [homeworks, setHomeworks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [selectedHomework, setSelectedHomework] = useState<any | null>(null)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)

    const [form, setForm] = useState({
        title: "",
        classId: "",
        subject: "",
        dueDate: "",
        description: "",
        totalMarks: "100",
        attachments: [] as any[]
    })

    useEffect(() => {
        fetchClasses()
        fetchHomeworks()
    }, [])

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/classes`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success && Array.isArray(data.data)) {
                setClasses(data.data)
            } else if (Array.isArray(data)) {
                setClasses(data)
            }
        } catch (err) {
            toast.error("Failed to load classes")
        }
    }

    const fetchHomeworks = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/homework`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setHomeworks(data.data)
            }
        } catch (err) {
            toast.error("Failed to load homework history")
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setForm({ title: "", classId: "", subject: "", dueDate: "", description: "", totalMarks: "100", attachments: [] })
        setIsEditing(false)
        setEditId(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title || !form.classId || !form.subject || !form.dueDate) {
            toast.error("Please fill required fields")
            return
        }

        setSaving(true)
        try {
            const token = localStorage.getItem("token")
            const url = isEditing ? `${API_URL}/api/homework/${editId}` : `${API_URL}/api/homework`
            const method = isEditing ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...form,
                    totalMarks: parseInt(form.totalMarks) || 0
                })
            })

            const data = await res.json()
            if (data.success) {
                toast.success(isEditing ? "Homework updated successfully" : "Homework created successfully")
                resetForm()
                fetchHomeworks()
            } else {
                toast.error(data.error || "Failed to save homework")
            }
        } catch (err) {
            toast.error("Failed to save homework")
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (homework: any) => {
        setForm({
            title: homework.title,
            classId: homework.classId?._id || homework.classId,
            subject: homework.subject,
            dueDate: homework.dueDate ? new Date(homework.dueDate).toISOString().split('T')[0] : "",
            description: homework.description,
            totalMarks: homework.totalMarks.toString(),
            attachments: homework.attachments || []
        })
        setIsEditing(true)
        setEditId(homework._id)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (id: string) => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/homework/${id}`, {
                method: 'DELETE',
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                toast.success("Homework deleted successfully")
                fetchHomeworks()
            } else {
                toast.error(data.error || "Failed to delete homework")
            }
        } catch (err) {
            toast.error("Failed to delete homework")
        }
    }

    const handlePrint = (homework: any) => {
        // Simple print implementation
        const printWindow = window.open('', '', 'width=800,height=600')
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Homework Details</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            h1 { color: #333; }
                            .meta { margin-bottom: 20px; }
                            .meta p { margin: 5px 0; }
                            .description { background: #f5f5f5; padding: 15px; border-radius: 5px; }
                        </style>
                    </head>
                    <body>
                        <h1>${homework.title}</h1>
                        <div class="meta">
                            <p><strong>Class:</strong> ${homework.classId?.name} ${homework.classId?.section}</p>
                            <p><strong>Subject:</strong> ${homework.subject}</p>
                            <p><strong>Due Date:</strong> ${new Date(homework.dueDate).toLocaleDateString()}</p>
                            <p><strong>Total Marks:</strong> ${homework.totalMarks}</p>
                        </div>
                        <h3>Description:</h3>
                        <div class="description">${homework.description}</div>
                        <h3>Attachments:</h3>
                        <ul>
                            ${homework.attachments?.map((a: any) => `<li>${a.filename}</li>`).join('') || '<li>No attachments</li>'}
                        </ul>
                    </body>
                </html>
            `)
            printWindow.document.close()
            printWindow.focus()
            printWindow.print()
            printWindow.close()
        }
    }

    const handleDownload = (homework: any) => {
        // Simple CSV download
        const data = [
            ['Title', 'Class', 'Subject', 'Due Date', 'Total Marks', 'Description'],
            [
                homework.title,
                `${homework.classId?.name}-${homework.classId?.section}`,
                homework.subject,
                new Date(homework.dueDate).toLocaleDateString(),
                homework.totalMarks,
                homework.description
            ]
        ]
        const csvContent = "data:text/csv;charset=utf-8," + data.map(e => e.join(",")).join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `homework_${homework.title}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <DashboardLayout title="Add Homework">
            <div className="space-y-6">
                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg flex items-center justify-between text-gray-800">
                            <div className="flex items-center gap-2">
                                <PlusCircle className="h-5 w-5" />
                                {isEditing ? "Edit Homework" : "Homework Details"}
                            </div>
                            {isEditing && (
                                <Button variant="ghost" size="sm" onClick={resetForm}>Cancel Edit</Button>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-red-500">Title *</Label>
                                <Input
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="Chapter 5 worksheet"
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-500">Class *</Label>
                                <Select value={form.classId} onValueChange={(val) => setForm({ ...form, classId: val })}>
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <SelectValue placeholder="Select class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls._id} value={cls._id}>
                                                Class {cls.name}-{cls.section}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-500">Subject *</Label>
                                <Input
                                    value={form.subject}
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                    placeholder="Science"
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-500">Due Date *</Label>
                                <Input
                                    type="date"
                                    value={form.dueDate}
                                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Total Marks</Label>
                                <Input
                                    type="number"
                                    value={form.totalMarks}
                                    onChange={(e) => setForm({ ...form, totalMarks: e.target.value })}
                                    placeholder="100"
                                    className="bg-white border-gray-200"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                    className="bg-white border-gray-200"
                                    placeholder="Homework description..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <AttachmentUpload onUpload={(file) => setForm(prev => ({ ...prev, attachments: [...(prev.attachments || []), file] }))} />
                                {form.attachments && form.attachments.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        <Label className="text-xs text-green-600 font-bold">Attached Files:</Label>
                                        <ul className="text-sm text-gray-600 list-disc pl-5">
                                            {form.attachments.map((file: any, index: number) => (
                                                <li key={index} className="flex items-center gap-2">
                                                    {file.filename}
                                                    <Button variant="ghost" size="sm" type="button" className="h-4 w-4 p-0 text-red-500"
                                                        onClick={() => setForm(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }))}>
                                                        &times;
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-2 flex justify-end">
                                <Button type="submit" disabled={saving} className="bg-blue-900 hover:bg-blue-800">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {isEditing ? "Update Homework" : "Create Homework"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Homework History Log */}
                <Card>
                    <CardHeader className="bg-gray-50 border-b border-gray-100">
                        <CardTitle className="text-lg text-gray-800">Homework History</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {loading ? (
                            <div className="text-center py-4">Loading history...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Class</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead>Submissions</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {homeworks.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center">No homework created yet</TableCell>
                                            </TableRow>
                                        ) : (
                                            homeworks.map((hw: any) => (
                                                <TableRow key={hw._id}>
                                                    <TableCell className="font-medium">{hw.title}</TableCell>
                                                    <TableCell>{hw.classId?.name} {hw.classId?.section}</TableCell>
                                                    <TableCell>{hw.subject}</TableCell>
                                                    <TableCell>{new Date(hw.dueDate).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {hw.submissions?.length || 0}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="flex items-center gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => { setSelectedHomework(hw); setViewDialogOpen(true); }}>
                                                            <Eye className="h-4 w-4 text-blue-600" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(hw)}>
                                                            <Pencil className="h-4 w-4 text-green-600" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will permanently delete the homework
                                                                        "{hw.title}" and all its submissions.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDelete(hw._id)} className="bg-red-600">Delete</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* View Dialog */}
                <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Homework Details</DialogTitle>
                        </DialogHeader>
                        {selectedHomework && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <Label className="text-gray-500">Title</Label>
                                        <p className="font-semibold">{selectedHomework.title}</p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-500">Subject</Label>
                                        <p className="font-semibold">{selectedHomework.subject}</p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-500">Class</Label>
                                        <p className="font-semibold">{selectedHomework.classId?.name} {selectedHomework.classId?.section}</p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-500">Due Date</Label>
                                        <p className="font-semibold">{new Date(selectedHomework.dueDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-500">Assigned Date</Label>
                                        <p className="font-semibold">{new Date(selectedHomework.assignedDate || selectedHomework.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-500">Total Marks</Label>
                                        <p className="font-semibold">{selectedHomework.totalMarks}</p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-500">Submissions</Label>
                                        <p className="font-semibold">{selectedHomework.submissions?.length || 0}</p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Description</Label>
                                    <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">{selectedHomework.description}</p>
                                </div>
                                {selectedHomework.attachments?.length > 0 && (
                                    <div>
                                        <Label className="text-gray-500">Attachments</Label>
                                        <ul className="mt-1 list-disc pl-5 text-sm">
                                            {selectedHomework.attachments.map((file: any, index: number) => (
                                                <li key={index}>
                                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                        {file.filename}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div className="flex gap-2 justify-end mt-4">
                                    <Button variant="outline" onClick={() => handlePrint(selectedHomework)}>
                                        <Printer className="h-4 w-4 mr-2" /> Print
                                    </Button>
                                    <Button variant="outline" onClick={() => handleDownload(selectedHomework)}>
                                        <Download className="h-4 w-4 mr-2" /> Download
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    )
}

function AttachmentUpload({ onUpload }: { onUpload: (file: any) => void }) {
    const [uploading, setUploading] = useState(false)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        setUploading(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })
            const data = await res.json()

            if (data.success) {
                onUpload({
                    filename: data.file.filename,
                    url: data.file.url,
                    uploadedAt: new Date()
                })
                toast.success("File attached successfully")
            } else {
                toast.error("Upload failed")
            }
        } catch (err) {
            toast.error("Upload error")
        } finally {
            setUploading(false)
            // Clear input
            e.target.value = ''
        }
    }

    return (
        <div className="space-y-2">
            <Label>Attachments (Optional)</Label>
            <div className="flex items-center gap-2">
                <Input
                    type="file"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="bg-white border-gray-200"
                />
                {uploading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
            </div>
        </div>
    )
}
