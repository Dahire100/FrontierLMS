"use client"

import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import FormModal, { FormField } from "@/components/form-modal"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { Button } from "@/components/ui/button"
import {
    Plus,
    FileEdit,
    UserCircle2,
    Building2,
    PhoneCall,
    CalendarDays,
    UserPlus,
    BookOpenCheck,
    ClipboardList,
    GraduationCap
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ExamItem {
    id: string
    name: string
    fatherName?: string
    phone: string
    gender?: string
    dob: string
    examName?: string
    formNo?: string
    centerName?: string
    image?: string
}

export default function EntranceExamPage() {
    const { toast } = useToast()
    const [exams, setExams] = useState<ExamItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
        open: false,
        id: null
    })

    useEffect(() => {
        fetchExams()
    }, [])

    const fetchExams = async () => {
        setLoading(true)
        try {
            const response = await apiFetch(API_ENDPOINTS.ENTRANCE_EXAM)
            if (response.ok) {
                const data = await response.json()
                const mappedArray = Array.isArray(data) ? data : data.data || []
                setExams(mappedArray.map((e: any) => ({
                    id: e._id,
                    name: e.name,
                    fatherName: e.fatherName,
                    phone: e.phone,
                    gender: e.gender,
                    dob: new Date(e.dob).toLocaleDateString(),
                    examName: e.examName,
                    formNo: e.formNo,
                    centerName: e.centerName,
                    image: e.image
                })))
            } else {
                toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
            }
        } catch (error) {
            console.error('Error fetching exams:', error)
            toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (data: any) => {
        try {
            const response = await apiFetch(API_ENDPOINTS.ENTRANCE_EXAM, {
                method: 'POST',
                body: JSON.stringify(data)
            })
            if (response.ok) {
                toast({ title: "Success", description: "Application registered successfully." })
                fetchExams()
                setIsModalOpen(false)
            } else {
                toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
            }
        } catch (error) {
            console.error('Error registering exam:', error)
            toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
        }
    }

    const handleEdit = async (id: string, data: any) => {
        try {
            const response = await apiFetch(`${API_ENDPOINTS.ENTRANCE_EXAM}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            })
            if (response.ok) {
                toast({ title: "Updated", description: "Application details refined." })
                fetchExams()
                setIsModalOpen(false)
                setEditingId(null)
            } else {
                toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
            }
        } catch (error) {
            console.error('Error updating exam:', error)
            toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
        }
    }

    const confirmDelete = async () => {
        if (!deleteConfirm.id) return
        try {
            const response = await apiFetch(`${API_ENDPOINTS.ENTRANCE_EXAM}/${deleteConfirm.id}`, {
                method: 'DELETE'
            })
            if (response.ok) {
                toast({ title: "Deleted", description: "Application purged from records." })
                fetchExams()
            } else {
                toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
            }
        } catch (error) {
            console.error('Error deleting exam:', error)
            toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
        } finally {
            setDeleteConfirm({ open: false, id: null })
        }
    }

    const columns = [
        {
            key: "name",
            label: "Candidate profile",
            sortable: true,
            render: (value: string, row: ExamItem) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-orange-50 rounded-full flex items-center justify-center border border-orange-100 font-bold text-orange-600 text-xs shadow-sm">
                        {value.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 leading-tight">{value}</span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                            DOB: {row.dob} | {row.gender}
                        </span>
                    </div>
                </div>
            )
        },
        {
            key: "examName",
            label: "Examination Identity",
            sortable: true,
            render: (value: string, row: ExamItem) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-xs text-gray-800">{value || "General Intake"}</span>
                    <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                        <ClipboardList size={10} /> Form: {row.formNo || "PENDING"}
                    </span>
                </div>
            )
        },
        {
            key: "centerName",
            label: "Venu / Center",
            sortable: true,
            render: (value: string) => value ? (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium bg-gray-50 px-2 py-1 rounded-md border border-gray-100 italic w-fit">
                    <Building2 size={12} className="text-gray-400" /> {value}
                </div>
            ) : <span className="text-gray-300 text-[10px]">Pending Allocation</span>
        },
        {
            key: "phone",
            label: "Contact Gateway",
            sortable: true,
            render: (value: string) => (
                <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold">
                    <PhoneCall size={12} /> {value}
                </div>
            )
        }
    ]

    const formFields: FormField[] = [
        { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Candidate's legal name" },
        { name: "fatherName", label: "Guardian / Father Name", type: "text", required: false, placeholder: "Legal guardian name" },
        { name: "phone", label: "Emergency Contact", type: "text", required: true, placeholder: "Primary mobile number" },
        {
            name: "gender",
            label: "Gender Identity",
            type: "select",
            options: [
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Non-binary / Other" }
            ],
            required: false
        },
        { name: "dob", label: "Date of Birth", type: "date", required: true },
        { name: "examName", label: "Exam Title", type: "text", required: true, placeholder: "e.g. Grade 1 Entrance 2024" },
        { name: "formNo", label: "Application Form #", type: "text", required: true, placeholder: "Internal tracking number" },
        { name: "centerName", label: "Examination Center", type: "text", required: false, placeholder: "Allocated venue" },
        { name: "note", label: "Administrative Notes", type: "textarea", required: false, placeholder: "Disability reqs, scholarship notes, etc." },
    ]

    const stats = {
        total: exams.length,
        today: exams.filter(e => e.dob === new Date().toLocaleDateString()).length, // This is DOB, maybe not registration date but used for demo
        male: exams.filter(e => e.gender === 'Male').length,
        female: exams.filter(e => e.gender === 'Female').length
    }

    return (
        <DashboardLayout title="Entrance Command">
            <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <GraduationCap className="text-orange-600" size={24} />
                            Examination Intake
                        </h1>
                        <p className="text-sm text-gray-500">Manage all external candidates and entrance evaluation workflows</p>
                    </div>
                    <Button
                        onClick={() => { setEditingId(null); setIsModalOpen(true); }}
                        className="bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-100 gap-2 h-11 px-6 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                    >
                        <Plus className="h-4 w-4" /> Register Candidate
                    </Button>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Applications"
                        value={stats.total.toString()}
                        icon={ClipboardList}
                        iconColor="text-blue-600"
                        iconBgColor="bg-blue-50"
                        description="Intake database size"
                    />
                    <StatCard
                        title="Male Candidates"
                        value={stats.male.toString()}
                        icon={UserPlus}
                        iconColor="text-indigo-600"
                        iconBgColor="bg-indigo-50"
                        description="Cumulative male"
                    />
                    <StatCard
                        title="Female Candidates"
                        value={stats.female.toString()}
                        icon={UserCircle2}
                        iconColor="text-pink-600"
                        iconBgColor="bg-pink-50"
                        description="Cumulative female"
                    />
                    <StatCard
                        title="Tests Pending"
                        value={exams.filter(e => !e.centerName).length.toString()}
                        icon={BookOpenCheck}
                        iconColor="text-amber-600"
                        iconBgColor="bg-amber-50"
                        description="Requiring allocation"
                    />
                </div>

                <AdvancedTable
                    title="Consolidated Intake registry"
                    columns={columns}
                    data={exams}
                    loading={loading}
                    searchable
                    searchPlaceholder="Audit by candidate name, phone or form number..."
                    pagination
                    onEdit={(row) => {
                        setEditingId(row.id)
                        setIsModalOpen(true)
                    }}
                    onDelete={(row) => setDeleteConfirm({ open: true, id: row.id })}
                />

                <FormModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false)
                        setEditingId(null)
                    }}
                    title={editingId ? "Refine Candidate profile" : "Capture New Intake Application"}
                    fields={formFields}
                    initialData={editingId ? exams.find(e => e.id === editingId) : undefined}
                    onSubmit={(data: any) => editingId ? handleEdit(editingId, data) : handleAdd(data)}
                />

                <ConfirmationDialog
                    open={deleteConfirm.open}
                    onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
                    onConfirm={confirmDelete}
                    title="Expunge Application permanently?"
                    description="This will purge the candidate's entrance examination data from the system. This action is terminal."
                    variant="destructive"
                />
            </div>
        </DashboardLayout>
    )
}
