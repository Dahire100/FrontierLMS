"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Receipt, CreditCard, Download, Clock, AlertCircle, CheckCircle, FileText } from "lucide-react"
import { toast } from "sonner"

export default function StudentFees() {
    const [activeTab, setActiveTab] = useState("pending")
    const [fees, setFees] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFees = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`${API_URL}/api/student/fees`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await res.json()
                if (data.success) {
                    setFees(data.data.fees)
                }
            } catch (error) {
                console.error("Failed to fetch fees", error)
                toast.error("Failed to load fees")
            } finally {
                setLoading(false)
            }
        }
        fetchFees()
    }, [])

    const pendingFees = fees.filter(f => f.status === 'pending' || f.status === 'partial' || f.status === 'overdue').map(f => ({
        id: f._id,
        title: f.title || "Tuition Fee", // Fallback title
        amount: f.amount - f.paidAmount,
        dueDate: f.dueDate,
        status: new Date(f.dueDate) < new Date() ? "Overdue" : "Pending",
        invoice: f.invoiceNumber || "INV-MISSING"
    }))

    const paidFees = fees.filter(f => f.status === 'paid').map(f => ({
        id: f._id,
        title: f.title || "Tuition Fee",
        amount: f.paidAmount,
        date: f.updatedAt,
        method: f.paymentMethod || "Online",
        receipt: f.receiptNumber || "RCP-MISSING"
    }))

    const handlePayNow = (amount: number, feeTitle: string) => {
        toast.success("Payment Initiated", { description: `Redirecting to payment gateway for ${feeTitle} (₹${amount})...` })
    }

    const generateReceipt = (fee: any) => {
        const receiptWindow = window.open('', '_blank', 'width=800,height=600');
        if (receiptWindow) {
            receiptWindow.document.write(`
                <html>
                <head>
                    <title>Payment Receipt - ${fee.receipt}</title>
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
                        .receipt-container { max-width: 700px; margin: 0 auto; border: 1px solid #ddd; padding: 40px; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
                        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                        .school-name { font-size: 24px; font-weight: bold; color: #2563eb; letter-spacing: 1px; text-transform: uppercase; margin: 0; }
                        .school-address { font-size: 13px; color: #666; margin-top: 5px; }
                        
                        .receipt-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
                        .info-group h4 { margin: 0 0 5px 0; font-size: 12px; color: #888; text-transform: uppercase; }
                        .info-group p { margin: 0; font-size: 15px; font-weight: 600; }
                        
                        .student-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e2e8f0; }
                        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                        .detail-row:last-child { margin-bottom: 0; }
                        .detail-label { color: #64748b; font-size: 14px; }
                        .detail-value { font-weight: 500; font-size: 14px; }
                        
                        .fee-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        .fee-table th { text-align: left; padding: 12px 0; border-bottom: 2px solid #eee; color: #64748b; font-size: 13px; text-transform: uppercase; }
                        .fee-table td { padding: 16px 0; border-bottom: 1px solid #eee; }
                        .amount-col { text-align: right; }
                        
                        .total-section { display: flex; justify-content: flex-end; margin-top: 10px; }
                        .total-box { text-align: right; width: 250px; }
                        .total-label { font-size: 14px; color: #64748b; }
                        .total-amount { font-size: 28px; font-weight: bold; color: #0f172a; margin-top: 5px; }
                        
                        .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #eee; padding-top: 20px; }
                        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
                        .paid { background: #dcfce7; color: #166534; }
                        
                        @media print {
                           body { padding: 0; }
                           .receipt-container { box-shadow: none; border: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt-container">
                        <div class="header">
                            <h1 class="school-name">Silver Oak International School</h1>
                            <p class="school-address">123 Education Lane, Knowledge Park, City - 400001</p>
                        </div>
                        
                        <div class="receipt-info">
                            <div class="info-group">
                                <h4>Receipt No</h4>
                                <p>${fee.receipt}</p>
                            </div>
                            <div class="info-group" style="text-align: center">
                                <h4>Date</h4>
                                <p>${new Date(fee.date).toLocaleDateString()}</p>
                            </div>
                             <div class="info-group" style="text-align: right">
                                <h4>Status</h4>
                                <span class="badge paid">PAID</span>
                            </div>
                        </div>
                        
                        <div class="student-details">
                            <div class="detail-row">
                                <span class="detail-label">Student Name</span>
                                <span class="detail-value">John Student</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Roll Number</span>
                                <span class="detail-value">2024001</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Class</span>
                                <span class="detail-value">10-A</span>
                            </div>
                             <div class="detail-row">
                                <span class="detail-label">Payment Mode</span>
                                <span class="detail-value">${fee.method}</span>
                            </div>
                        </div>
                        
                        <table class="fee-table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th class="amount-col">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div style="font-weight: 600; color: #333;">${fee.title}</div>
                                        <div style="font-size: 12px; color: #888; margin-top: 4px;">Tuition and associated academic fees</div>
                                    </td>
                                    <td class="amount-col" style="font-weight: 600;">₹${fee.amount.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <div class="total-section">
                            <div class="total-box">
                                <div class="total-label">Total Amount Paid</div>
                                <div class="total-amount">₹${fee.amount.toLocaleString()}</div>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>This is a computer-generated receipt and does not require a physical signature.</p>
                            <p>Generated on ${new Date().toLocaleString()}</p>
                        </div>
                    </div>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
                </html>
            `);
            receiptWindow.document.close();
        } else {
            toast.error("Popup blocked. Please allow popups to download receipt.");
        }
    }

    return (
        <DashboardLayout title="Fees & Payments">
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                        Fees & Payments
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Manage your fee payments and view transaction history
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Summary Cards */}
                    <Card className="lg:col-span-3 border-none shadow-sm bg-gradient-to-r from-red-50 to-orange-50">
                        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-100 rounded-full text-red-600">
                                    <AlertCircle className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-red-900">Total Pending Dues</h3>
                                    <p className="text-sm text-red-700">Accumulated dues for current session</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-red-600">₹{pendingFees.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</span>
                                {pendingFees.some(f => f.status === "Overdue") && (
                                    <p className="text-xs font-semibold text-red-600 mt-1 animate-pulse">⚠️ Includes overdue payments</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <Card className="border-none shadow-md">
                            <CardHeader>
                                <CardTitle>Fee Details</CardTitle>
                                <CardDescription>View pending dues and payment history</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 mb-4">
                                        <TabsTrigger value="pending">Pending Dues</TabsTrigger>
                                        <TabsTrigger value="history">Payment History</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="pending" className="space-y-4">
                                        {pendingFees.map((fee) => (
                                            <div key={fee.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-xl bg-white hover:shadow-sm transition-all gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="mt-1">
                                                        <Receipt className="h-5 w-5 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{fee.title}</h4>
                                                        <p className="text-sm text-gray-500">Invoice: {fee.invoice}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Badge variant={fee.status === "Overdue" ? "destructive" : "secondary"}>
                                                                {fee.status}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Clock className="h-3 w-3" /> Due {new Date(fee.dueDate).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                                                    <span className="text-xl font-bold">₹{fee.amount.toLocaleString()}</span>
                                                    <Button size="sm" className="w-full md:w-auto bg-green-600 hover:bg-green-700" onClick={() => handlePayNow(fee.amount, fee.title)}>
                                                        Pay Now
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </TabsContent>

                                    <TabsContent value="history" className="space-y-4">
                                        <div className="rounded-md border">
                                            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase">
                                                <div className="col-span-4">Fee Description</div>
                                                <div className="col-span-3">Payment Date</div>
                                                <div className="col-span-2">Mode</div>
                                                <div className="col-span-3 text-right">Amount</div>
                                            </div>
                                            <div className="divide-y relative">
                                                {paidFees.map((fee) => (
                                                    <div key={fee.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors bg-white">
                                                        <div className="col-span-4">
                                                            <p className="font-medium text-sm text-gray-900">{fee.title}</p>
                                                            <p className="text-xs text-gray-500">{fee.receipt}</p>
                                                        </div>
                                                        <div className="col-span-3 text-sm text-gray-600">
                                                            {new Date(fee.date).toLocaleDateString()}
                                                        </div>
                                                        <div className="col-span-2">
                                                            <Badge variant="outline" className="text-xs">{fee.method}</Badge>
                                                        </div>
                                                        <div className="col-span-3 text-right flex flex-col items-end gap-1">
                                                            <span className="font-bold text-sm">₹{fee.amount.toLocaleString()}</span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-xs text-blue-600 flex items-center gap-1 hover:underline h-auto p-0 hover:bg-transparent"
                                                                onClick={() => generateReceipt(fee)}
                                                            >
                                                                <Download className="h-3 w-3" /> Receipt
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <Card className="bg-blue-50 border-blue-100">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-700">
                                    <CreditCard className="h-5 w-5" /> Bank Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-blue-900">
                                <div className="flex justify-between">
                                    <span className="opacity-70">Bank Name</span>
                                    <span className="font-medium">HDFC Bank</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="opacity-70">Account Name</span>
                                    <span className="font-medium">School ERP Trust</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="opacity-70">Account No</span>
                                    <span className="font-medium">XXXX-8821</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="opacity-70">IFSC Code</span>
                                    <span className="font-medium">HDFC0001234</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
