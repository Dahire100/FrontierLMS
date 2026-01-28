"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, MapPin, Clock, Tag, Activity, Archive, Trash2, Edit, MoreVertical } from "lucide-react"
import { StatCard } from "@/components/super-admin/stat-card"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import FormModal, { FormField } from "@/components/form-modal"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface EventItem {
  id: string
  title: string
  description: string
  eventDate: string
  startTime: string
  endTime: string
  venue: string
  eventType: string
  status: string
}

export default function EventsPage() {
  const { toast } = useToast()
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/events`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        const mappedEvents = data.map((item: any) => ({
          id: item._id,
          title: item.title,
          description: item.description,
          eventDate: item.eventDate,
          startTime: item.startTime,
          endTime: item.endTime,
          venue: item.venue,
          eventType: item.eventType,
          status: item.status
        }));
        setEvents(mappedEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({ title: "Error", description: "Failed to load events", variant: "destructive" });
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingId
        ? `${API_URL}/api/events/${editingId}`
        : `${API_URL}/api/events`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast({ title: "Success", description: `Event ${editingId ? "updated" : "added"} successfully.` });
        fetchEvents();
        setIsModalOpen(false);
        setEditingId(null);
      } else {
        throw new Error("Failed to save event")
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/events/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({ title: "Deleted", description: "Event has been removed." });
        fetchEvents();
      } else {
        throw new Error("Failed to delete event")
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  }

  const columns = [
    {
      key: "title",
      label: "Event Information",
      render: (val: string, row: EventItem) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 leading-none mb-1">{val}</span>
          <span className="text-[10px] text-gray-400 truncate max-w-[200px]">{row.description}</span>
        </div>
      )
    },
    {
      key: "eventDate",
      label: "Schedule",
      render: (val: string, row: EventItem) => (
        <div className="flex flex-col gap-1 text-[11px]">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Calendar size={12} className="text-indigo-500" />
            {new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <Clock size={12} className="text-amber-500" />
            {row.startTime} - {row.endTime}
          </div>
        </div>
      )
    },
    {
      key: "venue",
      label: "Location",
      render: (val: string) => (
        <div className="flex items-center gap-1.5 text-gray-600">
          <MapPin size={12} className="text-rose-500" />
          <span className="text-[11px] font-medium">{val}</span>
        </div>
      )
    },
    {
      key: "eventType",
      label: "Classification",
      render: (val: string) => (
        <div className="flex items-center gap-1.5">
          <Tag size={12} className="text-indigo-400" />
          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100 uppercase tracking-tighter">
            {val}
          </span>
        </div>
      )
    },
    {
      key: "status",
      label: "Progress",
      render: (val: string) => {
        const statusConfig: any = {
          upcoming: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
          ongoing: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
          completed: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
          cancelled: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100" },
        }
        const cfg = statusConfig[val] || statusConfig.upcoming
        return (
          <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border", cfg.bg, cfg.text, cfg.border)}>
            {val}
          </span>
        )
      }
    }
  ]

  const formFields: FormField[] = [
    { name: "title", label: "Event Title", type: "text", required: true, placeholder: "e.g. Annual Sports Meet" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Detailed overview..." },
    { name: "eventDate", label: "Event Date", type: "date", required: true },
    { name: "startTime", label: "Start Time", type: "text", required: true, placeholder: "e.g. 09:00 AM" },
    { name: "endTime", label: "End Time", type: "text", required: true, placeholder: "e.g. 04:00 PM" },
    { name: "venue", label: "Venue", type: "text", required: true, placeholder: "e.g. School Playground" },
    {
      name: "eventType", label: "Event Type", type: "select", options: [
        { value: "academic", label: "Academic" },
        { value: "sports", label: "Sports" },
        { value: "cultural", label: "Cultural" },
        { value: "holiday", label: "Holiday" },
        { value: "other", label: "Other" }
      ], required: true
    },
    {
      name: "status", label: "Status", type: "select", options: [
        { value: "upcoming", label: "Upcoming" },
        { value: "ongoing", label: "Ongoing" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" }
      ], required: true
    }
  ]

  return (
    <DashboardLayout title="Events & Activities">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

        {/* Modernized Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-inner">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight italic">EVENT TRACKER</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Public Engagement Hub</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => { setEditingId(null); setIsModalOpen(true); }}
            className="bg-[#1e1e50] hover:bg-[#151538] text-white px-6 h-12 rounded-xl shadow-lg shadow-indigo-100 flex gap-2 font-bold"
          >
            <Plus size={18} strokeWidth={3} /> SCHEDULE EVENT
          </Button>
        </div>

        {/* Analytics Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Events"
            value={events.length.toString()}
            icon={Activity}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-50"
            description="Across all categories"
          />
          <StatCard
            title="Upcoming"
            value={events.filter(e => e.status === 'upcoming').length.toString()}
            icon={Calendar}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-50"
            description="Preparation phase"
          />
          <StatCard
            title="Completed"
            value={events.filter(e => e.status === 'completed').length.toString()}
            icon={Archive}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            description="Successful activities"
          />
          <StatCard
            title="Venues"
            value={new Set(events.map(e => e.venue)).size.toString()}
            icon={MapPin}
            iconColor="text-rose-600"
            iconBgColor="bg-rose-50"
            description="Active locations"
          />
        </div>

        <AdvancedTable
          title="Engagement Calendar"
          columns={columns}
          data={events}
          loading={loading}
          searchable
          searchPlaceholder="Search by title, venue or type..."
          pagination
          onEdit={(row) => {
            setEditingId(row.id);
            setIsModalOpen(true);
          }}
          onDelete={(row) => {
            setDeleteConfirm({ open: true, id: row.id });
          }}
        />

        <FormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingId(null);
          }}
          onSubmit={handleSave}
          fields={formFields}
          title={editingId ? "Modify Event Details" : "Schedule New Event"}
          initialData={editingId ? events.find((e) => e.id === editingId) : undefined}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          title="Remove Event Record?"
          description="Are you sure you want to delete this event? This action will remove it from the public calendar and cannot be undone."
          onConfirm={confirmDelete}
        />
      </div>
    </DashboardLayout>
  )
}
