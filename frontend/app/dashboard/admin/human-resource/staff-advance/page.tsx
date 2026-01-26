"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Edit2, Users, Calendar, Home, Loader2, IndianRupee, HandCoins } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import { StatusBadge } from "@/components/super-admin/status-badge"

export default function StaffAdvancePage() {
    const [advances, setAdvances] = useState<any[]>([])
    const [staffList, setStaffList] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        staffId: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        settlementMonth: "",
        note: ""
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const [advRes, staffRes] = await Promise.all([
                fetch(`${API_URL}/api/hr-module/advances`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/api/staff`, { headers: { 'Authorization': `Bearer ${token}` } })
            ])

            if (advRes.ok) setAdvances(await advRes.json())
            if (staffRes.ok) {
                const data = await staffRes.json()
                setStaffList(data.staff || data || [])
            }
        } catch (error) {
            toast.error("Failed to load advance data")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/hr-module/advances`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                toast.success("Advance recorded successfully")
                setFormData({
                    staffId: "",
                    amount: "",
                    date: new Date().toISOString().split('T')[0],
                    settlementMonth: "",
                    note: ""
                })
                fetchData()
            }
        } catch (error) {
            toast.error("Failed to save advance")
        } finally {
            setSubmitting(false)
        }
    }

    const columns = [
        {
            key: "staffId",
            label: "STAFF",
            render: (v: any) => v ? <span className="font-bold text-gray-800 text-xs">{v.firstName} {v.lastName}</span> : '-'
        },
        {
            key: "date",
            label: "DATE",
            render: (v: string) => <span className="text-xs text-gray-500">{new Date(v).toLocaleDateString()}</span>
        },
        {
            key: "amount",
            label: "AMOUNT",
            render: (v: number) => <span className="font-bold text-blue-600 text-xs">₹{v.toLocaleString()}</span>
        },
        {
            key: "settlementMonth",
            label: "SETTLEMENT",
            render: (v: string) => <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{v || 'N/A'}</span>
        },
        {
            key: "status",
            label: "STATUS",
            render: (v: string) => <StatusBadge status={v ? v.charAt(0).toUpperCase() + v.slice(1) : 'Active'} />
        }
    ]

    return (
        <DashboardLayout title="Staff Financial Advance">
            <div className="space-y-6 max-w-full pb-10">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-pink-500">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Staff Advance Ledger</h1>
                        <p className="text-xs text-gray-500 font-medium">Record and track salary advances and short-term institutional loans.</p>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1 border bg-gray-50 px-3 py-1.5 rounded-full">
                        <Home className="h-4 w-4" /> Human Resource <span className="mx-1 text-gray-300">/</span> <span className="text-pink-600 font-bold">Staff Advance</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-6">
                    {/* Form */}
                    <div className="lg:col-span-4 xl:col-span-3">
                        <Card className="border-t-4 border-t-[#0b1c48] shadow-sm sticky top-6">
                            <CardHeader className="py-4 bg-gray-50/50 border-b">
                                <CardTitle className="text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest text-gray-600">
                                    <HandCoins className="h-4 w-4 text-emerald-600" /> Disburse Advance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-500 uppercase">Select Staff <span className="text-red-500">*</span></Label>
                                        <Select value={formData.staffId} onValueChange={v => setFormData({ ...formData, staffId: v })}>
                                            <SelectTrigger className="h-9 text-xs">
                                                <SelectValue placeholder="Select Personnel" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {staffList.map(s => (
                                                    <SelectItem key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.staffId})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-500 uppercase">Amount (₹) <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <Input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="h-9 text-xs pl-8" placeholder="0.00" required />
                                            <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-gray-500 uppercase">Request Date</Label>
                                            <Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="h-9 text-xs" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-gray-500 uppercase">Settlement Month</Label>
                                            <Input type="month" value={formData.settlementMonth} onChange={e => setFormData({ ...formData, settlementMonth: e.target.value })} className="h-9 text-xs" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-500 uppercase">Internal Note</Label>
                                        <Textarea value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} className="min-h-[70px] text-xs resize-none" placeholder="Reason for advance..." />
                                    </div>
                                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold uppercase text-[10px] tracking-widest h-10 shadow-lg shadow-emerald-50" disabled={submitting}>
                                        {submitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Edit2 className="h-4 w-4 mr-2" />}
                                        Record Disbursal
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Table */}
                    <div className="lg:col-span-8 xl:col-span-9">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden h-full">
                            <div className="p-4 border-b bg-white flex items-center justify-between">
                                <h3 className="text-sm font-bold flex items-center gap-2 text-gray-700 uppercase tracking-widest">
                                    <Users className="h-4 w-4 text-pink-500" />
                                    Advance History
                                </h3>
                                <div className="text-[10px] font-bold text-gray-400 uppercase">
                                    Total: {advances.length} Records
                                </div>
                            </div>
                            <AdvancedTable
                                columns={columns}
                                data={advances}
                                loading={loading}
                                searchable={true}
                                headerClassName="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-widest h-12"
                                emptyMessage={
                                    <div className="p-10 text-center space-y-2">
                                        <HandCoins className="h-10 w-10 mx-auto text-gray-200" />
                                        <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">No advance records</p>
                                    </div>
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

