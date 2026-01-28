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
import { History, Search, Loader2, PlayCircle, FileText } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

export default function PastClassLogs() {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/online-classes?status=completed`, { // Assuming we can filter by status or filtering client side
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                const all = data.data || []
                // If API doesn't support status filter, do it here
                const completed = all.filter((c: any) => c.status === 'completed' || new Date(c.scheduledDate) < new Date())
                setLogs(completed)
            }
        } catch (err) {
            console.error(err)
            toast({ title: "Error", description: "Failed to load class logs", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout title="Past Class Logs">
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Past Class Logs</h2>
                        <p className="text-muted-foreground mt-1">Review history and recordings of previous online sessions.</p>
                    </div>
                </div>

                <Card className="border-gray-100 shadow-md bg-white/50 backdrop-blur-sm">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <History className="h-5 w-5 text-blue-600" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Class</Label>
                                <Select>
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Classes</SelectItem>
                                        <SelectItem value="6">Class 6</SelectItem>
                                        <SelectItem value="7">Class 7</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Date Range</Label>
                                <Input placeholder="Date" type="date" className="bg-white border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Subject</Label>
                                <Input placeholder="All subjects" className="bg-white border-gray-200" />
                            </div>
                            <div className="space-y-2 flex items-end">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={fetchLogs}>
                                    <Search className="mr-2 h-4 w-4" /> Search
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-md bg-white overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                        <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-orange-500" />
                            Class History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Class/Section</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Date</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Platform</TableHead>
                                        <TableHead className="font-semibold text-gray-700 text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12">
                                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                                                <p className="mt-2 text-sm text-gray-500">Loading history...</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                                No past class logs found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.map((row) => (
                                            <TableRow key={row._id} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell className="font-medium text-gray-900">
                                                    <div>{row.subject}</div>
                                                    <div className="text-xs text-muted-foreground">{row.title}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-white">
                                                        {row.classId ? `${row.classId.name}-${row.classId.section}` : "N/A"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-sm">
                                                        <span>{new Date(row.scheduledDate).toLocaleDateString()}</span>
                                                        <span className="text-xs text-muted-foreground">{row.startTime} - {row.endTime}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="capitalize">{row.platform}</TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                                        Completed
                                                    </Badge>
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

