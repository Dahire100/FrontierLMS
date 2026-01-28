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
  ShieldAlert,
  MessageSquare,
  CheckCircle2,
  Clock,
  User,
  AlertTriangle,
  FileText
} from "lucide-react"
import { ViewComplaintModal } from "@/components/front-office/view-complaint-modal"
import { useToast } from "@/components/ui/use-toast"

interface ComplaintItem {
  id: string
  complainantName: string
  complainantType: "student" | "parent" | "teacher" | "staff" | "visitor" | "other"
  complaintType: string
  subject: string
  description: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in-progress" | "resolved" | "closed" | "rejected"
  createdAt: string
  response?: string
}

export default function ComplaintRegisterPage() {
  const { toast } = useToast()
  const [complaints, setComplaints] = useState<ComplaintItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      const response = await apiFetch(API_ENDPOINTS.COMPLAINT_REGISTER);
      if (response.ok) {
        const data = await response.json();
        const mappedArray = Array.isArray(data) ? data : data.data || [];
        const mappedData = mappedArray.map((item: any) => ({
          id: item._id,
          complainantName: item.complainantName,
          complainantType: item.complainantType,
          complaintType: item.complaintType,
          subject: item.subject,
          description: item.description,
          priority: item.priority || "medium",
          status: item.status || "open",
          createdAt: new Date(item.createdAt).toLocaleDateString(),
          response: item.response
        }));
        setComplaints(mappedData);
      } else {
        toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
    } finally {
      setLoading(false)
    }
  };

  const handleAdd = async (data: any) => {
    try {
      const response = await apiFetch(API_ENDPOINTS.COMPLAINT_REGISTER, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (response.ok) {
        toast({ title: "Success", description: "Complaint registered successfully." });
        fetchComplaints();
        setIsModalOpen(false);
      } else {
        toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error adding complaint:', error);
      toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
    }
  };

  const handleEdit = async (id: string, data: any) => {
    try {
      const response = await apiFetch(`${API_ENDPOINTS.COMPLAINT_REGISTER}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      if (response.ok) {
        toast({ title: "Updated", description: "Complaint details updated." });
        fetchComplaints();
        setIsModalOpen(false);
        setEditingId(null);
      } else {
        toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const response = await apiFetch(`${API_ENDPOINTS.COMPLAINT_REGISTER}/${deleteConfirm.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast({ title: "Deleted", description: "Grievance record removed." });
        fetchComplaints();
      } else {
        toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error deleting complaint:', error);
      toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  };

  const columns = [
    {
      key: "complainantName",
      label: "Reporter",
      sortable: true,
      render: (value: string, row: ComplaintItem) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-pink-50 rounded-full flex items-center justify-center border border-pink-100">
            <User className="h-4 w-4 text-pink-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{value}</span>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
              {row.complainantType}
            </span>
          </div>
        </div>
      )
    },
    {
      key: "subject",
      label: "Grievance Detail",
      sortable: false,
      render: (value: string, row: ComplaintItem) => (
        <div className="flex flex-col gap-0.5 max-w-[300px]">
          <span className="font-semibold text-xs text-gray-800 truncate">{value}</span>
          <span className="text-[10px] text-gray-400 line-clamp-1 italic">{row.description}</span>
        </div>
      )
    },
    {
      key: "priority",
      label: "Impact",
      sortable: true,
      render: (value: string) => {
        const colors: Record<string, string> = {
          low: "bg-blue-100 text-blue-700",
          medium: "bg-yellow-100 text-yellow-700",
          high: "bg-orange-100 text-orange-700",
          urgent: "bg-red-100 text-red-700"
        }
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${colors[value] || "bg-gray-100"}`}>
            {value}
          </span>
        )
      }
    },
    {
      key: "status",
      label: "Current State",
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />
    },
    {
      key: "createdAt",
      label: "Filed On",
      sortable: true,
      render: (value: string) => <span className="text-xs text-gray-500 font-medium">{value}</span>
    }
  ]

  const formFields: FormField[] = [
    { name: "complainantName", label: "Grievant Name", type: "text", required: true, placeholder: "Who is reporting?" },
    {
      name: "complainantType",
      label: "Entity Type",
      type: "select",
      options: [
        { value: "student", label: "Student" },
        { value: "parent", label: "Parent" },
        { value: "teacher", label: "Teacher" },
        { value: "staff", label: "Management/Staff" },
        { value: "visitor", label: "External Visitor" },
        { value: "other", label: "Other" }
      ],
      required: true
    },
    {
      name: "complaintType",
      label: "Reporting Category",
      type: "select",
      options: [
        { value: "academic", label: "Academics" },
        { value: "discipline", label: "Discipline" },
        { value: "facility", label: "Facilities" },
        { value: "transport", label: "Transport" },
        { value: "fee", label: "Fee Issues" },
        { value: "bullying", label: "Bullying" },
        { value: "other", label: "General" }
      ],
      required: true
    },
    { name: "subject", label: "Core Subject", type: "text", required: true, placeholder: "Brief summary of the issue" },
    { name: "description", label: "Full Narration", type: "textarea", required: true, placeholder: "Extensive details about the complaint..." },
    {
      name: "priority",
      label: "Urgency Level",
      type: "select",
      options: [
        { value: "low", label: "Low (General)" },
        { value: "medium", label: "Medium (Prompt)" },
        { value: "high", label: "High (Critical)" },
        { value: "urgent", label: "Urgent (Immediate)" }
      ],
      required: true
    },
    {
      name: "status",
      label: "Investigation Status",
      type: "select",
      options: [
        { value: "open", label: "Open (New)" },
        { value: "in-progress", label: "Under Investigation" },
        { value: "resolved", label: "Resolved" },
        { value: "closed", label: "Closed" },
        { value: "rejected", label: "Discarded" }
      ],
      required: true
    },
  ];

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'open' || c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length,
    urgent: complaints.filter(c => c.priority === 'urgent' || c.priority === 'high').length
  }

  return (
    <DashboardLayout title="Complaint Registry">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <ShieldAlert className="text-red-600" size={24} />
              Case Management
            </h1>
            <p className="text-sm text-gray-500">Official log for registering and tracking organizational complaints</p>
          </div>
          <Button
            onClick={() => { setEditingId(null); setIsModalOpen(true); }}
            className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-100 gap-2 h-11 px-6 rounded-xl font-semibold transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" /> Log New Case
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Cases"
            value={stats.total.toString()}
            icon={MessageSquare}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
            description="Lifetime filings"
          />
          <StatCard
            title="Active Cases"
            value={stats.pending.toString()}
            icon={Clock}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-50"
            description="Under investigation"
          />
          <StatCard
            title="Resolved"
            value={stats.resolved.toString()}
            icon={CheckCircle2}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            description="Closed successfully"
          />
          <StatCard
            title="Priority Issues"
            value={stats.urgent.toString()}
            icon={AlertTriangle}
            iconColor="text-red-600"
            iconBgColor="bg-red-50"
            description="High attention required"
          />
        </div>

        <AdvancedTable
          title="Case History Archive"
          columns={columns}
          data={complaints}
          loading={loading}
          searchable
          searchPlaceholder="Audit by reporter name or subject..."
          searchFields={['complainantName', 'complainantType', 'subject', 'id']}
          onView={(row) => setViewingId(row.id)}
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
          title={editingId ? "Update Case Details" : "New Grievance Entry"}
          fields={formFields}
          initialData={editingId ? complaints.find(c => c.id === editingId) : undefined}
          onSubmit={(data: any) => editingId ? handleEdit(editingId, data) : handleAdd(data)}
        />

        <ViewComplaintModal
          isOpen={!!viewingId}
          onClose={() => setViewingId(null)}
          complaint={complaints.find(c => c.id === viewingId)}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          onConfirm={confirmDelete}
          title="Purge Case Record?"
          description="This will permanently delete this complaint from the records. Historical data cannot be recovered."
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
