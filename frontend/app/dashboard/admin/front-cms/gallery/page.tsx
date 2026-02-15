"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import FormModal, { FormField } from "@/components/form-modal"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { Button } from "@/components/ui/button"
import { Plus, Image as ImageIcon, Layout, Eye, Camera, CheckCircle, Download, Printer } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface GalleryItem {
  id: string
  title: string
  description?: string
  thumbnail?: string
  isActive: boolean
}

export default function GalleryPage() {
  const { toast } = useToast()
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  const [initialFormData, setInitialFormData] = useState<any>(undefined)

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cms/galleries`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        const mappedGallery = data.map((item: any) => ({
          id: item._id,
          title: item.title,
          description: item.description,
          thumbnail: item.thumbnail,
          isActive: item.isActive
        }));
        setGallery(mappedGallery);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast({ title: "Error", description: "Loading failed.", variant: "destructive" });
    } finally {
      setLoading(false)
    }
  };

  const handleSave = async (data: any) => {
    try {
      const token = localStorage.getItem('token');

      let thumbnail = editingId
        ? (gallery.find(g => g.id === editingId)?.thumbnail || "")
        : "";

      // Handle file upload if present
      if (data.thumbnail && data.thumbnail instanceof File) {
        try {
          const formData = new FormData();
          formData.append('file', data.thumbnail);

          const uploadRes = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });

          if (uploadRes.ok) {
            const uploadResult = await uploadRes.json();
            if (uploadResult.success) {
              thumbnail = uploadResult.file.url;
            }
          } else {
            console.error("Upload failed");
            toast({ title: "Upload Warning", description: "Could not upload image.", variant: "destructive" });
          }
        } catch (e) {
          console.error("Upload error", e);
        }
      } else if (typeof data.thumbnail === 'string' && data.thumbnail.startsWith('http')) {
        // If user manually entered URL (if we allow text input fallback, but here we prioritize file)
        thumbnail = data.thumbnail;
      }

      const url = editingId
        ? `${API_URL}/api/cms/galleries/${editingId}`
        : `${API_URL}/api/cms/galleries`;

      const payload = {
        title: data.title,
        description: data.description,
        thumbnail: thumbnail,
        isActive: data.isActive === 'true' || data.isActive === true,
        images: [] // Initially empty, management of images inside gallery might be separate or part of edit
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
        toast({ title: "Success", description: `Gallery ${editingId ? "updated" : "created"}.` });
        fetchGallery();
        setIsModalOpen(false);
        setEditingId(null);
        setInitialFormData(undefined);
      } else {
        throw new Error("Failed to save gallery");
      }
    } catch (error: any) {
      console.error('Error saving gallery:', error);
      toast({ title: "Error", description: error.message || "Failed to save gallery.", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cms/galleries/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast({ title: "Deleted", description: "Gallery removed." });
        fetchGallery();
      }
    } catch (error) {
      console.error('Error deleting gallery:', error);
      toast({ title: "Error", description: "Failed to delete gallery.", variant: "destructive" });
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  };

  const handleDownloadPDF = (row: GalleryItem) => {
    const doc = new jsPDF()
    doc.text(`Gallery: ${row.title}`, 20, 20)
    doc.text(`Description: ${row.description || 'N/A'}`, 20, 30)
    doc.save(`${row.title}.pdf`)
  }

  const handlePrint = (row: GalleryItem) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
          <html>
            <head><title>${row.title}</title></head>
            <body>
              <h1>${row.title}</h1>
              <p>${row.description || ''}</p>
              ${row.thumbnail ? `<img src="${API_URL}${row.thumbnail}" style="max-width:100%;"/>` : ''}
              <script>window.print();window.close();</script>
            </body>
          </html>
        `);
      printWindow.document.close();
    }
  }

  const columns = [
    {
      key: "title",
      label: "Gallery Portfolio",
      sortable: true,
      render: (value: string, row: GalleryItem) => (
        <div className="flex items-center gap-4 group">
          <div className="h-12 w-16 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0 shadow-sm relative">
            {row.thumbnail ? (
              <img
                src={`${row.thumbnail.startsWith('http') ? row.thumbnail : `${API_URL}${row.thumbnail}`}`}
                alt={value}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            ) : (
              <ImageIcon className="text-gray-300 h-6 w-6" />
            )}
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-gray-900 truncate text-sm">{value}</span>
            <span className="text-[11px] text-gray-500 font-medium truncate max-w-[240px]">
              {row.description || "No description provided"}
            </span>
          </div>
        </div>
      )
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (value: boolean) => <StatusBadge status={value ? "Active" : "Inactive"} />
    }
  ]

  const formFields: FormField[] = [
    { name: "title", label: "Gallery Title", type: "text", required: true, placeholder: "e.g. Annual Day 2024" },
    { name: "description", label: "Brief Description", type: "textarea", required: false, placeholder: "Describe the event or album..." },
    { name: "thumbnail", label: "Cover Image", type: "file", accept: "image/*", required: false },
    {
      name: "isActive",
      label: "Visibility",
      type: "select",
      options: [
        { value: "true", label: "Active (Visible on Website)" },
        { value: "false", label: "Inactive (Hidden)" }
      ],
      required: true
    },
  ];

  return (
    <DashboardLayout title="Media curation">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Camera className="text-indigo-500" size={24} />
              Visual Libraries
            </h1>
            <p className="text-sm text-gray-500">Organize and showcase institute events, facilities and achievements</p>
          </div>
          <Button
            onClick={() => { setEditingId(null); setInitialFormData(undefined); setIsModalOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 gap-2 h-11 px-6 rounded-xl"
          >
            <Plus className="h-4 w-4" /> Create Gallery
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Galleries"
            value={gallery.length.toString()}
            icon={Layout}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
            description="Active visual collections"
          />
          <StatCard
            title="Visible"
            value={gallery.filter(g => g.isActive).length.toString()}
            icon={CheckCircle}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            description="Publicly accessible"
          />
          <StatCard
            title="Hidden"
            value={gallery.filter(g => !g.isActive).length.toString()}
            icon={Eye}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-50"
            description="Draft mode"
          />
          <StatCard
            title="Total Assets"
            value="Coming Soon"
            icon={ImageIcon}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-50"
            description="Cumulative media"
          />
        </div>

        <AdvancedTable
          title="Archive Ledger"
          columns={columns}
          data={gallery}
          loading={loading}
          searchable
          searchPlaceholder="Audit gallery titles or descriptions..."
          searchFields={['title', 'description']}
          pagination
          onEdit={(row) => {
            setEditingId(row.id);
            setInitialFormData({
              ...row,
              isActive: row.isActive.toString(),
              thumbnail: row.thumbnail // Passes existing URL, handled by FormModal preview
            });
            setIsModalOpen(true);
          }}
          onDelete={(row) => setDeleteConfirm({ open: true, id: row.id })}
          actions={[
            {
              label: "Download",
              onClick: (row: any) => handleDownloadPDF(row),
              icon: <Download className="h-4 w-4 mr-2" />
            },
            {
              label: "Print",
              onClick: (row: any) => handlePrint(row),
              icon: <Printer className="h-4 w-4 mr-2" />
            }
          ]}
        />

        <FormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingId(null);
            setInitialFormData(undefined);
          }}
          title={editingId ? "Modify Gallery Details" : "New Visual Collection"}
          fields={formFields}
          initialData={initialFormData}
          onSubmit={handleSave}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          onConfirm={confirmDelete}
          title="Dissolve Visual Library?"
          description="This will permanently delete this gallery and all its linked assets from the visual directory. This cannot be reversed."
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
