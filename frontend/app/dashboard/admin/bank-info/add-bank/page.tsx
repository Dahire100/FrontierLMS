"use client"

import { useState, useEffect, Suspense } from "react"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Banknote, Pencil, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"

function AddBankContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const editId = searchParams?.get("id")

    const [form, setForm] = useState({
        bankName: "",
        accountName: "",
        accountNumber: "",
        ifsc: "",
        branch: "",
        openingBalance: "",
        notes: ""
    })
    const [existingBanks, setExistingBanks] = useState<any[]>([])

    useEffect(() => {
        fetchBanks()
        if (editId) {
            fetchBankDetails(editId)
        }
    }, [editId])

    const fetchBanks = async () => {
        try {
            const res = await apiFetch(API_ENDPOINTS.BANK_ACCOUNTS)
            if (res.ok) {
                const data = await res.json()
                setExistingBanks(data.accounts || [])
            }
        } catch (error) {
            console.error(error)
        }
    }

    const fetchBankDetails = async (id: string) => {
        try {
            const res = await apiFetch(`${API_ENDPOINTS.BANK_ACCOUNTS}/${id}`)
            if (res.ok) {
                const data = await res.json()
                setForm({
                    bankName: data.bankName,
                    accountName: data.accountName,
                    accountNumber: data.accountNumber,
                    ifsc: data.ifscCode,
                    branch: data.branchName,
                    openingBalance: data.openingBalance?.toString() || "",
                    notes: data.notes || ""
                })
            }
        } catch (error) {
            toast.error("Failed to fetch details")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.bankName || !form.accountName || !form.accountNumber || !form.ifsc) {
            toast.error("Required fields missing")
            return
        }

        try {
            const url = editId
                ? `${API_ENDPOINTS.BANK_ACCOUNTS}/${editId}`
                : API_ENDPOINTS.BANK_ACCOUNTS

            const method = editId ? 'PUT' : 'POST'

            const response = await apiFetch(url, {
                method,
                body: JSON.stringify({
                    bankName: form.bankName,
                    accountName: form.accountName,
                    accountNumber: form.accountNumber,
                    ifscCode: form.ifsc,
                    branchName: form.branch,
                    openingBalance: parseFloat(form.openingBalance) || 0,
                    notes: form.notes
                })
            })

            if (response.ok) {
                toast.success(editId ? "Bank updated" : "Bank created")
                if (!editId) {
                    setForm({ bankName: "", accountName: "", accountNumber: "", ifsc: "", branch: "", openingBalance: "", notes: "" })
                } else {
                    router.push('/dashboard/admin/bank-info/bank-list')
                }
                fetchBanks()
            } else {
                const err = await response.json()
                toast.error(err.message || "Failed")
            }
        } catch (error) {
            toast.error("Connection error")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return
        try {
            const res = await apiFetch(`${API_ENDPOINTS.BANK_ACCOUNTS}/${id}`, { method: 'DELETE' })
            if (res.ok) {
                toast.success("Bank deleted")
                fetchBanks()
            } else {
                toast.error("Cannot delete active bank or bank with transactions")
            }
        } catch (error) {
            toast.error("Error deleting")
        }
    }

    return (
        <DashboardLayout title={editId ? "Edit Bank" : "Add Bank"}>
            <div className="space-y-6 max-w-5xl mx-auto pb-10">
                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <Banknote className="h-5 w-5" />
                            {editId ? "Edit Bank Details" : "New Bank Details"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-red-500">Bank Name *</Label>
                                <Input
                                    value={form.bankName}
                                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                                    placeholder="e.g. HDFC Bank"
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-500">Account Name *</Label>
                                <Input
                                    value={form.accountName}
                                    onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                                    placeholder="e.g. School Fees Account"
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-500">Account Number *</Label>
                                <Input
                                    value={form.accountNumber}
                                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                                    placeholder="xxxxxxxxxxxx"
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-500">IFSC Code *</Label>
                                <Input
                                    value={form.ifsc}
                                    onChange={(e) => setForm({ ...form, ifsc: e.target.value })}
                                    placeholder="IFSC12345"
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Branch Name</Label>
                                <Input
                                    value={form.branch}
                                    onChange={(e) => setForm({ ...form, branch: e.target.value })}
                                    placeholder="e.g. Main Branch"
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Opening Balance (₹)</Label>
                                <Input
                                    type="number"
                                    value={form.openingBalance}
                                    onChange={(e) => setForm({ ...form, openingBalance: e.target.value })}
                                    placeholder="0.00"
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label>Notes</Label>
                                <Textarea
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    rows={2}
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-2">
                                {editId && (
                                    <Button type="button" variant="outline" onClick={() => router.push('/dashboard/admin/bank-info/bank-list')}>
                                        Cancel
                                    </Button>
                                )}
                                <Button type="submit" className="bg-blue-900 hover:bg-blue-800 px-8">
                                    {editId ? "Update Bank" : "Save Bank"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Existing Banks List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Existing Bank Accounts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Bank</TableHead>
                                    <TableHead>Account No</TableHead>
                                    <TableHead>Balance</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {existingBanks.map((bank) => (
                                    <TableRow key={bank._id}>
                                        <TableCell className="font-medium">{bank.bankName}</TableCell>
                                        <TableCell>{bank.accountNumber}</TableCell>
                                        <TableCell>₹{bank.currentBalance?.toLocaleString()}</TableCell>
                                        <TableCell className="text-right flex justify-end gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => {
                                                router.push(`/dashboard/admin/bank-info/add-bank?id=${bank._id}`)
                                            }}>
                                                <Pencil size={16} className="text-blue-500" />
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => handleDelete(bank._id)}>
                                                <Trash2 size={16} className="text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {existingBanks.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4 text-gray-500">No banks added yet</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

export default function AddBank() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-blue-900" /></div>}>
            <AddBankContent />
        </Suspense>
    )
}

