"use client"

import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"

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
  Search,
  UserPlus,
  PhoneCall,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  ClipboardCheck
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface EnquiryItem {
  id: string
  studentName: string
  phone: string
  email?: string
  source: string
  date: string
  status: "active" | "passive" | "dead" | "won" | "lost"
  classId?: { _id: string; name: string }
  className?: string
  noOfChild: number
  description?: string
}

export default function EnquiryManagementPage() {
  const { toast } = useToast()
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setLoading(true)
    try {
      const response = await apiFetch(API_ENDPOINTS.ENQUIRY);
      if (response.ok) {
        const data = await response.json();
        const mappedArray = Array.isArray(data) ? data : data.data || [];
        const mappedData = mappedArray.map((item: any) => ({
          id: item._id,
          studentName: item.studentName,
          phone: item.phone,
          email: item.email,
          source: item.source,
          date: new Date(item.date).toLocaleDateString(),
          status: item.status || "active",
          className: item.classId?.name || "N/A",
          noOfChild: item.noOfChild || 1,
          description: item.description
        }));
        setEnquiries(mappedData);
      } else {
        toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
    } finally {
      setLoading(false)
    }
  };

  const handleAdd = async (data: any) => {
    try {
      const response = await apiFetch(API_ENDPOINTS.ENQUIRY, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (response.ok) {
        toast({ title: "Success", description: "Enquiry logged successfully." });
        fetchEnquiries();
        setIsModalOpen(false);
      } else {
        toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error adding enquiry:', error);
      toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
    }
  };

  const handleEdit = async (id: string, data: any) => {
    try {
      const response = await apiFetch(`${API_ENDPOINTS.ENQUIRY}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      if (response.ok) {
        toast({ title: "Updated", description: "Enquiry record updated." });
        fetchEnquiries();
        setIsModalOpen(false);
        setEditingId(null);
      } else {
        toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error updating enquiry:', error);
      toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const response = await apiFetch(`${API_ENDPOINTS.ENQUIRY}/${deleteConfirm.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast({ title: "Deleted", description: "Enquiry record removed." });
        fetchEnquiries();
      } else {
        toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  };

  const columns = [
    {
      key: "studentName",
      label: "Lead Identity",
      sortable: true,
      render: (value: string, row: EnquiryItem) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 font-bold text-blue-600 text-xs">
            {value.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{value}</span>
            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
              <PhoneCall size={10} /> {row.phone}
            </span>
          </div>
        </div>
      )
    },
    {
      key: "className",
      label: "Level",
      sortable: true,
      render: (value: string) => (
        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
          Class {value}
        </span>
      )
    },
    {
      key: "source",
      label: "Origin",
      sortable: true,
      render: (value: string) => (
        <span className="text-xs text-gray-600 font-medium flex items-center gap-1 uppercase tracking-tighter">
          <Layers size={12} className="text-gray-400" /> {value}
        </span>
      )
    },
    {
      key: "status",
      label: "Pipeline Stage",
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />
    },
    {
      key: "date",
      label: "Recorded",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <Calendar size={14} className="text-gray-400" /> {value}
        </div>
      )
    }
  ]

  const formFields: FormField[] = [
    { name: "studentName", label: "Prospective Student", type: "text", required: true, placeholder: "Full Name" },
    { name: "phone", label: "Contact Number", type: "text", required: true, placeholder: "Primary mobile number" },
    { name: "email", label: "Contact Email", type: "email", required: false, placeholder: "example@domain.com" },
    { name: "source", label: "Discovery Medium", type: "text", required: true, placeholder: "Ref, Web, Ad..." },
    {
      name: "status",
      label: "Engagement Status",
      type: "select",
      options: [
        { value: "active", label: "Active Follow-up" },
        { value: "passive", label: "Passive Lead" },
        { value: "won", label: "Successfully Enrolled" },
        { value: "lost", label: "Closed/Interested Lost" },
        { value: "dead", label: "No Response" }
      ],
      required: true
    },
    { name: "noOfChild", label: "Inquiry Count", type: "number", required: true, placeholder: "1" },
    { name: "description", label: "Requirement Context", type: "textarea", required: false, placeholder: "Add specific requirements or details..." },
  ];

  const stats = {
    total: enquiries.length,
    active: enquiries.filter(e => e.status === 'active').length,
    won: enquiries.filter(e => e.status === 'won').length,
    today: enquiries.filter(e => e.date === new Date().toLocaleDateString()).length
  }

  return (
    <DashboardLayout title="Enquiry Command Center">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <ClipboardCheck className="text-blue-600" size={24} />
              Enquiry Management
            </h1>
            <p className="text-sm text-gray-500">Centralized tracking of all inbound leads and prospective admissions</p>
          </div>
          <Button
            onClick={() => { setEditingId(null); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 gap-2 h-11 px-6 rounded-xl font-semibold transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" /> Log Discovery
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Leads"
            value={stats.total.toString()}
            icon={Layers}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
            description="Database size"
          />
          <StatCard
            title="Active Pipeline"
            value={stats.active.toString()}
            icon={Clock}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-50"
            description="In-progress"
          />
          <StatCard
            title="Conversions"
            value={stats.won.toString()}
            icon={CheckCircle2}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            description="Student wins"
          />
          <StatCard
            title="New Today"
            value={stats.today.toString()}
            icon={Calendar}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50"
            description="Daily pulse"
          />
        </div>

        <AdvancedTable
          title="Engagement Pipeline"
          columns={columns}
          data={enquiries}
          loading={loading}
          searchable
          searchPlaceholder="Audit by student name or contact details..."
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
          title={editingId ? "Update Lead Context" : "Capture Critical Inquiry"}
          fields={formFields}
          initialData={editingId ? enquiries.find(e => e.id === editingId) : undefined}
          onSubmit={(data: any) => editingId ? handleEdit(editingId, data) : handleAdd(data)}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          onConfirm={confirmDelete}
          title="Remove Lead from Pipeline?"
          description="This will purge the inquiry record from the database. This action is terminal."
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
