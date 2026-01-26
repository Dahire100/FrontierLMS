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
import { BookOpenCheck, Loader2, Printer, Search, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AttendanceRegister() {
    const { toast } = useToast()
    const [classes, setClasses] = useState<any[]>([])
    const [registerData, setRegisterData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)
    const [hasGenerated, setHasGenerated] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState({
        classId: "",
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

    const generateRegister = async () => {
        if (!filters.classId) {
            toast({ title: "Required", description: "Please select a class", variant: "destructive" })
            return
        }

        setSearching(true)
        setHasGenerated(false)
        try {
            const token = localStorage.getItem("token")
            const params = new URLSearchParams()
            params.append("classId", filters.classId)
            params.append("month", filters.month.toString())
            params.append("year", filters.year.toString())

            const res = await fetch(`${API_URL}/api/attendance/register?${params.toString()}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await res.json()
            const list = Array.isArray(result)
                ? result
                : (result?.data && Array.isArray(result.data) ? result.data : null)

            if (Array.isArray(list)) {
                setRegisterData(list)
                setSearchQuery("")
                toast({ title: "Success", description: "Register generated successfully" })
            } else {
                setRegisterData([])
                toast({ title: "No Data", description: "No attendance records found", variant: "destructive" })
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to generate register", variant: "destructive" })
        } finally {
            setHasGenerated(true)
            setSearching(false)
        }
    }

    return (
        <DashboardLayout title="Attendance Register">
            <div className="max-w-6xl mx-auto space-y-6">
                <Card className="border-0 shadow-sm ring-1 ring-gray-200">
                    <CardHeader className="border-b bg-gray-50/50 pb-4">
                        <CardTitle className="text-base font-medium text-gray-700 flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Register Criteria
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Class</Label>
                                <Select value={filters.classId} onValueChange={(v) => setFilters({ ...filters, classId: v })}>
                                    <SelectTrigger className="bg-white">
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
                                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Month</Label>
                                <Select
                                    value={filters.month.toString()}
                                    onValueChange={(v) => setFilters({ ...filters, month: parseInt(v) })}
                                >
                                    <SelectTrigger className="bg-white">
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
                                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Year</Label>
                                <Select
                                    value={filters.year.toString()}
                                    onValueChange={(v) => setFilters({ ...filters, year: parseInt(v) })}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[2023, 2024, 2025, 2026].map(y => (
                                            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                onClick={generateRegister}
                                disabled={searching || loading}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                            >
                                {searching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Generate Register"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {searching && (
                    <Card className="border-0 shadow-sm ring-1 ring-gray-200 overflow-hidden">
                        <div className="flex items-center gap-3 p-4 border-b bg-gray-50/50">
                            <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                            <div className="text-sm text-gray-700">Generating register…</div>
                        </div>
                    </Card>
                )}

                {!searching && registerData.length === 0 && (
                    <Card className="border-0 shadow-sm ring-1 ring-gray-200 overflow-hidden">
                        <div className="p-6">
                            <div className="text-sm font-semibold text-gray-900">
                                {hasGenerated ? "No records found" : "Generate a register"}
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                                {hasGenerated
                                    ? "Try a different class/month/year and generate again."
                                    : "Select class/month/year above, then click Generate Register."}
                            </div>
                        </div>
                    </Card>
                )}

                {!searching && registerData.length > 0 && (
                    <Card className="border-0 shadow-sm ring-1 ring-gray-200 overflow-hidden">
                        <div className="flex flex-col gap-4 p-4 border-b bg-gray-50/50">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <BookOpenCheck className="h-4 w-4 text-slate-600" />
                                    Daily Summary
                                </h3>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="h-8">
                                        <Printer className="h-4 w-4 mr-2" /> Print
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8">
                                        <Download className="h-4 w-4 mr-2" /> Export
                                    </Button>
                                </div>
                            </div>

                            <div className="relative w-full md:max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by date"
                                    className="bg-white pl-9"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                                        <TableHead className="w-[150px]">Date</TableHead>
                                        <TableHead className="text-center text-green-700">Present</TableHead>
                                        <TableHead className="text-center text-red-700">Absent</TableHead>
                                        <TableHead className="text-center text-yellow-700">Late</TableHead>
                                        <TableHead className="text-center text-blue-700">Half Day</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {registerData
                                        .filter((row) => {
                                            const q = searchQuery.trim().toLowerCase()
                                            if (!q) return true
                                            return `${row.date || ''}`.toLowerCase().includes(q)
                                        })
                                        .map((row) => (
                                        <TableRow key={row.date} className="hover:bg-slate-50 transition-colors">
                                            <TableCell className="font-medium text-gray-700">{row.date}</TableCell>
                                            <TableCell className="text-center text-green-700 font-bold bg-green-50">{row.present}</TableCell>
                                            <TableCell className="text-center text-red-600 font-bold bg-red-50">{row.absent}</TableCell>
                                            <TableCell className="text-center text-yellow-600 font-bold bg-yellow-50">{row.late}</TableCell>
                                            <TableCell className="text-center text-blue-600 font-bold bg-blue-50">{row.halfDay || 0}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}
