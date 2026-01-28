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
import { Plus, Image as ImageIcon, Layout, Eye, Camera, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface GalleryItem {
  id: string
  title: string
  description?: string
  thumbnail?: string
  isActive: boolean
}

export default function GalleryPage() {
  const { toast } = useToast()
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cms/galleries`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        const mappedGallery = data.map((item: any) => ({
          id: item._id,
          title: item.title,
          description: item.description,
          thumbnail: item.thumbnail,
          isActive: item.isActive
        }));
        setGallery(mappedGallery);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast({ title: "Error", description: "Loading failed.", variant: "destructive" });
    } finally {
      setLoading(false)
    }
  };

  const handleAdd = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cms/galleries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          isActive: data.isActive === 'true' || data.isActive === true,
          images: []
        })
      });
      if (response.ok) {
        toast({ title: "Success", description: "Gallery created." });
        fetchGallery();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding gallery:', error);
      toast({ title: "Error", description: "Failed to create gallery.", variant: "destructive" });
    }
  };

  const handleEdit = async (id: string, data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cms/galleries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          isActive: data.isActive === 'true' || data.isActive === true
        })
      });
      if (response.ok) {
        toast({ title: "Success", description: "Gallery updated." });
        fetchGallery();
        setIsModalOpen(false);
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error updating gallery:', error);
      toast({ title: "Error", description: "Failed to update gallery.", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cms/galleries/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast({ title: "Deleted", description: "Gallery removed." });
        fetchGallery();
      }
    } catch (error) {
      console.error('Error deleting gallery:', error);
      toast({ title: "Error", description: "Failed to delete gallery.", variant: "destructive" });
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  };

  const columns = [
    {
      key: "title",
      label: "Gallery Portfolio",
      sortable: true,
      render: (value: string, row: GalleryItem) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
            {row.thumbnail ? (
              <img src={row.thumbnail} alt={value} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="text-gray-300 h-5 w-5" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{value}</span>
            <span className="text-[10px] text-gray-400 font-medium uppercase truncate max-w-[200px]">
              {row.description || "No description provided"}
            </span>
          </div>
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
    { name: "title", label: "Gallery Title", type: "text", required: true, placeholder: "e.g. Annual Day 2024" },
    { name: "description", label: "Brief Description", type: "textarea", required: false, placeholder: "Describe the event or album..." },
    { name: "thumbnail", label: "Cover Image URL", type: "text", required: false, placeholder: "https://..." },
    {
      name: "isActive",
      label: "Visibility",
      type: "select",
      options: [
        { value: "true", label: "Active (Visible on Website)" },
        { value: "false", label: "Inactive (Hidden)" }
      ],
      required: true
    },
  ];

  return (
    <DashboardLayout title="Media curation">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Camera className="text-indigo-500" size={24} />
              Visual Libraries
            </h1>
            <p className="text-sm text-gray-500">Organize and showcase institute events, facilities and achievements</p>
          </div>
          <Button
            onClick={() => { setEditingId(null); setIsModalOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 gap-2 h-11 px-6 rounded-xl"
          >
            <Plus className="h-4 w-4" /> Create Gallery
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Galleries"
            value={gallery.length.toString()}
            icon={Layout}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
            description="Active visual collections"
          />
          <StatCard
            title="Visible"
            value={gallery.filter(g => g.isActive).length.toString()}
            icon={CheckCircle}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            description="Publicly accessible"
          />
          <StatCard
            title="Hidden"
            value={gallery.filter(g => !g.isActive).length.toString()}
            icon={Eye}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-50"
            description="Draft mode"
          />
          <StatCard
            title="Total Assets"
            value="Coming Soon"
            icon={ImageIcon}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-50"
            description="Cumulative media"
          />
        </div>

        <AdvancedTable
          title="Archive Ledger"
          columns={columns}
          data={gallery}
          loading={loading}
          searchable
          searchPlaceholder="Audit gallery titles or descriptions..."
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
          title={editingId ? "Modify Gallery Details" : "New Visual Collection"}
          fields={formFields}
          initialData={editingId ? {
            ...gallery.find(g => g.id === editingId),
            isActive: gallery.find(g => g.id === editingId)?.isActive.toString()
          } : undefined}
          onSubmit={(data: any) => editingId ? handleEdit(editingId, data) : handleAdd(data)}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          onConfirm={confirmDelete}
          title="Dissolve Visual Library?"
          description="This will permanently delete this gallery and all its linked assets from the visual directory. This cannot be reversed."
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
