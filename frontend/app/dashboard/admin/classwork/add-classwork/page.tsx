"use client"

import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
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
import { PlusCircle, Loader2, Eye, Pencil, Trash2, Printer, Download } from "lucide-react"

export default function AddClasswork() {
    const [classes, setClasses] = useState<any[]>([])
    const [classworks, setClassworks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [selectedClasswork, setSelectedClasswork] = useState<any | null>(null)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)

    const [form, setForm] = useState({
        title: "",
        classId: "",
        subject: "",
        assignedDate: new Date().toISOString().split('T')[0],
        dueDate: "",
        description: "",
        maxMarks: "100",
        attachments: [] as any[]
    })

    useEffect(() => {
        fetchClasses()
        fetchClassworks()
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
            } else if (data.data) {
                setClasses(data.data)
            }
        } catch (err) {
            toast.error("Failed to load classes")
        }
    }

    const fetchClassworks = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/classwork`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success || Array.isArray(data)) {
                setClassworks(data.data || data)
            }
        } catch (err) {
            toast.error("Failed to load classwork history")
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setForm({
            title: "",
            classId: "",
            subject: "",
            assignedDate: new Date().toISOString().split('T')[0],
            dueDate: "",
            description: "",
            maxMarks: "100",
            attachments: []
        })
        setIsEditing(false)
        setEditId(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title || !form.classId || !form.subject || !form.assignedDate || !form.description) {
            toast.error("Please fill required fields")
            return
        }

        setSaving(true)
        try {
            const token = localStorage.getItem("token")
            const url = isEditing ? `${API_URL}/api/classwork/${editId}` : `${API_URL}/api/classwork`
            const method = isEditing ? 'PUT' : 'POST'

            const payload: any = {
                ...form,
                maxMarks: parseInt(form.maxMarks) || 0
            }
            if (!payload.dueDate) delete payload.dueDate

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            const data = await res.json()
            if (data.success) {
                toast.success(isEditing ? "Classwork updated" : "Classwork created")
                resetForm()
                fetchClassworks()
            } else {
                toast.error(data.error || "Failed to save classwork")
            }
        } catch (err) {
            toast.error("Failed to save classwork")
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (cw: any) => {
        setForm({
            title: cw.title,
            classId: cw.classId?._id || cw.classId,
            subject: cw.subject,
            assignedDate: cw.assignedDate ? new Date(cw.assignedDate).toISOString().split('T')[0] : "",
            dueDate: cw.dueDate ? new Date(cw.dueDate).toISOString().split('T')[0] : "",
            description: cw.description,
            maxMarks: (cw.maxMarks || cw.totalMarks || 0).toString(),
            attachments: cw.attachments || []
        })
        setIsEditing(true)
        setEditId(cw._id)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (id: string) => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/classwork/${id}`, {
                method: 'DELETE',
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                toast.success("Classwork deleted")
                fetchClassworks()
            } else {
                toast.error(data.error || "Failed to delete")
            }
        } catch (err) {
            toast.error("Failed to delete")
        }
    }

    const handlePrint = (cw: any) => {
        const printWindow = window.open('', '', 'width=800,height=600')
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head><title>Classwork Details</title></head>
                    <body style="font-family: Arial; padding: 20px;">
                        <h1>${cw.title}</h1>
                        <p><strong>Class:</strong> ${cw.classId?.name} ${cw.classId?.section}</p>
                        <p><strong>Subject:</strong> ${cw.subject}</p>
                        <p><strong>Assigned:</strong> ${new Date(cw.assignedDate).toLocaleDateString()}</p>
                        <hr/>
                        <p>${cw.description}</p>
                    </body>
                </html>
            `)
            printWindow.document.close()
            printWindow.print()
        }
    }

    const handleDownload = (cw: any) => {
        const data = [
            ['Title', 'Class', 'Subject', 'Assigned Date', 'Description'],
            [cw.title, `${cw.classId?.name}-${cw.classId?.section}`, cw.subject, new Date(cw.assignedDate).toLocaleDateString(), cw.description]
        ]
        const csvContent = "data:text/csv;charset=utf-8," + data.map(e => e.join(",")).join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `classwork_${cw.title}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <DashboardLayout title="Add Classwork">
            <div className="space-y-6">
                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg flex items-center justify-between text-gray-800">
                            <div className="flex items-center gap-2">
                                <PlusCircle className="h-5 w-5" />
                                {isEditing ? "Edit Classwork" : "Classwork Details"}
                            </div>
                            {isEditing && <Button variant="ghost" size="sm" onClick={resetForm}>Cancel Edit</Button>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-red-500">Title *</Label>
                                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Activity name" className="bg-white border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-500">Class *</Label>
                                <Select value={form.classId} onValueChange={(val) => setForm({ ...form, classId: val })}>
                                    <SelectTrigger className="bg-white border-gray-200"><SelectValue placeholder="Select class" /></SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls._id} value={cls._id}>Class {cls.name}-{cls.section}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-500">Subject *</Label>
                                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="bg-white border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-500">Assigned Date *</Label>
                                <Input type="date" value={form.assignedDate} onChange={(e) => setForm({ ...form, assignedDate: e.target.value })} className="bg-white border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <Label>Due Date (Optional)</Label>
                                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="bg-white border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Marks</Label>
                                <Input type="number" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} placeholder="100" className="bg-white border-gray-200" />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <Label>Description *</Label>
                                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="bg-white border-gray-200" placeholder="Description..." />
                            </div>

                            <div className="md:col-span-2">
                                <AttachmentUpload onUpload={(file) => setForm(prev => ({ ...prev, attachments: [...(prev.attachments || []), file] }))} />
                                {form.attachments && form.attachments.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        <Label className="text-xs text-green-600 font-bold">Attached Files:</Label>
                                        <ul className="text-sm text-gray-600 list-disc pl-5">
                                            {form.attachments.map((file: any, index: number) => (
                                                <li key={index} className="flex gap-2 items-center">
                                                    {file.filename}
                                                    <Button variant="ghost" size="sm" type="button" className="h-4 w-4 p-0 text-red-500" onClick={() => setForm(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }))}>&times;</Button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-2 flex justify-end">
                                <Button type="submit" disabled={saving} className="bg-blue-900 hover:bg-blue-800 px-8">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {isEditing ? "Update Classwork" : "Save Classwork"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="bg-gray-50 border-b border-gray-100">
                        <CardTitle className="text-lg text-gray-800">Classwork History</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {loading ? <div className="text-center py-4">Loading...</div> : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Class</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Assigned Date</TableHead>
                                            <TableHead>Attachments</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {classworks.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center">No classwork found</TableCell></TableRow> : (
                                            classworks.map((cw: any) => (
                                                <TableRow key={cw._id}>
                                                    <TableCell className="font-medium">{cw.title}</TableCell>
                                                    <TableCell>{cw.classId?.name} {cw.classId?.section}</TableCell>
                                                    <TableCell>{cw.subject}</TableCell>
                                                    <TableCell>{new Date(cw.assignedDate).toLocaleDateString()}</TableCell>
                                                    <TableCell>{cw.attachments?.length || 0}</TableCell>
                                                    <TableCell className="flex items-center gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => { setSelectedClasswork(cw); setViewDialogOpen(true); }}><Eye className="h-4 w-4 text-blue-600" /></Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(cw)}><Pencil className="h-4 w-4 text-green-600" /></Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-600" /></Button></AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader><AlertDialogTitle>Delete Classwork?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(cw._id)} className="bg-red-600">Delete</AlertDialogAction></AlertDialogFooter>
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

                <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Classwork Details</DialogTitle></DialogHeader>
                        {selectedClasswork && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <p><strong>Title:</strong> {selectedClasswork.title}</p>
                                    <p><strong>Subject:</strong> {selectedClasswork.subject}</p>
                                    <p><strong>Class:</strong> {selectedClasswork.classId?.name} {selectedClasswork.classId?.section}</p>
                                    <p><strong>Assigned:</strong> {new Date(selectedClasswork.assignedDate).toLocaleDateString()}</p>
                                </div>
                                <div><p className="font-semibold">Description:</p><p className="bg-gray-50 p-2 text-sm">{selectedClasswork.description}</p></div>
                                {selectedClasswork.attachments?.length > 0 && (
                                    <div><p className="font-semibold">Attachments:</p>
                                        <ul className="list-disc pl-5 text-sm">{selectedClasswork.attachments.map((f: any, i: number) => <li key={i}><a href={f.url} target="_blank" className="text-blue-600 underline">{f.filename}</a></li>)}</ul>
                                    </div>
                                )}
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handlePrint(selectedClasswork)}><Printer className="h-4 w-4 mr-2" /> Print</Button>
                                    <Button variant="outline" size="sm" onClick={() => handleDownload(selectedClasswork)}><Download className="h-4 w-4 mr-2" /> Download</Button>
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
            const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData })
            const data = await res.json()
            if (data.success) { onUpload({ filename: data.file.filename, url: data.file.url, uploadedAt: new Date() }); toast.success("File attached") }
            else toast.error("Upload failed")
        } catch { toast.error("Error") } finally { setUploading(false) }
    }
    return (
        <div className="space-y-2">
            <Label>Attachments (Optional)</Label>
            <div className="flex items-center gap-2"><Input type="file" onChange={handleFileChange} disabled={uploading} className="bg-white border-gray-200" />{uploading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}</div>
        </div>
    )
}
