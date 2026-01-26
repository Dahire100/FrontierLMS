"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Search, FilePen, Check, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

export default function StudentUpdate() {
    const [classes, setClasses] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedClass, setSelectedClass] = useState("")
    const [selectedSection, setSelectedSection] = useState("")

    // For bulk update
    const [selectedStudents, setSelectedStudents] = useState<string[]>([])
    const [bulkField, setBulkField] = useState("")
    const [bulkValue, setBulkValue] = useState("")

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const token = localStorage.getItem("token")
                const res = await fetch(`${API_URL}/api/classes`, {
                    headers: { "Authorization": `Bearer ${token}` }
                })
                const data = await res.json()
                setClasses(data.data || [])
            } catch (error) {
                console.error("Failed to fetch classes")
            }
        }
        fetchClasses()
    }, [])

    const handleSearch = async () => {
        if (!selectedClass || !selectedSection) {
            toast.error("Please select class and section")
            return
        }
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/students?class=${selectedClass}&section=${selectedSection}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            setStudents(data)
        } catch (error) {
            toast.error("Failed to fetch students")
        } finally {
            setLoading(false)
        }
    }

    const handleBulkUpdate = async () => {
        if (selectedStudents.length === 0) return toast.error("Select at least one student")
        if (!bulkField || !bulkValue) return toast.error("Select field and value to update")

        if (!confirm(`Update ${bulkField} for ${selectedStudents.length} students?`)) return;

        try {
            const token = localStorage.getItem("token")
            // This is a simplified bulk update. In a real app, you'd likely have a dedicated bulk update endpoint 
            // or loop requests (less efficient). Use loop for now as we lack bulk endpoint.
            const promises = selectedStudents.map(id =>
                fetch(`${API_URL}/api/students/${id}`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ [bulkField]: bulkValue })
                })
            )
            await Promise.all(promises)
            toast.success("Bulk update successful")
            handleSearch() // Refresh
            setSelectedStudents([])
            setBulkValue("")
        } catch (error) {
            toast.error("Failed to update students")
        }
    }

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedStudents(students.map(s => s._id))
        } else {
            setSelectedStudents([])
        }
    }

    const toggleStudent = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedStudents(prev => [...prev, id])
        } else {
            setSelectedStudents(prev => prev.filter(sid => sid !== id))
        }
    }

    return (
        <DashboardLayout title="Student Update">
            <div className="flex justify-end mb-4">
                <div className="text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                        <span className="text-[#1e1e50] font-semibold flex items-center gap-1"><FilePen className="h-5 w-5" /> Bulk Update</span>
                        <span className="mx-1">/</span>
                        <span>Student Update</span>
                    </span>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-pink-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-pink-100">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Search className="h-5 w-5 text-gray-600" /> Select Criteria
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-red-500">Class *</label>
                                <Select onValueChange={setSelectedClass}>
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="Select Class" /></SelectTrigger>
                                    <SelectContent>
                                        {classes.map((c: any) => (
                                            <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-red-500">Section *</label>
                                <Select onValueChange={setSelectedSection}>
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="Select Section" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A">A</SelectItem>
                                        <SelectItem value="B">B</SelectItem>
                                        <SelectItem value="C">C</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <Button className="bg-[#1e1e50] hover:bg-[#151538] text-white px-6" onClick={handleSearch}>
                                <Search className="h-4 w-4 mr-2" /> Search
                            </Button>
                        </div>
                    </div>
                </div>

                {students.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-pink-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-pink-100 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Student List</h3>

                            {/* Bulk Actions */}
                            <div className="flex gap-2 items-center">
                                <Select onValueChange={setBulkField}>
                                    <SelectTrigger className="w-[150px] bg-white"><SelectValue placeholder="Field to Update" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bloodGroup">Blood Group</SelectItem>
                                        <SelectItem value="transportRoute">Transport Route</SelectItem>
                                        <SelectItem value="category">Category</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    className="w-[150px]"
                                    placeholder="New Value"
                                    value={bulkValue}
                                    onChange={(e) => setBulkValue(e.target.value)}
                                />
                                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleBulkUpdate}>
                                    <Check className="h-4 w-4 mr-1" /> Update Selected
                                </Button>
                            </div>
                        </div>
                        <div className="p-0">
                            <Table>
                                <TableHeader className="bg-pink-50">
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedStudents.length === students.length && students.length > 0}
                                                onCheckedChange={(checked) => toggleSelectAll(checked as boolean)}
                                            />
                                        </TableHead>
                                        <TableHead>Admission No</TableHead>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Father Name</TableHead>
                                        <TableHead>Mobile</TableHead>
                                        <TableHead>Current Values</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student) => (
                                        <TableRow key={student._id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedStudents.includes(student._id)}
                                                    onCheckedChange={(checked) => toggleStudent(student._id, checked as boolean)}
                                                />
                                            </TableCell>
                                            <TableCell>{student.admissionNumber || student.studentId}</TableCell>
                                            <TableCell>{student.firstName} {student.lastName}</TableCell>
                                            <TableCell>{student.parentName || student.fatherName || 'N/A'}</TableCell>
                                            <TableCell>{student.phone}</TableCell>
                                            <TableCell className="text-xs text-gray-500">
                                                BG: {student.bloodGroup || '-'}, Trans: {student.transportRoute || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
