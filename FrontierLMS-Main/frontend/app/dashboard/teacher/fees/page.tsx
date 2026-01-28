"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IndianRupee, CreditCard, Receipt, Search, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function TeacherFeesPage() {
    const { toast } = useToast()
    const [selectedClass, setSelectedClass] = useState("10-A")
    const [feeRecords, setFeeRecords] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Fetch Fees
    const fetchFees = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }
            const res = await fetch(`${API_URL}/api/teacher/fees?classId=${selectedClass}`, { headers })
            const data = await res.json()
            if (data.success) {
                setFeeRecords(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch fees", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFees()
    }, [selectedClass])

    const totalDue = feeRecords.filter((r: any) => r.status === 'Due' || r.paymentStatus === 'Pending').length
    const totalPaid = feeRecords.filter((r: any) => r.status === 'Paid' || r.paymentStatus === 'Paid').length

    const handleRemind = async (studentName: string) => {
        // In real implementation you might need student ID
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/teacher/fees/remind`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ studentName })
            })
            const data = await res.json()
            if (data.success) {
                toast({
                    title: "Reminder Sent",
                    description: `A fee reminder has been sent to ${studentName}.`,
                })
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to send reminder", variant: "destructive" })
        }
    }

    const handleExport = () => {
        toast({
            title: "Export Started",
            description: "Fee report is being downloaded.",
        })
    }

    const handleReceipt = (id: string) => {
        toast({
            title: "Receipt Generated",
            description: `Receipt #${id} opened.`,
        })
    }

    return (
        <DashboardLayout title="Fee Collection">
            <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Fee Collection</h1>
                        <p className="text-gray-500 mt-1">Monitor fee status and collection history for your classes.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Select Class" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10-A">Class 10-A</SelectItem>
                                <SelectItem value="10-B">Class 10-B</SelectItem>
                                <SelectItem value="9-A">Class 9-A</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={handleExport}><Download className="w-4 h-4 mr-2" /> Export Report</Button>
                    </div>
                </div>

                {/* Financial Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-indigo-100 font-medium text-sm">Total Expected (Monthly)</p>
                                    <h3 className="text-3xl font-bold mt-2">₹2,000</h3>
                                </div>
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <IndianRupee className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-indigo-100 text-xs">
                                <span className="bg-white/20 px-2 py-0.5 rounded">Oct 2023</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 font-medium text-sm">Students Paid</p>
                                    <h3 className="text-3xl font-bold text-green-600 mt-2">{totalPaid} <span className="text-sm text-gray-400 font-normal">/ {feeRecords.length}</span></h3>
                                </div>
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <CreditCard className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                            <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{ width: `${(totalPaid / feeRecords.length) * 100}%` }}></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 font-medium text-sm">Payment Due</p>
                                    <h3 className="text-3xl font-bold text-red-600 mt-2">{totalDue}</h3>
                                </div>
                                <div className="p-2 bg-red-50 rounded-lg">
                                    <Receipt className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-red-500 font-medium">Action Required: Send Reminders</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Student Fee List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Student Fee Records</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input placeholder="Search student..." className="pl-9 h-9" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead>Invoice ID</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Roll No</TableHead>
                                    <TableHead>Payment Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {feeRecords.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center">No records found</TableCell></TableRow> : feeRecords.map((record: any) => (
                                    <TableRow key={record._id || record.id}>
                                        <TableCell className="font-mono text-xs">{record.invoiceId || 'INV-XXX'}</TableCell>
                                        <TableCell className="font-medium">{record.studentId?.firstName ? `${record.studentId.firstName} ${record.studentId.lastName}` : (record.name || 'Student')}</TableCell>
                                        <TableCell>{record.studentId?.rollNumber || record.roll}</TableCell>
                                        <TableCell>{record.date ? new Date(record.date).toLocaleDateString() : '-'}</TableCell>
                                        <TableCell className="font-semibold">{record.amount}</TableCell>
                                        <TableCell>
                                            {(record.status === 'Paid' || record.paymentStatus === 'Paid') && <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Paid</Badge>}
                                            {(record.status === 'Due' || record.paymentStatus === 'Pending') && <Badge className="bg-red-100 text-red-700 hover:bg-red-200">Due</Badge>}
                                            {(record.status === 'Partial') && <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Partial</Badge>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {record.status === 'Due' || record.paymentStatus === 'Pending' ? (
                                                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleRemind(record.name || record.studentId?.firstName)}>Remind</Button>
                                            ) : (
                                                <Button size="sm" variant="ghost" onClick={() => handleReceipt(record.invoiceId)}>Receipt</Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
