"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Globe, FileText, Eye, Edit, Plus } from "lucide-react"
import FormModal from "@/components/form-modal"

interface CMSPage {
  id: string
  title: string
  slug: string
  status: "Published" | "Draft" | "Scheduled"
  lastUpdated: string
  author: string
  views: number
}

export default function FrontCMS() {

  const initialPages: CMSPage[] = []

  const [pages, setPages] = useState<CMSPage[]>(initialPages)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/cms/pages`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const result = await response.json();
          const data = result.data || result;
          const mappedPages = data.map((item: any) => ({
            id: item._id,
            title: item.title,
            slug: item.slug,
            status: item.status,
            lastUpdated: item.updatedAt,
            author: item.author,
            views: item.views || 0
          }));
          setPages(mappedPages);
        }
      } catch (error) {
        console.error('Error fetching pages:', error);
      }
    };

    fetchPages();
  }, []);

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
        const result = await response.json();
        const item = result.data || result;
        const newPage: CMSPage = {
          id: item._id,
          title: item.title,
          slug: item.slug,
          status: item.status,
          lastUpdated: item.updatedAt,
          author: item.author,
          views: item.views || 0
        };
        setPages([newPage, ...pages]);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding page:', error);
    }
  }

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
        const result = await response.json();
        const item = result.data || result;
        setPages(
          pages.map((p) => (p.id === id ? {
            ...p,
            title: item.title,
            slug: item.slug,
            status: item.status,
            author: item.author,
            lastUpdated: item.updatedAt
          } : p)),
        );
        setIsModalOpen(false);
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error updating page:', error);
    }
  }

  const handleDelete = (item: any) => {
    setDeleteConfirm({ open: true, id: item.id })
  }

  const confirmDelete = async () => {
    if (deleteConfirm.id) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/cms/pages/${deleteConfirm.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          setPages(pages.filter((p) => p.id !== deleteConfirm.id));
        }
      } catch (error) {
        console.error('Error deleting page:', error);
      }
    }
    setDeleteConfirm({ open: false, id: null });
  }

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    if (action === "delete") {
      setPages(pages.filter((p) => !selectedIds.includes(p.id)))
    }
  }

  const stats = {
    total: pages.length,
    published: pages.filter(p => p.status === "Published").length,
    draft: pages.filter(p => p.status === "Draft").length,
    totalViews: pages.reduce((sum, p) => sum + p.views, 0)
  }

  const columns = [
    {
      key: "title",
      label: "Page",
      render: (value: string, row: CMSPage) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-muted-foreground font-mono">/{row.slug}</p>
          </div>
        </div>
      )
    },
    {
      key: "author",
      label: "Author",
      render: (value: string) => <span className="text-sm">{value}</span>
    },
    {
      key: "views",
      label: "Views",
      render: (value: number) => (
        <div className="flex items-center gap-1 text-sm">
          <Eye className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium">{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: "lastUpdated",
      label: "Last Updated",
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => <StatusBadge status={value} />
    },
  ]

  const formFields = [
    { name: "title", label: "Page Title", type: "text" as const, required: true },
    { name: "slug", label: "URL Slug", type: "text" as const, required: true },
    { name: "author", label: "Author", type: "text" as const, required: true },
    {
      name: "status", label: "Status", type: "select" as const, options: [
        { value: "Published", label: "Published" },
        { value: "Draft", label: "Draft" },
        { value: "Scheduled", label: "Scheduled" }
      ], required: true
    },
  ]

  return (
    <DashboardLayout title="Front CMS">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Website Content Management</h2>
            <p className="text-sm text-muted-foreground">Manage website pages and content</p>
          </div>
          <Button onClick={() => { setEditingId(null); setIsModalOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Page
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Pages"
            value={stats.total.toString()}
            icon={FileText}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Published"
            value={stats.published.toString()}
            icon={Globe}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Draft"
            value={stats.draft.toString()}
            icon={Edit}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
          <StatCard
            title="Total Views"
            value={stats.totalViews.toLocaleString()}
            icon={Eye}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
        </div>

        <AdvancedTable
          columns={columns}
          data={pages}
          searchable={true}
          searchPlaceholder="Search by page title or slug..."
          filterable={true}
          filterOptions={[
            { key: "status", label: "Status", options: ["Published", "Draft", "Scheduled"] },
          ]}
          selectable={true}
          onEdit={(item) => {
            setEditingId(item.id)
            setIsModalOpen(true)
          }}
          onDelete={handleDelete}
          onBulkAction={handleBulkAction}
          pageSize={10}
          emptyMessage="No pages found."
        />

        <FormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingId(null)
          }}
          onSubmit={(data) => (editingId ? handleEdit(editingId, data) : handleAdd(data))}
          fields={formFields}
          title={editingId ? "Edit Page" : "Add New Page"}
          initialData={editingId ? pages.find((p) => p.id === editingId) : {}}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          title="Delete Page"
          description="Are you sure you want to delete this page? This action cannot be undone."
          onConfirm={confirmDelete}
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
