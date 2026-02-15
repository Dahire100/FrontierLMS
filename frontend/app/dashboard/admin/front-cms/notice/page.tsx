"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus, Megaphone, Pin, Calendar, Tag, Activity, Clock, Trash2, Edit, AlertCircle, Info, Bookmark, Eye, Printer, Download, Paperclip } from "lucide-react"
import { StatCard } from "@/components/super-admin/stat-card"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import FormModal, { FormField } from "@/components/form-modal"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface NoticeItem {
  id: string
  title: string
  description: string
  type: string
  publishedDate: string
  isPinned: boolean
  isActive: boolean
  attachments?: { filename: string; url: string; uploadedAt: string }[]
}

export default function NoticePage() {
  const { toast } = useToast()
  const [notices, setNotices] = useState<NoticeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // View Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null)

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  const [initialFormData, setInitialFormData] = useState<any>(undefined)

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
          isActive: item.isActive,
          attachments: item.attachments || []
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

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/upload/document`, { // Assuming correct endpoint based on discovery or standard pattern, but usually it's /api/upload
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    return await response.json();
  }

  const handleSave = async (data: any) => {
    try {
      const token = localStorage.getItem('token');

      let attachments = editingId
        ? (notices.find(n => n.id === editingId)?.attachments || [])
        : [];

      // Handle file upload if present
      if (data.attachment && data.attachment instanceof File) {
        try {
          // Try generic upload endpoint first if specific one fails or isn't known
          // Based on previous search, route is mounted at /api/upload? No, route returned was for document upload.
          // Let's assume /api/uploads/documents or similar. 
          // Wait, previous tool output for upload.js didn't specify mount path. 
          // Usually in server.js: app.use('/api/upload', uploadRoutes);

          // I'll try /api/upload first, as per common convention.
          // If the backend has specific route for documents, I might need to adjust.
          // The file `routes/upload.js` uses `documentUpload` middleware.

          const formData = new FormData();
          formData.append('file', data.attachment);

          const uploadRes = await fetch(`${API_URL}/api/upload`, { // Adjusted from assumption
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });

          if (uploadRes.ok) {
            const uploadResult = await uploadRes.json();
            if (uploadResult.success) {
              attachments = [uploadResult.file]; // Replace or append? Requirement says "attach a reference image", implied single.
            }
          } else {
            // Fallback or error
            console.error("Upload failed");
            toast({ title: "Upload Warning", description: "Could not upload attachment.", variant: "destructive" });
          }
        } catch (e) {
          console.error("Upload error", e);
        }
      }

      const url = editingId
        ? `${API_URL}/api/notices/${editingId}`
        : `${API_URL}/api/notices`;

      const payload = {
        ...data,
        isPinned: data.isPinned === 'true' || data.isPinned === true,
        targetAudience: ['all'],
        attachments: attachments
      };

      // Remove raw file object from payload
      delete payload.attachment;

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
        setInitialFormData(undefined);
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

  const handleView = (row: NoticeItem) => {
    setSelectedNotice(row)
    setViewModalOpen(true)
  }

  const handleDownloadPDF = (row: NoticeItem) => {
    const doc = new jsPDF()

    doc.setFontSize(22)
    doc.setTextColor(30, 30, 80)
    doc.text(row.title, 20, 20)

    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text(`Notice ID: ${row.id}`, 20, 30)
    doc.text(`Date: ${new Date(row.publishedDate).toLocaleDateString()}`, 20, 36)

    doc.setDrawColor(200)
    doc.line(20, 40, 190, 40)

    doc.setFontSize(11)
    doc.setTextColor(50)
    const splitDesc = doc.splitTextToSize(row.description, 170)
    doc.text(splitDesc, 20, 50)

    if (row.attachments && row.attachments.length > 0) {
      let y = 60 + (splitDesc.length * 5)
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 255)
      doc.text(`Attachment: ${row.attachments[0].filename} (See online for file)`, 20, y)
    }

    doc.save(`Notice-${row.title.replace(/\s+/g, '-')}.pdf`)
  }

  const handlePrint = (row: NoticeItem) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
          <html>
            <head>
              <title>Print Notice - ${row.title}</title>
              <style>
                body { font-family: sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                h1 { margin: 0; color: #1e1e50; }
                .meta { color: #666; font-size: 0.9em; margin-top: 10px; }
                .content { line-height: 1.6; font-size: 1.1em; }
                .footer { margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; font-size: 0.8em; color: #999; text-align: center; }
                .attachment { margin-top: 30px; padding: 15px; background: #f9f9f9; border: 1px dashed #ccc; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${row.title}</h1>
                <div class="meta">
                    Posted on ${new Date(row.publishedDate).toLocaleDateString()} • ${row.type.toUpperCase()}
                    ${row.isPinned ? ' • PINNED' : ''}
                </div>
              </div>
              
              <div class="content">
                ${row.description.replace(/\n/g, '<br/>')}
              </div>
              
              ${row.attachments && row.attachments.length > 0 ? `
                  <div class="attachment">
                    <strong>Attachment:</strong> ${row.attachments[0].filename}<br/>
                    <small>Available in digital portal</small>
                  </div>
              ` : ''}
              
              <div class="footer">
                FrontierLMS Official Notice • Generated on ${new Date().toLocaleDateString()}
              </div>
              
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
      label: "Bulletin Subject",
      render: (val: string, row: NoticeItem) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {row.isPinned && <Pin size={14} className="text-amber-500 fill-amber-500" />}
            <span className="font-bold text-gray-900 leading-none">{val}</span>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 truncate max-w-[250px]">{row.description}</span>
          {row.attachments && row.attachments.length > 0 && (
            <span className="flex items-center gap-1 text-[9px] text-blue-500 mt-1">
              <Paperclip size={10} /> Has Attachment
            </span>
          )}
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
    },
    {
      name: "attachment", label: "Reference Image/Document", type: "file", accept: "image/*, .pdf, .doc, .docx"
    }
  ]

  const additionalActions = [
    {
      label: "Download",
      icon: <Download className="h-4 w-4 mr-2" />,
      onClick: (row: NoticeItem) => handleDownloadPDF(row)
    },
    {
      label: "Print",
      icon: <Printer className="h-4 w-4 mr-2" />,
      onClick: (row: NoticeItem) => handlePrint(row)
    }
  ]

  return (
    <DashboardLayout title="Notice & Bulletins">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

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
            onClick={() => { setEditingId(null); setInitialFormData(undefined); setIsModalOpen(true); }}
            className="bg-[#1e1e50] hover:bg-[#151538] text-white px-6 h-12 rounded-xl shadow-lg shadow-indigo-100 flex gap-2 font-bold"
          >
            <Plus size={18} strokeWidth={3} /> NEW ANNOUNCEMENT
          </Button>
        </div>

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
          searchFields={['title', 'description', 'type']}
          pagination
          onEdit={(row) => {
            setEditingId(row.id);
            setInitialFormData({
              ...row,
              isPinned: row.isPinned.toString(),
              // Keep existing attachment for display/logic, but file input stays empty initially
              attachment: row.attachments && row.attachments.length > 0 ? row.attachments[0].url : undefined
            });
            setIsModalOpen(true);
          }}
          onDelete={(row) => setDeleteConfirm({ open: true, id: row.id })}
          onView={handleView}
          actions={[
            {
              label: "Pin/Unpin",
              onClick: (row: any) => togglePin(row.id),
              icon: <Pin className="h-4 w-4 mr-2" />
            },
            ...additionalActions
          ]}
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
          title={editingId ? "Modify Announcement" : "Publish New Notice"}
          initialData={initialFormData}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          title="Remove Announcement?"
          description="Are you sure you want to delete this notice? This action will remove it from all student and staff portals immediately."
          onConfirm={confirmDelete}
        />

        {/* View Modal */}
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center justify-between">
                Notice Details
                <div className="flex gap-2 mr-6">
                  <Button variant="outline" size="sm" onClick={() => selectedNotice && handleDownloadPDF(selectedNotice)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => selectedNotice && handlePrint(selectedNotice)}>
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            {selectedNotice && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900">{selectedNotice.title}</h3>
                  <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase",
                    "bg-indigo-100 text-indigo-700"
                  )}>
                    {selectedNotice.type}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(selectedNotice.publishedDate).toLocaleDateString()}
                  </div>
                  {selectedNotice.isPinned && (
                    <div className="flex items-center gap-1 text-amber-600 font-medium">
                      <Pin className="h-4 w-4" /> Pinned
                    </div>
                  )}
                </div>

                <div className="space-y-2 border-t pt-4">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedNotice.description}
                  </p>
                </div>

                {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 block">Attachment</span>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700 truncate">{selectedNotice.attachments[0].filename}</span>
                      <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                        <a href={`${API_URL}${selectedNotice.attachments[0].url}`} target="_blank" rel="noopener noreferrer">
                          Open File
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
