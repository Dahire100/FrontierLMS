"use client"

import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Download, FileSpreadsheet, FileIcon as FilePdf, Loader2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AttendanceExport() {
    const { toast } = useToast()
    const [classes, setClasses] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [exporting, setExporting] = useState(false)

    // Form state
    const [reportType, setReportType] = useState("daily")
    const [formatType, setFormatType] = useState("csv") // Default to CSV as it's easiest to implement client-side
    const [classId, setClassId] = useState("all")
    const [month, setMonth] = useState((new Date().getMonth() + 1).toString())
    const [year, setYear] = useState(new Date().getFullYear().toString())
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])

    useEffect(() => {
        fetchClasses()
    }, [])

    const fetchClasses = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/classes`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await res.json()
            if (result.success && Array.isArray(result.data)) {
                setClasses(result.data)
            } else if (Array.isArray(result)) {
                setClasses(result)
            }
        } catch (err) {
            console.error("Failed to load classes", err)
        } finally {
            setLoading(false)
        }
    }

    const downloadCSV = (data: any[], filename: string) => {
        if (!data || data.length === 0) {
            toast({ title: "No Data", description: "No records found to export", variant: "destructive" })
            return
        }

        // Get headers from first object
        const headers = Object.keys(data[0])
        const csvContent = [
            headers.join(","),
            ...data.map(row => headers.map(fieldName => {
                const value = row[fieldName]
                // Handle strings with commas
                return typeof value === 'string' && value.includes(',')
                    ? `"${value}"`
                    : value
            }).join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `${filename}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleExport = async () => {
        if (formatType === 'pdf') {
            toast({ title: "Not Supported", description: "PDF export is coming soon. Please use CSV.", variant: "default" })
            return
        }

        setExporting(true)
        try {
            const token = localStorage.getItem("token")
            let endpoint = ""
            let params = new URLSearchParams()
            let filename = `attendance_report_${new Date().getTime()}`

            // Build Query Params based on report type
            if (classId !== 'all') params.append("classId", classId)

            switch (reportType) {
                case "daily":
                    endpoint = "/api/attendance"
                    params.append("date", date)
                    filename = `daily_attendance_${date}`
                    break
                case "monthly":
                    endpoint = "/api/attendance/monthly-report"
                    params.append("month", month)
                    params.append("year", year)
                    filename = `monthly_attendance_${month}_${year}`
                    break
                case "consolidated":
                    endpoint = "/api/attendance/consolidated"
                    params.append("month", month)
                    params.append("year", year)
                    filename = `consolidated_report_${month}_${year}`
                    break
                case "register":
                    endpoint = "/api/attendance/register"
                    params.append("month", month)
                    params.append("year", year)
                    filename = `attendance_register_${month}_${year}`
                    break
            }

            const res = await fetch(`${API_URL}${endpoint}?${params.toString()}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })

            const data = await res.json()

            if (Array.isArray(data)) {
                // Determine structure based on report type for better CSV formatting if needed
                // For now, flattening or using raw JSON is okay for simple export

                // For daily attendance, if response is student list with status, we need to map it
                let exportData = data

                if (reportType === 'daily') {
                    exportData = data.map((s: any) => ({
                        RollNo: s.rollNumber || s.rollNo,
                        Name: `${s.firstName} ${s.lastName}`,
                        Status: s.status || 'Not Marked',
                        Date: s.date || date
                    }))
                } else if (reportType === 'monthly') {
                    exportData = data.map((s: any) => ({
                        StudentId: s.studentId,
                        Name: `${s.firstName} ${s.lastName}`,
                        TotalDays: s.totalDays,
                        Present: s.presentDays,
                        Absent: s.absentDays,
                        Percentage: `${s.attendancePercentage}%`
                    }))
                }

                downloadCSV(exportData, filename)
                toast({ title: "Success", description: "Report downloaded successfully" })
            } else {
                toast({ title: "Error", description: data.error || "Failed to fetch data", variant: "destructive" })
            }

        } catch (err) {
            toast({ title: "Error", description: "Failed to export report", variant: "destructive" })
        } finally {
            setExporting(false)
        }
    }

    return (
        <DashboardLayout title="Export Attendance">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-800">Export Center</h2>
                        <p className="text-muted-foreground">Generate and download attendance reports.</p>
                    </div>
                </div>

                <Card className="border-t-4 border-t-blue-600 shadow-lg">
                    <CardHeader className="bg-gray-50/50 pb-8">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Download className="h-6 w-6 text-blue-600" />
                            Report Configuration
                        </CardTitle>
                        <CardDescription>
                            Select the type of report, date range, and format you wish to export.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Report Type */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Report Type</Label>
                                <Select value={reportType} onValueChange={setReportType}>
                                    <SelectTrigger className="h-11 bg-white border-gray-200 focus:ring-blue-500">
                                        <SelectValue placeholder="Choose report" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily Attendance</SelectItem>
                                        <SelectItem value="monthly">Monthly Report</SelectItem>
                                        <SelectItem value="consolidated">Consolidated Report</SelectItem>
                                        <SelectItem value="register">Attendance Register</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Format */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Format</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div
                                        onClick={() => setFormatType('csv')}
                                        className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-all ${formatType === 'csv' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <FileSpreadsheet className="h-6 w-6" />
                                        <span className="text-xs font-medium">Excel / CSV</span>
                                        {formatType === 'csv' && <CheckCircle2 className="h-4 w-4 absolute top-2 right-2 text-green-600" />}
                                    </div>
                                    <div
                                        onClick={() => setFormatType('pdf')}
                                        className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-all ${formatType === 'pdf' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-200 hover:border-gray-300 opacity-60'}`}
                                    >
                                        <FilePdf className="h-6 w-6" />
                                        <span className="text-xs font-medium">PDF (Soon)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100" />

                        {/* Dynamic Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Class Scope</Label>
                                <Select value={classId} onValueChange={setClassId}>
                                    <SelectTrigger className="h-11 bg-white border-gray-200">
                                        <SelectValue placeholder="All classes" />
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

                            {reportType === 'daily' ? (
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Date</Label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="flex h-11 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Month</Label>
                                        <Select value={month} onValueChange={setMonth}>
                                            <SelectTrigger className="h-11 bg-white border-gray-200">
                                                <SelectValue placeholder="Select Month" />
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
                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Year</Label>
                                        <Select value={year} onValueChange={setYear}>
                                            <SelectTrigger className="h-11 bg-white border-gray-200">
                                                <SelectValue placeholder="Select Year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[2023, 2024, 2025, 2026].map(y => (
                                                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                size="lg"
                                onClick={handleExport}
                                disabled={exporting || loading}
                                className="bg-slate-900 hover:bg-slate-800 text-white min-w-[200px]"
                            >
                                {exporting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Download className="h-5 w-5 mr-2" />}
                                {exporting ? "Generating..." : "Download Report"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
