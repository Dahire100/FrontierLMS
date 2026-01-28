"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Download, IndianRupee, Calendar, TrendingUp, Filter, Loader2, Sparkles, ReceiptText, ChevronRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Payroll {
    _id: string;
    month: string;
    year: number;
    basicSalary: number;
    totalEarnings: number;
    totalDeductions: number;
    netSalary: number;
    paymentStatus: string;
    paymentDate?: string;
}

export default function PayrollPage() {
    const [payrolls, setPayrolls] = useState<Payroll[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        fetchPayrolls()
    }, [])

    const fetchPayrolls = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/teacher/payroll`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setPayrolls(data.data)
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to load financial records", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const totalGross = payrolls.reduce((sum, p) => sum + p.totalEarnings, 0)
    const lastNet = payrolls.length > 0 ? payrolls[0].netSalary : 0
    const totalTax = payrolls.reduce((sum, p) => sum + p.totalDeductions, 0)

    if (loading) {
        return (
            <DashboardLayout title="Financial Registry">
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Compensation Ledger">
            <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight italic uppercase">Payroll Registry</h2>
                        <p className="text-muted-foreground font-medium italic">Audit-ready monthly compensation and benefit records.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="h-12 px-6 rounded-xl border-2 font-black uppercase tracking-widest text-[10px]">
                            <Filter className="w-4 h-4 mr-2" /> Annual Scope
                        </Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6 rounded-xl shadow-lg shadow-indigo-100 font-black uppercase tracking-widest text-[10px]"
                            onClick={() => toast({ title: "Analytics Generated", description: "Financial metrics have been updated." })}
                        >
                            Generate Analytics
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden group">
                        <CardContent className="p-8 flex items-center gap-6 relative z-10">
                            <div className="p-4 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
                                <IndianRupee className="w-8 h-8 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-4xl font-black">₹{totalGross.toLocaleString()}</h3>
                                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mt-1">Cumulative Gross (YTD)</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-xl shadow-indigo-100/30 ring-1 ring-gray-100 rounded-2xl p-8 flex items-center gap-6">
                        <div className="p-4 bg-emerald-50 rounded-2xl">
                            <TrendingUp className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-gray-900">₹{lastNet.toLocaleString()}</h3>
                            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mt-1">Net Yield (Last Cycle)</p>
                        </div>
                    </Card>
                    <Card className="border-none shadow-xl shadow-indigo-100/30 ring-1 ring-gray-100 rounded-2xl p-8 flex items-center gap-6">
                        <div className="p-4 bg-orange-50 rounded-2xl">
                            <ReceiptText className="w-8 h-8 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-gray-900">₹{totalTax.toLocaleString()}</h3>
                            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mt-1">Total Withholdings (YTD)</p>
                        </div>
                    </Card>
                </div>

                <Card className="border-none shadow-2xl shadow-indigo-100/30 ring-1 ring-gray-100 rounded-2xl overflow-hidden bg-white">
                    <CardHeader className="bg-white border-b py-8 px-8 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black tracking-tight text-gray-800 uppercase italic flex items-center gap-2">
                                <ReceiptText className="h-5 w-5 text-indigo-600" /> Remuneration History
                            </CardTitle>
                            <CardDescription className="italic font-medium text-gray-400">Chronological history of all generated institutional payslips.</CardDescription>
                        </div>
                        <Sparkles className="h-5 w-5 text-indigo-400 opacity-50" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b h-16">
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 pl-8">Voucher Identifier</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500">Fiscal Period</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500">Settlement Date</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500">Gross Vol</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500">Deductions</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500">Net Yield</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500">Registry Status</TableHead>
                                        <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-gray-500 pr-8">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payrolls.length > 0 ? payrolls.map((payroll, index) => (
                                        <TableRow key={payroll._id || index} className="group hover:bg-indigo-50/30 transition-all border-b border-gray-50">
                                            <TableCell className="pl-8 py-6 font-black text-gray-400 group-hover:text-indigo-600 text-[10px] uppercase tracking-widest">#{payroll._id ? payroll._id.slice(-8).toUpperCase() : 'PYRL-' + index}</TableCell>
                                            <TableCell className="font-black text-gray-900 italic uppercase">{payroll.month} {payroll.year}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-tight">
                                                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                                    {payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString() : 'Pending'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-emerald-600 font-black">₹{payroll.totalEarnings.toLocaleString()}</TableCell>
                                            <TableCell className="text-rose-500 font-black">-₹{payroll.totalDeductions.toLocaleString()}</TableCell>
                                            <TableCell className="font-black text-gray-900 text-lg tracking-tighter italic">₹{payroll.netSalary.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge className={`h-7 px-4 rounded-lg font-black uppercase text-[9px] border-none shadow-sm ${payroll.paymentStatus === 'Paid' ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
                                                    }`}>
                                                    {payroll.paymentStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 group-hover:border group-hover:border-indigo-100">
                                                    <Download className="w-4 h-4 mr-2" /> PDF Slip
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="p-20 text-center">
                                                <div className="space-y-4">
                                                    <div className="h-16 w-16 bg-gray-50 rounded-2xl mx-auto flex items-center justify-center opacity-50">
                                                        <ReceiptText className="h-8 w-8 text-gray-300" />
                                                    </div>
                                                    <p className="text-sm font-black text-gray-300 uppercase tracking-widest italic">No remuneration records found.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
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
