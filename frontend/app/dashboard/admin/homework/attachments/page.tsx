"use client"

import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Paperclip, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function HomeworkAttachments() {
    const [homeworkList, setHomeworkList] = useState<any[]>([])
    const [attachments, setAttachments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [attaching, setAttaching] = useState(false)

    // Form state
    const [selectedHomework, setSelectedHomework] = useState("")
    const [fileToAttach, setFileToAttach] = useState<any>(null)

    useEffect(() => {
        fetchHomework()
    }, [])

    const fetchHomework = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/homework`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()

            if (data.success && Array.isArray(data.data)) {
                setHomeworkList(data.data)

                // Extract all attachments
                const allAttachments: any[] = []
                data.data.forEach((hw: any) => {
                    if (hw.attachments && hw.attachments.length > 0) {
                        hw.attachments.forEach((att: any) => {
                            allAttachments.push({
                                id: att._id || Math.random().toString(),
                                title: hw.title,
                                classSection: hw.classId ? `${hw.classId.name}-${hw.classId.section}` : 'N/A',
                                file: att.filename,
                                url: att.url,
                                uploadedAt: att.uploadedAt
                            })
                        })
                    }
                })
                setAttachments(allAttachments)
            }
        } catch (err) {
            toast.error("Failed to load homework")
        } finally {
            setLoading(false)
        }
    }

    const handleAttach = async () => {
        if (!selectedHomework || !fileToAttach) {
            toast.error("Please select homework and upload a file")
            return
        }

        setAttaching(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/homework/${selectedHomework}/attachments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ attachment: fileToAttach })
            })

            const data = await res.json()
            if (data.success) {
                toast.success("Attachment added successfully")
                setFileToAttach(null)
                setSelectedHomework("")
                fetchHomework() // Refresh list
            } else {
                toast.error(data.error || "Failed to add attachment")
            }
        } catch (err) {
            toast.error("Failed to add attachment")
        } finally {
            setAttaching(false)
        }
    }

    return (
        <DashboardLayout title="Homework Attachments">
            <div className="space-y-6">
                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <Paperclip className="h-5 w-5" />
                            Upload / Link Attachments
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-red-500">Homework *</Label>
                                <Select value={selectedHomework} onValueChange={setSelectedHomework}>
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <SelectValue placeholder="Select homework" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {homeworkList.map((hw) => (
                                            <SelectItem key={hw._id} value={hw._id}>
                                                {hw.title} ({hw.classId ? `${hw.classId.name}-${hw.classId.section}` : 'N/A'})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <AttachmentUpload
                                    onUpload={setFileToAttach}
                                    currentFile={fileToAttach}
                                />
                            </div>

                            <div className="md:col-span-2 flex justify-end">
                                <Button
                                    onClick={handleAttach}
                                    disabled={attaching || !fileToAttach || !selectedHomework}
                                    className="bg-blue-900 hover:bg-blue-800"
                                >
                                    {attaching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Attach File
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg text-gray-800">Attachment List</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-pink-50 hover:bg-pink-50">
                                            <TableHead className="font-bold text-gray-700 uppercase">Homework</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Class/Section</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">File</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Uploaded At</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attachments.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                    No attachments found.
                                                </TableCell>
                                            </TableRow>
                                        ) : attachments.map((row, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">{row.title}</TableCell>
                                                <TableCell>{row.classSection}</TableCell>
                                                <TableCell>
                                                    <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                        <Paperclip className="h-3 w-3" />
                                                        {row.file}
                                                    </a>
                                                </TableCell>
                                                <TableCell>{row.uploadedAt ? new Date(row.uploadedAt).toLocaleDateString() : '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" className="text-blue-600 h-8">View</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

function AttachmentUpload({ onUpload, currentFile }: { onUpload: (file: any) => void, currentFile: any }) {
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
                toast.success("File uploaded successfully")
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
            <Label className="text-red-500">File *</Label>
            <div className="flex gap-2">
                <Input
                    type="file"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="bg-white border-gray-200"
                />
            </div>
            {uploading && <div className="text-xs text-blue-600 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</div>}
            {currentFile && (
                <div className="text-xs text-green-600 font-medium">
                    Ready to attach: {currentFile.filename}
                </div>
            )}
        </div>
    )
}

