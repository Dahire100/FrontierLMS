"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Loader2, ArrowLeft, Receipt, Calendar } from "lucide-react"
import { toast } from "sonner"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import { format } from "date-fns"

interface StudentInfo {
    name: string
    admissionNo: string
    class: string
    fatherName: string
    phone: string
}

interface DueFee {
    masterId: string
    feeGroup: string
    feeType: string
    feeCode: string
    totalAmount: number
    paidAmount: number
    balance: number
    dueDate: string
    status: 'Paid' | 'Due'
}

export default function StudentFeeCollection() {
    const params = useParams()
    const router = useRouter()
    const studentId = params.studentId as string

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [student, setStudent] = useState<StudentInfo | null>(null)
    const [dueFees, setDueFees] = useState<DueFee[]>([])

    // Payment Form State
    const [selectedFees, setSelectedFees] = useState<Set<string>>(new Set())
    const [paymentMode, setPaymentMode] = useState("Cash")
    const [remarks, setRemarks] = useState("")
    const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'))

    const fetchData = useCallback(async () => {
        try {
            const res = await apiFetch(`${API_ENDPOINTS.FEES.COLLECT}/${studentId}`)
            if (!res.ok) throw new Error("Failed to load data")
            const data = await res.json()
            setStudent(data.student)
            setDueFees(data.dueFees)
        } catch (err) {
            toast.error("Failed to fetch student fees")
        } finally {
            setLoading(false)
        }
    }, [studentId])

    useEffect(() => {
        if (studentId) fetchData()
    }, [fetchData, studentId])

    const handleToggleFee = (masterId: string) => {
        const newSelected = new Set(selectedFees)
        if (newSelected.has(masterId)) {
            newSelected.delete(masterId)
        } else {
            newSelected.add(masterId)
        }
        setSelectedFees(newSelected)
    }

    const calculateTotal = () => {
        let total = 0
        dueFees.forEach(fee => {
            if (selectedFees.has(fee.masterId)) {
                total += fee.balance
            }
        })
        return total
    }

    const handleCollect = async () => {
        if (selectedFees.size === 0) {
            toast.error("Please select at least one fee to collect")
            return
        }

        setSubmitting(true)
        try {
            const feesToPay = dueFees
                .filter(f => selectedFees.has(f.masterId))
                .map(f => ({
                    masterId: f.masterId,
                    feeType: f.feeType,
                    amount: f.balance, // Paying full balance for now
                    // discount: 0,
                    // fine: 0
                }))

            const payload = {
                studentId,
                fees: feesToPay,
                paymentMode,
                remarks,
                paidDate: paymentDate
            }

            const res = await apiFetch(API_ENDPOINTS.FEES.COLLECT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                toast.success("Fees collected successfully!")
                setSelectedFees(new Set())
                fetchData() // Refresh data
            } else {
                toast.error("Failed to collect fees")
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>

    return (
        <DashboardLayout title="Collect Fee">
            <div className="max-w-7xl mx-auto space-y-6">
                <Button variant="ghost" onClick={() => router.back()} className="mb-2">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
                </Button>

                {/* Student Info Card */}
                {student && (
                    <Card className="border-t-4 border-t-blue-600 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-gray-800">Student Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Name</p>
                                    <p className="font-semibold text-blue-900">{student.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Admission No</p>
                                    <p className="font-semibold">{student.admissionNo}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Class</p>
                                    <p className="font-semibold">{student.class}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Father Name</p>
                                    <p className="font-semibold">{student.fatherName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Phone</p>
                                    <p className="font-semibold">{student.phone}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Fee List */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gray-50 border-b">
                                <CardTitle className="text-md flex items-center justify-between">
                                    <span>Applicable Fees</span>
                                    <span className="text-xs font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        Session 2025-26
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50">
                                            <TableHead className="w-10 text-center">
                                                <Checkbox
                                                    checked={dueFees.length > 0 && dueFees.every(f => f.status === 'Paid' || selectedFees.has(f.masterId))}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            const ids = dueFees.filter(f => f.status === 'Due').map(f => f.masterId)
                                                            setSelectedFees(new Set(ids))
                                                        } else {
                                                            setSelectedFees(new Set())
                                                        }
                                                    }}
                                                />
                                            </TableHead>
                                            <TableHead>Fee Group / Type</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead className="text-right">Status</TableHead>
                                            <TableHead className="text-right">Amount (₹)</TableHead>
                                            <TableHead className="text-right">Paid (₹)</TableHead>
                                            <TableHead className="text-right">Balance (₹)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dueFees.map((fee) => (
                                            <TableRow key={fee.masterId} className={fee.balance > 0 ? "bg-white" : "bg-green-50/30"}>
                                                <TableCell className="text-center">
                                                    {fee.status === 'Due' ? (
                                                        <Checkbox
                                                            checked={selectedFees.has(fee.masterId)}
                                                            onCheckedChange={() => handleToggleFee(fee.masterId)}
                                                        />
                                                    ) : (
                                                        <span className="text-green-600">✓</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-gray-900">{fee.feeGroup}</div>
                                                    <div className="text-xs text-gray-500">{fee.feeType} ({fee.feeCode})</div>
                                                </TableCell>
                                                <TableCell className="text-xs text-gray-600">
                                                    {fee.dueDate ? format(new Date(fee.dueDate), 'dd MMM yyyy') : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${fee.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {fee.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">{fee.totalAmount}</TableCell>
                                                <TableCell className="text-right text-gray-600">{fee.paidAmount}</TableCell>
                                                <TableCell className="text-right font-bold text-gray-900">
                                                    {fee.balance > 0 ? fee.balance : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payment Panel */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6 shadow-md border-t-4 border-t-green-600">
                            <CardHeader className="bg-green-50 border-b border-green-100">
                                <CardTitle className="flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-green-700" />
                                    Collect Payment
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Selected Fees:</span>
                                        <span className="font-semibold">{selectedFees.size}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span>Total Payable:</span>
                                        <span className="text-green-700">₹{calculateTotal()}</span>
                                    </div>
                                </div>

                                <div className="border-t pt-4 space-y-4">
                                    <div className="space-y-2">
                                        <Label>Payment Date</Label>
                                        <div className="relative">
                                            <Input
                                                type="date"
                                                value={paymentDate}
                                                onChange={(e) => setPaymentDate(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Payment Mode</Label>
                                        <Select value={paymentMode} onValueChange={setPaymentMode}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Cash">Cash</SelectItem>
                                                <SelectItem value="Cheque">Cheque</SelectItem>
                                                <SelectItem value="DD">Demand Draft</SelectItem>
                                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="UPI">UPI</SelectItem>
                                                <SelectItem value="Card">Card</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Note / Remarks</Label>
                                        <Textarea
                                            placeholder="Transaction ID / Cheque No / Remarks..."
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            rows={2}
                                        />
                                    </div>

                                    <Button
                                        className="w-full bg-green-700 hover:bg-green-800 text-lg py-6"
                                        disabled={submitting || selectedFees.size === 0}
                                        onClick={handleCollect}
                                    >
                                        {submitting ? <Loader2 className="animate-spin mr-2" /> : "Pay Now"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
