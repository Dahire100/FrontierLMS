"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, FileText, Settings, Loader2, AlertCircle, Search } from "lucide-react"
import { API_ENDPOINTS, apiFetch } from "@/lib/api-config"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ActivityLog() {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("All")
    const [searchTerm, setSearchTerm] = useState("")

    const tabs = [
        "All",
        "Student",
        "Fees",
        "Staff",
        "Authentication",
        "Exam"
    ]

    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const res = await apiFetch(API_ENDPOINTS.REPORTS.ACTIVITY_LOG)
            const data = await res.json()
            if (data.logs) {
                setLogs(data.logs)
                setError(null)
            } else {
                setLogs([])
            }
        } catch (err) {
            console.error("Failed to fetch activity logs", err)
            setError("Failed to load activity logs. Please try again later.")
        } finally {
            setLoading(false)
        }
    }

    const filteredLogs = logs.filter(log => {
        const matchesTab = activeTab === "All" || log.module === activeTab
        const matchesSearch = log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesTab && matchesSearch
    })

    return (
        <DashboardLayout title="Activity Log">
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-end text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-indigo-500" />
                        <span className="text-indigo-900 font-medium">Reports</span>
                        <span>/</span>
                        <span>Activity Log</span>
                    </span>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <CardTitle className="text-2xl font-bold flex items-center gap-2 text-white">
                                    <FileText className="h-6 w-6 text-indigo-200" />
                                    System Activity Log
                                </CardTitle>
                                <p className="text-indigo-100 mt-1 text-sm">Monitor user actions and system events.</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-lg p-1 flex gap-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === tab
                                                ? "bg-white text-indigo-600 shadow-sm"
                                                : "text-indigo-100 hover:bg-white/10"
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="bg-white pt-6 space-y-4">
                        <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by action or description..."
                                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500 transition-all rounded-xl"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" onClick={fetchLogs} className="border-indigo-100 text-indigo-600 hover:bg-indigo-50">
                                Refresh Logs
                            </Button>
                        </div>

                        <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader className="bg-gray-50/80">
                                    <TableRow>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500 w-[150px]">Action</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500 w-[120px]">Module</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500 w-[180px]">User</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500 w-[180px]">Date</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                                                    <span className="text-sm text-gray-500">Loading activity...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredLogs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12 text-muted-foreground bg-gray-50/30">
                                                No activity logs found for the selected criteria.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredLogs.map((log) => (
                                            <TableRow key={log._id} className="hover:bg-indigo-50/30 transition-colors group">
                                                <TableCell className="font-medium text-indigo-700">
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                                                        {log.action}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                                        {log.module}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-gray-800">
                                                        {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                                                    </div>
                                                    <div className="text-xs text-gray-400">{log.user?.role || 'System'}</div>
                                                </TableCell>
                                                <TableCell className="text-gray-500 text-xs font-mono">
                                                    {format(new Date(log.createdAt), "MMM d, yyyy h:mm a")}
                                                </TableCell>
                                                <TableCell className="text-gray-600 max-w-md truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                                                    {log.description}
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
        </DashboardLayout>
    )
}
