"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import {
    Users,
    Search,
    Filter,
    Download,
    Loader2,
    ShieldCheck,
    AlertCircle,
    UserX,
    UserCheck,
    FileSpreadsheet,
    Trash2,
    RotateCcw,
    X
} from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ActionMenu } from "@/components/action-menu"
import { toast } from "sonner"
import { API_URL } from "@/lib/api-config"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function UsersPage() {
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [currentTab, setCurrentTab] = useState("student")
    const [users, setUsers] = useState<any[]>([])
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    // Filter states
    const [showFilters, setShowFilters] = useState(false)
    const [classes, setClasses] = useState<any[]>([])
    const [selectedClass, setSelectedClass] = useState("all")
    const [selectedSection, setSelectedSection] = useState("all")

    // Delete dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [targetUser, setTargetUser] = useState<any>(null)

    useEffect(() => {
        fetchUsers()
    }, [currentTab, selectedClass, selectedSection])

    useEffect(() => {
        fetchClasses()
    }, [])

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/classes`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await response.json()
            if (Array.isArray(data)) setClasses(data)
        } catch (error) {
            console.error("Classes fetch failed")
        }
    }

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            let url = `${API_URL}/api/user-management?role=${currentTab}`
            if (selectedClass !== "all") url += `&classId=${selectedClass}`
            if (selectedSection !== "all") url += `&section=${selectedSection}`
            if (searchTerm) url += `&searchTerm=${searchTerm}`

            const response = await fetch(url, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await response.json()
            if (Array.isArray(data)) {
                setUsers(data)
            }
        } catch (error) {
            toast.error("Failed to load user list")
        } finally {
            setLoading(false)
        }
    }

    const toggleStatus = async (userId: string, currentStatus: boolean) => {
        if (!userId) {
            toast.error("No login account linked to this record")
            return
        }
        try {
            setActionLoading(userId)
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/user-management/${userId}/status`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: !currentStatus })
            })
            if (response.ok) {
                toast.success(`User access ${!currentStatus ? 'enabled' : 'disabled'}`)
                setUsers(users.map(u => u.userId === userId ? { ...u, status: !currentStatus } : u))
            }
        } catch (error) {
            toast.error("Status update failed")
        } finally {
            setActionLoading(null)
        }
    }

    const handleDeleteAccount = async () => {
        if (!targetUser?.userId) return
        try {
            setActionLoading(targetUser.userId)
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/user-management/${targetUser.userId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (response.ok) {
                toast.success("Login account permanently removed")
                fetchUsers()
            } else {
                const err = await response.json()
                toast.error(err.message || "Deletion failed")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setActionLoading(null)
            setDeleteDialogOpen(false)
            setTargetUser(null)
        }
    }

    const downloadCSV = () => {
        if (users.length === 0) return
        const headers = currentTab === 'student'
            ? ['Admission No', 'Name', 'Username', 'Class', 'Father Name', 'Mobile', 'Status']
            : currentTab === 'staff'
                ? ['ID', 'Name', 'Email', 'Role', 'Department', 'Phone', 'Status']
                : ['Guardian Name', 'Phone', 'Username', 'Status']

        const rows = users.map(u => {
            if (currentTab === 'student') return [u.studentId, `${u.firstName} ${u.lastName}`, u.userName, `${u.class}-${u.section}`, u.fatherName, u.phone, u.status ? 'Active' : 'Disabled']
            if (currentTab === 'staff') return [u.staffId || u.teacherId, u.name, u.email, u.role, u.department, u.phone, u.status ? 'Active' : 'Disabled']
            return [u.guardianName, u.guardianPhone, u.userName, u.status ? 'Active' : 'Disabled']
        })

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `Users_${currentTab}_${new Date().toLocaleDateString()}.csv`)
        link.click()
    }

    const activeSections = classes.find(c => c._id === selectedClass)?.sections || []

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="p-2 bg-indigo-100 rounded-md">
                        <Users className="w-6 h-6 text-indigo-700" />
                    </span>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Management Center</h1>
                        <p className="text-sm text-gray-500">Global access control and account auditing for all stakeholders.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2" onClick={downloadCSV}>
                        <FileSpreadsheet size={16} className="text-green-600" />
                        Export directory
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm">
                <div className="p-6">
                    <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
                            <TabsList className="bg-gray-100/80 p-1 rounded-xl h-11 border">
                                <TabsTrigger value="student" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-md px-6 font-bold transition-all">Student Portal</TabsTrigger>
                                <TabsTrigger value="staff" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-md px-6 font-bold transition-all">Staff/Faculty</TabsTrigger>
                                <TabsTrigger value="parent" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-md px-6 font-bold transition-all">Parent Access</TabsTrigger>
                            </TabsList>

                            <div className="flex items-center gap-3 w-full xl:w-auto">
                                <div className="relative flex-1 xl:w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Fast search..."
                                        className="pl-10 h-10 shadow-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                                    />
                                </div>
                                <Button
                                    variant={showFilters ? "secondary" : "default"}
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`h-10 px-6 gap-2 transition-all ${!showFilters && 'bg-indigo-600 hover:bg-black shadow-lg'}`}
                                >
                                    {showFilters ? <X size={16} /> : <Filter size={16} />}
                                    {showFilters ? "Close" : "Advanced Filter"}
                                </Button>
                            </div>
                        </div>

                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-indigo-50/30 rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                                {currentTab === 'student' && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase text-indigo-700 ml-1">Class</label>
                                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                                <SelectTrigger className="bg-white h-9 border-indigo-100"><SelectValue placeholder="Select Class" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Classes</SelectItem>
                                                    {classes.map(c => <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase text-indigo-700 ml-1">Section</label>
                                            <Select value={selectedSection} onValueChange={setSelectedSection}>
                                                <SelectTrigger className="bg-white h-9 border-indigo-100"><SelectValue placeholder="Select Section" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Sections</SelectItem>
                                                    {['A', 'B', 'C', 'D'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}
                                <div className="flex items-end flex-wrap gap-2">
                                    <Button size="sm" onClick={fetchUsers} className="h-9 bg-indigo-700">Apply Filter</Button>
                                    <Button size="sm" variant="ghost" onClick={() => { setSelectedClass("all"); setSelectedSection("all"); setSearchTerm(""); }}>Reset</Button>
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="flex h-96 flex-col items-center justify-center gap-4">
                                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                                <p className="text-sm font-medium animate-pulse">Scanning user database...</p>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-inner bg-white">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                                            {currentTab === 'student' && (
                                                <>
                                                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-gray-500">Admn No.</TableHead>
                                                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-gray-500">Student Name</TableHead>
                                                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-gray-500">Class/Sec</TableHead>
                                                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-gray-500">Parent</TableHead>
                                                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-gray-500">Login User</TableHead>
                                                </>
                                            )}
                                            {currentTab === 'staff' && (
                                                <>
                                                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-gray-500">Emp ID</TableHead>
                                                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-gray-500">Staff Name</TableHead>
                                                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-gray-500">Role/Group</TableHead>
                                                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-gray-500">Dept.</TableHead>
                                                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-gray-500">Type</TableHead>
                                                </>
                                            )}
                                            {currentTab === 'parent' && (
                                                <>
                                                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-gray-500">Guardian Name</TableHead>
                                                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-gray-500">Mobile Number</TableHead>
                                                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-gray-500">Login ID</TableHead>
                                                </>
                                            )}
                                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-gray-500 text-right pr-6">Portal Auth</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="h-64 text-center">
                                                    <div className="flex flex-col items-center justify-center opacity-40">
                                                        <Search size={48} className="mb-2" />
                                                        <p>No records found in {currentTab} directory.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            users.map((item, idx) => (
                                                <TableRow key={idx} className="hover:bg-indigo-50/30 transition-all border-b border-gray-50 group">
                                                    {currentTab === 'student' && (
                                                        <>
                                                            <TableCell className="font-mono text-[11px] text-indigo-600 font-bold">{item.studentId}</TableCell>
                                                            <TableCell className="font-bold text-gray-900">{item.firstName} {item.lastName}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 text-[10px] uppercase font-bold">{item.class}-{item.section}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-xs">{item.fatherName || item.parentName || "-"}</TableCell>
                                                            <TableCell className="text-xs font-mono bg-gray-50/50 px-2 py-0.5 rounded border border-gray-100">{item.userName}</TableCell>
                                                        </>
                                                    )}
                                                    {currentTab === 'staff' && (
                                                        <>
                                                            <TableCell className="font-mono text-[11px] text-indigo-600 font-bold">{item.staffId || item.teacherId}</TableCell>
                                                            <TableCell className="font-bold text-gray-900">{item.name}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="secondary" className="font-bold text-[10px] uppercase bg-green-50 text-green-700 border-green-100">{item.role}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-xs text-gray-500">{item.department || "-"}</TableCell>
                                                            <TableCell>
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.type === 'Teacher' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                    {item.type}
                                                                </span>
                                                            </TableCell>
                                                        </>
                                                    )}
                                                    {currentTab === 'parent' && (
                                                        <>
                                                            <TableCell className="font-bold text-gray-900">{item.guardianName}</TableCell>
                                                            <TableCell className="text-xs text-indigo-600 font-bold">{item.guardianPhone}</TableCell>
                                                            <TableCell className="text-xs font-mono bg-gray-50/50 px-2 py-0.5 rounded border border-gray-100">{item.userName}</TableCell>
                                                        </>
                                                    )}
                                                    <TableCell className="text-right pr-6">
                                                        <div className="flex justify-end items-center gap-4">
                                                            <div className="flex items-center gap-2">
                                                                {actionLoading === item.userId && item.userId ? (
                                                                    <Loader2 size={16} className="animate-spin text-indigo-600" />
                                                                ) : (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Switch
                                                                                    disabled={!item.userId}
                                                                                    checked={item.status}
                                                                                    onCheckedChange={() => toggleStatus(item.userId, item.status)}
                                                                                    className="data-[state=checked]:bg-green-600 shadow-sm disabled:opacity-30"
                                                                                />
                                                                            </TooltipTrigger>
                                                                            <TooltipContent className="bg-indigo-900 border-none text-white text-[10px]">
                                                                                {item.userId ? (item.status ? 'Revoke Login Access' : 'Grant Login Access') : 'No System Account Found'}
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                )}
                                                            </div>
                                                            <ActionMenu>
                                                                <DropdownMenuItem onClick={() => toast.info("Profile viewing under development")} className="cursor-pointer">
                                                                    <RotateCcw className="mr-2 h-4 w-4" />
                                                                    <span>View Logins</span>
                                                                </DropdownMenuItem>
                                                                {item.userId && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setTargetUser(item);
                                                                            setDeleteDialogOpen(true);
                                                                        }}
                                                                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        <span className="font-bold">Delete Auth</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </ActionMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </Tabs>

                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 p-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span><strong>{users.filter(u => u.status).length}</strong> Users currently active on portal.</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Account Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="border-t-4 border-t-red-600">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-700">
                            <AlertCircle /> Irreversible Action
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600">
                            You are about to permanently delete the login account for <strong>{targetUser?.firstName || targetUser?.guardianName || targetUser?.name}</strong>.
                            This will result in an immediate logout and they won't be able to access the portal until a new account is created.
                            Personal data in the ERP remains safe.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel Protection</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-red-600 hover:bg-black text-white font-bold"
                        >
                            Yes, Erase Access Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
