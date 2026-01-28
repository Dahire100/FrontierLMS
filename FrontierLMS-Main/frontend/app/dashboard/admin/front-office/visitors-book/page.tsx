"use client"

import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import FormModal, { FormField } from "@/components/form-modal"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { Button } from "@/components/ui/button"
import {
    Plus,
    Search,
    UserSquare2,
    Users,
    Clock,
    Calendar,
    MapPin,
    ClipboardList,
    UserPlus
} from "lucide-react"
import { ViewVisitorModal } from "@/components/front-office/view-visitor-modal"
import { useToast } from "@/components/ui/use-toast"

interface VisitorItem {
    id: string
    purpose: string
    name: string
    phone: string
    email?: string
    date: string
    inTime: string
    outTime?: string
    noOfPerson: number
    idCard?: string
    note?: string
}

export default function VisitorsBookPage() {
    const { toast } = useToast()
    const [visitors, setVisitors] = useState<VisitorItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [viewingId, setViewingId] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
        open: false,
        id: null
    })

    useEffect(() => {
        fetchVisitors();
    }, []);

    const fetchVisitors = async () => {
        setLoading(true)
        try {
            const response = await apiFetch(API_ENDPOINTS.FRONT_OFFICE.VISITORS);
            if (response.ok) {
                const data = await response.json();
                const mappedData = (Array.isArray(data) ? data : data.data || []).map((item: any) => ({
                    id: item._id,
                    purpose: item.purpose,
                    name: item.name,
                    phone: item.phone,
                    email: item.email,
                    date: new Date(item.date).toLocaleDateString(),
                    inTime: item.inTime || "N/A",
                    outTime: item.outTime || "Still In",
                    noOfPerson: item.noOfPerson || 1,
                    idCard: item.idCard,
                    note: item.note
                }));
                setVisitors(mappedData);
            } else {
                toast({ title: "Error", description: "Failed to load visitor records.", variant: "destructive" });
            }
        } catch (error) {
            console.error('Error fetching visitors:', error);
            toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
        } finally {
            setLoading(false)
        }
    };

    const handleAdd = async (data: any) => {
        try {
            const response = await apiFetch(API_ENDPOINTS.FRONT_OFFICE.VISITORS, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            if (response.ok) {
                toast({ title: "Success", description: "Visitor entry logged." });
                fetchVisitors();
                setIsModalOpen(false);
            } else {
                toast({ title: "Error", description: "Failed to log visitor.", variant: "destructive" });
            }
        } catch (error) {
            console.error('Error adding visitor:', error);
            toast({ title: "Error", description: "Failed to log visitor.", variant: "destructive" });
        }
    };

    const handleEdit = async (id: string, data: any) => {
        try {
            const response = await apiFetch(`${API_ENDPOINTS.FRONT_OFFICE.VISITORS}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            if (response.ok) {
                toast({ title: "Updated", description: "Visitor record updated." });
                fetchVisitors();
                setIsModalOpen(false);
                setEditingId(null);
            } else {
                toast({ title: "Error", description: "Failed to update record.", variant: "destructive" });
            }
        } catch (error) {
            console.error('Error updating visitor:', error);
            toast({ title: "Error", description: "Failed to update record.", variant: "destructive" });
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            const response = await apiFetch(`${API_ENDPOINTS.FRONT_OFFICE.VISITORS}/${deleteConfirm.id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                toast({ title: "Deleted", description: "Visitor record removed." });
                fetchVisitors();
            } else {
                toast({ title: "Error", description: "Failed to delete visitor.", variant: "destructive" });
            }
        } catch (error) {
            console.error('Error deleting visitor:', error);
            toast({ title: "Error", description: "Failed to delete visitor.", variant: "destructive" });
        } finally {
            setDeleteConfirm({ open: false, id: null });
        }
    };

    const columns = [
        {
            key: "name",
            label: "Visitor Details",
            sortable: true,
            render: (value: string, row: VisitorItem) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 font-bold text-emerald-600">
                        {value.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{value}</span>
                        <span className="text-[10px] text-gray-400 font-medium">
                            {row.phone} {row.email ? `| ${row.email}` : ''}
                        </span>
                    </div>
                </div>
            )
        },
        {
            key: "purpose",
            label: "Intent",
            sortable: true,
            render: (value: string) => (
                <span className="text-xs font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                    {value}
                </span>
            )
        },
        {
            key: "inTime",
            label: "Arrival",
            sortable: true,
            render: (value: string, row: VisitorItem) => (
                <div className="flex flex-col">
                    <span className="text-xs text-gray-900 font-bold flex items-center gap-1">
                        <Clock size={10} className="text-emerald-500" /> {value}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">{row.date}</span>
                </div>
            )
        },
        {
            key: "outTime",
            label: "Departure",
            sortable: true,
            render: (value: string) => (
                <span className={`text-xs font-medium ${value === "Still In" ? "text-orange-500 animate-pulse" : "text-gray-500"}`}>
                    {value}
                </span>
            )
        },
        {
            key: "noOfPerson",
            label: "Group Size",
            sortable: true,
            render: (value: number) => (
                <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-700">{value}</span>
                </div>
            )
        }
    ]

    const formFields: FormField[] = [
        { name: "name", label: "Visitor Name", type: "text", required: true, placeholder: "Enter visitor's full name" },
        { name: "phone", label: "Contact No.", type: "text", required: true, placeholder: "Active mobile number" },
        { name: "purpose", label: "Visiting Purpose", type: "text", required: true, placeholder: "e.g., Parent-Teacher Meeting, Maintenance..." },
        { name: "idCard", label: "ID/Identification", type: "text", required: false, placeholder: "Aadhar, DL, or Employee ID" },
        { name: "noOfPerson", label: "Count of Persons", type: "number", required: true, placeholder: "1" },
        { name: "date", label: "Visit Date", type: "date", required: true },
        { name: "inTime", label: "In Time", type: "time", required: true },
        { name: "outTime", label: "Out Time (Optional)", type: "time", required: false },
        { name: "note", label: "Special Remarks", type: "textarea", required: false, placeholder: "Any additional details..." },
    ];

    const stats = {
        total: visitors.length,
        active: visitors.filter(v => v.outTime === 'Still In' || !v.outTime).length,
        today: visitors.filter(v => v.date === new Date().toLocaleDateString()).length,
        groupVisits: visitors.filter(v => v.noOfPerson > 1).length
    }

    return (
        <DashboardLayout title="Access Control">
            <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <UserSquare2 className="text-emerald-600" size={24} />
                            Visitors Registry
                        </h1>
                        <p className="text-sm text-gray-500">Log and monitor all external traffic entering the premises</p>
                    </div>
                    <Button
                        onClick={() => { setEditingId(null); setIsModalOpen(true); }}
                        className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 gap-2 h-11 px-6 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                    >
                        <Plus className="h-4 w-4" /> Record New Entry
                    </Button>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Visitors"
                        value={stats.total.toString()}
                        icon={ClipboardList}
                        iconColor="text-blue-600"
                        iconBgColor="bg-blue-50"
                        description="Historical logs"
                    />
                    <StatCard
                        title="On Premises"
                        value={stats.active.toString()}
                        icon={MapPin}
                        iconColor="text-orange-600"
                        iconBgColor="bg-orange-50"
                        description="Currently checked-in"
                    />
                    <StatCard
                        title="Today's Traffic"
                        value={stats.today.toString()}
                        icon={Calendar}
                        iconColor="text-emerald-600"
                        iconBgColor="bg-emerald-50"
                        description="Recorded today"
                    />
                    <StatCard
                        title="Group Entries"
                        value={stats.groupVisits.toString()}
                        icon={Users}
                        iconColor="text-indigo-600"
                        iconBgColor="bg-indigo-50"
                        description="Visits with 2+ persons"
                    />
                </div>

                <AdvancedTable
                    title="Digital Visitor Manifest"
                    columns={columns}
                    data={visitors}
                    loading={loading}
                    searchable
                    searchPlaceholder="Monitor by visitor name or purpose..."
                    searchFields={['phone', 'name', 'purpose', 'id']}
                    onView={(row) => setViewingId(row.id)}
                    pagination
                    onEdit={(row) => {
                        setEditingId(row.id);
                        setIsModalOpen(true);
                    }}
                    onDelete={(row) => setDeleteConfirm({ open: true, id: row.id })}
                />

                <FormModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingId(null);
                    }}
                    title={editingId ? "Update Visitor Details" : "New Secure Entry Point"}
                    fields={formFields}
                    initialData={editingId ? visitors.find(v => v.id === editingId) : undefined}
                    onSubmit={(data: any) => editingId ? handleEdit(editingId, data) : handleAdd(data)}
                />

                <ViewVisitorModal
                    isOpen={!!viewingId}
                    onClose={() => setViewingId(null)}
                    visitor={visitors.find(v => v.id === viewingId)}
                />

                <ConfirmationDialog
                    open={deleteConfirm.open}
                    onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
                    onConfirm={confirmDelete}
                    title="Delete Security Log?"
                    description="This will permanently purge this visitor's record from the security logs. This action cannot be reversed."
                    variant="destructive"
                />
            </div>
        </DashboardLayout>
    )
}
