"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Menu, Plus, Layout, List, ExternalLink } from "lucide-react"
import FormModal from "@/components/form-modal"
import { useToast } from "@/components/ui/use-toast"

interface MenuItem {
  id: string
  title: string
  createdAt?: string
}

export default function MenusPage() {
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })
  const { toast } = useToast()

  const fetchMenus = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cms/menus`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        const mappedMenus = data.map((item: any) => ({
          id: item._id,
          title: item.title,
          createdAt: item.createdAt
        }));
        setMenus(mappedMenus);
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
      toast({
        title: "Error",
        description: "Failed to fetch menus",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleAdd = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cms/menus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Menu added successfully"
        })
        fetchMenus();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding menu:', error);
    }
  }

  const handleEdit = async (id: string, data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cms/menus/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Menu updated successfully"
        })
        fetchMenus();
        setIsModalOpen(false);
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error updating menu:', error);
    }
  }

  const handleDelete = (item: any) => {
    setDeleteConfirm({ open: true, id: item.id })
  }

  const confirmDelete = async () => {
    if (deleteConfirm.id) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/cms/menus/${deleteConfirm.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          toast({
            title: "Success",
            description: "Menu deleted successfully"
          })
          fetchMenus();
        }
      } catch (error) {
        console.error('Error deleting menu:', error);
      }
    }
    setDeleteConfirm({ open: false, id: null });
  }

  const columns = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 rounded-md">
            <Layout className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="font-medium text-gray-800">{value}</span>
        </div>
      )
    },
    {
      key: "createdAt",
      label: "Created At",
      sortable: true,
      render: (value: string) => value ? new Date(value).toLocaleDateString() : "N/A"
    }
  ]

  const formFields = [
    { name: "title", label: "Menu Title", type: "text" as const, required: true },
  ]

  return (
    <DashboardLayout title="Front CMS Menus">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500">
              Navigation Menus
            </h2>
            <p className="text-sm text-muted-foreground">Manage your website's navigation structure</p>
          </div>
          <Button
            onClick={() => { setEditingId(null); setIsModalOpen(true) }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Menu
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Menus"
            value={menus.length.toString()}
            icon={Menu}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-50"
          />
          <StatCard
            title="Quick Links"
            value="Coming Soon"
            icon={List}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
          />
          <StatCard
            title="External Links"
            value="Coming Soon"
            icon={ExternalLink}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-50"
          />
        </div>

        <AdvancedTable
          columns={columns}
          data={menus}
          searchable={true}
          searchPlaceholder="Search by title..."
          loading={loading}
          onEdit={(item) => {
            setEditingId(item.id)
            setIsModalOpen(true)
          }}
          onDelete={handleDelete}
          pageSize={10}
          emptyMessage="No menus found."
        />

        <FormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingId(null)
          }}
          onSubmit={(data) => (editingId ? handleEdit(editingId, data) : handleAdd(data))}
          fields={formFields}
          title={editingId ? "Edit Menu" : "Add New Menu"}
          initialData={editingId ? menus.find((m) => m.id === editingId) : {}}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          title="Delete Menu"
          description="Are you sure you want to delete this menu? This action cannot be undone."
          onConfirm={confirmDelete}
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
