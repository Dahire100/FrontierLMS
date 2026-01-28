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
import { Plus, Image as ImageIcon, Layout, Eye, Hash, Link as LinkIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface BannerImageItem {
    id: string
    title: string
    imageUrl: string
    link?: string
    description?: string
    order: number
    isActive: boolean
}

export default function BannerImagesPage() {
    const { toast } = useToast()
    const [images, setImages] = useState<BannerImageItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
        open: false,
        id: null
    })

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/cms/banners`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                const data = result.data || result;
                const mappedBanners = data.map((item: any) => ({
                    id: item._id,
                    title: item.title,
                    imageUrl: item.imageUrl || '/placeholder.svg',
                    link: item.link,
                    description: item.description,
                    order: item.order || 0,
                    isActive: item.isActive
                }));
                setImages(mappedBanners);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
            toast({ title: "Error", description: "Loading failed.", variant: "destructive" });
        } finally {
            setLoading(false)
        }
    };

    const handleAdd = async (data: any) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/cms/banners`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...data,
                    order: Number(data.order) || 0,
                    isActive: data.isActive === 'true' || data.isActive === true
                })
            });
            if (response.ok) {
                toast({ title: "Success", description: "Banner added successfully." });
                fetchBanners();
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Error adding banner:', error);
            toast({ title: "Error", description: "Failed to add banner.", variant: "destructive" });
        }
    };

    const handleEdit = async (id: string, data: any) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/cms/banners/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...data,
                    order: Number(data.order),
                    isActive: data.isActive === 'true' || data.isActive === true
                })
            });
            if (response.ok) {
                toast({ title: "Success", description: "Banner updated successfully." });
                fetchBanners();
                setIsModalOpen(false);
                setEditingId(null);
            }
        } catch (error) {
            console.error('Error updating banner:', error);
            toast({ title: "Error", description: "Failed to update banner.", variant: "destructive" });
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/cms/banners/${deleteConfirm.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                toast({ title: "Deleted", description: "Banner image removed." });
                fetchBanners();
            }
        } catch (error) {
            console.error('Error deleting banner:', error);
            toast({ title: "Error", description: "Failed to delete banner.", variant: "destructive" });
        } finally {
            setDeleteConfirm({ open: false, id: null });
        }
    };

    const columns = [
        {
            key: "imageUrl",
            label: "Visual Presence",
            sortable: false,
            render: (value: string, row: BannerImageItem) => (
                <div className="flex items-center gap-4">
                    <div className="h-12 w-20 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                        {value ? (
                            <img src={value} alt={row.title} className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="text-gray-300 h-6 w-6" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{row.title}</span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase truncate max-w-[200px]">
                            {row.description || "No sub-text provided"}
                        </span>
                    </div>
                </div>
            )
        },
        {
            key: "link",
            label: "Call to Action",
            sortable: true,
            render: (value: string) => value ? (
                <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
                    <LinkIcon size={12} /> {value}
                </div>
            ) : <span className="text-gray-300 text-[10px]">NO LINK</span>
        },
        {
            key: "order",
            label: "Sequence",
            sortable: true,
            render: (value: number) => (
                <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3 text-gray-400" />
                    <span className="text-xs font-bold text-gray-700">{value}</span>
                </div>
            )
        },
        {
            key: "isActive",
            label: "Status",
            sortable: true,
            render: (value: boolean) => <StatusBadge status={value ? "Active" : "Inactive"} />
        }
    ]

    const formFields: FormField[] = [
        { name: "title", label: "Banner Heading", type: "text", required: true, placeholder: "e.g. Welcome to Excellence" },
        { name: "imageUrl", label: "Asset URL", type: "text", required: true, placeholder: "https://..." },
        { name: "link", label: "Target URL (Optional)", type: "text", required: false, placeholder: "/admission" },
        { name: "description", label: "Sub-heading / Description", type: "textarea", required: false, placeholder: "Briefly describe the banner..." },
        { name: "order", label: "Display Priority", type: "number", required: true, placeholder: "0" },
        {
            name: "isActive",
            label: "Visibility",
            type: "select",
            options: [
                { value: "true", label: "Active (Visible)" },
                { value: "false", label: "Inactive (Hidden)" }
            ],
            required: true
        },
    ];

    return (
        <DashboardLayout title="Billboard Management">
            <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <ImageIcon className="text-indigo-600" size={24} />
                            Website Front-Page
                        </h1>
                        <p className="text-sm text-gray-500">Curate the spotlight banners for your main institute portal</p>
                    </div>
                    <Button
                        onClick={() => { setEditingId(null); setIsModalOpen(true); }}
                        className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 gap-2 h-11 px-6 rounded-xl font-semibold"
                    >
                        <Plus className="h-4 w-4" /> Add Spotlight
                    </Button>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Banners"
                        value={images.length.toString()}
                        icon={Layout}
                        iconColor="text-blue-600"
                        iconBgColor="bg-blue-50"
                        description="Stored billboards"
                    />
                    <StatCard
                        title="Online"
                        value={images.filter(img => img.isActive).length.toString()}
                        icon={Eye}
                        iconColor="text-emerald-600"
                        iconBgColor="bg-emerald-50"
                        description="Currently visible"
                    />
                    <StatCard
                        title="Internal Link"
                        value={images.filter(img => img.link && !img.link.startsWith('http')).length.toString()}
                        icon={LinkIcon}
                        iconColor="text-indigo-600"
                        iconBgColor="bg-indigo-50"
                        description="Portal navigation"
                    />
                    <StatCard
                        title="Drafts"
                        value={images.filter(img => !img.isActive).length.toString()}
                        icon={ImageIcon}
                        iconColor="text-orange-600"
                        iconBgColor="bg-orange-50"
                        description="Pending launch"
                    />
                </div>

                <AdvancedTable
                    title="Spotlight Archive"
                    columns={columns}
                    data={images}
                    loading={loading}
                    searchable
                    searchPlaceholder="Audit banner titles or descriptions..."
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
                    title={editingId ? "Refine Spotlight Design" : "New Website Spotlight"}
                    fields={formFields}
                    initialData={editingId ? {
                        ...images.find(img => img.id === editingId),
                        isActive: images.find(img => img.id === editingId)?.isActive.toString()
                    } : undefined}
                    onSubmit={(data: any) => editingId ? handleEdit(editingId, data) : handleAdd(data)}
                />

                <ConfirmationDialog
                    open={deleteConfirm.open}
                    onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
                    onConfirm={confirmDelete}
                    title="Dissolve Spotlight?"
                    description="This will permanently remove this banner from the homepage spotlight. This action cannot be reversed."
                    variant="destructive"
                />
            </div>
        </DashboardLayout>
    )
}
