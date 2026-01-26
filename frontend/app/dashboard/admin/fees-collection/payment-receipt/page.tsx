"use client"

import { useState, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Printer, FileText, Download, List, Loader2, Receipt, Calendar, User, Database, RefreshCcw } from "lucide-react"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { format } from "date-fns"

interface PaymentReceipt {
    _id: string
    receiptNo: string
    studentId: {
        firstName: string
        lastName: string
        studentId: string
    }
    amount: number
    discount: number
    additionalDiscount: number
    lateFees: number
    status: string
    date: string
    collectedBy: string
    duration?: string
}

export default function PaymentReceipt() {
    const [searchTerm, setSearchTerm] = useState("")
    const [receipts, setReceipts] = useState<PaymentReceipt[]>([])
    const [loading, setLoading] = useState(false)
    const [receiptNo, setReceiptNo] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    const handleSearch = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (receiptNo) params.append('receiptNo', receiptNo)
            if (startDate) params.append('startDate', startDate)
            if (endDate) params.append('endDate', endDate)

            const response = await apiFetch(`${API_ENDPOINTS.FEES.COLLECT}?${params.toString()}`)
            if (response.ok) {
                const data = await response.json()
                setReceipts(Array.isArray(data) ? data : data.data || [])
                if (data.length === 0) toast.info("No payment receipts found")
            } else {
                toast.error("Failed to sync receipt data")
            }
        } catch (error) {
            toast.error("Network synchronization failure")
        } finally {
            setLoading(false)
        }
    }, [receiptNo, startDate, endDate])

    const columns = [
        {
            key: "receiptNo",
            label: "Fiscal ID",
            render: (val: string) => (
                <div className="font-mono text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 w-fit">
                    #{val}
                </div>
            )
        },
        {
            key: "studentId",
            label: "Stakeholder",
            render: (val: any) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shadow-md">
                        {val?.firstName?.[0]}{val?.lastName?.[0]}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 leading-tight">{val?.firstName} {val?.lastName}</div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">UID: {val?.studentId}</div>
                    </div>
                </div>
            )
        },
        {
            key: "amount",
            label: "Valuation",
            render: (val: number, row: any) => (
                <div className="text-right">
                    <div className="font-black text-indigo-700">₹{val?.toLocaleString()}</div>
                    <div className="text-[9px] text-emerald-500 font-bold uppercase tracking-tighter">Net Settlement</div>
                </div>
            )
        },
        {
            key: "adjustments",
            label: "Deductions",
            render: (_: any, row: any) => (
                <div className="text-right text-[10px]">
                    <div className="text-gray-400">Disc: <span className="font-bold text-emerald-600">₹{(row.discount || 0) + (row.additionalDiscount || 0)}</span></div>
                    <div className="text-gray-400">Late: <span className="font-bold text-rose-600">₹{row.lateFees || 0}</span></div>
                </div>
            )
        },
        {
            key: "status",
            label: "Protocol Status",
            render: (val: string) => (
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-widest">
                    {val || 'Validated'}
                </span>
            )
        },
        {
            key: "date",
            label: "Maturity",
            render: (val: string) => (
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1.5">
                    <Calendar size={12} className="text-gray-300" /> {val ? format(new Date(val), 'dd MMM yyyy') : '-'}
                </div>
            )
        },
        {
            key: "collectedBy",
            label: "Auditor",
            render: (val: string) => (
                <div className="flex items-center gap-2 text-[10px] font-medium text-gray-500 italic">
                    <User size={12} className="text-gray-300" /> {val || 'System Admin'}
                </div>
            )
        },
        {
            key: "actions",
            label: "Control",
            render: () => (
                <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 text-indigo-600 border-indigo-100 hover:bg-indigo-50 rounded-lg">
                        <Printer size={14} />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-gray-400 border-gray-100 hover:bg-gray-50 rounded-lg">
                        <Download size={14} />
                    </Button>
                </div>
            )
        }
    ]

    const filteredReceipts = receipts.filter(receipt =>
        searchTerm === "" ||
        receipt.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${receipt.studentId.firstName} ${receipt.studentId.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout title="Universal Audit: Payment Receipts">
            <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <div className="h-12 w-12 bg-gradient-to-br from-indigo-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl text-white">
                                <Receipt size={24} />
                            </div>
                            Fiscal Receipt Archive
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg italic font-medium">Validated repository of all digital and physical settlement proofs</p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 transition-all hover:bg-gray-50">
                            <Download size={18} /> Master Export
                        </Button>
                    </div>
                </div>

                {/* Analytical Scanners Card */}
                <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden rounded-[2rem] bg-white">
                    <CardHeader className="bg-gradient-to-r from-indigo-50/50 via-white to-transparent border-b border-gray-100/50 p-8">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                                <Search size={24} />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black text-indigo-900 uppercase tracking-tight">Audit Scanners</CardTitle>
                                <p className="text-xs text-indigo-400 font-bold uppercase tracking-[0.2em] mt-0.5">Archive Segment selection protocol</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Receipt ID</Label>
                                <Input
                                    id="receiptNo"
                                    value={receiptNo}
                                    onChange={(e) => setReceiptNo(e.target.value)}
                                    placeholder="Enter Fiscal # Ref"
                                    className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-indigo-500 font-bold placeholder:font-normal"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Inception Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" />
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 pl-12 rounded-2xl focus:ring-indigo-500 font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Termination Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" />
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 pl-12 rounded-2xl focus:ring-indigo-500 font-bold"
                                    />
                                </div>
                            </div>
                            <div className="flex items-end">
                                <Button
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white h-14 rounded-2xl shadow-xl shadow-indigo-100 font-black text-xs uppercase tracking-[0.2em] gap-3 transition-all hover:scale-[1.02]"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
                                    Execute Audit Scan
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Registry Results */}
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                                className="pl-14 h-16 bg-white border-none ring-1 ring-gray-100 shadow-xl rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500/20 text-lg font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Refine results by stakeholder name or receipt index..."
                            />
                        </div>
                        <Button variant="outline" size="sm" onClick={handleSearch} className="gap-2 border-gray-100 hover:bg-white shadow-lg h-16 px-10 rounded-[1.5rem] font-black uppercase tracking-widest text-xs bg-white text-gray-500 group">
                            <RefreshCcw size={18} className={`group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} /> Sync Registry
                        </Button>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <AdvancedTable
                            title="Validated Fiscal Matrix"
                            columns={columns}
                            data={filteredReceipts}
                            loading={loading}
                            pagination
                        />
                    </div>

                    {filteredReceipts.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                            <div className="h-28 w-28 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-white">
                                <FileText size={48} className="text-indigo-200" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Audit Trail Empty</h3>
                            <p className="text-gray-400 max-w-sm text-center mt-3 text-sm italic font-medium leading-relaxed">Initialize the analytical scanners to visualize payment proofs stored in the institutional ledger.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
