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
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShieldCheck, Download, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"

export default function RoleVisibility() {
    const [rows, setRows] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [contents, setContents] = useState<any[]>([])
    const [form, setForm] = useState({ contentId: "", roles: [] })
    const [searchTerm, setSearchTerm] = useState("")

    // Fetch all downloadable content
    const fetchContents = async () => {
        try {
            const res = await apiFetch(API_ENDPOINTS.DOWNLOAD_CONTENT)
            if (res.ok) {
                const data = await res.json()
                setContents(data)
            }
        } catch (error) {
            console.error("Failed to fetch contents", error)
        }
    }

    // Fetch visibility settings
    const fetchVisibility = async () => {
        setLoading(true)
        try {
            const res = await apiFetch(API_ENDPOINTS.DOWNLOAD_CONTENT)
            if (res.ok) {
                const data = await res.json()
                setRows(data)
            } else {
                toast.error("Failed to fetch visibility settings")
            }
        } catch (error) {
            toast.error("Backend server is not running. Start it: cd backend && npm start")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchContents()
        fetchVisibility()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.contentId) {
            toast.error("Please select content")
            return
        }

        try {
            const roles = form.roles.length > 0 ? form.roles : ["admin", "teacher", "student"]
            const res = await apiFetch(`${API_ENDPOINTS.DOWNLOAD_CONTENT}/${form.contentId}`, {
                method: "PATCH",
                body: JSON.stringify({ visibleToRoles: roles })
            })

            if (res.ok) {
                toast.success("Visibility updated successfully")
                setForm({ contentId: "", roles: [] })
                fetchVisibility()
            } else {
                toast.error("Failed to update visibility")
            }
        } catch (error) {
            toast.error("Error updating visibility")
        }
    }

    const toggleRole = (role: string) => {
        setForm(prev => ({
            ...prev,
            roles: prev.roles.includes(role)
                ? prev.roles.filter(r => r !== role)
                : [...prev.roles, role]
        }))
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return
        try {
            const res = await apiFetch(`${API_ENDPOINTS.DOWNLOAD_CONTENT}/${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Visibility entry deleted")
                fetchVisibility()
            } else {
                toast.error("Failed to delete entry")
            }
        } catch (error) {
            toast.error("Error deleting entry")
        }
    }

    const filteredRows = rows.filter(row =>
        row.title?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const roleColors: Record<string, string> = {
        admin: "bg-red-100 text-red-700",
        teacher: "bg-blue-100 text-blue-700",
        student: "bg-green-100 text-green-700",
        parent: "bg-purple-100 text-purple-700"
    }

    return (
        <DashboardLayout title="Role-wise Visibility">
            <div className="space-y-6">
                {/* Header with Gradient */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600 p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                    <div className="relative flex items-center gap-4">
                        <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Role-wise Visibility</h1>
                            <p className="mt-1 text-indigo-50">Control content visibility by user role</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Section */}
                    <div className="lg:col-span-1">
                        <Card className="border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-indigo-200">
                                <CardTitle className="text-base font-bold flex items-center gap-2 text-indigo-900">
                                    <ShieldCheck className="h-5 w-5" />
                                    Set Visibility
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSave} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold after:content-['*'] after:ml-0.5 after:text-red-500">
                                            Select Content
                                        </Label>
                                        <Select value={form.contentId} onValueChange={(val) => setForm({ ...form, contentId: val })}>
                                            <SelectTrigger className="border-indigo-200 focus:border-indigo-500">
                                                <SelectValue placeholder="Choose content" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {contents.map((content: any) => (
                                                    <SelectItem key={content._id} value={content._id}>
                                                        {content.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold">
                                            Visible To
                                        </Label>
                                        <div className="space-y-2">
                                            {["admin", "teacher", "student", "parent"].map((role) => (
                                                <label key={role} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-indigo-50 transition">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.roles.includes(role)}
                                                        onChange={() => toggleRole(role)}
                                                        className="w-4 h-4 rounded border-indigo-300 text-indigo-600 cursor-pointer"
                                                    />
                                                    <span className="text-sm font-medium capitalize text-gray-700">{role}s</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 w-full gap-2 shadow-lg">
                                        <ShieldCheck className="h-4 w-4" />
                                        Update Visibility
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Table Section */}
                    <div className="lg:col-span-2">
                        <Card className="border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-indigo-200">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold flex items-center gap-2 text-indigo-900">
                                        <Eye className="h-5 w-5" />
                                        Visibility Matrix
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="mb-4">
                                    <Input
                                        placeholder="Search content..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="border-indigo-200 focus:border-indigo-500"
                                    />
                                </div>
                                <div className="rounded-lg border border-indigo-100 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                            <TableRow className="border-b border-indigo-100 hover:bg-indigo-50">
                                                <TableHead className="font-bold text-indigo-900">Content</TableHead>
                                                <TableHead className="font-bold text-indigo-900">Visible To</TableHead>
                                                <TableHead className="text-right font-bold text-indigo-900">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center py-8">
                                                        <div className="flex justify-center items-center gap-2">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                                                            Loading...
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredRows.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                                                        No content found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredRows.map((row) => (
                                                    <TableRow key={row._id} className="border-b border-indigo-100 hover:bg-indigo-50/50">
                                                        <TableCell className="font-medium text-gray-900">{row.title}</TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-1">
                                                                {(row.visibleToRoles || []).map((role: string) => (
                                                                    <span
                                                                        key={role}
                                                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${roleColors[role] || "bg-gray-100 text-gray-700"}`}
                                                                    >
                                                                        {role}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex gap-2 justify-end">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setForm({ contentId: row._id, roles: row.visibleToRoles || [] })}
                                                                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(row._id)}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

