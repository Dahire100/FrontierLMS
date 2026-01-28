"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, HandCoins, Home, Loader2, ReceiptIndianRupee, CheckCircle2, CreditCard } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import { StatusBadge } from "@/components/super-admin/status-badge"
import FormModal, { FormField } from "@/components/form-modal"

export default function PayrollPage() {
    const [staff, setStaff] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [searching, setSearching] = useState(false)
    const [role, setRole] = useState("all")
    const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }).toLowerCase())
    const [year, setYear] = useState(new Date().getFullYear().toString())

    const [payModalOpen, setPayModalOpen] = useState(false)
    const [selectedPayrollId, setSelectedPayrollId] = useState<string | null>(null)

    const handleSearch = async () => {
        setSearching(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/payroll?role=${role}&month=${month}&year=${year}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setStaff(data)
            }
        } catch (error) {
            toast.error("Failed to fetch payroll list")
        } finally {
            setSearching(false)
        }
    }

    const handleGenerate = async (staffId: string) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/payroll/generate`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ staffId, month, year })
            })

            if (response.ok) {
                toast.success("Payroll generated")
                handleSearch()
            } else {
                const err = await response.json()
                toast.error(err.error || "Generation failed")
            }
        } catch (error) {
            toast.error("An error occurred")
        }
    }

    const handlePay = async (data: any) => {
        if (!selectedPayrollId) return
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/payroll/${selectedPayrollId}/pay`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            })

            if (response.ok) {
                toast.success("Payment successful")
                setPayModalOpen(false)
                handleSearch()
            }
        } catch (error) {
            toast.error("Payment failed")
        }
    }

    const columns = [
        {
            key: "staffId",
            label: "ID",
            render: (v: string) => <span className="font-bold text-[10px] text-blue-600">{v}</span>
        },
        {
            key: "name",
            label: "NAME",
            render: (v: string) => <span className="font-bold text-gray-800 text-xs">{v}</span>
        },
        {
            key: "role",
            label: "ROLE",
            render: (v: string) => <span className="text-[9px] uppercase font-bold text-gray-400">{v}</span>
        },
        {
            key: "netSalary",
            label: "NET SALARY",
            render: (v: number) => <span className="font-bold text-gray-900 text-xs">₹{v.toLocaleString()}</span>
        },
        {
            key: "payrollStatus",
            label: "STATUS",
            render: (v: string) => <StatusBadge status={v === 'not_generated' ? 'Pending' : v.charAt(0).toUpperCase() + v.slice(1)} />
        },
    ]

    const payFields: FormField[] = [
        {
            name: "paymentMode",
            label: "Payment Mode",
            type: "select",
            required: true,
            options: [
                { label: "Cash", value: "cash" },
                { label: "Bank Transfer", value: "bank_transfer" },
                { label: "Cheque", value: "cheque" }
            ]
        },
        {
            name: "remarks",
            label: "Remarks",
            type: "textarea",
            required: false
        }
    ]

    return (
        <DashboardLayout title="Institutional Payroll Management">
            <div className="space-y-6 max-w-full pb-10">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-pink-500">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Staff Remuneration</h1>
                        <p className="text-xs text-gray-500 font-medium">Generate and manage monthly salary disbursements for all employees.</p>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1 border bg-gray-50 px-3 py-1.5 rounded-full">
                        <Home className="h-4 w-4" /> Human Resource <span className="mx-1 text-gray-300">/</span> <span className="text-pink-600 font-bold">Payroll</span>
                    </div>
                </div>

                <Card className="border-t-4 border-t-pink-500 shadow-sm overflow-hidden">
                    <CardHeader className="py-3 bg-gray-50/50 border-b">
                        <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-gray-600">
                            <Search className="h-4 w-4" /> Filter Disbursement Criteria
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid md:grid-cols-4 gap-6 items-end">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-gray-500 uppercase">Employment Role</Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="All Roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="teacher">Teacher</SelectItem>
                                        <SelectItem value="driver">Driver</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-gray-500 uppercase">Month <span className="text-red-500">*</span></Label>
                                <Select value={month} onValueChange={setMonth}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"].map(m => (
                                            <SelectItem key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-gray-500 uppercase">Year <span className="text-red-500">*</span></Label>
                                <Select value={year} onValueChange={setYear}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2024">2024</SelectItem>
                                        <SelectItem value="2025">2025</SelectItem>
                                        <SelectItem value="2026">2026</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={handleSearch}
                                className="bg-[#0b1c48] hover:bg-[#1a2d65] h-10 px-8 text-xs font-bold uppercase tracking-widest"
                                disabled={searching}
                            >
                                {searching ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Search className="h-4 w-4 mr-2" />}
                                Search Ledger
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {staff.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="text-sm font-bold flex items-center gap-2 text-gray-700 uppercase tracking-widest">
                                <ReceiptIndianRupee className="h-4 w-4 text-pink-500" />
                                Payroll Summary: {month.toUpperCase()} {year}
                            </h3>
                        </div>
                        <AdvancedTable
                            columns={columns}
                            data={staff}
                            headerClassName="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-widest h-12"
                            actions={[
                                {
                                    label: "Generate Payroll",
                                    onClick: (row) => handleGenerate(row._id),
                                    icon: <HandCoins className="h-4 w-4 mr-2" />,
                                    disabled: (row) => row.payrollStatus !== 'not_generated'
                                },
                                {
                                    label: "Record Payment",
                                    onClick: (row) => {
                                        setSelectedPayrollId(row.payrollId)
                                        setPayModalOpen(true)
                                    },
                                    icon: <CreditCard className="h-4 w-4 mr-2 text-green-600" />,
                                    disabled: (row) => row.payrollStatus !== 'generated'
                                }
                            ]}
                        />
                    </div>
                )}

                {staff.length === 0 && !searching && (
                    <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-20 flex flex-col items-center justify-center text-center">
                        <HandCoins size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest">No Selection</h3>
                        <p className="text-gray-400 text-sm max-w-xs mx-auto mt-2 font-medium">Please select criteria above to view or generate payroll for personnel.</p>
                    </div>
                )}

                <FormModal
                    isOpen={payModalOpen}
                    onClose={() => setPayModalOpen(false)}
                    title="Confirm Salary Payment"
                    description="Enter payment details to mark this payroll as disbursed."
                    fields={payFields}
                    onSubmit={handlePay}
                />
            </div>
        </DashboardLayout>
    )
}

