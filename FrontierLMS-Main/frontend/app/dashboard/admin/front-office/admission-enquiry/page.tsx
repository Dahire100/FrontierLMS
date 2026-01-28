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
    UserPlus,
    PhoneCall,
    CheckCircle2,
    Clock,
    MapPin,
    Calendar,
    Layers
} from "lucide-react"
import { ViewEnquiryModal } from "@/components/front-office/view-enquiry-modal"
import { useToast } from "@/components/ui/use-toast"

interface EnquiryItem {
    id: string
    studentName: string
    phone: string
    email?: string
    source: string
    date: string
    status: "active" | "passive" | "dead" | "won" | "lost"
    classId?: { _id: string; name: string }
    className?: string
    noOfChild: number
    description?: string
}

export default function AdmissionEnquiryPage() {
    const { toast } = useToast()
    const [enquiries, setEnquiries] = useState<EnquiryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [viewingId, setViewingId] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
        open: false,
        id: null
    })

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        setLoading(true)
        try {
            const response = await apiFetch(API_ENDPOINTS.ADMISSION_ENQUIRY);
            if (response.ok) {
                const data = await response.json();
                const mappedData = (Array.isArray(data) ? data : data.data || []).map((item: any) => ({
                    id: item._id,
                    studentName: item.studentName,
                    phone: item.phone,
                    email: item.email,
                    source: item.source,
                    date: new Date(item.date).toLocaleDateString(),
                    status: item.status || "active",
                    className: item.classId?.name || "N/A",
                    noOfChild: item.noOfChild || 1,
                    description: item.description
                }));
                setEnquiries(mappedData);
            } else {
                toast({ title: "Error", description: "Failed to load enquiries.", variant: "destructive" });
            }
        } catch (error) {
            console.error('Error fetching enquiries:', error);
            toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
        } finally {
            setLoading(false)
        }
    };

    const handleAdd = async (data: any) => {
        try {
            const response = await apiFetch(API_ENDPOINTS.ADMISSION_ENQUIRY, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            if (response.ok) {
                toast({ title: "Success", description: "Application enquiry logged." });
                fetchEnquiries();
                setIsModalOpen(false);
            } else {
                toast({ title: "Error", description: "Failed to save enquiry.", variant: "destructive" });
            }
        } catch (error) {
            console.error('Error adding enquiry:', error);
            toast({ title: "Error", description: "Failed to save enquiry.", variant: "destructive" });
        }
    };

    const handleEdit = async (id: string, data: any) => {
        try {
            const response = await apiFetch(`${API_ENDPOINTS.ADMISSION_ENQUIRY}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            if (response.ok) {
                toast({ title: "Updated", description: "Enquiry record updated." });
                fetchEnquiries();
                setIsModalOpen(false);
                setEditingId(null);
            } else {
                toast({ title: "Error", description: "Failed to update record.", variant: "destructive" });
            }
        } catch (error) {
            console.error('Error updating enquiry:', error);
            toast({ title: "Error", description: "Failed to update record.", variant: "destructive" });
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            const response = await apiFetch(`${API_ENDPOINTS.ADMISSION_ENQUIRY}/${deleteConfirm.id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                toast({ title: "Deleted", description: "Enquiry removed." });
                fetchEnquiries();
            } else {
                toast({ title: "Error", description: "Failed to delete record.", variant: "destructive" });
            }
        } catch (error) {
            console.error('Error deleting enquiry:', error);
            toast({ title: "Error", description: "Failed to delete record.", variant: "destructive" });
        } finally {
            setDeleteConfirm({ open: false, id: null });
        }
    };

    const columns = [
        {
            key: "studentName",
            label: "Lead Name",
            sortable: true,
            render: (value: string, row: EnquiryItem) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100 font-bold text-indigo-600 text-xs">
                        {value.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{value}</span>
                        <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                            <PhoneCall size={10} /> {row.phone}
                        </span>
                    </div>
                </div>
            )
        },
        {
            key: "className",
            label: "Target Class",
            sortable: true,
            render: (value: string) => (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
                    Grade {value}
                </span>
            )
        },
        {
            key: "source",
            label: "Acquisition",
            sortable: true,
            render: (value: string) => (
                <span className="text-xs text-gray-600 font-medium flex items-center gap-1">
                    <Layers size={12} className="text-gray-400" /> {value}
                </span>
            )
        },
        {
            key: "status",
            label: "Lead Status",
            sortable: true,
            render: (value: string) => <StatusBadge status={value} />
        },
        {
            key: "date",
            label: "Inbound Date",
            sortable: true,
            render: (value: string) => (
                <div className="flex flex-col">
                    <span className="text-xs text-gray-900 font-semibold">{value}</span>
                    <span className="text-[9px] text-gray-400">Captured at Front Desk</span>
                </div>
            )
        }
    ]

    const formFields: FormField[] = [
        { name: "studentName", label: "Candidate Name", type: "text", required: true, placeholder: "Full Name of Student" },
        { name: "phone", label: "Contact Number", type: "text", required: true, placeholder: "+91 ..." },
        { name: "email", label: "Email ID", type: "email", required: false, placeholder: "guardian@example.com" },
        { name: "source", label: "Discovery Source", type: "text", required: true, placeholder: "Website, Newspaper, Walk-in..." },
        {
            name: "status",
            label: "Current Standing",
            type: "select",
            options: [
                { value: "active", label: "Active Pursuing" },
                { value: "passive", label: "Passive Interest" },
                { value: "won", label: "Won (Enrolled)" },
                { value: "lost", label: "Lost Interest" },
                { value: "dead", label: "Dead Lead" }
            ],
            required: true
        },
        { name: "noOfChild", label: "Number of Children", type: "number", required: true, placeholder: "1" },
        { name: "description", label: "Internal Commentary", type: "textarea", required: false, placeholder: "Background details or special requests..." },
    ];

    const stats = {
        total: enquiries.length,
        active: enquiries.filter(e => e.status === 'active').length,
        won: enquiries.filter(e => e.status === 'won').length,
        newToday: enquiries.filter(e => e.date === new Date().toLocaleDateString()).length
    }

    return (
        <DashboardLayout title="Inbound Interest">
            <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <UserPlus className="text-indigo-600" size={24} />
                            Admission Pipelines
                        </h1>
                        <p className="text-sm text-gray-500">Track prospective students and manage converted leads</p>
                    </div>
                    <Button
                        onClick={() => { setEditingId(null); setIsModalOpen(true); }}
                        className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 gap-2 h-11 px-6 rounded-xl font-semibold"
                    >
                        <Plus className="h-4 w-4" /> Register Interest
                    </Button>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Prospects"
                        value={stats.total.toString()}
                        icon={Layers}
                        iconColor="text-blue-600"
                        iconBgColor="bg-blue-50"
                        description="Lifetime inquiries"
                    />
                    <StatCard
                        title="Hot Leads"
                        value={stats.active.toString()}
                        icon={Clock}
                        iconColor="text-orange-600"
                        iconBgColor="bg-orange-50"
                        description="Active follow-ups"
                    />
                    <StatCard
                        title="Conversions"
                        value={stats.won.toString()}
                        icon={CheckCircle2}
                        iconColor="text-emerald-600"
                        iconBgColor="bg-emerald-50"
                        description="Successfully enrolled"
                    />
                    <StatCard
                        title="Today's Pulse"
                        value={stats.newToday.toString()}
                        icon={Calendar}
                        iconColor="text-purple-600"
                        iconBgColor="bg-purple-50"
                        description="New inquiries today"
                    />
                </div>

                <AdvancedTable
                    title="Lead Management Desk"
                    columns={columns}
                    data={enquiries}
                    loading={loading}
                    searchable
                    searchPlaceholder="Track leads by student name or contact..."
                    searchFields={['phone', 'studentName', 'id']}
                    pagination
                    onEdit={(row) => {
                        setEditingId(row.id);
                        setIsModalOpen(true);
                    }}
                    onView={(row) => setViewingId(row.id)}
                    onDelete={(row) => setDeleteConfirm({ open: true, id: row.id })}
                />

                <FormModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingId(null);
                    }}
                    title={editingId ? "Refine Lead Profile" : "Capture New Prospect"}
                    fields={formFields}
                    initialData={editingId ? enquiries.find(e => e.id === editingId) : undefined}
                    onSubmit={(data: any) => editingId ? handleEdit(editingId, data) : handleAdd(data)}
                />

                <ViewEnquiryModal
                    isOpen={!!viewingId}
                    onClose={() => setViewingId(null)}
                    enquiry={enquiries.find(e => e.id === viewingId)}
                />

                <ConfirmationDialog
                    open={deleteConfirm.open}
                    onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
                    onConfirm={confirmDelete}
                    title="Archive Lead Permanently?"
                    description="This will remove the prospect from the tracking pipeline. This action is irreversible."
                    variant="destructive"
                />
            </div>
        </DashboardLayout>
    )
}
