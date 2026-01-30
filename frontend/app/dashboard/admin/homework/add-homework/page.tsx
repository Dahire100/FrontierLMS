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
import { toast } from "sonner"
import { PlusCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AddHomework() {
    const { toast: toastHook } = useToast()
    const [classes, setClasses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
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
        } finally {
            setLoading(false)
        }
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
            const res = await fetch(`${API_URL}/api/homework`, {
                method: 'POST',
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
                toast.success("Homework created successfully")
                setForm({ title: "", classId: "", subject: "", dueDate: "", description: "", totalMarks: "100", attachments: [] })
            } else {
                toast.error(data.error || "Failed to create homework")
            }
        } catch (err) {
            toast.error("Failed to create homework")
        } finally {
            setSaving(false)
        }
    }

    return (
        <DashboardLayout title="Add Homework">
            <div className="space-y-6">
                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <PlusCircle className="h-5 w-5" />
                            Homework Details
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
                                                <li key={index}>{file.filename}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-2 flex justify-end">
                                <Button type="submit" disabled={saving} className="bg-blue-900 hover:bg-blue-800">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {saving ? "Creating..." : "Create Homework"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
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

