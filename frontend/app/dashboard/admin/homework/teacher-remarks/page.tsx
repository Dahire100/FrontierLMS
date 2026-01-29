"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MessageSquare } from "lucide-react"
import { toast } from "sonner"

const sample = [
    { id: 1, student: "Ansh Sharma", classSection: "7-B", homework: "Chapter 5 worksheet", remark: "Good work" },
    { id: 2, student: "Vanya Patel", classSection: "6-A", homework: "Essay on Environment", remark: "" },
]

export default function TeacherRemarks() {
    const [rows, setRows] = useState(sample)
    const [form, setForm] = useState({ student: "", homework: "", remark: "" })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.student || !form.homework || !form.remark) {
            toast.error("Please fill all fields")
            return
        }
        setRows([...rows, { id: Date.now(), student: form.student, classSection: "", homework: form.homework, remark: form.remark }])
        toast.success("Remark added")
        setForm({ student: "", homework: "", remark: "" })
    }

    return (
        <DashboardLayout title="Teacher Remarks">
            <div className="space-y-6">
                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <MessageSquare className="h-5 w-5" />
                            Add Remark
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-red-500">Student *</Label>
                                <Input
                                    value={form.student}
                                    onChange={(e) => setForm({ ...form, student: e.target.value })}
                                    placeholder="Student name or ID"
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-500">Homework *</Label>
                                <Input
                                    value={form.homework}
                                    onChange={(e) => setForm({ ...form, homework: e.target.value })}
                                    placeholder="Homework title"
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-1">
                                <Label className="text-red-500">Remark *</Label>
                                <Textarea
                                    value={form.remark}
                                    onChange={(e) => setForm({ ...form, remark: e.target.value })}
                                    rows={2}
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="md:col-span-3 flex justify-end">
                                <Button type="submit" className="bg-blue-900 hover:bg-blue-800 px-8">
                                    Save Remark
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg text-gray-800">Remarks List</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-pink-50 hover:bg-pink-50">
                                        <TableHead className="font-bold text-gray-700 uppercase">Student</TableHead>
                                        <TableHead className="font-bold text-gray-700 uppercase">Class/Section</TableHead>
                                        <TableHead className="font-bold text-gray-700 uppercase">Homework</TableHead>
                                        <TableHead className="font-bold text-gray-700 uppercase">Remark</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.student}</TableCell>
                                            <TableCell>{row.classSection}</TableCell>
                                            <TableCell>{row.homework}</TableCell>
                                            <TableCell>{row.remark || "-"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

