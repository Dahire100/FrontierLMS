"use client"

import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileText, Upload, Download, Trash2, Eye, File, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Document {
    _id: string;
    title: string;
    type: string;
    fileUrl: string;
    description?: string;
    uploadedAt: string;
    status?: string; // Add if backend supports it, otherwise default to "Verified" or "Pending"
}

export default function StudentDocuments() {
    const [isUploadOpen, setIsUploadOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [documents, setDocuments] = useState<Document[]>([])

    const [formData, setFormData] = useState({
        title: "",
        type: "",
        file: null as File | null
    })

    const fetchDocuments = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/student/documents`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setDocuments(data.data)
            }
        } catch (error) {
            console.error("Fetch docs error", error)
            toast.error("Failed to load documents")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDocuments()
    }, [])

    const getFullUrl = (url: string) => {
        if (!url) return "";
        if (url.startsWith('http')) {
            // Fix potentially malformed URLs from seed data (e.g. https// instead of https://)
            if (url.startsWith('https//')) return url.replace('https//', 'https://');
            if (url.startsWith('http//')) return url.replace('http//', 'http://');
            return url;
        }
        return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.file || !formData.title || !formData.type) {
            toast.error("Please fill all fields")
            return
        }

        setUploading(true)
        try {
            const token = localStorage.getItem('token')
            const body = new FormData()
            body.append('title', formData.title)
            body.append('type', formData.type)
            body.append('file', formData.file)

            const res = await fetch(`${API_URL}/api/student/documents`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body
            })

            const data = await res.json()
            if (data.success) {
                toast.success("Document Uploaded")
                setIsUploadOpen(false)
                setFormData({ title: "", type: "", file: null })
                fetchDocuments()
            } else {
                toast.error(data.error || "Upload failed")
            }
        } catch (error) {
            console.error("Upload error", error)
            toast.error("An error occurred during upload")
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (id: string) => {
        // Implement delete if backend supports it, for now locally filter or alert
        toast.info("Delete functionality coming soon")
    }

    const getStatusColor = (status: string = "pending") => {
        switch (status.toLowerCase()) {
            case "verified": return "bg-green-100 text-green-700 border-green-200"
            case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200"
            case "rejected": return "bg-red-100 text-red-700 border-red-200"
            default: return "bg-gray-100 text-gray-700"
        }
    }

    return (
        <DashboardLayout title="My Documents">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            My Documents
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            Manage and upload your certificates and records
                        </p>
                    </div>
                    <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
                                <Upload className="mr-2 h-4 w-4" /> Upload Document
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={handleUpload}>
                                <DialogHeader>
                                    <DialogTitle>Upload New Document</DialogTitle>
                                    <DialogDescription>
                                        Upload certificates, ID proofs, or other required documents.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Document Title</Label>
                                        <Input
                                            id="title"
                                            placeholder="e.g. Transfer Certificate"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="type">Document Type</Label>
                                        <Select
                                            required
                                            onValueChange={(val) => setFormData({ ...formData, type: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="academic">Academic Certificate</SelectItem>
                                                <SelectItem value="personal">Personal ID Proof</SelectItem>
                                                <SelectItem value="medical">Medical Record</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="file">File</Label>
                                        <Input
                                            id="file"
                                            type="file"
                                            required
                                            className="cursor-pointer"
                                            onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                                        />
                                        <p className="text-xs text-muted-foreground">Supported format: PDF, JPG, PNG (Max 5MB)</p>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={uploading}>
                                        {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        {uploading ? "Uploading..." : "Upload File"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">Total Documents</p>
                                        <h3 className="text-2xl font-bold text-blue-700">{documents.length}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-green-100 rounded-full text-green-600">
                                        <CheckCircle className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-green-900">Verified</p>
                                        <h3 className="text-2xl font-bold text-green-700">{documents.filter(d => d.status === 'verified').length}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-100">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-yellow-900">Pending</p>
                                        <h3 className="text-2xl font-bold text-yellow-700">{documents.filter(d => d.status === 'pending').length}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Documents List */}
                        <Card className="border-none shadow-md">
                            <CardHeader>
                                <CardTitle>Uploaded Documents</CardTitle>
                                <CardDescription>List of all documents submitted by you</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[500px] pr-4">
                                    <div className="space-y-4">
                                        {documents.length === 0 ? (
                                            <div className="text-center py-12 text-muted-foreground">
                                                No documents found.
                                            </div>
                                        ) : (
                                            documents.map((doc) => (
                                                <div key={doc._id} className="group flex flex-col md:flex-row items-center justify-between p-4 border rounded-xl hover:shadow-md transition-all bg-white gap-4">
                                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                                        <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                                                            <File className="h-6 w-6 text-gray-500 group-hover:text-blue-500" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900">{doc.title}</h4>
                                                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                                <span className="uppercase font-bold tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">
                                                                    {doc.fileUrl.split('.').pop()}
                                                                </span>
                                                                <span>Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                                        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border capitalize ${getStatusColor(doc.status || 'pending')}`}>
                                                            {doc.status === 'verified' && <CheckCircle className="h-4 w-4" />}
                                                            {doc.status === 'pending' && <Clock className="h-4 w-4" />}
                                                            {doc.status === 'rejected' && <AlertCircle className="h-4 w-4" />}
                                                            {doc.status || 'Pending'}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => window.open(getFullUrl(doc.fileUrl), '_blank', 'noopener,noreferrer')}
                                                            >
                                                                <Eye className="h-4 w-4 text-gray-500" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    const link = document.createElement('a');
                                                                    link.href = getFullUrl(doc.fileUrl);
                                                                    link.setAttribute('download', doc.title);
                                                                    document.body.appendChild(link);
                                                                    link.click();
                                                                    document.body.removeChild(link);
                                                                }}
                                                            >
                                                                <Download className="h-4 w-4 text-blue-600" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => handleDelete(doc._id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </DashboardLayout>
    )
}
