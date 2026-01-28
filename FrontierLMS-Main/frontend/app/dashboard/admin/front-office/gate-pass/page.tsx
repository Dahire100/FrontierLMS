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
    ShieldCheck,
    DoorOpen,
    Users,
    UserSquare2,
    Clock,
    Calendar,
    Image as ImageIcon,
    ArrowUpRight,
    ArrowDownLeft,
    History
} from "lucide-react"
import { ViewGatePassModal } from "@/components/front-office/view-gate-pass-modal"
import { useToast } from "@/components/ui/use-toast"

interface GatePassItem {
    id: string
    issuedTo: "Student" | "Staff"
    name: string
    personCarrying?: string
    startDate: string
    endDate: string
    inTime?: string
    outTime?: string
    note?: string
    image?: string
}

export default function GatePassPage() {
    const { toast } = useToast()
    const [passes, setPasses] = useState<GatePassItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [viewingId, setViewingId] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
        open: false,
        id: null
    })

    useEffect(() => {
        fetchPasses()
    }, [])

    const fetchPasses = async () => {
        setLoading(true)
        try {
            const response = await apiFetch(API_ENDPOINTS.FRONT_OFFICE.GATE_PASS)
            if (response.ok) {
                const data = await response.json()
                setPasses((Array.isArray(data) ? data : data.data || []).map((p: any) => ({
                    id: p._id,
                    issuedTo: p.issuedTo,
                    name: p.name,
                    personCarrying: p.personCarrying,
                    startDate: new Date(p.startDate).toLocaleDateString(),
                    endDate: new Date(p.endDate).toLocaleDateString(),
                    inTime: p.inTime,
                    outTime: p.outTime,
                    note: p.note,
                    image: p.image
                })))
            } else {
                toast({ title: "Error", description: "Failed to load authorization logs.", variant: "destructive" })
            }
        } catch (error) {
            console.error('Error fetching gate passes:', error)
            toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (data: any) => {
        try {
            const response = await apiFetch(API_ENDPOINTS.FRONT_OFFICE.GATE_PASS, {
                method: 'POST',
                body: JSON.stringify(data)
            })
            if (response.ok) {
                toast({ title: "Success", description: "Gate pass issued successfully." })
                fetchPasses()
                setIsModalOpen(false)
            } else {
                toast({ title: "Error", description: "Failed to issue gate pass.", variant: "destructive" })
            }
        } catch (error) {
            console.error('Error issuing pass:', error)
            toast({ title: "Error", description: "Failed to issue gate pass.", variant: "destructive" })
        }
    }

    const handleEdit = async (id: string, data: any) => {
        try {
            const response = await apiFetch(`${API_ENDPOINTS.FRONT_OFFICE.GATE_PASS}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            })
            if (response.ok) {
                toast({ title: "Updated", description: "Authorization record refined." })
                fetchPasses()
                setIsModalOpen(false)
                setEditingId(null)
            } else {
                toast({ title: "Error", description: "Failed to update record.", variant: "destructive" })
            }
        } catch (error) {
            console.error('Error updating pass:', error)
            toast({ title: "Error", description: "Failed to update record.", variant: "destructive" })
        }
    }

    const confirmDelete = async () => {
        if (!deleteConfirm.id) return
        try {
            const response = await apiFetch(`${API_ENDPOINTS.FRONT_OFFICE.GATE_PASS}/${deleteConfirm.id}`, {
                method: 'DELETE'
            })
            if (response.ok) {
                toast({ title: "Deleted", description: "Authorization record purged." })
                fetchPasses()
            } else {
                toast({ title: "Error", description: "Failed to delete record.", variant: "destructive" })
            }
        } catch (error) {
            console.error('Error deleting pass:', error)
            toast({ title: "Error", description: "Failed to delete record.", variant: "destructive" })
        } finally {
            setDeleteConfirm({ open: false, id: null })
        }
    }

    const columns = [
        {
            key: "name",
            label: "Authorized Entity",
            sortable: true,
            render: (value: string, row: GatePassItem) => (
                <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center border font-bold text-xs ${row.issuedTo === 'Student' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-purple-50 border-purple-100 text-purple-600'
                        }`}>
                        {row.issuedTo === 'Student' ? 'ST' : 'SF'}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{value}</span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                            Issued to {row.issuedTo}
                        </span>
                    </div>
                </div>
            )
        },
        {
            key: "personCarrying",
            label: "Escort/Guardian",
            sortable: true,
            render: (value: string) => value ? (
                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium bg-gray-50 px-2 py-1 rounded w-fit">
                    <UserSquare2 size={12} className="text-gray-400" /> {value}
                </div>
            ) : <span className="text-gray-300 italic text-[10px]">Self/None</span>
        },
        {
            key: "timeline",
            label: "Validity period",
            render: (_: any, row: GatePassItem) => (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                        <ArrowUpRight size={10} /> {row.startDate}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-red-600">
                        <ArrowDownLeft size={10} /> {row.endDate}
                    </div>
                </div>
            )
        },
        {
            key: "times",
            label: "In/Out Window",
            render: (_: any, row: GatePassItem) => (
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                        <Clock size={12} className="text-emerald-500" /> {row.inTime || "N/A"}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                        <Clock size={12} className="text-red-500" /> {row.outTime || "N/A"}
                    </span>
                </div>
            )
        }
    ]

    const formFields: FormField[] = [
        {
            name: "issuedTo",
            label: "Recipient Category",
            type: "radio",
            options: [
                { value: "Student", label: "Student" },
                { value: "Staff", label: "Staff Member" }
            ],
            required: true
        },
        { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Name of person issued to" },
        { name: "startDate", label: "Effective From", type: "date", required: true },
        { name: "endDate", label: "Expires On", type: "date", required: true },
        { name: "inTime", label: "Authorized Entry Time", type: "time", required: false },
        { name: "outTime", label: "Authorized Exit Time", type: "time", required: false },
        { name: "personCarrying", label: "Guardian / Escort Name", type: "text", required: false, placeholder: "Optional: for students" },
        { name: "note", label: "Justification/Notes", type: "textarea", required: false, placeholder: "Reason for gate pass..." },
    ]

    const stats = {
        total: passes.length,
        activeToday: passes.filter(p => {
            const today = new Date().toLocaleDateString();
            return p.startDate === today;
        }).length,
        studentPasses: passes.filter(p => p.issuedTo === 'Student').length,
        staffPasses: passes.filter(p => p.issuedTo === 'Staff').length
    }

    return (
        <DashboardLayout title="Movement Control">
            <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <ShieldCheck className="text-indigo-600" size={24} />
                            Gate Pass Command
                        </h1>
                        <p className="text-sm text-gray-500">Authorize and audit the physical entry/exit workflows of the campus</p>
                    </div>
                    <Button
                        onClick={() => { setEditingId(null); setIsModalOpen(true); }}
                        className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 gap-2 h-11 px-6 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                    >
                        <Plus className="h-4 w-4" /> Issue New Pass
                    </Button>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Issued"
                        value={stats.total.toString()}
                        icon={History}
                        iconColor="text-blue-600"
                        iconBgColor="bg-blue-50"
                        description="Lifetime record"
                    />
                    <StatCard
                        title="Daily Active"
                        value={stats.activeToday.toString()}
                        icon={DoorOpen}
                        iconColor="text-emerald-600"
                        iconBgColor="bg-emerald-50"
                        description="Valid today"
                    />
                    <StatCard
                        title="Student Passes"
                        value={stats.studentPasses.toString()}
                        icon={Users}
                        iconColor="text-amber-600"
                        iconBgColor="bg-amber-50"
                        description="Active scholars"
                    />
                    <StatCard
                        title="Staff Clearances"
                        value={stats.staffPasses.toString()}
                        icon={UserSquare2}
                        iconColor="text-purple-600"
                        iconBgColor="bg-purple-50"
                        description="Faculty movement"
                    />
                </div>

                <AdvancedTable
                    title="Consolidated Authorization Log"
                    columns={columns}
                    data={passes}
                    loading={loading}
                    searchable
                    searchPlaceholder="Track by name or justification..."
                    searchFields={['name', 'note', 'issuedTo', 'id']}
                    onView={(row) => setViewingId(row.id)}
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
                    title={editingId ? "Refine Authorization" : "New Secure Gate Pass"}
                    fields={formFields}
                    initialData={editingId ? passes.find(p => p.id === editingId) : undefined}
                    onSubmit={(data: any) => editingId ? handleEdit(editingId, data) : handleAdd(data)}
                />

                <ViewGatePassModal
                    isOpen={!!viewingId}
                    onClose={() => setViewingId(null)}
                    pass={passes.find(p => p.id === viewingId)}
                />

                <ConfirmationDialog
                    open={deleteConfirm.open}
                    onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
                    onConfirm={confirmDelete}
                    title="Void and Archive Authorization?"
                    description="This will permanently nullify this gate pass. Security personnel will no longer recognize this record."
                    variant="destructive"
                />
            </div>
        </DashboardLayout>
    )
}
