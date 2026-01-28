"use client"

import { useState, useEffect } from "react"
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
import { Clock, Search, Smartphone, Loader2, User, AlertCircle } from "lucide-react"
import { API_ENDPOINTS, apiFetch } from "@/lib/api-config"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AppLoginStatus() {
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        setLoading(true)
        try {
            const res = await apiFetch(API_ENDPOINTS.REPORTS.APP_LOGIN_STATUS)
            const data = await res.json()
            if (data.history) {
                setHistory(data.history)
                setError(null)
            } else {
                setHistory([])
            }
        } catch (err) {
            console.error(err)
            setError("Failed to load login history. Please check your connection.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout title="App Login Status">
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-end text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-indigo-500" />
                        <span className="text-indigo-900 font-medium">Reports</span>
                        <span>/</span>
                        <span>App Login Status</span>
                    </span>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <Card className="lg:col-span-4 border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                            <CardTitle className="text-2xl font-bold flex items-center gap-2 text-white">
                                <Search className="h-6 w-6 text-blue-200" />
                                Login History
                            </CardTitle>
                            <p className="text-blue-100 mt-1">Track user login sessions and device information.</p>
                        </CardHeader>
                        <CardContent className="pt-6 p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50/80">
                                        <TableRow>
                                            <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">User</TableHead>
                                            <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Role</TableHead>
                                            <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Device</TableHead>
                                            <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">IP Address</TableHead>
                                            <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Time</TableHead>
                                            <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-12">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                                                        <span className="text-sm text-gray-500">Loading history...</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : history.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground bg-gray-50/30">
                                                    No login history found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            history.map((h, idx) => (
                                                <TableRow key={h._id || idx} className="hover:bg-blue-50/30 transition-colors group">
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-blue-100 p-2 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                                <User className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-gray-800">{h.user ? `${h.user.firstName} ${h.user.lastName}` : 'Unknown'}</div>
                                                                <div className="text-xs text-gray-500">{h.user?.email}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="capitalize bg-gray-100 text-gray-700">
                                                            {h.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{h.device || 'Unknown'}</TableCell>
                                                    <TableCell className="font-mono text-xs text-gray-500">{h.ipAddress || '-'}</TableCell>
                                                    <TableCell className="text-gray-500 text-xs">
                                                        {format(new Date(h.createdAt), "MMM d, yyyy h:mm a")}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={h.status === 'Success' ? 'outline' : 'destructive'}
                                                            className={h.status === 'Success' ? 'text-green-600 border-green-200 bg-green-50' : ''}>
                                                            {h.status}
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
            </div>
        </DashboardLayout>
    )
}


