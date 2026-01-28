"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Plus, Loader2, RefreshCcw, Search, Trash2, Edit, AlertCircle, Calendar, Database } from "lucide-react"
import { toast } from "sonner"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"

interface FeeGroup {
    _id: string
    name: string
}

interface FeeType {
    _id: string
    name: string
    code: string
    feeGroupId: string | { _id: string }
}

interface ClassItem {
    _id: string
    class: string
    section: string
}

interface FeeMaster {
    _id: string
    feeGroupId: FeeGroup
    feeTypeId: FeeType
    classId: ClassItem
    amount: number
    dueDate: string
    type: string
}

import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FeeMaster() {
    const [activeTab, setActiveTab] = useState("fee-structure")

    // Data states
    const [groups, setGroups] = useState<FeeGroup[]>([])
    const [types, setTypes] = useState<FeeType[]>([])
    const [filteredTypes, setFilteredTypes] = useState<FeeType[]>([])
    const [classes, setClasses] = useState<ClassItem[]>([])
    const [masters, setMasters] = useState<FeeMaster[]>([])

    // Loading states
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        feeGroupId: "",
        feeTypeId: "",
        classId: "",
        amount: "",
        dueDate: "",
        type: "OneTime",
        fineType: "none",
        fineAmount: "0"
    })

    const fetchAllData = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const [groupsRes, typesRes, classesRes, mastersRes] = await Promise.all([
                apiFetch(API_ENDPOINTS.FEES.GROUPS),
                apiFetch(API_ENDPOINTS.FEES.TYPES),
                apiFetch(API_ENDPOINTS.CLASSES),
                apiFetch(API_ENDPOINTS.FEES.MASTERS)
            ])

            if (groupsRes.ok && typesRes.ok && classesRes.ok && mastersRes.ok) {
                setGroups(await groupsRes.json())
                setTypes(await typesRes.json())
                const classesData = await classesRes.json()
                setClasses(classesData.data || [])
                setMasters(await mastersRes.json())
            } else {
                setError("Failed to load some data")
            }
        } catch (err) {
            setError("Network error")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAllData()
    }, [fetchAllData])

    // Filter types when group changes
    useEffect(() => {
        if (formData.feeGroupId) {
            const relevantTypes = types.filter(t => {
                const gid = typeof t.feeGroupId === 'object' ? (t.feeGroupId as any)._id : t.feeGroupId;
                return gid === formData.feeGroupId;
            })
            setFilteredTypes(relevantTypes)
        } else {
            setFilteredTypes([])
        }
    }, [formData.feeGroupId, types])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.feeGroupId || !formData.feeTypeId || !formData.classId || !formData.amount || !formData.dueDate) {
            toast.error("Please fill all required fields")
            return
        }

        setIsSubmitting(true)
        try {
            const payload = {
                ...formData,
                amount: Number(formData.amount),
                fineAmount: Number(formData.fineAmount)
            }

            const res = await apiFetch(API_ENDPOINTS.FEES.MASTERS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                toast.success("Fee Master saved successfully")
                setFormData({
                    feeGroupId: "",
                    feeTypeId: "",
                    classId: "",
                    amount: "",
                    dueDate: "",
                    type: "OneTime",
                    fineType: "none",
                    fineAmount: "0"
                })
                // Refresh masters list
                const refreshedMasters = await apiFetch(API_ENDPOINTS.FEES.MASTERS)
                setMasters(await refreshedMasters.json())
                setActiveTab("fee-structure") // Switch to list view
            } else {
                const data = await res.json()
                toast.error(data.error || "Failed to save")
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return
        try {
            const res = await apiFetch(`${API_ENDPOINTS.FEES.MASTERS}/${id}`, {
                method: "DELETE"
            })
            if (res.ok) {
                toast.success("Deleted successfully")
                setMasters(masters.filter(m => m._id !== id))
            }
        } catch (err) {
            toast.error("Failed to delete")
        }
    }

    const columns = [
        {
            key: "classId",
            label: "Class / Section",
            render: (val: any) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 font-bold text-xs">
                        CL
                    </div>
                    <span className="font-medium">{val?.class} - {val?.section}</span>
                </div>
            )
        },
        {
            key: "feeGroupId",
            label: "Group Identity",
            render: (val: any) => (
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span className="font-medium text-gray-700">{val?.name}</span>
                </div>
            )
        },
        {
            key: "feeTypeId",
            label: "Type (Code)",
            render: (val: any) => (
                <div>
                    <div className="text-sm font-bold text-gray-900">{val?.name}</div>
                    <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{val?.code}</div>
                </div>
            )
        },
        {
            key: "dueDate",
            label: "Maturity Date",
            render: (val: string) => (
                <div className="flex items-center gap-2 text-rose-600 font-medium">
                    <Calendar size={14} />
                    {val ? format(new Date(val), 'dd MMM yyyy') : '-'}
                </div>
            )
        },
        {
            key: "amount",
            label: "Valuation",
            render: (val: number) => (
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 shadow-sm border border-emerald-200">
                    ₹{val.toLocaleString()}
                </div>
            )
        },
        {
            key: "actions",
            label: "Commands",
            render: (_: any, master: any) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 rounded-full" onClick={() => handleDelete(master._id)}>
                        <Trash2 size={14} />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <DashboardLayout title="Institutional Fee Master">
            <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase">
                            <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg text-white">
                                <Database size={22} />
                            </div>
                            Core Fee Architect
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Design and assign structural fee components to academic hierarchies</p>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-gray-100/50 p-1 rounded-xl mb-8 border border-gray-200 shadow-inner">
                        <TabsTrigger value="fee-structure" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md px-8 py-2 font-bold text-xs uppercase tracking-widest">
                            Global Structure
                        </TabsTrigger>
                        <TabsTrigger value="create-fee" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md px-8 py-2 font-bold text-xs uppercase tracking-widest">
                            New Fee Assignment
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="fee-structure" className="mt-0">
                        {error && (
                            <Alert variant="destructive" className="mb-6 shadow-lg border-none bg-red-50 text-red-600">
                                <AlertDescription className="font-bold flex items-center gap-2">
                                    <AlertCircle size={16} /> {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="flex justify-end mb-4">
                            <Button variant="outline" size="sm" onClick={fetchAllData} className="gap-2 border-gray-200 hover:bg-white shadow-sm">
                                <RefreshCcw size={14} className={isLoading ? 'animate-spin' : ''} /> Synchronize Data
                            </Button>
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <AdvancedTable
                                title="Validated Fee Masters"
                                columns={columns}
                                data={masters}
                                loading={isLoading}
                                pagination
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="create-fee" className="mt-0">
                        <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden bg-white max-w-5xl mx-auto">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-200">
                                        <Plus size={20} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold text-purple-900 underline decoration-purple-200 decoration-4">Architectural Definition</CardTitle>
                                        <p className="text-sm text-gray-400">Specify parameters for a new fee assignment</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-10">
                                <form onSubmit={handleSubmit} className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {/* Row 1 */}
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Fee Group <span className="text-red-500">*</span></Label>
                                            <Select value={formData.feeGroupId} onValueChange={(val) => setFormData({ ...formData, feeGroupId: val })}>
                                                <SelectTrigger className="bg-gray-50/50 border-gray-200 h-11 focus:ring-purple-500">
                                                    <SelectValue placeholder="Select Base Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {groups.map(g => (
                                                        <SelectItem key={g._id} value={g._id}>{g.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Specific Fee Type <span className="text-red-500">*</span></Label>
                                            <Select value={formData.feeTypeId} onValueChange={(val) => setFormData({ ...formData, feeTypeId: val })} disabled={!formData.feeGroupId}>
                                                <SelectTrigger className="bg-gray-50/50 border-gray-200 h-11 focus:ring-purple-500">
                                                    <SelectValue placeholder="Choose Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {filteredTypes.map(t => (
                                                        <SelectItem key={t._id} value={t._id}>{t.name} ({t.code})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Target Academic Unit <span className="text-red-500">*</span></Label>
                                            <Select value={formData.classId} onValueChange={(val) => setFormData({ ...formData, classId: val })}>
                                                <SelectTrigger className="bg-gray-50/50 border-gray-200 h-11 focus:ring-purple-500">
                                                    <SelectValue placeholder="Select Class/Section" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map(c => (
                                                        <SelectItem key={c._id} value={c._id}>{c.class} - {c.section}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Row 2 */}
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Maturity / Due Date <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="dueDate"
                                                type="date"
                                                value={formData.dueDate}
                                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                                className="bg-gray-50/50 border-gray-200 h-11 focus:ring-purple-500"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Valuation Amount (₹) <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                min="0"
                                                placeholder="Enter monetary value"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                className="bg-gray-50/50 border-gray-200 h-11 focus:ring-purple-500 font-bold"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Payment Interval</Label>
                                            <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                                <SelectTrigger className="bg-gray-50/50 border-gray-200 h-11 focus:ring-purple-500">
                                                    <SelectValue placeholder="Select frequency" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="OneTime">Single Instance</SelectItem>
                                                    <SelectItem value="Monthly">Monthly Cycle</SelectItem>
                                                    <SelectItem value="Yearly">Annual Cycle</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Penalty Matrix */}
                                    <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100 flex flex-col md:flex-row items-center gap-8">
                                        <div className="flex items-center gap-4 min-w-[200px]">
                                            <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                                                <AlertCircle size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-rose-900 underline decoration-rose-200">Penalty configuration</h4>
                                                <p className="text-[10px] text-rose-500 uppercase font-black">Post-maturity logic</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest ml-1">Fine Classification</Label>
                                                <Select value={formData.fineType} onValueChange={(val) => setFormData({ ...formData, fineType: val })}>
                                                    <SelectTrigger className="bg-white border-rose-200 h-11 focus:ring-rose-500">
                                                        <SelectValue placeholder="Select Strategy" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">Zero Penalty</SelectItem>
                                                        <SelectItem value="fixed">Fixed Global Amount</SelectItem>
                                                        <SelectItem value="percentage">Relative Percentage</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {formData.fineType !== 'none' && (
                                                <div className="space-y-1.5 animate-in slide-in-from-left-4 duration-300">
                                                    <Label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest ml-1">Penalty Valuation</Label>
                                                    <Input
                                                        id="fineAmount"
                                                        type="number"
                                                        min="0"
                                                        value={formData.fineAmount}
                                                        onChange={(e) => setFormData({ ...formData, fineAmount: e.target.value })}
                                                        className="bg-white border-rose-200 h-11 focus:ring-rose-500 font-bold"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6 border-t border-gray-100">
                                        <Button
                                            type="submit"
                                            className="bg-purple-600 hover:bg-purple-700 h-12 px-12 shadow-xl shadow-purple-100 font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02]"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    Deploy Fee Master <Database size={18} />
                                                </div>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}

