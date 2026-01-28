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
  Users,
  UserPlus,
  Clock,
  History,
  DoorOpen,
  DoorClosed,
  IdCard
} from "lucide-react"
import { ViewVisitorModal } from "@/components/front-office/view-visitor-modal"
import { useToast } from "@/components/ui/use-toast"

interface VisitorItem {
  id: string
  name: string
  phone: string
  purpose: string
  idCard?: string
  noOfPerson: number
  date: string
  inTime?: string
  outTime?: string
  note?: string
}

export default function VisitorLogPage() {
  const { toast } = useToast()
  const [visitors, setVisitors] = useState<VisitorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  useEffect(() => {
    fetchVisitors()
  }, [])

  const fetchVisitors = async () => {
    setLoading(true)
    try {
      const response = await apiFetch(API_ENDPOINTS.FRONT_OFFICE.VISITOR_LOG)
      if (response.ok) {
        const data = await response.json()
        const mappedData = Array.isArray(data) ? data : data.data || []
        setVisitors(mappedData.map((v: any) => ({
          id: v._id,
          name: v.name,
          phone: v.phone,
          purpose: v.purpose,
          idCard: v.idCard,
          noOfPerson: v.noOfPerson,
          date: new Date(v.date).toLocaleDateString(),
          inTime: v.inTime,
          outTime: v.outTime,
          note: v.note
        })))
      } else {
        toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error fetching visitors:', error)
      toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (data: any) => {
    try {
      const response = await apiFetch(API_ENDPOINTS.FRONT_OFFICE.VISITOR_LOG, {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (response.ok) {
        toast({ title: "Success", description: "Visitor logged successfully." })
        fetchVisitors()
        setIsModalOpen(false)
      } else {
        toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error adding visitor:', error)
      toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
    }
  }

  const handleEdit = async (id: string, data: any) => {
    try {
      const response = await apiFetch(`${API_ENDPOINTS.FRONT_OFFICE.VISITOR_LOG}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
      if (response.ok) {
        toast({ title: "Updated", description: "Visitor record updated." })
        fetchVisitors()
        setIsModalOpen(false)
        setEditingId(null)
      } else {
        toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error updating visitor:', error)
      toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return
    try {
      const response = await apiFetch(`${API_ENDPOINTS.FRONT_OFFICE.VISITOR_LOG}/${deleteConfirm.id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        toast({ title: "Deleted", description: "Visitor record purged." })
        fetchVisitors()
      } else {
        toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error deleting visitor:', error)
      toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
    } finally {
      setDeleteConfirm({ open: false, id: null })
    }
  }

  const columns = [
    {
      key: "name",
      label: "Visitor Identity",
      sortable: true,
      render: (value: string, row: VisitorItem) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">{value}</span>
          <span className="text-[10px] text-gray-500 font-medium tracking-tight uppercase">{row.phone}</span>
        </div>
      )
    },
    {
      key: "purpose",
      label: "Intent of Visit",
      sortable: true,
      render: (value: string) => (
        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100 uppercase tracking-tighter">
          {value}
        </span>
      )
    },
    {
      key: "idCard",
      label: "Verification ID",
      sortable: true,
      render: (value: string) => value ? (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
          <IdCard size={14} /> {value}
        </div>
      ) : <span className="text-gray-300">N/A</span>
    },
    {
      key: "inTime",
      label: "Arrival",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
          <DoorOpen size={14} className="text-emerald-500" /> {value || "--:--"}
        </div>
      )
    },
    {
      key: "outTime",
      label: "Departure",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
          <DoorClosed size={14} className="text-red-500" /> {value || "On Premise"}
        </div>
      )
    }
  ]

  const formFields: FormField[] = [
    { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Visitor's full name" },
    { name: "phone", label: "Contact Number", type: "text", required: true, placeholder: "Mobile/Phone number" },
    { name: "purpose", label: "Visit Purpose", type: "text", required: true, placeholder: "Admission, Meeting, Delivery, etc." },
    { name: "idCard", label: "ID Card / Govt ID", type: "text", required: false, placeholder: "Aadhar, License, etc." },
    { name: "noOfPerson", label: "Group Size", type: "number", required: true, placeholder: "1" },
    { name: "date", label: "Visit Date", type: "date", required: true },
    { name: "inTime", label: "Entry Time", type: "time", required: true },
    { name: "outTime", label: "Exit Time", type: "time", required: false },
    { name: "note", label: "Security Remarks", type: "textarea", required: false, placeholder: "Optional notes..." },
  ]

  const stats = {
    total: visitors.length,
    onPremise: visitors.filter(v => !v.outTime).length,
    today: visitors.filter(v => v.date === new Date().toLocaleDateString()).length,
    groupEntries: visitors.filter(v => v.noOfPerson > 1).length
  }

  return (
    <DashboardLayout title="Security Gateway">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Users className="text-emerald-600" size={24} />
              Visitor Registry
            </h1>
            <p className="text-sm text-gray-500">Live monitoring and historical auditing of all campus access</p>
          </div>
          <Button
            onClick={() => { setEditingId(null); setIsModalOpen(true); }}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 gap-2 h-11 px-6 rounded-xl font-semibold transition-all hover:scale-[1.02]"
          >
            <UserPlus className="h-4 w-4" /> Grant Access
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Visitors"
            value={stats.total.toString()}
            icon={History}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
            description="Historical total"
          />
          <StatCard
            title="On Premises"
            value={stats.onPremise.toString()}
            icon={DoorOpen}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            description="Active guests"
          />
          <StatCard
            title="Today's Traffic"
            value={stats.today.toString()}
            icon={Clock}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-50"
            description="Arrivals today"
          />
          <StatCard
            title="Group Entries"
            value={stats.groupEntries.toString()}
            icon={Users}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50"
            description="Multiple persons"
          />
        </div>

        <AdvancedTable
          title="Consolidated Access Log"
          columns={columns}
          data={visitors}
          loading={loading}
          searchable
          searchPlaceholder="Search by name, phone or purpose..."
          searchFields={['phone', 'name', 'purpose', 'id']}
          onView={(row) => setViewingId(row.id)}
          pagination
          onEdit={(row) => {
            setEditingId(row.id)
            setIsModalOpen(true)
          }}
          onDelete={(row) => setDeleteConfirm({ open: true, id: row.id })}
        />

        <FormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingId(null)
          }}
          title={editingId ? "Modify Access Record" : "New Secure Authorization"}
          fields={formFields}
          initialData={editingId ? visitors.find(v => v.id === editingId) : undefined}
          onSubmit={(data: any) => editingId ? handleEdit(editingId, data) : handleAdd(data)}
        />

        <ViewVisitorModal
          isOpen={!!viewingId}
          onClose={() => setViewingId(null)}
          visitor={visitors.find(v => v.id === viewingId)}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          onConfirm={confirmDelete}
          title="Revoke and Purge Record?"
          description="This will permanently delete the visitor entry from the security archives. This action is terminal."
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
