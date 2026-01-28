"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ClipboardList, Download, Upload, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"

export default function Assignments() {
    const [rows, setRows] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [form, setForm] = useState({ title: "", classSection: "", subject: "", fileUrl: "" })

    const fetchAssignments = async () => {
        setLoading(true)
        try {
            const res = await apiFetch(`${API_ENDPOINTS.STUDY_MATERIAL}?type=assignment`)
            if (res.ok) {
                const data = await res.json()
                setRows(data)
            } else {
                console.error('Failed to fetch assignments:', res.status);
                toast.error(`Failed to fetch assignments: ${res.status}`)
            }
        } catch (error) {
            console.error("Failed to fetch assignments", error)
            toast.error('Backend server is not running. Start it: cd backend && npm start')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAssignments()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title || !form.classSection || !form.subject || !form.fileUrl) {
            toast.error("All fields are required")
            return
        }

        try {
            const res = await apiFetch(API_ENDPOINTS.STUDY_MATERIAL, {
                method: "POST",
                body: JSON.stringify({
                    title: form.title,
                    description: `Class: ${form.classSection}`,
                    type: "assignment",
                    subject: form.subject,
                    fileUrl: form.fileUrl
                })
            })

            if (res.ok) {
                toast.success("Assignment added successfully")
                setForm({ title: "", classSection: "", subject: "", fileUrl: "" })
                fetchAssignments()
            } else {
                toast.error("Failed to add assignment")
            }
        } catch (error) {
            toast.error("Error submitting form")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return
        try {
            const res = await apiFetch(`${API_ENDPOINTS.STUDY_MATERIAL}/${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Assignment deleted")
                fetchAssignments()
            } else {
                toast.error("Failed to delete assignment")
            }
        } catch (error) {
            toast.error("Error deleting assignment")
        }
    }

    const filteredRows = rows.filter(row =>
        row.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout title="Assignments">
            <div className="space-y-6">
                {/* Header with Gradient */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                    <div className="relative flex items-center gap-4">
                        <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                            <ClipboardList className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Assignments</h1>
                            <p className="mt-1 text-blue-50">Create and manage student assignments</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Section */}
                    <div className="lg:col-span-1">
                        <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-200">
                                <CardTitle className="text-base font-bold flex items-center gap-2 text-blue-900">
                                    <Upload className="h-5 w-5" />
                                    Add New Assignment
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
                                            placeholder="Assignment title"
                                            className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold after:content-['*'] after:ml-0.5 after:text-red-500">
                                            Class / Section
                                        </Label>
                                        <Input
                                            value={form.classSection}
                                            onChange={(e) => setForm({ ...form, classSection: e.target.value })}
                                            placeholder="e.g., 7-B"
                                            className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold after:content-['*'] after:ml-0.5 after:text-red-500">
                                            Subject
                                        </Label>
                                        <Input
                                            value={form.subject}
                                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                            placeholder="e.g., Science"
                                            className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
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
                                            className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full gap-2 shadow-lg">
                                        <Upload className="h-4 w-4" />
                                        Upload Assignment
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Table Section */}
                    <div className="lg:col-span-2">
                        <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-200">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold flex items-center gap-2 text-blue-900">
                                        <ClipboardList className="h-5 w-5" />
                                        Assignment List
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="mb-4">
                                    <Input
                                        placeholder="Search by title or subject..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="border-blue-200 focus:border-blue-500"
                                    />
                                </div>
                                <div className="rounded-lg border border-blue-100 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                            <TableRow className="border-b border-blue-100 hover:bg-blue-50">
                                                <TableHead className="font-bold text-blue-900">Title</TableHead>
                                                <TableHead className="font-bold text-blue-900">Subject</TableHead>
                                                <TableHead className="font-bold text-blue-900">Class</TableHead>
                                                <TableHead className="text-right font-bold text-blue-900">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8">
                                                        <div className="flex justify-center items-center gap-2">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                            Loading assignments...
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredRows.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                                        No assignments found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredRows.map((row) => (
                                                    <TableRow key={row._id} className="border-b border-blue-100 hover:bg-blue-50/50">
                                                        <TableCell className="font-medium text-gray-900">{row.title}</TableCell>
                                                        <TableCell>
                                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                                {row.subject}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-gray-700">{row.classSection || 'N/A'}</TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex gap-2 justify-end">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    asChild
                                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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
