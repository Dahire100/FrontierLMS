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
import { Plus, Layout, FileText, Globe, Eye, MoreVertical } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface PageItem {
  id: string
  title: string
  slug: string
  content?: string
  status: "Published" | "Draft" | "Scheduled"
  author: string
  views: number
  updatedAt: string
}

export default function PagesPage() {
  const { toast } = useToast()
  const [pages, setPages] = useState<PageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cms/pages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        const mappedPages = data.map((item: any) => ({
          id: item._id,
          title: item.title,
          slug: item.slug,
          content: item.content,
          status: item.status || "Draft",
          author: item.author || "Admin",
          views: item.views || 0,
          updatedAt: new Date(item.updatedAt).toLocaleDateString()
        }));
        setPages(mappedPages);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast({ title: "Error", description: "Failed to load pages.", variant: "destructive" });
    } finally {
      setLoading(false)
    }
  };

  const handleAdd = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cms/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        toast({ title: "Success", description: "Page created successfully." });
        fetchPages();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding page:', error);
      toast({ title: "Error", description: "Failed to create page.", variant: "destructive" });
    }
  };

  const handleEdit = async (id: string, data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cms/pages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        toast({ title: "Success", description: "Page updated successfully." });
        fetchPages();
        setIsModalOpen(false);
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error updating page:', error);
      toast({ title: "Error", description: "Failed to update page.", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cms/pages/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast({ title: "Deleted", description: "Page removed successfully." });
        fetchPages();
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      toast({ title: "Error", description: "Failed to delete page.", variant: "destructive" });
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  };

  const columns = [
    {
      key: "title",
      label: "Resource Title",
      sortable: true,
      render: (value: string, row: PageItem) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Globe className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{value}</span>
            <span className="text-[10px] text-gray-400 font-mono tracking-tight uppercase truncate max-w-[150px]">
              /{row.slug}
            </span>
          </div>
        </div>
      )
    },
    {
      key: "status",
      label: "Visibility",
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />
    },
    {
      key: "updatedAt",
      label: "Modified",
      sortable: true,
      render: (value: string) => <span className="text-xs text-gray-500 font-medium">{value}</span>
    },
    {
      key: "views",
      label: "Engagement",
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-1.5">
          <Eye className="h-3 w-3 text-gray-400" />
          <span className="text-xs font-bold text-gray-700">{value}</span>
        </div>
      )
    }
  ]

  const formFields: FormField[] = [
    { name: "title", label: "Page Title", type: "text", required: true, placeholder: "e.g. Admission Policy" },
    { name: "slug", label: "URL Slug", type: "text", required: true, placeholder: "e.g. admission-policy" },
    { name: "content", label: "Page Content (HTML/Text)", type: "textarea", required: false, placeholder: "Write your page content here..." },
    {
      name: "status",
      label: "Publishing Status",
      type: "select",
      options: [
        { value: "Published", label: "Published (Live)" },
        { value: "Draft", label: "Draft (Internal)" },
        { value: "Scheduled", label: "Scheduled (Coming Soon)" }
      ],
      required: true
    },
    { name: "author", label: "Author Reference", type: "text", required: false, placeholder: "Admin Name" },
  ];

  return (
    <DashboardLayout title="Digital Pages">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Layout className="text-indigo-600" size={24} />
              Website Blueprints
            </h1>
            <p className="text-sm text-gray-500">Manage custom pages and structural content for your institute portal</p>
          </div>
          <Button
            onClick={() => { setEditingId(null); setIsModalOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 gap-2 h-11 px-6 rounded-xl font-semibold"
          >
            <Plus className="h-4 w-4" /> Design New Page
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Layouts"
            value={pages.length.toString()}
            icon={Layout}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
            description="Active web pages"
          />
          <StatCard
            title="Live Content"
            value={pages.filter(p => p.status === 'Published').length.toString()}
            icon={Globe}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            description="Publicly visible"
          />
          <StatCard
            title="Drafts"
            value={pages.filter(p => p.status === 'Draft').length.toString()}
            icon={FileText}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-50"
            description="Pending review"
          />
          <StatCard
            title="Total Reach"
            value={pages.reduce((acc, curr) => acc + curr.views, 0).toLocaleString()}
            icon={Eye}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-50"
            description="Cumulative views"
          />
        </div>

        <AdvancedTable
          title="Digital Archive"
          columns={columns}
          data={pages}
          loading={loading}
          searchable
          searchPlaceholder="Audit page titles or slugs..."
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
          title={editingId ? "Refine Page Layout" : "Create Digital Blueprint"}
          fields={formFields}
          initialData={editingId ? pages.find(p => p.id === editingId) : undefined}
          onSubmit={(data: any) => editingId ? handleEdit(editingId, data) : handleAdd(data)}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          onConfirm={confirmDelete}
          title="Deconstruct Page?"
          description="This will permanently delete this page layout and all its associated content. This action is irreversible."
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
