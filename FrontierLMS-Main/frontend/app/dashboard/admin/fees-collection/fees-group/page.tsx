"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, Printer, FileText, Download, List, Trash2, Loader2, MoreVertical, RefreshCcw, Search, Users } from "lucide-react"
import { toast } from "sonner"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FeeGroup {
    _id: string
    name: string
    description: string
}

import { AdvancedTable } from "@/components/super-admin/advanced-table"

export default function FeesGroup() {
    const [searchTerm, setSearchTerm] = useState("")
    const [groups, setGroups] = useState<FeeGroup[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        description: ""
    })

    const fetchGroups = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await apiFetch(API_ENDPOINTS.FEES.GROUPS)
            const data = await res.json()
            if (res.ok) {
                setGroups(data)
            } else {
                setError(data.error || "Failed to fetch fee groups")
            }
        } catch (err) {
            setError("Network error. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchGroups()
    }, [fetchGroups])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name) {
            toast.error("Please enter a group name")
            return
        }

        setIsSubmitting(true)
        try {
            const res = await apiFetch(API_ENDPOINTS.FEES.GROUPS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            const data = await res.json()
            if (res.ok) {
                toast.success("Fee Group added successfully")
                setFormData({ name: "", description: "" })
                fetchGroups()
            } else {
                toast.error(data.error || "Failed to add fee group")
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this fee group?")) return

        try {
            const res = await apiFetch(`${API_ENDPOINTS.FEES.GROUPS}/${id}`, {
                method: "DELETE"
            })

            if (res.ok) {
                toast.success("Fee Group deleted")
                setGroups(groups.filter(g => g._id !== id))
            } else {
                const data = await res.json()
                toast.error(data.error || "Failed to delete")
            }
        } catch (err) {
            toast.error("Delete failed")
        }
    }

    const columns = [
        {
            key: "name",
            label: "Group Identity",
            render: (val: string) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                        <Users size={16} />
                    </div>
                    <span className="font-bold text-gray-900">{val}</span>
                </div>
            )
        },
        {
            key: "description",
            label: "Core Description",
            render: (val: string) => <span className="text-gray-500 italic text-sm">{val || 'No extended description'}</span>
        },
        {
            key: "actions",
            label: "Action Center",
            render: (_: any, group: any) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                                <MoreVertical className="h-4 w-4 text-gray-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem className="cursor-pointer gap-2">
                                <Edit className="h-4 w-4 text-blue-600" /> Edit Metadata
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600 cursor-pointer gap-2"
                                onClick={() => handleDelete(group._id)}
                            >
                                <Trash2 className="h-4 w-4" /> Purge Record
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ]

    const filteredGroups = groups.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout title="Universal Fee Groups">
            <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg text-white">
                                <Users size={22} />
                            </div>
                            Group Classification
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Define structural containers for your institution's fee types</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Definition Panel */}
                    <div className="lg:col-span-4 transition-all duration-500">
                        <Card className="border-none shadow-xl ring-1 ring-black/5 overflow-hidden sticky top-8">
                            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                                <CardTitle className="text-xs flex items-center gap-2 text-indigo-800 uppercase tracking-widest font-black">
                                    <Edit size={14} /> Structural Definition
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Group Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g. Admission Cycle 2024"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-gray-50/50 border-gray-200 h-11 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Extended Description</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Contextual notes for this fee grouping..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="bg-gray-50/50 border-gray-200 focus:ring-indigo-500"
                                            rows={4}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 shadow-lg shadow-indigo-100 font-bold group transition-all"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                Commit Group <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                                            </div>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Registry Panel */}
                    <div className="lg:col-span-8">
                        {error && (
                            <Alert variant="destructive" className="mb-6 shadow-lg border-none bg-red-50 text-red-600">
                                <AlertDescription className="font-bold flex items-center gap-2">
                                    <AlertCircle size={16} /> {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                <Input
                                    className="pl-10 h-11 bg-white border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-100"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Filter by group identity..."
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={fetchGroups}
                                className="h-11 px-4 border-gray-200 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Sync
                            </Button>
                        </div>

                        <AdvancedTable
                            title="Group Registry"
                            columns={columns}
                            data={filteredGroups}
                            loading={isLoading}
                            pagination
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

import { AlertCircle } from "lucide-react"
