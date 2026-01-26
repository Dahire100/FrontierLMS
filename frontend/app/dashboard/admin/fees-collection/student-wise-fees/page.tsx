"use client"

import { useState, useCallback } from "react"
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
import { UserSearch, Loader2, Search, RefreshCcw, Database, Filter, User, BookOpen, Layers, Phone } from "lucide-react"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"

interface StudentFee {
    _id: string
    studentId: {
        _id: string
        studentId: string
        firstName: string
        lastName: string
        class: string
        section: string
    }
    totalFees: number
    paidAmount: number
    dueAmount: number
}

export default function StudentWiseFees() {
    const [students, setStudents] = useState<StudentFee[]>([])
    const [loading, setLoading] = useState(false)
    const [classSelect, setClassSelect] = useState("all")
    const [sectionSelect, setSectionSelect] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")

    const handleSearch = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (classSelect && classSelect !== 'all') params.append('classId', classSelect)
            if (sectionSelect && sectionSelect !== 'all') params.append('section', sectionSelect)
            if (searchTerm) params.append('search', searchTerm)

            const response = await apiFetch(`${API_ENDPOINTS.FEES.SUMMARY}?${params.toString()}`)
            if (response.ok) {
                const data = await response.json()
                setStudents(Array.isArray(data) ? data : data.data || [])
                if (data.length === 0) toast.info("No stakeholder records identified")
            } else {
                toast.error("Failed to sync structural data")
            }
        } catch (error) {
            toast.error("Network synchronization failure")
        } finally {
            setLoading(false)
        }
    }, [classSelect, sectionSelect, searchTerm])

    const columns = [
        {
            key: "student",
            label: "Stakeholder Profile",
            render: (_: any, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white font-black shadow-lg">
                        {row.studentId?.firstName?.[0]}{row.studentId?.lastName?.[0]}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 leading-tight">{row.studentId?.firstName} {row.studentId?.lastName}</div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">UID: {row.studentId?.studentId}</div>
                    </div>
                </div>
            )
        },
        {
            key: "academic",
            label: "Structural Unit",
            render: (_: any, row: any) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                        <Layers size={14} />
                    </div>
                    <div>
                        <div className="font-black text-indigo-900 text-xs">Grade {row.studentId?.class}</div>
                        <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">Division {row.studentId?.section}</div>
                    </div>
                </div>
            )
        },
        {
            key: "totalFees",
            label: "Gross Liability",
            render: (val: number) => (
                <div className="text-right font-medium text-gray-400 italic">₹{val?.toLocaleString()}</div>
            )
        },
        {
            key: "paidAmount",
            label: "Settled Capital",
            render: (val: number) => (
                <div className="text-right font-black text-emerald-600">₹{val?.toLocaleString()}</div>
            )
        },
        {
            key: "dueAmount",
            label: "Outstanding Exposure",
            render: (val: number) => (
                <div className="text-right">
                    <div className="inline-block px-3 py-1 bg-rose-50 text-rose-700 rounded-lg font-black text-base shadow-sm ring-1 ring-rose-100">
                        ₹{val?.toLocaleString()}
                    </div>
                </div>
            )
        },
        {
            key: "actions",
            label: "Intelligence",
            render: (_: any, row: any) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 rounded-lg">
                        <BookOpen size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-emerald-600 rounded-lg">
                        <Phone size={14} />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <DashboardLayout title="Financial Audit: Direct Stakeholder Ledger">
            <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <div className="h-12 w-12 bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-2xl flex items-center justify-center shadow-xl text-white">
                                <UserSearch size={24} />
                            </div>
                            Stakeholder Fee Analytics
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg italic font-medium">Granular visibility into institutional liabilities and collection status per profile</p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 transition-all hover:bg-gray-50">
                            <RefreshCcw size={18} /> Master Sync
                        </Button>
                    </div>
                </div>

                {/* Analytical Scanners Card */}
                <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden rounded-[2rem] bg-white">
                    <CardHeader className="bg-gradient-to-r from-indigo-50/50 via-white to-transparent border-b border-gray-100/50 p-8">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                                <Filter size={24} />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black text-indigo-900 uppercase tracking-tight">Audit Scanners</CardTitle>
                                <p className="text-xs text-indigo-400 font-bold uppercase tracking-[0.2em] mt-0.5">Direct Hierarchy selection protocol</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Target Hierarchy</Label>
                                <Select value={classSelect} onValueChange={setClassSelect}>
                                    <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-indigo-500 font-black text-indigo-900">
                                        <SelectValue placeholder="Unified academy" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Global Institution</SelectItem>
                                        {[...Array(12)].map((_, i) => (
                                            <SelectItem key={i} value={(i + 1).toString()}>Grade {i + 1}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Section Protocol</Label>
                                <Select value={sectionSelect} onValueChange={setSectionSelect}>
                                    <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-indigo-500 font-black text-indigo-900">
                                        <SelectValue placeholder="All Divisions" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Unified Sections</SelectItem>
                                        <SelectItem value="A">Division A</SelectItem>
                                        <SelectItem value="B">Division B</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 lg:col-span-1">
                                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Universal Search</Label>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <Input
                                        placeholder="Adm No / Name / Phone"
                                        className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 pl-12 rounded-2xl focus:ring-indigo-500 font-bold"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-indigo-800 hover:to-black text-white h-14 rounded-2xl shadow-xl shadow-indigo-100 font-black text-xs uppercase tracking-[0.2em] gap-3 transition-all hover:scale-[1.02]"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
                                    Execute Ledger Scan
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Registry Section */}
                {students.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <AdvancedTable
                            title="Validated Exposure Ledger"
                            columns={columns}
                            data={students}
                            loading={loading}
                            pagination
                        />
                    </div>
                )}

                {/* Empty State */}
                {students.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                        <div className="h-32 w-32 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner ring-8 ring-white">
                            <User size={56} className="text-indigo-200" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Audit Trail Deployed</h3>
                        <p className="text-gray-400 max-w-sm text-center mt-3 text-sm italic font-medium leading-relaxed">System is synchronized. Configure scan parameters to extract stakeholder financial data from the institutional archive.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
