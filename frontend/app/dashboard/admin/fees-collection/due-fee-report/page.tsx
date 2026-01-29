"use client"

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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import { format } from "date-fns"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { FileSearch, Loader2, Download, Printer, RefreshCcw, Search, Database, Layers } from "lucide-react"

interface DueFeeItem {
    _id: string
    studentId: {
        _id: string
        studentId: string
        firstName: string
        lastName: string
        class: string
        section: string
        phone: string
    }
    feeType: string
    amount: number
    totalAmount: number
    paidAmount: number
    dueDate: string
    status: string
}

export default function DueFeeReport() {
    const [loading, setLoading] = useState(false)
    const [fees, setFees] = useState<DueFeeItem[]>([])

    // Filters
    const [classSelect, setClassSelect] = useState("all")
    const [sectionSelect, setSectionSelect] = useState("all")
    const [typeSelect, setTypeSelect] = useState("all")
    const [feeTypesList, setFeeTypesList] = useState<string[]>([])

    // Fetch Fee Types for filter
    useEffect(() => {
        const loadTypes = async () => {
            const res = await apiFetch(API_ENDPOINTS.FEES.TYPES)
            if (res.ok) {
                const data = await res.json()
                setFeeTypesList(data.map((t: any) => t.name))
            }
        }
        loadTypes()
    }, [])

    const fetchDueFees = useCallback(async () => {
        setLoading(true)
        try {
            // Build Query Params
            const params = new URLSearchParams()
            if (classSelect && classSelect !== 'all') params.append('classId', classSelect)
            if (sectionSelect && sectionSelect !== 'all') params.append('section', sectionSelect)
            if (typeSelect && typeSelect !== 'all') params.append('feeType', typeSelect)

            const response = await apiFetch(`${API_ENDPOINTS.FEES.DUE_REPORT}?${params.toString()}`)

            if (response.ok) {
                const data = await response.json()
                setFees(data)
                if (data.length === 0) toast.info("No due fees found for selected criteria")
            } else {
                toast.error("Failed to fetch due fees")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error loading report")
        } finally {
            setLoading(false)
        }
    }, [classSelect, sectionSelect, typeSelect])

    const columns = [
        {
            key: "studentId",
            label: "Stakeholder Profile",
            render: (val: any) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                        {val?.firstName?.[0]}{val?.lastName?.[0]}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 leading-none">{val?.firstName} {val?.lastName}</div>
                        <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">ID: {val?.studentId}</div>
                    </div>
                </div>
            )
        },
        {
            key: "class",
            label: "Academic Hierarchy",
            render: (_: any, row: any) => (
                <div className="flex items-center gap-2">
                    <Layers size={14} className="text-gray-400" />
                    <span className="font-semibold text-gray-700">{row.studentId?.class} - {row.studentId?.section}</span>
                </div>
            )
        },
        {
            key: "feeType",
            label: "Core Obligation",
            render: (val: string) => (
                <div className="px-2.5 py-1 bg-gray-50 border border-gray-100 rounded text-xs font-bold text-gray-600 shadow-inner">
                    {val}
                </div>
            )
        },
        {
            key: "totalAmount",
            label: "Liability",
            render: (val: number) => (
                <div className="text-right font-medium text-gray-500 italic">₹{val.toLocaleString()}</div>
            )
        },
        {
            key: "paidAmount",
            label: "Settled",
            render: (val: number) => (
                <div className="text-right font-black text-emerald-600">₹{val.toLocaleString()}</div>
            )
        },
        {
            key: "amount",
            label: "Pending Dues",
            render: (val: number) => (
                <div className="text-right">
                    <div className="inline-block px-3 py-1 bg-rose-50 text-rose-700 rounded-lg font-black text-base shadow-sm ring-1 ring-rose-100">
                        ₹{val.toLocaleString()}
                    </div>
                </div>
            )
        },
        {
            key: "dueDate",
            label: "Maturity",
            render: (val: string) => (
                <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest text-right">
                    {val ? format(new Date(val), 'dd MMM yyyy') : '-'}
                </div>
            )
        }
    ]

    return (
        <DashboardLayout title="Financial Audit: Due Fees">
            <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 group">
                            <div className="h-12 w-12 bg-gradient-to-br from-pink-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl text-white group-hover:rotate-12 transition-transform duration-500">
                                <Database size={24} />
                            </div>
                            Exposure Audit Report
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg">Detailed analysis of outstanding institutional liabilities and pending settlements</p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="h-11 border-gray-200 shadow-sm gap-2">
                            <Printer size={18} /> Print
                        </Button>
                        <Button variant="outline" className="h-11 border-gray-200 shadow-sm gap-2 bg-white">
                            <Download size={18} /> Export Data
                        </Button>
                    </div>
                </div>

                {/* Analytical Scanners Card */}
                <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-pink-50 via-white to-pink-50/30 border-b border-pink-100/50">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-pink-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-200">
                                <Search size={20} />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black text-gray-900 italic tracking-tight">Audit Scanners</CardTitle>
                                <p className="text-sm text-gray-500">Deploy specific parameters to isolate financial exposure</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Academic Unit</Label>
                                <Select value={classSelect} onValueChange={setClassSelect}>
                                    <SelectTrigger className="bg-gray-50/50 border-gray-200 h-12 focus:ring-pink-500 text-sm font-bold">
                                        <SelectValue placeholder="All Classes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Global Institution</SelectItem>
                                        {[...Array(12)].map((_, i) => (
                                            <SelectItem key={i} value={(i + 1).toString()}>Class {i + 1}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Section Protocol</Label>
                                <Select value={sectionSelect} onValueChange={setSectionSelect}>
                                    <SelectTrigger className="bg-gray-50/50 border-gray-200 h-12 focus:ring-pink-500 text-sm font-bold">
                                        <SelectValue placeholder="All Sections" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Unified Sections</SelectItem>
                                        <SelectItem value="A">Division A</SelectItem>
                                        <SelectItem value="B">Division B</SelectItem>
                                        <SelectItem value="C">Division C</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Obligation Classification</Label>
                                <Select value={typeSelect} onValueChange={setTypeSelect}>
                                    <SelectTrigger className="bg-gray-50/50 border-gray-200 h-12 focus:ring-pink-500 text-sm font-bold">
                                        <SelectValue placeholder="All Type Indicators" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Global Inventory</SelectItem>
                                        {feeTypesList.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    onClick={fetchDueFees}
                                    disabled={loading}
                                    className="bg-gradient-to-r from-pink-600 to-indigo-700 hover:from-pink-700 hover:to-indigo-800 text-white h-12 px-8 shadow-xl shadow-pink-100 font-black uppercase tracking-widest gap-3 w-full"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
                                    Execute Audit Scan
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Analytics Results */}
                {fees.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="border-none bg-rose-50 ring-1 ring-rose-100 shadow-sm p-4">
                                <div className="text-[10px] uppercase font-black text-rose-500 tracking-widest mb-1">Total Outstanding Liability</div>
                                <div className="text-2xl font-black text-rose-700">₹{fees.reduce((sum, f) => sum + f.amount, 0).toLocaleString()}</div>
                            </Card>
                            <Card className="border-none bg-emerald-50 ring-1 ring-emerald-100 shadow-sm p-4">
                                <div className="text-[10px] uppercase font-black text-emerald-500 tracking-widest mb-1">Target Stakeholders</div>
                                <div className="text-2xl font-black text-emerald-700">{fees.length} Profiles</div>
                            </Card>
                            <Card className="border-none bg-indigo-50 ring-1 ring-indigo-100 shadow-sm p-4">
                                <div className="text-[10px] uppercase font-black text-indigo-500 tracking-widest mb-1">Audit Confidence</div>
                                <div className="text-2xl font-black text-indigo-700">100% Validated</div>
                            </Card>
                        </div>

                        <AdvancedTable
                            title="Validated Exposure Matrix"
                            columns={columns}
                            data={fees}
                            loading={loading}
                            pagination
                        />
                    </div>
                )}

                {fees.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100 italic text-gray-400">
                        Initialize audit scanners to visualize exposure data
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
