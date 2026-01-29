"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Upload, Trash2, BookOpen, Search, Calendar } from "lucide-react"
import { toast } from "sonner"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"

export default function Syllabus() {
    const [rows, setRows] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ title: "", classSection: "", subject: "", fileUrl: "" })
    const [searchTerm, setSearchTerm] = useState("")

    const fetchSyllabus = async () => {
        try {
            const res = await apiFetch(`${API_ENDPOINTS.SYLLABI || '/api/syllabi'}`)
            if (res.ok) {
                const data = await res.json()
                setRows(data.data || [])
            } else {
                console.error('Failed to fetch syllabus:', res.status)
                toast.error(`Failed to fetch syllabus: ${res.status}`)
            }
        } catch (error) {
            console.error("Failed to fetch syllabus", error)
            toast.error('Backend server is not running. Start it: cd backend && npm start')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSyllabus()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title || !form.classSection || !form.subject || !form.fileUrl) {
            toast.error("All fields are required")
            return
        }

        try {
            const res = await apiFetch(API_ENDPOINTS.SYLLABI || '/api/syllabi', {
                method: "POST",
                body: JSON.stringify({
                    title: form.title,
                    description: `Class: ${form.classSection}`,
                    subject: form.subject,
                    fileUrl: form.fileUrl,
                    academicYear: new Date().getFullYear().toString()
                })
            })

            if (res.ok) {
                toast.success("Syllabus added successfully")
                setForm({ title: "", classSection: "", subject: "", fileUrl: "" })
                fetchSyllabus()
            } else {
                toast.error("Failed to add syllabus")
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error submitting form")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this syllabus?")) return
        
        try {
            const res = await apiFetch(`${API_ENDPOINTS.SYLLABI || '/api/syllabi'}/${id}`, {
                method: "DELETE"
            })

            if (res.ok) {
                toast.success("Syllabus deleted")
                fetchSyllabus()
            } else {
                toast.error("Failed to delete")
            }
        } catch (error) {
            toast.error("Error deleting syllabus")
        }
    }

    const filteredRows = rows.filter(row => 
        row.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout title="Syllabus">
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header with gradient */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                    <div className="relative flex items-center gap-4">
                        <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                            <BookOpen className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Syllabus Management</h1>
                            <p className="mt-1 text-purple-50">Upload and manage course syllabi</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <Card className="border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="bg-gradient-to-br from-purple-50 to-violet-50 border-b border-purple-200">
                                <CardTitle className="text-base font-bold flex items-center gap-2 text-purple-900">
                                    <Upload className="h-5 w-5" />
                                    Upload Syllabus
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold after:content-['*'] after:ml-0.5 after:text-red-500">
                                            Title / Description
                                        </Label>
                                        <Input
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            placeholder="e.g. Maths Syllabus Term 1"
                                            className="border-purple-200 focus:border-purple-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold after:content-['*'] after:ml-0.5 after:text-red-500">
                                            Class / Section
                                        </Label>
                                        <Input
                                            value={form.classSection}
                                            onChange={(e) => setForm({ ...form, classSection: e.target.value })}
                                            placeholder="7-B"
                                            className="border-purple-200 focus:border-purple-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold after:content-['*'] after:ml-0.5 after:text-red-500">
                                            Subject
                                        </Label>
                                        <Input
                                            value={form.subject}
                                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                            placeholder="Science"
                                            className="border-purple-200 focus:border-purple-500"
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
                                            className="border-purple-200 focus:border-purple-500"
                                        />
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button type="submit" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 w-full gap-2 shadow-lg">
                                            <Upload className="h-4 w-4" />
                                            Upload Syllabus
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card className="border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="bg-gradient-to-br from-purple-50 to-violet-50 border-b border-purple-200">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold flex items-center gap-2 text-purple-900">
                                        <FileText className="h-5 w-5" />
                                        <span>Syllabus Files</span>
                                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                            {filteredRows.length} files
                                        </Badge>
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input 
                                        placeholder="Search syllabus..." 
                                        className="pl-10 border-purple-200 focus:border-purple-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="rounded-lg border border-purple-200 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
                                            <TableRow className="hover:bg-purple-50/50">
                                                <TableHead className="font-bold text-purple-900">TITLE</TableHead>
                                                <TableHead className="font-bold text-purple-900">SUBJECT</TableHead>
                                                <TableHead className="font-bold text-purple-900">DATE</TableHead>
                                                <TableHead className="text-right font-bold text-purple-900">ACTIONS</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                                        Loading syllabi...
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredRows.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                                        No syllabus found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredRows.map((row: any) => (
                                                    <TableRow key={row._id} className="hover:bg-purple-50/50 transition-colors">
                                                        <TableCell className="font-medium">{row.title}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                                                {row.subject}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Calendar className="h-3 w-3" />
                                                                {new Date(row.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <Button 
                                                                    size="icon" 
                                                                    variant="ghost" 
                                                                    className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                                                    onClick={() => window.open(row.fileUrl, '_blank')}
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                                <Button 
                                                                    size="icon" 
                                                                    variant="ghost" 
                                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => handleDelete(row._id)}
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
