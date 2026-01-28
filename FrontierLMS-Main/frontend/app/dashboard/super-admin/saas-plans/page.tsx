"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { PlanCard } from "@/components/super-admin/plan-card"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import FormModal from "@/components/form-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, IndianRupee, TrendingUp, Package } from "lucide-react"

interface Plan {
  id: string
  name: string
  price: string
  description: string
  features: string[]
  subscribers: number
  status: string
  revenue: number
  isPopular?: boolean
}

export default function SaaSPlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/super-admin/plans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      // Check if response is JSON
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Backend API not available, using empty state')
        setPlans([])
        setLoading(false)
        return
      }

      const data = await res.json()
      if (data.success) {
        setPlans(data.data)
      } else {
        setPlans([])
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error)
      // Don't show error toast if backend isn't ready, just use empty state
      setPlans([])
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (data: any) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/super-admin/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      const result = await res.json()
      if (result.success) {
        toast({
          title: "Success",
          description: "Plan created successfully"
        })
        fetchPlans()
        setIsModalOpen(false)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create plan",
        variant: "destructive"
      })
    }
  }

  const handleEdit = async (id: string, data: any) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/super-admin/plans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      const result = await res.json()
      if (result.success) {
        toast({
          title: "Success",
          description: "Plan updated successfully"
        })
        fetchPlans()
        setIsModalOpen(false)
        setEditingId(null)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update plan",
        variant: "destructive"
      })
    }
  }

  const handleDelete = (id: string) => {
    setDeleteConfirm({ open: true, id })
  }

  const confirmDelete = async () => {
    if (deleteConfirm.id) {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_URL}/api/super-admin/plans/${deleteConfirm.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const result = await res.json()
        if (result.success) {
          toast({
            title: "Success",
            description: "Plan deleted successfully"
          })
          fetchPlans()
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete plan",
          variant: "destructive"
        })
      }
    }
    setDeleteConfirm({ open: false, id: null })
  }

  if (loading) {
    return (
      <DashboardLayout title="SaaS Plan Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  const formFields = [
    { name: "name", label: "Plan Name", type: "text" as const, required: true },
    { name: "price", label: "Price", type: "number" as const, required: true },
    {
      name: "interval", label: "Billing Interval", type: "select" as const, options: [
        { value: "Monthly", label: "Monthly" },
        { value: "Yearly", label: "Yearly" }
      ], required: true
    },
    { name: "maxStudents", label: "Max Students", type: "number" as const, required: true },
    { name: "maxTeachers", label: "Max Teachers", type: "number" as const, required: true },
    {
      name: "status", label: "Status", type: "select" as const, options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" }
      ], required: true
    },
  ]

  // Calculate stats
  const stats = {
    totalPlans: plans.length,
    totalSubscribers: plans.reduce((sum, p) => sum + p.subscribers, 0),
    totalRevenue: plans.reduce((sum, p) => sum + p.revenue, 0),
    activePlans: plans.filter(p => p.status === "Active").length
  }

  return (
    <DashboardLayout title="SaaS Plan Management">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Plans</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalPlans}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Plans</p>
                  <p className="text-2xl font-bold mt-1">{stats.activePlans}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Subscribers</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalSubscribers}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold mt-1">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <IndianRupee className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Subscription Plans</h2>
            <p className="text-sm text-muted-foreground">Manage pricing tiers and features</p>
          </div>
          <Button
            onClick={() => {
              setEditingId(null)
              setIsModalOpen(true)
            }}
          >
            <Package className="h-4 w-4 mr-2" />
            Create New Plan
          </Button>
        </div>

        <Tabs defaultValue="cards" className="w-full">
          <TabsList>
            <TabsTrigger value="cards">Card View</TabsTrigger>
            <TabsTrigger value="comparison">Feature Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  name={plan.name}
                  price={plan.price}
                  description={plan.description}
                  features={plan.features}
                  subscribers={plan.subscribers}
                  isPopular={plan.isPopular}
                  onEdit={() => {
                    setEditingId(plan.id)
                    setIsModalOpen(true)
                  }}
                  onDelete={() => handleDelete(plan.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Comparison</CardTitle>
                <CardDescription>Compare features across all plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Feature</th>
                        {plans.map((plan) => (
                          <th key={plan.id} className="text-center py-3 px-4 font-semibold">
                            {plan.name}
                            <div className="text-xs font-normal text-muted-foreground mt-1">
                              {plan.price}{plan.price !== "Custom" && "/mo"}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Get all unique features */}
                      {Array.from(new Set(plans.flatMap(p => p.features))).map((feature, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/30">
                          <td className="py-3 px-4 text-sm">{feature}</td>
                          {plans.map((plan) => (
                            <td key={plan.id} className="text-center py-3 px-4">
                              {plan.features.includes(feature) ? (
                                <span className="text-green-600 text-xl">✓</span>
                              ) : (
                                <span className="text-gray-300 text-xl">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className="border-b bg-muted/50">
                        <td className="py-3 px-4 font-semibold">Subscribers</td>
                        {plans.map((plan) => (
                          <td key={plan.id} className="text-center py-3 px-4 font-semibold">
                            {plan.subscribers}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-muted/50">
                        <td className="py-3 px-4 font-semibold">Monthly Revenue</td>
                        {plans.map((plan) => (
                          <td key={plan.id} className="text-center py-3 px-4 font-semibold">
                            ${plan.revenue.toLocaleString()}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit/Add Modal */}
        <FormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingId(null)
          }}
          onSubmit={(data) => (editingId ? handleEdit(editingId, data) : handleAdd(data))}
          fields={formFields}
          title={editingId ? "Edit Plan" : "Create New Plan"}
          initialData={editingId ? {
            ...plans.find((p) => p.id === editingId),
            features: plans.find((p) => p.id === editingId)?.features.join('\n')
          } : {}}
        />

        {/* Delete Confirmation */}
        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          title="Delete Plan"
          description="Are you sure you want to delete this plan? Existing subscribers will need to be migrated to another plan."
          onConfirm={confirmDelete}
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
