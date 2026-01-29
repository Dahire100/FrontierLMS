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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Edit, List, Trash2, Loader2, MoreVertical, RefreshCcw } from "lucide-react"
import { toast } from "sonner"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FeeGroup {
    _id: string
    name: string
}

interface FeeType {
    _id: string
    name: string
    code: string
    description: string
    feeGroupId: FeeGroup | string // populated or ID
}

import { AdvancedTable } from "@/components/super-admin/advanced-table"

export default function FeesTypes() {
    const [searchTerm, setSearchTerm] = useState("")
    const [types, setTypes] = useState<FeeType[]>([])
    const [groups, setGroups] = useState<FeeGroup[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        feeGroupId: "",
        name: "",
        code: "",
        description: ""
    })

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const [typesRes, groupsRes] = await Promise.all([
                apiFetch(API_ENDPOINTS.FEES.TYPES),
                apiFetch(API_ENDPOINTS.FEES.GROUPS)
            ])

            if (typesRes.ok && groupsRes.ok) {
                const typesData = await typesRes.json()
                const groupsData = await groupsRes.json()
                setTypes(typesData)
                setGroups(groupsData)
            } else {
                setError("Failed to fetch data")
            }
        } catch (err) {
            setError("Network connection failed")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name || !formData.code || !formData.feeGroupId) {
            toast.error("Please fill all required fields")
            return
        }

        setIsSubmitting(true)
        try {
            const res = await apiFetch(API_ENDPOINTS.FEES.TYPES, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                toast.success("Fee Type added successfully")
                setFormData({ feeGroupId: "", name: "", code: "", description: "" })
                fetchData()
            } else {
                const data = await res.json()
                toast.error(data.error || "Failed to add fee type")
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this fee type?")) return

        try {
            const res = await apiFetch(`${API_ENDPOINTS.FEES.TYPES}/${id}`, {
                method: "DELETE"
            })

            if (res.ok) {
                toast.success("Fee Type deleted")
                setTypes(types.filter(t => t._id !== id))
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
            label: "Nomenclature",
            render: (val: string) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-pink-50 rounded-lg flex items-center justify-center text-pink-600">
                        <Tag size={16} />
                    </div>
                    <span className="font-bold text-gray-900">{val}</span>
                </div>
            )
        },
        {
            key: "feeGroupId",
            label: "Parent Category",
            render: (val: any) => (
                <div className="flex items-center gap-2">
                    <Users size={14} className="text-gray-400" />
                    <span className="font-medium text-gray-700">{typeof val === 'object' ? val.name : '-'}</span>
                </div>
            )
        },
        {
            key: "code",
            label: "System Code",
            render: (val: string) => (
                <div className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono font-bold text-gray-600 border border-gray-200 uppercase w-fit">
                    {val}
                </div>
            )
        },
        {
            key: "actions",
            label: "Control",
            render: (_: any, type: any) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                                <MoreVertical className="h-4 w-4 text-gray-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem className="cursor-pointer gap-2">
                                <Edit className="h-4 w-4 text-blue-600" /> Modify
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600 cursor-pointer gap-2"
                                onClick={() => handleDelete(type._id)}
                            >
                                <Trash2 className="h-4 w-4" /> Purge
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ]

    const filteredTypes = types.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.code.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout title="Master Fee Inventory">
            <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                {/* Context Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <div className="h-10 w-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg text-white">
                                <Tag size={22} />
                            </div>
                            Fee Core Inventory
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Define granular fee types and map them to primary structural groups</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Input Panel */}
                    <div className="lg:col-span-4 transition-all duration-500">
                        <Card className="border-none shadow-xl ring-1 ring-black/5 overflow-hidden sticky top-8">
                            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                                <CardTitle className="text-xs flex items-center gap-2 text-pink-800 uppercase tracking-widest font-black">
                                    <Edit size={14} /> Type definition
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-8">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Parent Fee Group <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={formData.feeGroupId}
                                            onValueChange={(val) => setFormData({ ...formData, feeGroupId: val })}
                                        >
                                            <SelectTrigger className="bg-gray-50/50 border-gray-200 h-11 focus:ring-pink-500">
                                                <SelectValue placeholder="Associate with Group" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {groups.map((group) => (
                                                    <SelectItem key={group._id} value={group._id}>
                                                        {group.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Fee Type Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g. Admission Fee"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-gray-50/50 border-gray-200 h-11 focus:ring-pink-500"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">System Identifier Code <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="code"
                                            placeholder="e.g. ADM-001"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            className="bg-gray-50/50 border-gray-200 h-11 focus:ring-pink-500 font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Description</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Notes on the purpose of this fee type..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="bg-gray-50/50 border-gray-200 focus:ring-pink-500"
                                            rows={3}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-pink-600 hover:bg-pink-700 h-12 shadow-lg shadow-pink-100 font-bold group transition-all"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                Register Type <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
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
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
                                <Input
                                    className="pl-10 h-11 bg-white border-gray-200 shadow-sm focus:ring-2 focus:ring-pink-100"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Scout by name or system code..."
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={fetchData}
                                className="h-11 px-4 border-gray-200 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Sync
                            </Button>
                        </div>

                        <AdvancedTable
                            title="Validated Inventory"
                            columns={columns}
                            data={filteredTypes}
                            loading={isLoading}
                            pagination
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

import { Tag, Users, Search, AlertCircle } from "lucide-react"
