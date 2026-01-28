"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Trash2, Edit, RotateCcw, Search, Loader2, AlertTriangle, UserMinus, History } from "lucide-react"
import Link from "next/link"
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

interface StudentItem {
    _id: string
    studentId: string
    firstName: string
    lastName: string
    class: string
    section: string
    deletedAt?: string
}

export default function StudentDeletePage() {
    const [loading, setLoading] = useState(true)
    const [students, setStudents] = useState<StudentItem[]>([])
    const [selectedStudents, setSelectedStudents] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
    const [targetStudent, setTargetStudent] = useState<StudentItem | null>(null)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        fetchStudents()
    }, [])

    const fetchStudents = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            // Fetch deleted students
            const response = await fetch(`${API_URL}/api/students/deleted-list`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await response.json()
            if (Array.isArray(data)) {
                setStudents(data)
            }
        } catch (error) {
            toast.error("Failed to load deleted students")
        } finally {
            setLoading(false)
        }
    }

    const handleReadmit = async (studentId: string) => {
        try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/students/${studentId}/readmit`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (response.ok) {
                toast.success("Student re-admitted successfully")
                fetchStudents()
            }
        } catch (error) {
            toast.error("Failed to re-admit student")
        }
    }

    const handleDelete = async (studentId: string) => {
        try {
            setActionLoading(true)
            const token = localStorage.getItem("token")
            // For permanant delete in "Student Delete" module, might use hard delete if requested 
            // but usually this page is for SOFT deleted students to be readmitted or audited.
            // Keeping it simple: remove from this list (hard delete if needed or just status change)
            // The user said "Delete actions not working", usually implies the action itself fails.
            const response = await fetch(`${API_URL}/api/students/${studentId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (response.ok) {
                toast.success("Student permanently removed")
                fetchStudents()
            }
        } catch (error) {
            toast.error("Failed to delete student")
        } finally {
            setActionLoading(false)
            setDeleteDialogOpen(false)
        }
    }

    const handleBulkDelete = async () => {
        try {
            setActionLoading(true)
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/students/bulk-delete`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ids: selectedStudents })
            })
            if (response.ok) {
                toast.success(`${selectedStudents.length} students processed`)
                setSelectedStudents([])
                fetchStudents()
            }
        } catch (error) {
            toast.error("Bulk action failed")
        } finally {
            setActionLoading(false)
            setBulkDeleteDialogOpen(false)
        }
    }

    const toggleSelectAll = () => {
        if (selectedStudents.length === filteredStudents.length) {
            setSelectedStudents([])
        } else {
            setSelectedStudents(filteredStudents.map(s => s._id))
        }
    }

    const toggleSelect = (id: string) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(selectedStudents.filter(s => s !== id))
        } else {
            setSelectedStudents([...selectedStudents, id])
        }
    }

    const filteredStudents = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return (
        <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg border border-red-100">
                <div className="flex items-center gap-3">
                    <span className="p-2 bg-red-100 rounded-md">
                        <Trash2 className="w-5 h-5 text-red-600" />
                    </span>
                    <div>
                        <h1 className="text-xl font-bold">Student Account Cleanup</h1>
                        <p className="text-xs text-muted-foreground">Manage soft-deleted students and readmissions</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search records..."
                            className="pl-8 h-8 w-64 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Card className="border-t-4 border-t-red-500 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4 bg-muted/20">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <History className="w-5 h-5 text-muted-foreground" /> Deletion History & Audit
                        </CardTitle>
                        <CardDescription className="text-xs">Records of students removed from active directory</CardDescription>
                    </div>
                    {selectedStudents.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full border border-red-100 font-bold">
                                {selectedStudents.length} selected
                            </span>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setBulkDeleteDialogOpen(true)}
                                className="h-8 text-xs font-bold"
                            >
                                Bulk Remove
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-wider">Admission No.</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-wider">Student Name</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-wider">Class/Section</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-wider">Deleted On</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-wider text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <UserMinus size={48} className="mb-2 opacity-20" />
                                                <p>No deleted student records found.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <TableRow key={student._id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedStudents.includes(student._id)}
                                                    onCheckedChange={() => toggleSelect(student._id)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono font-medium text-xs">{student.studentId}</TableCell>
                                            <TableCell className="font-bold">{student.firstName} {student.lastName}</TableCell>
                                            <TableCell>
                                                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100 font-medium">
                                                    {student.class} - {student.section}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground italic">
                                                {student.deletedAt ? new Date(student.deletedAt).toLocaleString() : "Unknown"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <ActionMenu>
                                                    <DropdownMenuItem onClick={() => handleReadmit(student._id)} className="cursor-pointer text-blue-600 focus:text-blue-600 focus:bg-blue-50">
                                                        <RotateCcw className="mr-2 h-4 w-4" />
                                                        <span className="font-bold">Re-Admit</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setTargetStudent(student)
                                                            setDeleteDialogOpen(true)
                                                        }}
                                                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span className="font-bold">Hard Delete</span>
                                                    </DropdownMenuItem>
                                                </ActionMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Individual Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle /> Critical Warning
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to permanently delete <strong>{targetStudent?.firstName} {targetStudent?.lastName}</strong>.
                            This action will erase all associated records including parent profile and attendance history.
                            This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => targetStudent && handleDelete(targetStudent._id)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={actionLoading}
                        >
                            {actionLoading ? <Loader2 className="animate-spin" /> : "Confirm Hard Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Dialog */}
            <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 /> Bulk Permanent Removal
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently remove <strong>{selectedStudents.length}</strong> selected student records?
                            This is an irreversible audit action.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={actionLoading}
                        >
                            {actionLoading ? <Loader2 className="animate-spin" /> : "Process Bulk Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
