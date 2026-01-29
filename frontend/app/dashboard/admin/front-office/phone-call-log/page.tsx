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
  PhoneOutgoing,
  PhoneIncoming,
  Clock,
  Calendar,
  UserCircle2,
  History,
  PhoneCall,
  Navigation
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface CallLogItem {
  id: string
  name: string
  phone: string
  date: string
  callType: 'Incoming' | 'Outgoing'
  callDuration?: string
  nextFollowUpDate?: string
  note?: string
  description?: string
}

export default function PhoneCallLogPage() {
  const { toast } = useToast()
  const [logs, setLogs] = useState<CallLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await apiFetch(API_ENDPOINTS.FRONT_OFFICE.PHONE_LOGS);
      if (response.ok) {
        const data = await response.json();
        const mappedData = (Array.isArray(data) ? data : data.data || []).map((item: any) => ({
          id: item._id,
          name: item.name,
          phone: item.phone,
          date: new Date(item.date).toLocaleDateString(),
          callType: item.callType || 'Incoming',
          callDuration: item.callDuration,
          nextFollowUpDate: item.nextFollowUpDate ? new Date(item.nextFollowUpDate).toLocaleDateString() : 'N/A',
          note: item.note,
          description: item.description
        }));
        setLogs(mappedData);
      } else {
        toast({ title: "Error", description: "Failed to load call history.", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
    } finally {
      setLoading(false)
    }
  };

  const handleAdd = async (data: any) => {
    try {
      const response = await apiFetch(API_ENDPOINTS.FRONT_OFFICE.PHONE_LOGS, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (response.ok) {
        toast({ title: "Success", description: "Call logged successfully." });
        fetchLogs();
        setIsModalOpen(false);
      } else {
        toast({ title: "Error", description: "Failed to save call log.", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error adding log:', error);
      toast({ title: "Error", description: "Failed to save call log.", variant: "destructive" });
    }
  };

  const handleEdit = async (id: string, data: any) => {
    try {
      const response = await apiFetch(`${API_ENDPOINTS.FRONT_OFFICE.PHONE_LOGS}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      if (response.ok) {
        toast({ title: "Updated", description: "Call log updated." });
        fetchLogs();
        setIsModalOpen(false);
        setEditingId(null);
      } else {
        toast({ title: "Error", description: "Failed to update record.", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error updating log:', error);
      toast({ title: "Error", description: "Failed to update record.", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const response = await apiFetch(`${API_ENDPOINTS.FRONT_OFFICE.PHONE_LOGS}/${deleteConfirm.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast({ title: "Deleted", description: "Entry removed from log." });
        fetchLogs();
      } else {
        toast({ title: "Error", description: "Failed to delete log entry.", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error deleting log:', error);
      toast({ title: "Error", description: "Failed to delete log entry.", variant: "destructive" });
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  };

  const columns = [
    {
      key: "name",
      label: "Interlocutor",
      sortable: true,
      render: (value: string, row: CallLogItem) => (
        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center border font-bold text-xs
            ${row.callType === 'Incoming' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}
          `}>
            {row.callType === 'Incoming' ? <PhoneIncoming size={14} /> : <PhoneOutgoing size={14} />}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{value}</span>
            <span className="text-[10px] text-gray-500 font-medium tracking-wide">{row.phone}</span>
          </div>
        </div>
      )
    },
    {
      key: "callType",
      label: "Traffic",
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter border
          ${value === 'Incoming' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'}
        `}>
          {value}
        </span>
      )
    },
    {
      key: "date",
      label: "Timestamp",
      sortable: true,
      render: (value: string) => (
        <span className="text-xs text-gray-600 font-medium">{value}</span>
      )
    },
    {
      key: "nextFollowUpDate",
      label: "Follow-up",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar size={12} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-700">{value}</span>
        </div>
      )
    }
  ]

  const formFields: FormField[] = [
    { name: "name", label: "Contact Person", type: "text", required: true, placeholder: "Name of the person" },
    { name: "phone", label: "Contact Number", type: "text", required: true, placeholder: "+91 ..." },
    {
      name: "callType",
      label: "Call Direction",
      type: "select",
      options: [
        { value: "Incoming", label: "Incoming Call" },
        { value: "Outgoing", label: "Outgoing Call" }
      ],
      required: true
    },
    { name: "date", label: "Call Date", type: "date", required: true },
    { name: "callDuration", label: "Duration", type: "text", required: false, placeholder: "e.g., 5 mins 20 secs" },
    { name: "nextFollowUpDate", label: "Next Follow-up", type: "date", required: false },
    { name: "description", label: "Brief Summary", type: "textarea", required: false, placeholder: "Points discussed..." },
    { name: "note", label: "Internal Notes", type: "textarea", required: false, placeholder: "Private notes for staff..." },
  ];

  const stats = {
    total: logs.length,
    incoming: logs.filter(l => l.callType === 'Incoming').length,
    outgoing: logs.filter(l => l.callType === 'Outgoing').length,
    followUps: logs.filter(l => l.nextFollowUpDate && l.nextFollowUpDate !== 'N/A').length
  }

  return (
    <DashboardLayout title="Comms History">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <PhoneCall className="text-indigo-600" size={24} />
              Telephony Exchange
            </h1>
            <p className="text-sm text-gray-500">Comprehensive audit of all inbound and outbound voice communications</p>
          </div>
          <Button
            onClick={() => { setEditingId(null); setIsModalOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 gap-2 h-11 px-6 rounded-xl font-semibold transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" /> Log New Exchange
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Exchanges"
            value={stats.total.toString()}
            icon={History}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
            description="Historical logs"
          />
          <StatCard
            title="Inbound Flow"
            value={stats.incoming.toString()}
            icon={PhoneIncoming}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            description="Customer inquiries"
          />
          <StatCard
            title="Outbound Flow"
            value={stats.outgoing.toString()}
            icon={PhoneOutgoing}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-50"
            description="Active follow-ups"
          />
          <StatCard
            title="Next Step Agenda"
            value={stats.followUps.toString()}
            icon={Navigation}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-50"
            description="Pending call-backs"
          />
        </div>

        <AdvancedTable
          title="Telephony Manifest"
          columns={columns}
          data={logs}
          loading={loading}
          searchable
          searchPlaceholder="Track records by person or phone..."
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
          title={editingId ? "Refine Log Entry" : "Capture Telephony Exchange"}
          fields={formFields}
          initialData={editingId ? logs.find(l => l.id === editingId) : undefined}
          onSubmit={(data: any) => editingId ? handleEdit(editingId, data) : handleAdd(data)}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          onConfirm={confirmDelete}
          title="Permanently Delete Log?"
          description="This will remove the communication record from the system. This action is irreversible."
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}

