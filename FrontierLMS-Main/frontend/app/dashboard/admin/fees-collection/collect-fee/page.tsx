"use client"

import { API_URL } from "@/lib/api-config"

import { useState } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Loader2, IndianRupee, Users } from "lucide-react"
import { toast } from "sonner"

import { AdvancedTable } from "@/components/super-admin/advanced-table"

export default function CollectFee() {
    const [loading, setLoading] = useState(false)
    const [students, setStudents] = useState<any[]>([])

    // Search States
    const [classSelect, setClassSelect] = useState("")
    const [sectionSelect, setSectionSelect] = useState("")
    const [keyword, setKeyword] = useState("")

    const handleSearch = async (mode: 'class' | 'keyword') => {
        setLoading(true)
        setStudents([])

        try {
            const token = localStorage.getItem('token')
            let url = `${API_URL}/api/students?`

            if (mode === 'class') {
                if (!classSelect || !sectionSelect) {
                    toast.error("Please select both Class and Section")
                    setLoading(false)
                    return
                }
                url += `class=${classSelect}&section=${sectionSelect}`
            } else {
                if (!keyword) {
                    toast.error("Please enter a keyword")
                    setLoading(false)
                    return
                }
                url += `keyword=${encodeURIComponent(keyword)}`
            }

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!res.ok) throw new Error("Failed to fetch students")

            const data = await res.json()
            setStudents(data)

            if (data.length === 0) {
                toast.info("No students found")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error searching students")
        } finally {
            setLoading(false)
        }
    }

    const columns = [
        {
            key: "fullName",
            label: "Student Profile",
            render: (_: any, student: any) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                        {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">{student.firstName} {student.lastName}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-tighter">ID: {student.studentId || student.rollNumber}</div>
                    </div>
                </div>
            )
        },
        {
            key: "classSection",
            label: "Academic Info",
            render: (_: any, student: any) => (
                <div>
                    <div className="font-medium text-indigo-700">Class {student.class}</div>
                    <div className="text-xs text-gray-500">Section {student.section}</div>
                </div>
            )
        },
        {
            key: "parentName",
            label: "Registry Details",
            render: (val: string) => (
                <div>
                    <div className="text-sm font-medium text-gray-700">{val}</div>
                    <div className="text-[10px] text-gray-400">Guardian Name</div>
                </div>
            )
        },
        {
            key: "phone",
            label: "Contact",
            render: (val: string) => <div className="text-xs font-mono text-gray-600">{val}</div>
        },
        {
            key: "actions",
            label: "Collection",
            render: (_: any, student: any) => (
                <Link href={`./collect-fee/${student._id}`}>
                    <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md gap-2 border-none h-9 px-4">
                        <IndianRupee size={14} />
                        Collect Fee
                    </Button>
                </Link>
            )
        }
    ]

    return (
        <DashboardLayout title="Fee Collection Portal">
            <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                {/* Search Strategy Card */}
                <Card className="border-none shadow-xl ring-1 ring-black/5 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 via-white to-indigo-50/30 border-b border-indigo-100/50">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <Search size={20} />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold text-gray-900">Patient Search Strategy</CardTitle>
                                <p className="text-sm text-gray-500">Select class-wise lookup or direct keyword matching</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative">
                            {/* Divider for large screens */}
                            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent" />

                            {/* Class/Section Strategy */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">01</div>
                                    <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">Hierarchy Lookup</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-400 uppercase ml-1">Academic Class</Label>
                                        <Select value={classSelect} onValueChange={setClassSelect}>
                                            <SelectTrigger className="bg-gray-50/50 border-gray-200 h-11">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[...Array(12)].map((_, i) => (
                                                    <SelectItem key={i} value={(i + 1).toString()}>Class {i + 1}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-400 uppercase ml-1">Section</Label>
                                        <Select value={sectionSelect} onValueChange={setSectionSelect}>
                                            <SelectTrigger className="bg-gray-50/50 border-gray-200 h-11">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['A', 'B', 'C', 'D'].map(s => (
                                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => handleSearch('class')}
                                    disabled={loading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 h-11 font-bold transition-all hover:scale-[1.01]"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search size={18} className="mr-2" />}
                                    Search by Class
                                </Button>
                            </div>

                            {/* Direct Keyword Strategy */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">02</div>
                                    <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">Direct Intelligence</h3>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-400 uppercase ml-1">Global Keyword</Label>
                                    <Input
                                        placeholder="Admission No, Student Name, or Mobile..."
                                        className="bg-gray-50/50 border-gray-200 h-11"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                    />
                                </div>
                                <Button
                                    onClick={() => handleSearch('keyword')}
                                    disabled={loading}
                                    className="w-full bg-white border-2 border-indigo-600 text-indigo-700 hover:bg-indigo-50 h-11 font-bold transition-all hover:scale-[1.01]"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search size={18} className="mr-2" />}
                                    Direct Search
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Section */}
                {students.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <AdvancedTable
                            title="Identified Students"
                            columns={columns}
                            data={students}
                            loading={loading}
                            pagination
                        />
                    </div>
                )}

                {students.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Users size={40} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-500">Awaiting Search Query</h3>
                        <p className="max-w-xs text-center text-sm mt-2">Use the criteria cards above to find students and process their fee payments</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
