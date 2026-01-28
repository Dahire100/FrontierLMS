"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { CreditCard, IndianRupee, Users, Calendar, Plus } from "lucide-react"
import FormModal from "@/components/form-modal"

interface Subscription {
  id: string
  planName: string
  price: number
  features: string
  status: "Active" | "Inactive" | "Expired"
  renewalDate: string
  subscribers: number
}

export default function Subscription() {

  const initialSubscriptions: Subscription[] = []

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/subscription/plans`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const result = await response.json();
          const data = result.data || result;
          const mappedPlans = data.map((item: any) => ({
            id: item._id,
            planName: item.planName,
            price: item.price,
            features: Array.isArray(item.features) ? item.features.join(', ') : item.features,
            status: item.status,
            renewalDate: new Date().toISOString(), // Placeholder as plan doesn't have renewal date
            subscribers: 0 // Placeholder
          }));
          setSubscriptions(mappedPlans);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    };

    fetchPlans();
  }, []);

  const handleAdd = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/subscription/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        const item = await response.json();
        const newSub: Subscription = {
          id: item._id,
          planName: item.planName,
          price: item.price,
          features: Array.isArray(item.features) ? item.features.join(', ') : item.features,
          status: item.status,
          renewalDate: new Date().toISOString(),
          subscribers: 0
        };
        setSubscriptions([newSub, ...subscriptions]);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding plan:', error);
    }
  }

  const handleEdit = async (id: string, data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/subscription/plans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        const item = await response.json();
        setSubscriptions(subscriptions.map((s) => (s.id === id ? {
          ...s,
          planName: item.planName,
          price: item.price,
          features: Array.isArray(item.features) ? item.features.join(', ') : item.features,
          status: item.status
        } : s)));
        setIsModalOpen(false);
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  }

  const handleDelete = (item: any) => {
    setDeleteConfirm({ open: true, id: item.id })
  }

  const confirmDelete = async () => {
    if (deleteConfirm.id) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/subscription/plans/${deleteConfirm.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          setSubscriptions(subscriptions.filter((s) => s.id !== deleteConfirm.id));
        }
      } catch (error) {
        console.error('Error deleting plan:', error);
      }
    }
    setDeleteConfirm({ open: false, id: null });
  }

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    if (action === "delete") {
      setSubscriptions(subscriptions.filter((s) => !selectedIds.includes(s.id)))
    }
  }

  const stats = {
    totalPlans: subscriptions.length,
    active: subscriptions.filter(s => s.status === "Active").length,
    totalRevenue: subscriptions.filter(s => s.status === "Active").reduce((sum, s) => sum + (s.price * s.subscribers), 0),
    totalSubscribers: subscriptions.reduce((sum, s) => sum + s.subscribers, 0)
  }

  const columns = [
    {
      key: "planName",
      label: "Plan",
      render: (value: string, row: Subscription) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CreditCard className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-muted-foreground">{row.features}</p>
          </div>
        </div>
      )
    },
    {
      key: "price",
      label: "Price",
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{value}/month</span>
        </div>
      )
    },
    {
      key: "subscribers",
      label: "Subscribers",
      render: (value: number) => (
        <div className="flex items-center gap-1 text-sm">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: "renewalDate",
      label: "Renewal Date",
      render: (value: string) => {
        const daysUntil = Math.ceil((new Date(value).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        return (
          <div>
            <p className="text-sm">{new Date(value).toLocaleDateString()}</p>
            {daysUntil > 0 && daysUntil < 30 && (
              <p className="text-xs text-orange-600">in {daysUntil} days</p>
            )}
          </div>
        )
      }
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => <StatusBadge status={value} />
    },
  ]

  const formFields = [
    { name: "planName", label: "Plan Name", type: "text" as const, required: true },
    { name: "price", label: "Monthly Price (₹)", type: "number" as const, required: true },
    { name: "features", label: "Features Description", type: "text" as const, required: true },
    { name: "subscribers", label: "Current Subscribers", type: "number" as const, required: false },
    { name: "renewalDate", label: "Renewal Date", type: "date" as const, required: true },
    {
      name: "status", label: "Status", type: "select" as const, options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
        { value: "Expired", label: "Expired" }
      ], required: true
    },
  ]

  return (
    <DashboardLayout title="Subscription Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Subscription Management</h2>
            <p className="text-sm text-muted-foreground">Manage subscription plans and pricing</p>
          </div>
          <Button onClick={() => { setEditingId(null); setIsModalOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Plans"
            value={stats.totalPlans.toString()}
            icon={CreditCard}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Active Plans"
            value={stats.active.toString()}
            icon={Calendar}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Total Subscribers"
            value={stats.totalSubscribers.toString()}
            icon={Users}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatCard
            title="Monthly Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={IndianRupee}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-100"
          />
        </div>

        <AdvancedTable
          columns={columns}
          data={subscriptions}
          searchable={true}
          searchPlaceholder="Search by plan name or features..."
          filterable={true}
          filterOptions={[
            { key: "status", label: "Status", options: ["Active", "Inactive", "Expired"] },
          ]}
          selectable={true}
          onEdit={(item) => {
            setEditingId(item.id)
            setIsModalOpen(true)
          }}
          onDelete={handleDelete}
          onBulkAction={handleBulkAction}
          pageSize={10}
          emptyMessage="No subscription plans found."
        />

        <FormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingId(null)
          }}
          onSubmit={(data) => (editingId ? handleEdit(editingId, data) : handleAdd(data))}
          fields={formFields}
          title={editingId ? "Edit Plan" : "Add New Plan"}
          initialData={editingId ? subscriptions.find((s) => s.id === editingId) : {}}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          title="Delete Subscription Plan"
          description="Are you sure you want to delete this subscription plan? This action cannot be undone."
          onConfirm={confirmDelete}
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
