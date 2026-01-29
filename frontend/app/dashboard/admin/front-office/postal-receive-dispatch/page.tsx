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
  Mail,
  Send,
  Inbox,
  History,
  ClipboardList,
  Timer
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface PostalItem {
  id: string
  fromTitle: string
  toTitle: string
  referenceNo: string
  date: string
  type: 'receive' | 'dispatch'
  note?: string
}

export default function PostalReceiveDispatchPage() {
  const { toast } = useToast()
  const [records, setRecords] = useState<PostalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const response = await apiFetch(API_ENDPOINTS.FRONT_OFFICE.POSTAL_RECEIVE_DISPATCH);
      if (response.ok) {
        const data = await response.json();
        const mappedArray = Array.isArray(data) ? data : data.data || [];
        const mappedData = mappedArray.map((item: any) => ({
          id: item._id,
          fromTitle: item.fromTitle,
          toTitle: item.toTitle,
          referenceNo: item.referenceNo,
          date: new Date(item.date).toLocaleDateString(),
          type: item.type,
          note: item.note
        }));
        setRecords(mappedData);
      } else {
        toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error fetching postal records:', error);
      toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
    } finally {
      setLoading(false)
    }
  };

  const handleAdd = async (data: any) => {
    try {
      const response = await apiFetch(API_ENDPOINTS.FRONT_OFFICE.POSTAL_RECEIVE_DISPATCH, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (response.ok) {
        toast({ title: "Success", description: "Postal entry recorded." });
        fetchRecords();
        setIsModalOpen(false);
      } else {
        toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error adding record:', error);
      toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
    }
  };

  const handleEdit = async (id: string, data: any) => {
    try {
      const response = await apiFetch(`${API_ENDPOINTS.FRONT_OFFICE.POSTAL_RECEIVE_DISPATCH}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      if (response.ok) {
        toast({ title: "Updated", description: "Entry updated successfully." });
        fetchRecords();
        setIsModalOpen(false);
        setEditingId(null);
      } else {
        toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error updating record:', error);
      toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const response = await apiFetch(`${API_ENDPOINTS.FRONT_OFFICE.POSTAL_RECEIVE_DISPATCH}/${deleteConfirm.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast({ title: "Deleted", description: "Record removed from registry." });
        fetchRecords();
      } else {
        toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" });
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  };

  const columns = [
    {
      key: "type",
      label: "Traffic",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {value === 'receive' ? (
            <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg border border-emerald-100 italic">
              <Inbox size={14} />
            </div>
          ) : (
            <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg border border-blue-100 italic">
              <Send size={14} />
            </div>
          )}
          <span className="text-xs font-bold uppercase tracking-widest">{value}</span>
        </div>
      )
    },
    {
      key: "fromTitle",
      label: "Sender / Party",
      sortable: true,
      render: (value: string, row: PostalItem) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-900">{value}</span>
          <span className="text-[10px] text-gray-500 font-medium">To: {row.toTitle}</span>
        </div>
      )
    },
    {
      key: "referenceNo",
      label: "Reference #",
      sortable: true,
      render: (value: string) => <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{value}</span>
    },
    {
      key: "date",
      label: "Recorded On",
      sortable: true,
      render: (value: string) => (
        <span className="text-xs text-gray-600 font-medium flex items-center gap-1.5">
          <Timer size={12} className="text-gray-400" /> {value}
        </span>
      )
    }
  ]

  const formFields: FormField[] = [
    {
      name: "type",
      label: "Entry Category",
      type: "select",
      options: [
        { value: "receive", label: "Receive (Incoming)" },
        { value: "dispatch", label: "Dispatch (Outgoing)" }
      ],
      required: true
    },
    { name: "fromTitle", label: "From (Sender)", type: "text", required: true, placeholder: "e.g., Parent of Riya, Vendor Name..." },
    { name: "toTitle", label: "To (Recipient)", type: "text", required: true, placeholder: "e.g., General Office, Accountant..." },
    { name: "referenceNo", label: "Registry / Tracking No.", type: "text", required: true, placeholder: "REF-00X..." },
    { name: "date", label: "Transaction Date", type: "date", required: true },
    { name: "note", label: "Brief Remarks", type: "textarea", required: false, placeholder: "Confidential, Urgent, etc..." },
  ];

  const stats = {
    total: records.length,
    received: records.filter(r => r.type === 'receive').length,
    dispatched: records.filter(r => r.type === 'dispatch').length,
    today: records.filter(r => r.date === new Date().toLocaleDateString()).length
  }

  return (
    <DashboardLayout title="Postal Gateway">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Mail className="text-pink-600" size={24} />
              Inbound / Outbound Mail
            </h1>
            <p className="text-sm text-gray-500">Registry for monitoring all physical communication flows</p>
          </div>
          <Button
            onClick={() => { setEditingId(null); setIsModalOpen(true); }}
            className="bg-pink-600 hover:bg-pink-700 shadow-lg shadow-pink-100 gap-2 h-11 px-6 rounded-xl font-semibold transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" /> Log Postal Entry
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Handled"
            value={stats.total.toString()}
            icon={ClipboardList}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
            description="Registry size"
          />
          <StatCard
            title="Total Received"
            value={stats.received.toString()}
            icon={Inbox}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            description="Incoming flow"
          />
          <StatCard
            title="Total Dispatched"
            value={stats.dispatched.toString()}
            icon={Send}
            iconColor="text-pink-600"
            iconBgColor="bg-pink-50"
            description="Outgoing flow"
          />
          <StatCard
            title="Today's Traffic"
            value={stats.today.toString()}
            icon={History}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-50"
            description="Captured today"
          />
        </div>

        <AdvancedTable
          title="Digital Postal Registry"
          columns={columns}
          data={records}
          loading={loading}
          searchable
          searchPlaceholder="Monitor entries by sender, recipient or reference..."
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
          title={editingId ? "Modify Registry Entry" : "New Secure Postal Entry"}
          fields={formFields}
          initialData={editingId ? records.find(r => r.id === editingId) : undefined}
          onSubmit={(data: any) => editingId ? handleEdit(editingId, data) : handleAdd(data)}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          onConfirm={confirmDelete}
          title="Delete Registry Archive?"
          description="This will permanently purge this record from the security archives. This action cannot be undone."
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}

