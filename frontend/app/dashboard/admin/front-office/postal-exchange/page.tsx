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
    Send,
    Inbox,
    FileText,
    Clock,
    MapPin,
    History,
    MailCheck,
    Package
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PostalItem {
    id: string
    fromTitle: string
    toTitle: string
    referenceNo: string
    date: string
    address?: string
    note?: string
    type: 'receive' | 'dispatch'
}

export default function PostalExchangePage() {
    const { toast } = useToast()
    const [records, setRecords] = useState<PostalItem[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<string>("all")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
        open: false,
        id: null
    })

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        setLoading(true)
        try {
            const response = await apiFetch(API_ENDPOINTS.FRONT_OFFICE.POSTAL);
            if (response.ok) {
                const data = await response.json();
                const mappedData = (Array.isArray(data) ? data : data.data || []).map((item: any) => ({
                    id: item._id,
                    fromTitle: item.fromTitle,
                    toTitle: item.toTitle,
                    referenceNo: item.referenceNo,
                    date: new Date(item.date).toLocaleDateString(),
                    address: item.address,
                    note: item.note,
                    type: item.type
                }));
                setRecords(mappedData);
            } else {
                toast({ title: "Error", description: "Failed to load archives.", variant: "destructive" });
            }
        } catch (error) {
            console.error('Error fetching postal records:', error);
            toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
        } finally {
            setLoading(false)
        }
    };

    const handleAdd = async (data: any) => {
        try {
            const response = await apiFetch(API_ENDPOINTS.FRONT_OFFICE.POSTAL, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            if (response.ok) {
                toast({ title: "Success", description: "Log entry archived." });
                fetchRecords();
                setIsModalOpen(false);
            } else {
                toast({ title: "Error", description: "Failed to save record.", variant: "destructive" });
            }
        } catch (error) {
            console.error('Error adding record:', error);
            toast({ title: "Error", description: "Failed to save record.", variant: "destructive" });
        }
    };

    const handleEdit = async (id: string, data: any) => {
        try {
            const response = await apiFetch(`${API_ENDPOINTS.FRONT_OFFICE.POSTAL}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            if (response.ok) {
                toast({ title: "Updated", description: "Audit trail updated." });
                fetchRecords();
                setIsModalOpen(false);
                setEditingId(null);
            } else {
                toast({ title: "Error", description: "Failed to update record.", variant: "destructive" });
            }
        } catch (error) {
            console.error('Error updating record:', error);
            toast({ title: "Error", description: "Failed to update record.", variant: "destructive" });
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            const response = await apiFetch(`${API_ENDPOINTS.FRONT_OFFICE.POSTAL}/${deleteConfirm.id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                toast({ title: "Deleted", description: "Entry purged from manifest." });
                fetchRecords();
            } else {
                toast({ title: "Error", description: "Failed to delete entry.", variant: "destructive" });
            }
        } catch (error) {
            console.error('Error deleting record:', error);
            toast({ title: "Error", description: "Failed to delete entry.", variant: "destructive" });
        } finally {
            setDeleteConfirm({ open: false, id: null });
        }
    };

    const columns = [
        {
            key: "referenceNo",
            label: "Ref #",
            sortable: true,
            render: (value: string, row: PostalItem) => (
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${row.type === 'receive' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'}`}>
                        {row.type === 'receive' ? <Inbox size={14} /> : <Send size={14} />}
                    </div>
                    <span className="font-mono text-xs font-bold text-gray-700">{value}</span>
                </div>
            )
        },
        {
            key: "fromTitle",
            label: "Origin",
            sortable: true,
            render: (value: string) => <span className="text-xs font-semibold text-gray-900">{value}</span>
        },
        {
            key: "toTitle",
            label: "Destination",
            sortable: true,
            render: (value: string) => <span className="text-xs font-semibold text-gray-900">{value}</span>
        },
        {
            key: "date",
            label: "Timeline",
            sortable: true,
            render: (value: string) => (
                <div className="flex items-center gap-2">
                    <Clock size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-600">{value}</span>
                </div>
            )
        },
        {
            key: "type",
            label: "Classification",
            sortable: true,
            render: (value: string) => (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border
          ${value === 'receive' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-purple-50 text-purple-700 border-purple-100'}
        `}>
                    {value}
                </span>
            )
        }
    ]

    const formFields: FormField[] = [
        { name: "fromTitle", label: "From (Sender)", type: "text", required: true, placeholder: "Sender's name/title" },
        { name: "toTitle", label: "To (Recipient)", type: "text", required: true, placeholder: "Recipient's name/title" },
        { name: "referenceNo", label: "Reference ID", type: "text", required: true, placeholder: "Tracking or Invoice number" },
        {
            name: "type",
            label: "Traffic Type",
            type: "select",
            options: [
                { value: "receive", label: "Incoming (Receive)" },
                { value: "dispatch", label: "Outgoing (Dispatch)" }
            ],
            required: true
        },
        { name: "date", label: "Log Date", type: "date", required: true },
        { name: "address", label: "Physical Address", type: "textarea", required: false, placeholder: "Mailing address details..." },
        { name: "note", label: "Summary Note", type: "textarea", required: false, placeholder: "Contents or priority level..." },
    ];

    const filteredRecords = activeTab === "all" ? records : records.filter(r => r.type === activeTab)

    const stats = {
        total: records.length,
        received: records.filter(r => r.type === 'receive').length,
        dispatched: records.filter(r => r.type === 'dispatch').length,
        today: records.filter(r => r.date === new Date().toLocaleDateString()).length
    }

    return (
        <DashboardLayout title="Logistics Audit">
            <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <Package className="text-purple-600" size={24} />
                            Postal Manifest
                        </h1>
                        <p className="text-sm text-gray-500">End-to-end tracking of all physical correspondence and documentation</p>
                    </div>
                    <Button
                        onClick={() => { setEditingId(null); setIsModalOpen(true); }}
                        className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-100 gap-2 h-11 px-6 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                    >
                        <Plus className="h-4 w-4" /> Archive Parcel
                    </Button>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Logistics"
                        value={stats.total.toString()}
                        icon={History}
                        iconColor="text-blue-600"
                        iconBgColor="bg-blue-50"
                        description="Lifetime inventory"
                    />
                    <StatCard
                        title="Incoming Items"
                        value={stats.received.toString()}
                        icon={Inbox}
                        iconColor="text-amber-600"
                        iconBgColor="bg-amber-50"
                        description="Postal receive flow"
                    />
                    <StatCard
                        title="Outgoing Items"
                        value={stats.dispatched.toString()}
                        icon={Send}
                        iconColor="text-purple-600"
                        iconBgColor="bg-purple-50"
                        description="Postal dispatch flow"
                    />
                    <StatCard
                        title="Fresh Inbound"
                        value={stats.today.toString()}
                        icon={MailCheck}
                        iconColor="text-emerald-600"
                        iconBgColor="bg-emerald-50"
                        description="Updated in last 24h"
                    />
                </div>

                <div className="flex justify-start">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                        <TabsList className="bg-transparent gap-2">
                            <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 border-none px-4">All Traffic</TabsTrigger>
                            <TabsTrigger value="receive" className="rounded-lg data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 border-none px-4 flex gap-2">
                                <Inbox size={14} /> Incoming
                            </TabsTrigger>
                            <TabsTrigger value="dispatch" className="rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 border-none px-4 flex gap-2">
                                <Send size={14} /> Outgoing
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <AdvancedTable
                    title="Consolidated Postal Index"
                    columns={columns}
                    data={filteredRecords}
                    loading={loading}
                    searchable
                    searchPlaceholder="Filter by sender, recipient or reference..."
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
                    title={editingId ? "Refine Parcel Metadata" : "Initialize Postal Record"}
                    fields={formFields}
                    initialData={editingId ? records.find(r => r.id === editingId) : undefined}
                    onSubmit={(data: any) => editingId ? handleEdit(editingId, data) : handleAdd(data)}
                />

                <ConfirmationDialog
                    open={deleteConfirm.open}
                    onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
                    onConfirm={confirmDelete}
                    title="Purge Postal Record?"
                    description="This will permanently delete the parcel data from the archives. This action is terminal."
                    variant="destructive"
                />
            </div>
        </DashboardLayout>
    )
}
