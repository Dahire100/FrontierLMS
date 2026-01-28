"use client"

import { API_URL } from "@/lib/api-config"

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
    Megaphone,
    Star,
    Quote,
    Users,
    CheckCircle,
    EyeOff,
    User as UserIcon
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TestimonialItem {
    id: string
    name: string
    role?: string
    content: string
    image?: string
    rating?: number
    isActive: boolean
}

export default function TestimonialsPage() {
    const { toast } = useToast()
    const [testimonials, setTestimonials] = useState<TestimonialItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
        open: false,
        id: null
    })

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/cms/testimonials`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                const data = result.data || result;
                const mappedTestimonials = data.map((item: any) => ({
                    id: item._id,
                    name: item.name,
                    role: item.role,
                    content: item.content,
                    image: item.image || "/placeholder-user.jpg",
                    rating: item.rating || 5,
                    isActive: item.isActive
                }));
                setTestimonials(mappedTestimonials);
            }
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            toast({ title: "Error", description: "Failed to load testimonials.", variant: "destructive" });
        } finally {
            setLoading(false)
        }
    };

    const handleAdd = async (data: any) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/cms/testimonials`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...data,
                    rating: Number(data.rating) || 5,
                    isActive: data.isActive === 'true' || data.isActive === true
                })
            });
            if (response.ok) {
                toast({ title: "Success", description: "Testimonial added successfully." });
                fetchTestimonials();
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Error adding testimonial:', error);
            toast({ title: "Error", description: "Failed to add testimonial.", variant: "destructive" });
        }
    };

    const handleEdit = async (id: string, data: any) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/cms/testimonials/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...data,
                    rating: Number(data.rating),
                    isActive: data.isActive === 'true' || data.isActive === true
                })
            });
            if (response.ok) {
                toast({ title: "Success", description: "Testimonial updated successfully." });
                fetchTestimonials();
                setIsModalOpen(false);
                setEditingId(null);
            }
        } catch (error) {
            console.error('Error updating testimonial:', error);
            toast({ title: "Error", description: "Failed to update testimonial.", variant: "destructive" });
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/cms/testimonials/${deleteConfirm.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                toast({ title: "Deleted", description: "Testimonial removed successfully." });
                fetchTestimonials();
            }
        } catch (error) {
            console.error('Error deleting testimonial:', error);
            toast({ title: "Error", description: "Failed to delete testimonial.", variant: "destructive" });
        } finally {
            setDeleteConfirm({ open: false, id: null });
        }
    };

    const columns = [
        {
            key: "name",
            label: "Contributor",
            sortable: true,
            render: (value: string, row: TestimonialItem) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-gray-100 shadow-sm">
                        <AvatarImage src={row.image} />
                        <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold">
                            {value.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{value}</span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                            {row.role || "Stakeholder"}
                        </span>
                    </div>
                </div>
            )
        },
        {
            key: "content",
            label: "Statement",
            sortable: false,
            render: (value: string) => (
                <div className="flex gap-2 max-w-xs md:max-w-md">
                    <Quote className="h-4 w-4 text-indigo-200 mt-1 flex-shrink-0" />
                    <p className="text-xs text-gray-600 italic line-clamp-2 leading-relaxed">{value}</p>
                </div>
            )
        },
        {
            key: "rating",
            label: "Approval",
            sortable: true,
            render: (value: number) => (
                <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < (value || 0) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                    ))}
                </div>
            )
        },
        {
            key: "isActive",
            label: "Visibility",
            sortable: true,
            render: (value: boolean) => <StatusBadge status={value ? "Active" : "Inactive"} />
        }
    ]

    const formFields: FormField[] = [
        { name: "name", label: "Full Name", type: "text", required: true, placeholder: "e.g. John Doe" },
        { name: "role", label: "Professional Role", type: "text", required: false, placeholder: "e.g. Parent of Grade 4 Student" },
        { name: "content", label: "Testimonial Quote", type: "textarea", required: true, placeholder: "What did they say about the institute?" },
        { name: "image", label: "Portrait Image URL", type: "text", required: false, placeholder: "https://..." },
        { name: "rating", label: "Rating (1-5 Stars)", type: "number", required: true, placeholder: "5" },
        {
            name: "isActive",
            label: "Public Status",
            type: "select",
            options: [
                { value: "true", label: "Active (Visible on Website)" },
                { value: "false", label: "Inactive (Hidden)" }
            ],
            required: true
        },
    ];

    const stats = {
        total: testimonials.length,
        active: testimonials.filter(t => t.isActive).length,
        hidden: testimonials.filter(t => !t.isActive).length,
        highRated: testimonials.filter(t => (t.rating || 0) >= 4).length
    }

    return (
        <DashboardLayout title="Voice of Community">
            <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <Megaphone className="text-indigo-600" size={24} />
                            Review Curations
                        </h1>
                        <p className="text-sm text-gray-500">Manage and showcase testimonials from parents, students, and staff</p>
                    </div>
                    <Button
                        onClick={() => { setEditingId(null); setIsModalOpen(true); }}
                        className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 gap-2 h-11 px-6 rounded-xl font-semibold"
                    >
                        <Plus className="h-4 w-4" /> Add Feedback
                    </Button>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Praise"
                        value={stats.total.toString()}
                        icon={Users}
                        iconColor="text-blue-600"
                        iconBgColor="bg-blue-50"
                        description="Stored testimonials"
                    />
                    <StatCard
                        title="Live Status"
                        value={stats.active.toString()}
                        icon={CheckCircle}
                        iconColor="text-emerald-600"
                        iconBgColor="bg-emerald-50"
                        description="Visible on portal"
                    />
                    <StatCard
                        title="Top Rated"
                        value={stats.highRated.toString()}
                        icon={Star}
                        iconColor="text-amber-600"
                        iconBgColor="bg-amber-50"
                        description="4+ Stars reviews"
                    />
                    <StatCard
                        title="Internal"
                        value={stats.hidden.toString()}
                        icon={EyeOff}
                        iconColor="text-orange-600"
                        iconBgColor="bg-orange-50"
                        description="Pending approval"
                    />
                </div>

                <AdvancedTable
                    title="Endorsement Ledger"
                    columns={columns}
                    data={testimonials}
                    loading={loading}
                    searchable
                    searchPlaceholder="Audit feedback by author or content..."
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
                    title={editingId ? "Modify Community Feedback" : "New Community Statement"}
                    fields={formFields}
                    initialData={editingId ? {
                        ...testimonials.find(t => t.id === editingId),
                        isActive: testimonials.find(t => t.id === editingId)?.isActive.toString()
                    } : undefined}
                    onSubmit={(data: any) => editingId ? handleEdit(editingId, data) : handleAdd(data)}
                />

                <ConfirmationDialog
                    open={deleteConfirm.open}
                    onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
                    onConfirm={confirmDelete}
                    title="Remove Community Voice?"
                    description="This will permanently delete this testimonial from the system. This cannot be undone."
                    variant="destructive"
                />
            </div>
        </DashboardLayout>
    )
}
