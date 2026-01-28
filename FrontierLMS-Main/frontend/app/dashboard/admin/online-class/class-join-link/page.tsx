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
import { Link2, Copy, ExternalLink, Loader2, Plus, Share2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

export default function ClassJoinLink() {
    const [links, setLinks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({
        subject: "",
        classSection: "",
        platform: "zoom",
        link: ""
    })
    const [saving, setSaving] = useState(false)

    // In a real app, these might come from the same table as online classes
    // For now, we'll maintain a simulated list or fetch from online classes directly if appropriate
    // Let's try to fetch active online classes
    useEffect(() => {
        fetchLinks()
    }, [])

    const fetchLinks = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/online-classes`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setLinks(data.data || [])
            }
        } catch (err) {
            console.error(err)
            toast({ title: "Error", description: "Failed to load links", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast({ title: "Copied", description: "Link copied to clipboard" })
    }

    // Since we are reusing the online class API, adding a link is essentially scheduling a class
    // But for the purpose of this specific "Join Link" page, maybe it's just for quick reference?
    // I'll keep the form but make it clear it's adding a new class schedule effectively

    // Actually, let's simplify. This page seems to be about SHARING links. 
    // Let's just focus on displaying them nicely and copying.

    return (
        <DashboardLayout title="Class Join Link">
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Class Join Links</h2>
                        <p className="text-muted-foreground mt-1">Quickly access and share virtual class meeting links.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-3">
                        <Card className="border-gray-100 shadow-xl bg-white overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                                    <Link2 className="h-5 w-5 text-blue-500" />
                                    Active Meeting Links
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-gray-50/80">
                                            <TableRow>
                                                <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Class/Section</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Platform</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Meeting Link</TableHead>
                                                <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-12">
                                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                                                        <p className="mt-2 text-sm text-gray-500">Loading links...</p>
                                                    </TableCell>
                                                </TableRow>
                                            ) : links.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                                        No active details found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                links.map((row) => (
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
                                                            <div className="flex items-center gap-2">
                                                                <span className={`w-2 h-2 rounded-full ${row.platform === 'zoom' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                                                                <span className="capitalize">{row.platform}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="max-w-xs truncate text-blue-600 underline text-sm">
                                                            <a href={row.meetingLink} target="_blank" rel="noopener noreferrer">
                                                                {row.meetingLink}
                                                            </a>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(row.meetingLink)}>
                                                                    <Copy className="h-4 w-4 text-gray-500" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                                    <a href={row.meetingLink} target="_blank" rel="noopener noreferrer">
                                                                        <ExternalLink className="h-4 w-4 text-gray-500" />
                                                                    </a>
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

