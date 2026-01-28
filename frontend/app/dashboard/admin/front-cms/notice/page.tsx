"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus, Megaphone, Pin, Calendar, Tag, Activity, Clock, Trash2, Edit, AlertCircle, Info, Bookmark } from "lucide-react"
import { StatCard } from "@/components/super-admin/stat-card"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import FormModal, { FormField } from "@/components/form-modal"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface NoticeItem {
  id: string
  title: string
  description: string
  type: string
  publishedDate: string
  isPinned: boolean
  isActive: boolean
}

export default function NoticePage() {
  const { toast } = useToast()
  const [notices, setNotices] = useState<NoticeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/notices`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        const mappedNotices = data.map((item: any) => ({
          id: item._id,
          title: item.title,
          description: item.description,
          type: item.type,
          publishedDate: item.publishedDate,
          isPinned: item.isPinned,
          isActive: item.isActive
        }));
        setNotices(mappedNotices);
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
      toast({ title: "Error", description: "Failed to load notices", variant: "destructive" });
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingId
        ? `${API_URL}/api/notices/${editingId}`
        : `${API_URL}/api/notices`;

      const payload = {
        ...data,
        isPinned: data.isPinned === 'true' || data.isPinned === true,
        targetAudience: ['all']
      };

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({ title: "Success", description: `Notice ${editingId ? "updated" : "published"} successfully.` });
        fetchNotices();
        setIsModalOpen(false);
        setEditingId(null);
      } else {
        throw new Error("Failed to save notice")
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/notices/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({ title: "Deleted", description: "Notice has been removed." });
        fetchNotices();
      } else {
        throw new Error("Failed to delete notice")
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  }

  const togglePin = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/notices/${id}/toggle-pin`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast({ title: "Pinned", description: "Notice priority updated." });
        fetchNotices();
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const columns = [
    {
      key: "title",
      label: "Bulletin Subject",
      render: (val: string, row: NoticeItem) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {row.isPinned && <Pin size={14} className="text-amber-500 fill-amber-500" />}
            <span className="font-bold text-gray-900 leading-none">{val}</span>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 truncate max-w-[250px]">{row.description}</span>
        </div>
      )
    },
    {
      key: "type",
      label: "Category",
      render: (val: string) => {
        const typeConfig: any = {
          urgent: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100", icon: AlertCircle },
          holiday: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", icon: Info },
          exam: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", icon: Bookmark },
          circular: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100", icon: Info },
          general: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-100", icon: Megaphone }
        }
        const cfg = typeConfig[val] || typeConfig.general
        const Icon = cfg.icon
        return (
          <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border w-fit uppercase tracking-tighter", cfg.bg, cfg.text, cfg.border)}>
            <Icon size={10} />
            {val}
          </div>
        )
      }
    },
    {
      key: "publishedDate",
      label: "Date Posted",
      render: (val: string) => (
        <div className="flex items-center gap-1.5 text-gray-600">
          <Calendar size={12} className="text-indigo-500" />
          <span className="text-[11px] font-medium">
            {new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      )
    },
    {
      key: "isActive",
      label: "Visibility",
      render: (val: boolean) => (
        <span className={cn(
          "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border",
          val ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-gray-50 text-gray-400 border-gray-100"
        )}>
          {val ? "Public" : "Draft"}
        </span>
      )
    }
  ]

  const formFields: FormField[] = [
    { name: "title", label: "Notice Subject", type: "text", required: true, placeholder: "Headline for the notice..." },
    { name: "description", label: "Content", type: "textarea", required: true, placeholder: "Full notice description..." },
    {
      name: "type", label: "Notice Classification", type: "select", options: [
        { value: "general", label: "General Notice" },
        { value: "urgent", label: "Urgent Alert" },
        { value: "holiday", label: "Holiday Announcement" },
        { value: "exam", label: "Examination Info" },
        { value: "circular", label: "Official Circular" }
      ], required: true
    },
    {
      name: "isPinned", label: "Fix to Top (Pinned)", type: "select", options: [
        { value: "true", label: "Yes - High Priority" },
        { value: "false", label: "No - Normal Flow" }
      ], required: true
    }
  ]

  return (
    <DashboardLayout title="Notice & Bulletins">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

        {/* Modernized Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-inner">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight italic uppercase">BULLETIN BOARD</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#1e1e50] animate-pulse" />
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest text-[#1e1e50]">Digital Announcements Hub</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => { setEditingId(null); setIsModalOpen(true); }}
            className="bg-[#1e1e50] hover:bg-[#151538] text-white px-6 h-12 rounded-xl shadow-lg shadow-indigo-100 flex gap-2 font-bold"
          >
            <Plus size={18} strokeWidth={3} /> NEW ANNOUNCEMENT
          </Button>
        </div>

        {/* Analytics Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Active Notices"
            value={notices.length.toString()}
            icon={Activity}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-50"
            description="Currently visible"
          />
          <StatCard
            title="Urgent Alerts"
            value={notices.filter(n => n.type === 'urgent').length.toString()}
            icon={AlertCircle}
            iconColor="text-rose-600"
            iconBgColor="bg-rose-50"
            description="Priority attention"
          />
          <StatCard
            title="Pinned"
            value={notices.filter(n => n.isPinned).length.toString()}
            icon={Pin}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-50"
            description="Fixed at top"
          />
          <StatCard
            title="New This Week"
            value={notices.filter(n => {
              const postDate = new Date(n.publishedDate);
              const now = new Date();
              return (now.getTime() - postDate.getTime()) < 7 * 24 * 60 * 60 * 1000;
            }).length.toString()}
            icon={Clock}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            description="Recent updates"
          />
        </div>

        <AdvancedTable
          title="Bulletin Record"
          columns={columns}
          data={notices}
          loading={loading}
          searchable
          searchPlaceholder="Audit bulletin titles or categories..."
          pagination
          onEdit={(row) => {
            setEditingId(row.id);
            setIsModalOpen(true);
          }}
          onDelete={(row) => setDeleteConfirm({ open: true, id: row.id })}
          actions={[
            {
              label: "Pin/Unpin",
              onClick: (row: any) => togglePin(row.id),
              icon: <Pin className="h-4 w-4 mr-2" />
            }
          ]}
        />

        <FormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingId(null);
          }}
          onSubmit={handleSave}
          fields={formFields}
          title={editingId ? "Modify Announcement" : "Publish New Notice"}
          initialData={editingId ? {
            ...notices.find((n) => n.id === editingId),
            isPinned: notices.find((n) => n.id === editingId)?.isPinned.toString()
          } : undefined}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          title="Remove Announcement?"
          description="Are you sure you want to delete this notice? This action will remove it from all student and staff portals immediately."
          onConfirm={confirmDelete}
        />
      </div>
    </DashboardLayout>
  )
}
