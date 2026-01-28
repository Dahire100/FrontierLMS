"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { FileText, Download, Upload, Trash2, Eye, Search } from "lucide-react"
import { toast } from "sonner"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"

export default function OtherDownloadsPage() {
    const [rows, setRows] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [form, setForm] = useState({ title: "", description: "", fileUrl: "" })

    const fetchDownloads = async () => {
        setLoading(true)
        try {
            const res = await apiFetch(`${API_ENDPOINTS.DOWNLOAD_CONTENT}?type=other-download`)
            if (res.ok) {
                const data = await res.json()
                setRows(data)
            } else {
                console.error('Failed to fetch downloads:', res.status)
                toast.error(`Failed to fetch downloads: ${res.status}`)
            }
        } catch (error) {
            console.error("Failed to fetch downloads", error)
            toast.error('Backend server is not running. Start it: cd backend && npm start')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDownloads()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title || !form.fileUrl) {
            toast.error("Title and file URL are required")
            return
        }

        try {
            const res = await apiFetch(API_ENDPOINTS.DOWNLOAD_CONTENT, {
                method: "POST",
                body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    contentType: "other-download",
                    fileUrl: form.fileUrl,
                    visibleToRoles: ["admin", "teacher", "student"]
                })
            })

            if (res.ok) {
                toast.success("Download added successfully")
                setForm({ title: "", description: "", fileUrl: "" })
                fetchDownloads()
            } else {
                toast.error("Failed to add download")
            }
        } catch (error) {
            toast.error("Error submitting form")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return
        try {
            const res = await apiFetch(`${API_ENDPOINTS.DOWNLOAD_CONTENT}/${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Download deleted")
                fetchDownloads()
            } else {
                toast.error("Failed to delete download")
            }
        } catch (error) {
            toast.error("Error deleting download")
        }
    }

    const filteredRows = rows.filter(row =>
        row.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout title="Download Center / Other Downloads">
            <div className="space-y-6">
                {/* Header with Gradient */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                    <div className="relative flex items-center gap-4">
                        <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                            <FileText className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Other Downloads</h1>
                            <p className="mt-1 text-orange-50">Manage miscellaneous downloadable content</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Section */}
                    <div className="lg:col-span-1">
                        <Card className="border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="bg-gradient-to-br from-orange-50 to-rose-50 border-b border-orange-200">
                                <CardTitle className="text-base font-bold flex items-center gap-2 text-orange-900">
                                    <Upload className="h-5 w-5" />
                                    Add Other Download
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold after:content-['*'] after:ml-0.5 after:text-red-500">
                                            Title
                                        </Label>
                                        <Input
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            placeholder="e.g., Holiday List"
                                            className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">
                                            Description
                                        </Label>
                                        <Input
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            placeholder="Brief description"
                                            className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold after:content-['*'] after:ml-0.5 after:text-red-500">
                                            File URL
                                        </Label>
                                        <Input
                                            value={form.fileUrl}
                                            onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                                            placeholder="https://..."
                                            className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>
                                    <Button type="submit" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 w-full gap-2 shadow-lg">
                                        <Upload className="h-4 w-4" />
                                        Upload File
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Table Section */}
                    <div className="lg:col-span-2">
                        <Card className="border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="bg-gradient-to-br from-orange-50 to-rose-50 border-b border-orange-200">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold flex items-center gap-2 text-orange-900">
                                        <FileText className="h-5 w-5" />
                                        Downloads List
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="mb-4">
                                    <Input
                                        placeholder="Search by title or description..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="border-orange-200 focus:border-orange-500"
                                    />
                                </div>
                                <div className="rounded-lg border border-orange-100 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-gradient-to-r from-orange-50 to-rose-50">
                                            <TableRow className="border-b border-orange-100 hover:bg-orange-50">
                                                <TableHead className="font-bold text-orange-900">Title</TableHead>
                                                <TableHead className="font-bold text-orange-900">Description</TableHead>
                                                <TableHead className="font-bold text-orange-900">Date</TableHead>
                                                <TableHead className="text-right font-bold text-orange-900">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8">
                                                        <div className="flex justify-center items-center gap-2">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                                                            Loading downloads...
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredRows.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                                        No downloads found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredRows.map((row) => (
                                                    <TableRow key={row._id} className="border-b border-orange-100 hover:bg-orange-50/50">
                                                        <TableCell className="font-medium text-gray-900">{row.title}</TableCell>
                                                        <TableCell className="text-gray-700 truncate">{row.description || '-'}</TableCell>
                                                        <TableCell className="text-sm text-gray-600">
                                                            {new Date(row.createdAt).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex gap-2 justify-end">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    asChild
                                                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                                >
                                                                    <a href={row.fileUrl} target="_blank" rel="noopener noreferrer">
                                                                        <Eye className="h-4 w-4" />
                                                                    </a>
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    asChild
                                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                >
                                                                    <a href={row.fileUrl} target="_blank" rel="noopener noreferrer" download>
                                                                        <Download className="h-4 w-4" />
                                                                    </a>
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(row._id)}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
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
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
