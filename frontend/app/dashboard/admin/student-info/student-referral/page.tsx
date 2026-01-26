"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Copy, FileText, Printer, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function StudentReferral() {
    const [referrals, setReferrals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [newReferral, setNewReferral] = useState({
        referralBy: "", studentName: "", email: "", mobile: "", note: ""
    })

    const fetchReferrals = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/student-referrals`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (!res.ok) throw new Error("Failed to fetch referrals")
            const data = await res.json()
            setReferrals(data.data || [])
        } catch (error) {
            console.error(error)
            toast.error("Failed to load referrals")
        } finally {
            setLoading(false)
        }
    }

    const handleAddReferral = async () => {
        if (!newReferral.studentName || !newReferral.mobile || !newReferral.referralBy) {
            toast.error("Please fill required fields")
            return
        }
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/student-referrals`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newReferral)
            })
            if (!res.ok) throw new Error("Failed to add referral")
            toast.success("Referral added successfully")
            setShowAddForm(false)
            setNewReferral({
                referralBy: "", studentName: "", email: "", mobile: "", note: ""
            })
            fetchReferrals()
        } catch (error) {
            toast.error("Failed to add referral")
        }
    }

    const handleDeleteReferral = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/student-referrals/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (!res.ok) throw new Error("Failed to delete")
            toast.success("Referral deleted")
            fetchReferrals()
        } catch (error) {
            toast.error("Failed to delete")
        }
    }

    useEffect(() => {
        fetchReferrals()
    }, [])

    return (
        <DashboardLayout title="Student Referral">
            <div className="space-y-6">
                <div className="flex justify-end">
                    <Button
                        className="bg-[#1e1e50] hover:bg-[#151538] text-white"
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        <span className="mr-2">{showAddForm ? '-' : '+'}</span> {showAddForm ? 'Cancel' : 'Add'}
                    </Button>
                </div>

                {showAddForm && (
                    <Card>
                        <CardHeader className="bg-pink-50 border-b border-pink-100 py-3">
                            <CardTitle className="text-lg text-gray-800 font-normal">Add Referral</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Referral By *</Label>
                                    <Input value={newReferral.referralBy} onChange={(e) => setNewReferral({ ...newReferral, referralBy: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Student Name *</Label>
                                    <Input value={newReferral.studentName} onChange={(e) => setNewReferral({ ...newReferral, studentName: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mobile Number *</Label>
                                    <Input value={newReferral.mobile} onChange={(e) => setNewReferral({ ...newReferral, mobile: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={newReferral.email} onChange={(e) => setNewReferral({ ...newReferral, email: e.target.value })} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Note</Label>
                                    <Textarea value={newReferral.note} onChange={(e) => setNewReferral({ ...newReferral, note: e.target.value })} />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <Button className="bg-[#1e1e50] hover:bg-[#151538] text-white" onClick={handleAddReferral}>Save</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="bg-white rounded-lg shadow-sm border border-pink-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-pink-100 flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <span className="text-xl">≡</span> Student Referral List
                        </h3>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1e1e50] text-white hover:bg-[#151538] border-none" onClick={() => navigator.clipboard.writeText(JSON.stringify(referrals))}><Copy className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1e1e50] text-white hover:bg-[#151538] border-none" onClick={() => {
                                    const csv = "Referral By,Student Name,Email,Mobile,Note\n" + referrals.map(r => `${r.referralBy},${r.studentName},${r.email},${r.mobile},${r.note}`).join("\n");
                                    const blob = new Blob([csv], { type: "text/csv" });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.download = "referrals.csv";
                                    document.body.appendChild(link);
                                    link.click();
                                }}><FileText className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1e1e50] text-white hover:bg-[#151538] border-none" onClick={() => window.print()}><Printer className="h-4 w-4" /></Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Search:</span>
                                <Input className="w-48 h-8" />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-pink-50 hover:bg-pink-50">
                                        <TableHead className="w-12 font-bold text-gray-700">#</TableHead>
                                        <TableHead className="font-bold text-gray-700">REFERRAL BY</TableHead>
                                        <TableHead className="font-bold text-gray-700">STUDENT NAME</TableHead>
                                        <TableHead className="font-bold text-gray-700">EMAIL</TableHead>
                                        <TableHead className="font-bold text-gray-700">MOBILE NUMBER</TableHead>
                                        <TableHead className="font-bold text-gray-700">NOTE</TableHead>
                                        <TableHead className="font-bold text-gray-700 text-right">ACTION</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center h-24">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                                            </TableCell>
                                        </TableRow>
                                    ) : referrals.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center h-24 text-gray-500">No referrals found</TableCell>
                                        </TableRow>
                                    ) : (
                                        referrals.map((referral, index) => (
                                            <TableRow key={referral._id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{referral.referralBy}</TableCell>
                                                <TableCell>{referral.studentName}</TableCell>
                                                <TableCell>{referral.email}</TableCell>
                                                <TableCell>{referral.mobile}</TableCell>
                                                <TableCell>{referral.note}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button size="sm" className="bg-[#1e1e50] text-white hover:bg-[#151538] h-8 text-xs">
                                                                Action <ChevronDown className="h-3 w-3 ml-1" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteReferral(referral._id)}>Delete</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
