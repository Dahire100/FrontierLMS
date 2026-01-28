"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ClipboardList, Loader2, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function LeaveSummary() {
    const { toast } = useToast()
    const [summary, setSummary] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filteredSummary, setFilteredSummary] = useState<any[]>([])
    const [search, setSearch] = useState("")

    useEffect(() => {
        fetchLeaveSummary()
    }, [])

    useEffect(() => {
        if (!search) {
            setFilteredSummary(summary)
        } else {
            const lowerSearch = search.toLowerCase()
            const filtered = summary.filter((item) =>
                (item.firstName && item.firstName.toLowerCase().includes(lowerSearch)) ||
                (item.lastName && item.lastName.toLowerCase().includes(lowerSearch))
            )
            setFilteredSummary(filtered)
        }
    }, [search, summary])

    const fetchLeaveSummary = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/leaves/summary?requesterType=student`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await res.json()
            if (result.success && Array.isArray(result.data)) {
                setSummary(result.data)
                setFilteredSummary(result.data)
            } else {
                setSummary([])
                setFilteredSummary([])
                toast({ title: "No Data", description: "No approved leave records found", variant: "default" })
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to fetch leave summary", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout title="Leave Summary">
            <div className="space-y-6">
                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <ClipboardList className="h-5 w-5" />
                            Search Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Search Student</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Name"
                                        className="bg-white border-gray-200 pl-10"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg text-gray-800">Leave Totals (Approved)</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-pink-50 hover:bg-pink-50">
                                        <TableHead className="font-bold text-gray-700 uppercase">Student</TableHead>
                                        <TableHead className="font-bold text-gray-700 uppercase text-center">Casual</TableHead>
                                        <TableHead className="font-bold text-gray-700 uppercase text-center">Sick</TableHead>
                                        <TableHead className="font-bold text-gray-700 uppercase text-center">Medical</TableHead>
                                        <TableHead className="font-bold text-gray-700 uppercase text-center">Emergency</TableHead>
                                        <TableHead className="font-bold text-gray-700 uppercase text-center">Other</TableHead>
                                        <TableHead className="font-bold text-gray-700 uppercase text-right">Total Days</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredSummary.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                No records found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredSummary.map((row) => (
                                            <TableRow key={row._id}>
                                                <TableCell className="font-medium">
                                                    {row.firstName} {row.lastName}
                                                </TableCell>
                                                <TableCell className="text-center text-gray-600">{row.casual || 0}</TableCell>
                                                <TableCell className="text-center text-blue-600">{row.sick || 0}</TableCell>
                                                <TableCell className="text-center text-purple-600">{row.medical || 0}</TableCell>
                                                <TableCell className="text-center text-red-600">{row.emergency || 0}</TableCell>
                                                <TableCell className="text-center text-gray-600">{row.other || 0}</TableCell>
                                                <TableCell className="text-right font-bold text-lg">{row.total}</TableCell>
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
