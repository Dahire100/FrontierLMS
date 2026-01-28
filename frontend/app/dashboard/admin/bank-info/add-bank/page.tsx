"use client"

import { useState } from "react"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Banknote } from "lucide-react"
import { toast } from "sonner"

export default function AddBank() {
    const [form, setForm] = useState({
        bankName: "",
        accountName: "",
        accountNumber: "",
        ifsc: "",
        branch: "",
        notes: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.bankName || !form.accountName || !form.accountNumber || !form.ifsc) {
            toast.error("Bank name, account name, account number, and IFSC are required")
            return
        }

        try {
            const response = await apiFetch(API_ENDPOINTS.BANK_ACCOUNTS, {
                method: 'POST',
                body: JSON.stringify({
                    bankName: form.bankName,
                    accountName: form.accountName,
                    accountNumber: form.accountNumber,
                    ifscCode: form.ifsc,
                    branchName: form.branch,
                    notes: form.notes
                })
            })

            if (response.ok) {
                toast.success("Bank account saved successfully")
                setForm({ bankName: "", accountName: "", accountNumber: "", ifsc: "", branch: "", notes: "" })
            } else {
                const err = await response.json()
                toast.error(err.message || "Failed to save bank account")
            }
        } catch (error) {
            toast.error("Connection error")
        }
    }

    return (
        <DashboardLayout title="Add Bank">
            <div className="space-y-6">
                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <Banknote className="h-5 w-5" />
                            Bank Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-red-500">Bank Name *</Label>
                                <Input
                                    value={form.bankName}
                                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                                    placeholder="Bank name"
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-500">Account Name *</Label>
                                <Input
                                    value={form.accountName}
                                    onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                                    placeholder="Account holder name"
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-500">Account Number *</Label>
                                <Input
                                    value={form.accountNumber}
                                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                                    placeholder="Account number"
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-500">IFSC *</Label>
                                <Input
                                    value={form.ifsc}
                                    onChange={(e) => setForm({ ...form, ifsc: e.target.value })}
                                    placeholder="IFSC code"
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Branch</Label>
                                <Input
                                    value={form.branch}
                                    onChange={(e) => setForm({ ...form, branch: e.target.value })}
                                    placeholder="Branch name"
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label>Notes</Label>
                                <Textarea
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    rows={3}
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-end">
                                <Button type="submit" className="bg-blue-900 hover:bg-blue-800 px-8">
                                    Save Bank
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

