"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, List, CheckCircle2, MinusCircle, Loader2 } from "lucide-react"
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
import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

export default function OnlineAdmission() {
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchParams, setSearchParams] = useState({
        startDate: "",
        endDate: "",
        keyword: ""
    })

    const fetchAdmissions = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const query = new URLSearchParams()
            if (searchParams.startDate) query.append("startDate", searchParams.startDate)
            if (searchParams.endDate) query.append("endDate", searchParams.endDate)
            if (searchParams.keyword) query.append("keyword", searchParams.keyword)

            const res = await fetch(`${API_URL}/api/online-admissions?${query.toString()}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })

            if (!res.ok) throw new Error("Failed to fetch admissions")

            const data = await res.json()
            setStudents(data.data || [])
        } catch (error) {
            console.error(error)
            toast.error("Failed to load admissions")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAdmissions()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this record?")) return;
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/online-admissions/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (!res.ok) throw new Error("Failed to delete")
            toast.success("Record deleted")
            fetchAdmissions()
        } catch (error) {
            toast.error("Failed to delete record")
        }
    }

    return (
        <DashboardLayout title="Online Admission">
            <div className="space-y-6">
                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100 py-3">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800 font-normal">
                            <Search className="h-5 w-5" /> Select Criteria
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    className="bg-white border-gray-200"
                                    value={searchParams.startDate}
                                    onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    className="bg-white border-gray-200"
                                    value={searchParams.endDate}
                                    onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button
                                className="bg-[#1e1e50] hover:bg-[#151538] text-white"
                                onClick={fetchAdmissions}
                            >
                                <Search className="h-4 w-4 mr-2" /> Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100 py-3">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800 font-normal">
                            <List className="h-5 w-5" /> Online Admission Directory List
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1e1e50] text-white hover:bg-[#151538] border-none" onClick={() => navigator.clipboard.writeText(JSON.stringify(students))}>📋</Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1e1e50] text-white hover:bg-[#151538] border-none" onClick={() => {
                                    const headers = ["ID", "Name", "Class", "Father", "DOB", "Gender", "Mobile", "Transaction", "Enrolled", "Applied On"];
                                    const csvContent = [
                                        headers.join(","),
                                        ...students.map(s => [
                                            s._id, s.studentName, s.class, s.fatherName, s.dob, s.gender, s.mobile, s.paymentStatus, s.isEnrolled, s.appliedDate
                                        ].join(","))
                                    ].join("\n");
                                    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.setAttribute("download", "online_admissions.csv");
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}>📄</Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1e1e50] text-white hover:bg-[#151538] border-none" onClick={() => window.print()}>🖨️</Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Search:</span>
                                <Input
                                    className="w-48 h-8"
                                    placeholder="Search details..."
                                    value={searchParams.keyword}
                                    onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchAdmissions()}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto border rounded-md">
                            <Table>
                                <TableHeader className="bg-pink-50">
                                    <TableRow className="uppercase text-xs font-bold text-gray-700">
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Class</TableHead>
                                        <TableHead>Father Name</TableHead>
                                        <TableHead>Date Of Birth</TableHead>
                                        <TableHead>Gender</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Mobile Number</TableHead>
                                        <TableHead>Transaction</TableHead>
                                        <TableHead>Enrolled</TableHead>
                                        <TableHead>Applied On</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={12} className="text-center h-24">
                                                <div className="flex justify-center items-center">
                                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : students.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={12} className="text-center h-24 text-gray-500">
                                                No records found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        students.map((student, index) => (
                                            <TableRow key={student._id} className="text-sm hover:bg-gray-50">
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell className="font-medium">{student.studentName}</TableCell>
                                                <TableCell>{student.class}</TableCell>
                                                <TableCell>{student.fatherName || 'N/A'}</TableCell>
                                                <TableCell>{student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}</TableCell>
                                                <TableCell>{student.gender}</TableCell>
                                                <TableCell>{student.category || 'N/A'}</TableCell>
                                                <TableCell>{student.mobile}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded text-xs text-white ${student.paymentStatus === 'Paid' ? 'bg-green-600' : 'bg-[#1e1e50]'}`}>
                                                        {student.paymentStatus || 'Unpaid'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {student.isEnrolled ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                                                    ) : (
                                                        <MinusCircle className="h-5 w-5 text-gray-400 mx-auto" />
                                                    )}
                                                </TableCell>
                                                <TableCell>{new Date(student.appliedDate).toLocaleString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button size="sm" className="bg-[#1e1e50] text-white hover:bg-[#151538] h-7 px-2">
                                                                Action <span className="ml-1">▼</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>Details</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(student._id)}>Delete</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-xs text-gray-500">
                                Showing {students.length} records
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
