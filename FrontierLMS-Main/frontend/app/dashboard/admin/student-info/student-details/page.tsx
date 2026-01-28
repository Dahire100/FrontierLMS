"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Search,
    Users,
    Filter,
    Download,
    Printer,
    GraduationCap,
    School,
    UserCheck,
    RefreshCw,
    Trash2
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { StatCard } from "@/components/super-admin/stat-card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"

export default function StudentDetails() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [students, setStudents] = useState([])
    const [classes, setClasses] = useState<{ id: string, name: string }[]>([])
    const [sections, setSections] = useState<{ id: string, name: string }[]>([])
    const [searchCriteria, setSearchCriteria] = useState({
        class: "",
        section: "",
        caste: "",
        keyword: ""
    })

    useEffect(() => {
        fetchInitialData()
        handleSearch()
    }, [])

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [classesRes, sectionsRes] = await Promise.all([
                fetch(`${API_URL}/api/classes`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/api/sections`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (classesRes.ok) {
                const resData = await classesRes.json();
                // Helper to safely get the array
                const classesArray = Array.isArray(resData) ? resData : (Array.isArray(resData.data) ? resData.data : []);

                // Group by class name to get unique classes
                // The controller returns 'name' for the class name
                const uniqueClasses = Array.from(new Set(classesArray.map((c: any) => c.name))).map(name => ({
                    id: name as string,
                    name: name as string
                }));
                setClasses(uniqueClasses);
            }

            if (sectionsRes.ok) {
                const data = await sectionsRes.json();
                setSections(data.data.map((s: any) => ({ id: s.name, name: s.name })));
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    }

    const handleSearch = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token');
            let url = `${API_URL}/api/students?`;
            const params = new URLSearchParams();
            if (searchCriteria.class && searchCriteria.class !== "All") params.append('class', searchCriteria.class);
            if (searchCriteria.section && searchCriteria.section !== "All") params.append('section', searchCriteria.section);
            if (searchCriteria.caste && searchCriteria.caste !== "All") params.append('caste', searchCriteria.caste);
            if (searchCriteria.keyword) params.append('keyword', searchCriteria.keyword);

            url += params.toString();

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to fetch students",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error("Search error:", error)
            toast({ title: "Network Error", description: "Could not connect to server", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const columns = [
        {
            key: "name",
            label: "Student",
            render: (value: string, row: any) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-indigo-100 shadow-sm">
                        {row.profilePicture && <img src={`${API_URL}${row.profilePicture}`} alt={row.firstName} className="h-full w-full object-cover" />}
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">
                            {row.firstName?.[0]}{row.lastName?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-bold text-gray-900">{row.firstName} {row.lastName}</div>
                        <div className="text-[10px] text-gray-400 font-mono tracking-tighter">ID: {row.studentId}</div>
                    </div>
                </div>
            )
        },
        {
            key: "class",
            label: "Academics",
            render: (value: string, row: any) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-indigo-700">{value}</span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Section {row.section}</span>
                </div>
            )
        },
        {
            key: "parentName",
            label: "Guardian Info",
            render: (value: string, row: any) => (
                <div className="text-sm text-gray-600">
                    <div className="font-medium text-gray-800">{value || row.guardianName || 'N/A'}</div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        {row.parentPhone || row.guardianPhone || row.phone || 'No Contact'}
                    </div>
                </div>
            )
        },
        {
            key: "dateOfBirth",
            label: "Profile",
            render: (value: string, row: any) => (
                <div className="space-y-1">
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                        DOB: {value ? new Date(value).toLocaleDateString() : 'N/A'}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${row.gender?.toLowerCase() === 'male' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        row.gender?.toLowerCase() === 'female' ? 'bg-pink-50 text-pink-600 border-pink-100' :
                            'bg-gray-50 text-gray-600 border-gray-100'
                        }`}>
                        {row.gender || 'Other'}
                    </span>
                </div>
            )
        },
        {
            key: "resultStatus",
            label: "Result",
            render: (value: string) => (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${value === 'PASS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        value === 'FAIL' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            'bg-gray-50 text-gray-500 border-gray-100'
                    }`}>
                    {value || 'PENDING'}
                </span>
            )
        },
        {
            key: "email",
            label: "Account",
            render: (val: string) => <span className="text-[11px] text-indigo-600 font-medium underline underline-offset-2">{val || 'No Email'}</span>
        },
        {
            key: "actions",
            label: "Actions",
            render: (value: any, row: any) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={async (e) => {
                            e.stopPropagation();
                            if (!confirm("Are you sure you want to delete this student?")) return;
                            try {
                                const token = localStorage.getItem('token');
                                const res = await fetch(`${API_URL}/api/students/${row._id}`, {
                                    method: 'DELETE',
                                    headers: { 'Authorization': `Bearer ${token}` }
                                });
                                if (res.ok) {
                                    toast({ title: "Deleted", description: "Student deleted successfully" });
                                    handleSearch(); // Refresh list
                                } else {
                                    throw new Error("Failed to delete");
                                }
                            } catch (err) {
                                toast({ title: "Error", description: "Could not delete student", variant: "destructive" });
                            }
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <DashboardLayout title="Student Explorer">
            <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Student Directory</h1>
                        <p className="text-sm text-gray-500">Comprehensive database of all enrolled students and their profiles</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="gap-2 border-gray-200 shadow-sm hover:bg-white active:scale-95 transition-all"
                            onClick={() => window.print()}
                        >
                            <Printer className="h-4 w-4 text-gray-600" /> <span className="hidden sm:inline">Print Batch</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2 border-gray-200 shadow-sm hover:bg-white active:scale-95 transition-all"
                            onClick={() => {
                                const headers = ["Student ID", "First Name", "Last Name", "Class", "Section", "Parent Name", "Parent Phone", "Gender", "DOB"];
                                const csvContent = [
                                    headers.join(","),
                                    ...students.map((s: any) => [
                                        s.studentId, s.firstName, s.lastName, s.class, s.section, s.parentName || s.guardianName,
                                        s.parentPhone || s.guardianPhone, s.gender, s.dateOfBirth
                                    ].join(","))
                                ].join("\n");
                                const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.href = url;
                                link.setAttribute("download", "student_details_export.csv");
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                        >
                            <Download className="h-4 w-4 text-emerald-600" /> <span className="hidden sm:inline">Export CSV</span>
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Active"
                        value={students.length.toString()}
                        icon={Users}
                        iconColor="text-indigo-600"
                        iconBgColor="bg-indigo-50"
                        description="Currently enrolled"
                    />
                    <StatCard
                        title="New Admissions"
                        value="3"
                        icon={GraduationCap}
                        iconColor="text-emerald-600"
                        iconBgColor="bg-emerald-50"
                        description="This session"
                    />
                    <StatCard
                        title="Total Classes"
                        value={classes.length.toString()}
                        icon={School}
                        iconColor="text-orange-600"
                        iconBgColor="bg-orange-50"
                        description="Academic levels"
                    />
                    <StatCard
                        title="User Portals"
                        value={students.length.toString()}
                        icon={UserCheck}
                        iconColor="text-purple-600"
                        iconBgColor="bg-purple-50"
                        description="Students with logins"
                    />
                </div>

                {/* Filter Section */}
                <Card className="border-none shadow-xl shadow-indigo-100/20 bg-white overflow-hidden ring-1 ring-gray-100">
                    <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-white border-b border-gray-100 py-4 px-6 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-100">
                                <Filter className="h-4 w-4" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold text-gray-800">Advanced Search</CardTitle>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Refine student results</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => { setSearchCriteria({ class: "", section: "", caste: "", keyword: "" }); handleSearch() }} className="text-gray-400 hover:text-indigo-600 gap-1 text-[11px]">
                            <RefreshCw className="h-3 w-3" /> Reset
                        </Button>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                            <div className="md:col-span-3 space-y-2.5">
                                <Label className="text-gray-700 font-bold text-xs uppercase tracking-tight">Academic Year Class</Label>
                                <Select onValueChange={(v) => setSearchCriteria({ ...searchCriteria, class: v })} value={searchCriteria.class}>
                                    <SelectTrigger className="h-12 bg-gray-50/50 border-gray-100 focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all">
                                        <SelectValue placeholder="All Classes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Classes</SelectItem>
                                        {classes.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-2 space-y-2.5">
                                <Label className="text-gray-700 font-bold text-xs uppercase tracking-tight">Structural Section</Label>
                                <Select onValueChange={(v) => setSearchCriteria({ ...searchCriteria, section: v })} value={searchCriteria.section}>
                                    <SelectTrigger className="h-12 bg-gray-50/50 border-gray-100 focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all">
                                        <SelectValue placeholder="All Sections" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Sections</SelectItem>
                                        {sections.map(s => (
                                            <SelectItem key={s.id} value={s.id}>Section {s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-2 space-y-2.5">
                                <Label className="text-gray-700 font-bold text-xs uppercase tracking-tight">Caste Category</Label>
                                <Select onValueChange={(v) => setSearchCriteria({ ...searchCriteria, caste: v })} value={searchCriteria.caste}>
                                    <SelectTrigger className="h-12 bg-gray-50/50 border-gray-100 focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all">
                                        <SelectValue placeholder="All Castes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Castes</SelectItem>
                                        <SelectItem value="General">General</SelectItem>
                                        <SelectItem value="OBC">OBC</SelectItem>
                                        <SelectItem value="SC">SC</SelectItem>
                                        <SelectItem value="ST">ST</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-3 space-y-2.5">
                                <Label className="text-gray-700 font-bold text-xs uppercase tracking-tight">Keyword Identification</Label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                                    <Input
                                        placeholder="Identification #..."
                                        className="pl-11 h-12 bg-gray-50/50 border-gray-100 focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all"
                                        value={searchCriteria.keyword}
                                        onChange={(e) => setSearchCriteria({ ...searchCriteria, keyword: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <Button
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200/50 transition-all active:scale-95 group font-bold tracking-wide"
                                >
                                    {loading ? (
                                        <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Search className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                            Apply Filters
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Table */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
                    <AdvancedTable
                        title="Enrolment Records"
                        columns={columns}
                        data={students}
                        searchable={true}
                        searchPlaceholder="Real-time filter results..."
                        selectable={true}
                        loading={loading}
                        pagination
                        pageSize={10}
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}
