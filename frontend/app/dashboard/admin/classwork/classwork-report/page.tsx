"use client"

import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart2, Loader2, Search, Download } from "lucide-react"
import { toast } from "sonner"

interface ClassworkItem {
    _id: string
    title: string
    classId: { _id: string; name: string; section: string }
    subject: string
    assignedDate: string
    dueDate?: string
    status: string
    submissions?: any[]
}

export default function ClassworkReport() {
    const [classes, setClasses] = useState<any[]>([])
    const [classwork, setClasswork] = useState<ClassworkItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)
    const [filters, setFilters] = useState({
        classId: ""
    })

    useEffect(() => {
        fetchClasses()
        fetchClasswork()
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
        } catch { }
    }

    const fetchClasswork = async () => {
        try {
            setSearching(true)
            const token = localStorage.getItem("token")
            let url = `${API_URL}/api/classwork`
            if (filters.classId && filters.classId !== 'all') {
                url += `?classId=${filters.classId}`
            }

            const res = await fetch(url, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (Array.isArray(data)) {
                setClasswork(data)
            } else if (data.data && Array.isArray(data.data)) {
                setClasswork(data.data)
            }
        } catch {
            toast.error("Failed to load classwork")
        } finally {
            setLoading(false)
            setSearching(false)
        }
    }

    const handleExport = () => {
        const headers = ["Title", "Class", "Subject", "Assigned Date", "Status"]
        const csvContent = [
            headers.join(","),
            ...classwork.map(cw => [
                cw.title,
                cw.classId?.name ? `${cw.classId.name}-${cw.classId.section}` : 'N/A',
                cw.subject,
                new Date(cw.assignedDate).toLocaleDateString(),
                cw.status
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "classwork_report.csv"
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success("Report downloaded successfully")
    }

    return (
        <DashboardLayout title="Classwork Report">
            <div className="space-y-6">
                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <BarChart2 className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Class</Label>
                                <Select value={filters.classId} onValueChange={(v) => setFilters({ ...filters, classId: v })}>
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <SelectValue placeholder="All Classes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Classes</SelectItem>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls._id} value={cls._id}>
                                                Class {cls.name}-{cls.section}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end gap-2">
                                <Button onClick={fetchClasswork} disabled={searching} className="bg-blue-900 hover:bg-blue-800">
                                    {searching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                                    Search
                                </Button>
                                <Button variant="outline" onClick={handleExport} disabled={classwork.length === 0}>
                                    <Download className="h-4 w-4 mr-2" /> Export
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg text-gray-800">Classwork Overview ({classwork.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-pink-50 hover:bg-pink-50">
                                            <TableHead className="font-bold text-gray-700 uppercase">Title</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Class/Section</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Subject</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Assigned Date</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Due Date</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {classwork.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    No classwork found.
                                                </TableCell>
                                            </TableRow>
                                        ) : classwork.map((cw) => (
                                            <TableRow key={cw._id}>
                                                <TableCell className="font-medium">{cw.title}</TableCell>
                                                <TableCell>
                                                    {cw.classId?.name ? `${cw.classId.name}-${cw.classId.section}` : 'N/A'}
                                                </TableCell>
                                                <TableCell>{cw.subject}</TableCell>
                                                <TableCell>{new Date(cw.assignedDate).toLocaleDateString()}</TableCell>
                                                <TableCell>{cw.dueDate ? new Date(cw.dueDate).toLocaleDateString() : '-'}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cw.status === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : cw.status === 'in-progress'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {cw.status}
                                                    </span>
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
