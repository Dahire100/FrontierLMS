"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
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
import { Grid, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ConsolidatedReport() {
    const { toast } = useToast()
    const [classes, setClasses] = useState<any[]>([])
    const [reportData, setReportData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)
    const [hasGenerated, setHasGenerated] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState({
        classId: "all",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
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
            const result = await res.json()
            const list = Array.isArray(result)
                ? result
                : (result?.data && Array.isArray(result.data) ? result.data : [])

            if (Array.isArray(list)) {
                setClasses(list)
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to load classes", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const generateReport = async () => {
        setSearching(true)
        setHasGenerated(false)
        try {
            const token = localStorage.getItem("token")
            const params = new URLSearchParams()
            if (filters.classId && filters.classId !== 'all') {
                params.append("classId", filters.classId)
            }
            params.append("month", filters.month.toString())
            params.append("year", filters.year.toString())

            const res = await fetch(`${API_URL}/api/attendance/consolidated?${params.toString()}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await res.json()
            const list = Array.isArray(result)
                ? result
                : (result?.data && Array.isArray(result.data) ? result.data : null)

            if (Array.isArray(list)) {
                setReportData(list)
                setSearchQuery("")
                toast({ title: "Success", description: "Report generated successfully" })
            } else {
                setReportData([])
                toast({ title: "No Data", description: "No records found", variant: "destructive" })
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to generate report", variant: "destructive" })
        } finally {
            setHasGenerated(true)
            setSearching(false)
        }
    }

    return (
        <DashboardLayout title="Consolidated Attendance Report">
            <div className="max-w-6xl mx-auto space-y-6">
                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <Grid className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label className="text-red-500">Month *</Label>
                                <Select
                                    value={filters.month.toString()}
                                    onValueChange={(v) => setFilters({ ...filters, month: parseInt(v) })}
                                >
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <SelectValue placeholder="Select month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                            <SelectItem key={m} value={m.toString()}>
                                                {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-red-500">Year *</Label>
                                <Select
                                    value={filters.year.toString()}
                                    onValueChange={(v) => setFilters({ ...filters, year: parseInt(v) })}
                                >
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[2023, 2024, 2025, 2026].map(y => (
                                            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Class</Label>
                                <Select value={filters.classId} onValueChange={(v) => setFilters({ ...filters, classId: v })}>
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls._id} value={cls._id}>
                                                Class {cls.name}-{cls.section}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button
                                onClick={generateReport}
                                disabled={searching || loading}
                                className="bg-blue-900 hover:bg-blue-800"
                            >
                                {searching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Generate
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {searching && (
                    <Card className="border-0 shadow-sm ring-1 ring-gray-200 overflow-hidden">
                        <div className="flex items-center gap-3 p-4 border-b bg-gray-50/50">
                            <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                            <div className="text-sm text-gray-700">Generating report…</div>
                        </div>
                    </Card>
                )}

                {!searching && reportData.length === 0 && (
                    <Card className="border-0 shadow-sm ring-1 ring-gray-200 overflow-hidden">
                        <div className="p-6">
                            <div className="text-sm font-semibold text-gray-900">
                                {hasGenerated ? "No records found" : "Generate a report"}
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                                {hasGenerated
                                    ? "Try a different month/year (or class filter) and generate again."
                                    : "Select month/year and click Generate."}
                            </div>
                        </div>
                    </Card>
                )}

                {!searching && reportData.length > 0 && (
                    <Card>
                        <CardHeader className="bg-pink-50 border-b border-pink-100">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <CardTitle className="text-lg text-gray-800">Class / Section Roll-up</CardTitle>
                                <div className="relative w-full md:max-w-sm">
                                    <Grid className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search class/section"
                                        className="bg-white border-gray-200 pl-9"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-pink-50 hover:bg-pink-50">
                                            <TableHead className="font-bold text-gray-700 uppercase">Class-Section</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase text-center">Working Days</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase text-center">Totals Present</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase text-center">Totals Absent</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData
                                            .filter((row) => {
                                                const q = searchQuery.trim().toLowerCase()
                                                if (!q) return true
                                                return `${row.className || ''}`.toLowerCase().includes(q)
                                            })
                                            .map((row, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{row.className}</TableCell>
                                                    <TableCell className="text-center">{row.working}</TableCell>
                                                    <TableCell className="text-center text-green-700 font-bold">{row.present}</TableCell>
                                                    <TableCell className="text-center text-red-600 font-bold">{row.absent}</TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}
