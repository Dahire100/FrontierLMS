"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, MapPin, Clock, Tag, Activity, Archive, Trash2, Edit, MoreVertical, Eye, Printer, Download, X } from "lucide-react"
import { StatCard } from "@/components/super-admin/stat-card"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import FormModal, { FormField } from "@/components/form-modal"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

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

  // View Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  // Form initial data state to handle formatting
  const [initialFormData, setInitialFormData] = useState<any>(undefined)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching events from:', `${API_URL}/api/events`);
      console.log('Token present:', !!token);

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
      } else {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          window.location.href = '/school-login'; // Redirect to login
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to load events");
      }
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast({ title: "Error", description: error.message || "Failed to load events", variant: "destructive" });
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
        setInitialFormData(undefined);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save event");
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

  const handleView = (row: EventItem) => {
    setSelectedEvent(row)
    setViewModalOpen(true)
  }

  const handleDownloadPDF = (row: EventItem) => {
    const doc = new jsPDF()

    doc.setFontSize(22)
    doc.setTextColor(30, 30, 80)
    doc.text(row.title, 20, 20)

    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text(`Event ID: ${row.id}`, 20, 30)

    autoTable(doc, {
      startY: 40,
      head: [['Field', 'Details']],
      body: [
        ['Description', row.description || 'N/A'],
        ['Date', new Date(row.eventDate).toLocaleDateString()],
        ['Time', `${row.startTime} - ${row.endTime}`],
        ['Venue', row.venue],
        ['Type', row.eventType],
        ['Status', row.status.toUpperCase()]
      ],
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [41, 128, 185] }
    })

    doc.save(`Event-${row.title.replace(/\s+/g, '-')}.pdf`)
    toast({ title: "Downloaded", description: "PDF generated successfully." })
  }

  const handlePrint = (row: EventItem) => {
    // Create a print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
          <html>
            <head>
              <title>Print - ${row.title}</title>
              <style>
                body { font-family: sans-serif; padding: 40px; }
                h1 { color: #333; border-bottom: 2px solid #ccc; padding-bottom: 10px; }
                .meta { color: #666; font-size: 0.9em; margin-bottom: 20px; }
                .row { display: flex; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                .label { font-weight: bold; width: 150px; }
                .value { flex: 1; }
                .status { 
                    display: inline-block; padding: 4px 8px; border-radius: 4px; 
                    font-weight: bold; font-size: 0.8em; text-transform: uppercase;
                }
              </style>
            </head>
            <body>
              <h1>${row.title}</h1>
              <div class="meta">Event ID: ${row.id}</div>
              
              <div class="row">
                <div class="label">Date</div>
                <div class="value">${new Date(row.eventDate).toLocaleDateString()}</div>
              </div>
               <div class="row">
                <div class="label">Time</div>
                <div class="value">${row.startTime} - ${row.endTime}</div>
              </div>
               <div class="row">
                <div class="label">Venue</div>
                <div class="value">${row.venue}</div>
              </div>
              <div class="row">
                <div class="label">Type</div>
                <div class="value">${row.eventType}</div>
              </div>
               <div class="row">
                <div class="label">Status</div>
                <div class="value">${row.status}</div>
              </div>
              <div class="row" style="margin-top: 20px; border: none;">
                <div class="label">Description</div>
              </div>
              <div>${row.description || 'No description provided.'}</div>
              
              <script>
                window.onload = function() { window.print(); window.close(); }
              </script>
            </body>
          </html>
        `);
      printWindow.document.close();
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
      label: "Type",
      render: (val: string) => (
        <div className="flex items-center gap-1.5">
          <Tag size={12} className="text-indigo-400" />
          <span className="capitalize text-[11px]">{val}</span>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (val: string) => {
        const statusConfig: any = {
          upcoming: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
          ongoing: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
          completed: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
          cancelled: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100" },
          pending: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
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
    { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Detailed overview..." },
    { name: "eventDate", label: "Event Date", type: "date", required: true },
    { name: "startTime", label: "Start Time", type: "time", required: true },
    { name: "endTime", label: "End Time", type: "time", required: true },
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
        { value: "cancelled", label: "Cancelled" },
        { value: "pending", label: "Pending" }
      ], required: true
    }
  ]

  const additionalActions = [
    {
      label: "Download Details",
      icon: <Download className="h-4 w-4 mr-2" />,
      onClick: (row: EventItem) => handleDownloadPDF(row)
    },
    {
      label: "Print",
      icon: <Printer className="h-4 w-4 mr-2" />,
      onClick: (row: EventItem) => handlePrint(row)
    }
  ]

  return (
    <DashboardLayout title="Events & Activities">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
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
            onClick={() => {
              setEditingId(null);
              setInitialFormData(undefined);
              setIsModalOpen(true);
            }}
            className="bg-[#1e1e50] hover:bg-[#151538] text-white px-6 h-12 rounded-xl shadow-lg shadow-indigo-100 flex gap-2 font-bold"
          >
            <Plus size={18} strokeWidth={3} /> SCHEDULE EVENT
          </Button>
        </div>

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
            title="Pending Approval"
            value={events.filter(e => e.status === 'pending').length.toString()}
            icon={MoreVertical}
            iconColor="text-gray-600"
            iconBgColor="bg-gray-50"
            description="Draft/Review phase"
          />
        </div>

        <AdvancedTable
          title="Engagement Calendar"
          columns={columns}
          data={events}
          loading={loading}
          searchable
          searchPlaceholder="Search by title, venue or type..."
          searchFields={['title', 'venue', 'eventType', 'description']}
          pagination
          onEdit={(row) => {
            setEditingId(row.id);
            // Format date for the form
            setInitialFormData({
              ...row,
              eventDate: row.eventDate ? new Date(row.eventDate).toISOString().split('T')[0] : ''
            });
            setIsModalOpen(true);
          }}
          onDelete={(row) => {
            setDeleteConfirm({ open: true, id: row.id });
          }}
          onView={handleView}
          actions={additionalActions}
        />

        <FormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingId(null);
            setInitialFormData(undefined);
          }}
          onSubmit={handleSave}
          fields={formFields}
          title={editingId ? "Modify Event Details" : "Schedule New Event"}
          initialData={initialFormData}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          title="Remove Event Record?"
          description="Are you sure you want to delete this event? This action will remove it from the public calendar and cannot be undone."
          onConfirm={confirmDelete}
        />

        {/* View Modal */}
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center justify-between">
                Event Details
                <div className="flex gap-2 mr-6">
                  <Button variant="outline" size="sm" onClick={() => selectedEvent && handleDownloadPDF(selectedEvent)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => selectedEvent && handlePrint(selectedEvent)}>
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedEvent.title}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <MapPin className="h-3 w-3" /> {selectedEvent.venue}
                    </p>
                  </div>
                  <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase",
                    selectedEvent.status === 'upcoming' ? "bg-amber-100 text-amber-700" :
                      selectedEvent.status === 'ongoing' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                  )}>
                    {selectedEvent.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Date</span>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-indigo-500" />
                      {new Date(selectedEvent.eventDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Time</span>
                    <p className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-500" />
                      {selectedEvent.startTime} - {selectedEvent.endTime}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Type</span>
                    <p className="font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4 text-cyan-500" />
                      {selectedEvent.eventType}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Description</span>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedEvent.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
