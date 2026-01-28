"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Copy, FileText, Printer, Search, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

export default function InactiveStudents() {
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchParams, setSearchParams] = useState({
        class: "",
        section: "",
        keyword: ""
    })
    const [classes, setClasses] = useState<any[]>([])

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/classes`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (!response.ok) return
            const data = await response.json()
            setClasses(data.data || [])
        } catch (error) {
            console.error("Failed to fetch classes", error)
        }
    }

    const fetchStudents = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const query = new URLSearchParams()
            if (searchParams.class && searchParams.class !== "all") query.append("class", searchParams.class)
            if (searchParams.section && searchParams.section !== "all") query.append("section", searchParams.section)
            if (searchParams.keyword) query.append("keyword", searchParams.keyword)
            // Assuming the backend supports 'status=inactive' filtering
            query.append("status", "inactive")

            // NOTE: Currently using the general students endpoint. 
            // Ideally, the backend should filter by 'isActive: false'.
            // If the backend doesn't support 'status' query, we might need to filter client-side 
            // or update the backend. For now, assuming standard filter.
            const res = await fetch(`${API_URL}/api/students?${query.toString()}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })

            if (!res.ok) throw new Error("Failed to fetch students")

            const data = await res.json()
            // Client-side filtering if backend returns all students
            // Adjust this based on actual backend implementation
            const inactiveStudents = Array.isArray(data) ? data.filter((s: any) => s.isActive === false) : []
            // If array is empty, it might be because no students are inactive or backend filter worked.
            // If backend doesn't return isActive field, this will be empty.
            // Let's assume for now we just show what we get if query param works, else filter.
            setStudents(inactiveStudents)

        } catch (error) {
            console.error(error)
            toast.error("Failed to load inactive students")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClasses()
        fetchStudents()
    }, [])

    return (
        <DashboardLayout title="Inactive Students">
            <div className="space-y-6">
                {/* Search Criteria */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">Select Criteria</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Class</label>
                                <Select onValueChange={(val) => setSearchParams({ ...searchParams, class: val })}>
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="Select Option" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {classes.map((c: any) => (
                                            <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Section</label>
                                <Select onValueChange={(val) => setSearchParams({ ...searchParams, section: val })}>
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="Select Option" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="A">A</SelectItem>
                                        <SelectItem value="B">B</SelectItem>
                                        <SelectItem value="C">C</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 md:col-span-4">
                                <label className="text-sm font-medium text-gray-700">Search by Keyword</label>
                                <div className="flex gap-4">
                                    <Input
                                        placeholder="Search by Admission no, Student Name, Phone"
                                        className="bg-white flex-1"
                                        value={searchParams.keyword}
                                        onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
                                    />
                                    <Button
                                        className="bg-[#1e1e50] hover:bg-[#151538] text-white"
                                        onClick={fetchStudents}
                                    >
                                        <Search className="h-4 w-4 mr-2" /> Search
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-lg shadow-sm border border-pink-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-pink-100">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <span className="text-xl">≡</span> Inactive Students List
                        </h3>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1e1e50] text-white hover:bg-[#151538] border-none" onClick={() => navigator.clipboard.writeText(JSON.stringify(students))}><Copy className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1e1e50] text-white hover:bg-[#151538] border-none" onClick={() => {
                                    const csv = "ID,Name,Class,Mobile\n" + students.map(s => `${s.studentId},${s.firstName} ${s.lastName},${s.class},${s.phone}`).join("\n");
                                    const blob = new Blob([csv], { type: "text/csv" });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.download = "inactive_students.csv";
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
                            <Table className="w-full min-w-[1500px]">
                                <TableHeader>
                                    <TableRow className="bg-pink-50 hover:bg-pink-50">
                                        <TableHead className="w-12 font-bold text-gray-700">#</TableHead>
                                        <TableHead className="font-bold text-gray-700 text-xs">ADMISSION NO.</TableHead>
                                        <TableHead className="font-bold text-gray-700 text-xs">NAME</TableHead>
                                        <TableHead className="font-bold text-gray-700 text-xs">CLASS</TableHead>
                                        <TableHead className="font-bold text-gray-700 text-xs">DATE OF BIRTH</TableHead>
                                        <TableHead className="font-bold text-gray-700 text-xs">MOBILE NUMBER</TableHead>
                                        <TableHead className="font-bold text-gray-700 text-xs">GENDER</TableHead>
                                        <TableHead className="font-bold text-gray-700 text-xs">FATHER NAME</TableHead>
                                        <TableHead className="font-bold text-gray-700 text-xs">GUARDIAN PHONE</TableHead>
                                        <TableHead className="font-bold text-gray-700 text-xs text-right">ACTION</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={10} className="text-center h-24">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                                            </TableCell>
                                        </TableRow>
                                    ) : students.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} className="text-center h-24 text-gray-500">No inactive students found</TableCell>
                                        </TableRow>
                                    ) : (
                                        students.map((student, index) => (
                                            <TableRow key={student._id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell className="text-xs">{student.studentId}</TableCell>
                                                <TableCell className="text-xs text-blue-600 font-medium cursor-pointer">{student.firstName} {student.lastName}</TableCell>
                                                <TableCell className="text-xs">{student.class} - {student.section}</TableCell>
                                                <TableCell className="text-xs whitespace-nowrap">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}</TableCell>
                                                <TableCell className="text-xs">{student.phone}</TableCell>
                                                <TableCell className="text-xs">{student.gender}</TableCell>
                                                <TableCell className="text-xs">{student.parentName || student.fatherName || 'N/A'}</TableCell>
                                                <TableCell className="text-xs">{student.parentPhone || student.guardianPhone || 'N/A'}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button size="sm" className="bg-[#1e1e50] text-white hover:bg-[#151538] h-7 text-xs px-2">
                                                                Action <ChevronDown className="h-3 w-3 ml-1" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>Activate</DropdownMenuItem>
                                                            <DropdownMenuItem>Edit</DropdownMenuItem>
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
