"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { ShieldCheck } from "lucide-react"
import { toast } from "sonner"

export default function ConcessionsWaivers() {
    const [records, setRecords] = useState([
        { id: 1, reason: "Sibling Waiver", type: "Percentage", value: "15", appliedTo: "Class 1" },
        { id: 2, reason: "Staff Child", type: "Amount", value: "1000", appliedTo: "All" },
    ])

    const [formData, setFormData] = useState({
        reason: "",
        type: "",
        value: "",
        scope: "",
        note: ""
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.reason || !formData.type || !formData.value) {
            toast.error("Reason, type and value are required")
            return
        }
        setRecords([...records, { id: Date.now(), reason: formData.reason, type: formData.type, value: formData.value, appliedTo: formData.scope || "Custom" }])
        toast.success("Concession added")
        setFormData({ reason: "", type: "", value: "", scope: "", note: "" })
    }

    return (
        <DashboardLayout title="Concessions / Waivers">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader className="bg-pink-50 border-b border-pink-100">
                            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                                <ShieldCheck className="h-5 w-5" />
                                Add Waiver
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-red-500">Reason *</Label>
                                    <Input
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        placeholder="e.g. Financial Assistance"
                                        className="bg-white border-gray-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-red-500">Type *</Label>
                                    <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                        <SelectTrigger className="bg-white border-gray-200">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Percentage">Percentage</SelectItem>
                                            <SelectItem value="Amount">Amount</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-red-500">Value *</Label>
                                    <Input
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        placeholder="Enter amount or %"
                                        className="bg-white border-gray-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Applicable To</Label>
                                    <Input
                                        value={formData.scope}
                                        onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                                        placeholder="Class/Group/Student"
                                        className="bg-white border-gray-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Note</Label>
                                    <Textarea
                                        value={formData.note}
                                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                        className="bg-white border-gray-200"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button type="submit" className="bg-blue-900 hover:bg-blue-800 px-6">
                                        Save
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="bg-pink-50 border-b border-pink-100">
                            <CardTitle className="text-lg text-gray-800">Waiver List</CardTitle>
                        </CardHeader>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-pink-50 hover:bg-pink-50">
                                        <TableHead className="font-bold text-gray-700 uppercase">Reason</TableHead>
                                        <TableHead className="font-bold text-gray-700 uppercase">Type</TableHead>
                                        <TableHead className="font-bold text-gray-700 uppercase">Value</TableHead>
                                        <TableHead className="font-bold text-gray-700 uppercase">Applied To</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {records.map((rec) => (
                                        <TableRow key={rec.id}>
                                            <TableCell>{rec.reason}</TableCell>
                                            <TableCell>{rec.type}</TableCell>
                                            <TableCell>{rec.value}</TableCell>
                                            <TableCell>{rec.appliedTo}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}

