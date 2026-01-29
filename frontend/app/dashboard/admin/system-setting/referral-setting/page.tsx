"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
    Plus,
    Search,
    Copy,
    FileSpreadsheet,
    Printer,
    UserPlus,
    Edit2,
    Loader2,
    Info,
    Trash
} from "lucide-react"
import { ActionMenu } from "@/components/action-menu"
import { toast } from "sonner"
import { API_URL } from "@/lib/api-config"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"

interface ClassItem {
    _id: string
    className: string
}

interface ReferralItem {
    _id: string
    classId: {
        _id: string
        className: string
    }
    amount: number
    description?: string
}

export default function ReferralSettingPage() {
    const [referrals, setReferrals] = useState<ReferralItem[]>([])
    const [classes, setClasses] = useState<ClassItem[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [editingItem, setEditingItem] = useState<ReferralItem | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const [form, setForm] = useState({
        classId: "",
        amount: "",
        description: ""
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const [refRes, clsRes] = await Promise.all([
                fetch(`${API_URL}/api/referral-settings`, { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(`${API_URL}/api/classes`, { headers: { "Authorization": `Bearer ${token}` } })
            ])
            const refData = await refRes.json()
            const clsData = await clsRes.json()

            if (refData.success) setReferrals(refData.data)
            if (clsData.success) setClasses(clsData.data)
        } catch (err) {
            toast.error("Failed to load data")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!form.classId || !form.amount) {
            toast.error("Class and Amount are required")
            return
        }

        try {
            setSaving(true)
            const token = localStorage.getItem("token")
            const url = editingItem
                ? `${API_URL}/api/referral-settings/${editingItem._id}`
                : `${API_URL}/api/referral-settings`
            const method = editingItem ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            })

            const result = await response.json()
            if (result.success) {
                toast.success(editingItem ? "Referral setting updated" : "Referral setting added")
                resetForm()
                fetchData()
            } else {
                toast.error(result.error || "Save failed")
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (item: ReferralItem) => {
        setEditingItem(item)
        setForm({
            classId: item.classId._id,
            amount: item.amount.toString(),
            description: item.description || ""
        })
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/referral-settings/${deleteId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await response.json()
            if (result.success) {
                toast.success("Setting removed")
                fetchData()
            }
        } catch (err) {
            toast.error("Delete failed")
        } finally {
            setDeleteId(null)
        }
    }

    const resetForm = () => {
        setEditingItem(null)
        setForm({ classId: "", amount: "", description: "" })
    }

    const filteredReferrals = referrals.filter(item =>
        item.classId.className.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <span className="p-2 bg-primary/10 rounded-md">
                        <UserPlus className="w-5 h-5 text-primary" />
                    </span>
                    Referral Setting
                </h1>
                <div className="text-sm text-muted-foreground">
                    System Setting / Referral Setting
                </div>
            </div>

            {/* Workflow Explanation */}
            <Card className="bg-blue-50/50 border-blue-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-800">
                        <Info size={16} /> How it Works
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-blue-700 leading-relaxed">
                        Referral settings allow the school to define financial incentives for existing students, parents, or staff who refer new admissions.
                        <strong> Rewards are class-specific:</strong> You can set different referral amounts for each class.
                        Once a referred student completes their admission process for a specific class, the reward amount defined here is credited or applied as per school policy.
                    </p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 border-primary/10">
                    <CardHeader className="border-b pb-4">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Edit2 size={18} className="text-primary" />
                            {editingItem ? "Edit Referral Setting" : "Add Referral Setting"}
                        </CardTitle>
                        <CardDescription>Configure referral amounts per class</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="class">Class <span className="text-red-500">*</span></Label>
                            <Select
                                value={form.classId}
                                onValueChange={(v) => setForm({ ...form, classId: v })}
                            >
                                <SelectTrigger id="class">
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map(cls => (
                                        <SelectItem key={cls._id} value={cls._id}>{cls.className}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Reward Amount (₹) <span className="text-red-500">*</span></Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="e.g. 500"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="desc">Notes / Description (Optional)</Label>
                            <Input
                                id="desc"
                                placeholder="e.g. Paid after first month fee"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-2 pt-4">
                            {editingItem && (
                                <Button variant="outline" className="flex-1" onClick={resetForm}>Cancel</Button>
                            )}
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-[#1e1b4b] hover:bg-[#1e1b4b]/90 flex-1"
                            >
                                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                {editingItem ? "Update" : "Save"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                        <CardTitle className="text-lg font-medium">Referral Setting List</CardTitle>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search by class..."
                                className="pl-9 w-48 sm:w-64 h-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead className="font-bold py-4 pl-6">CLASS</TableHead>
                                        <TableHead className="font-bold">REWARD AMOUNT</TableHead>
                                        <TableHead className="font-bold">NOTES</TableHead>
                                        <TableHead className="text-right pr-6 font-bold">ACTION</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-10">
                                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredReferrals.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">
                                                No referral settings configured.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredReferrals.map((item) => (
                                            <TableRow key={item._id} className="hover:bg-muted/10 transition-colors">
                                                <TableCell className="font-medium py-4 pl-6">
                                                    <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold uppercase border border-blue-100">
                                                        {item.classId.className}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="font-bold text-green-600">₹{item.amount.toLocaleString()}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                                                    {item.description || "-"}
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <ActionMenu
                                                        onEdit={() => handleEdit(item)}
                                                        onDelete={() => setDeleteId(item._id)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <ConfirmationDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Remove Referral Setting"
                description="Are you sure you want to delete this referral configuration? This will not affect past rewards but no new rewards will be calculated for this class."
                variant="destructive"
            />
        </div>
    )
}
