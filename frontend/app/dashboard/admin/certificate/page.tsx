"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Award, FileCheck, Clock, Download, Plus, Loader2 } from "lucide-react"
import FormModal from "@/components/form-modal"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

interface Certificate {
  _id: string
  studentId: {
    _id: string
    firstName: string
    lastName: string
    rollNumber: string
    classId?: string
  }
  certificateType: string
  title: string
  description?: string
  issuedDate: string
  validUntil?: string
  certificateNumber: string
  issuedBy: string
  fileUrl?: string
  status: "active" | "expired" | "revoked"
}

export default function Certificate() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/certificates`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await response.json()

      if (data.success) {
        setCertificates(data.data)
      } else {
        toast.error("Failed to fetch certificates")
      }
    } catch (error) {
      console.error("Error fetching certificates:", error)
      toast.error("Failed to fetch certificates")
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/students`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await response.json()

      if (data.success) {
        setStudents(data.data)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  useEffect(() => {
    fetchCertificates()
    fetchStudents()
  }, [])

  const handleAdd = async (data: any) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/certificates`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentId: data.studentId,
          certificateType: data.certificateType,
          title: data.title,
          description: data.description,
          issuedDate: data.issuedDate,
          validUntil: data.validUntil,
          issuedBy: data.issuedBy,
          fileUrl: data.fileUrl
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Certificate created successfully")
        setIsModalOpen(false)
        fetchCertificates()
      } else {
        toast.error(result.error || "Failed to create certificate")
      }
    } catch (error) {
      console.error("Error creating certificate:", error)
      toast.error("Failed to create certificate")
    }
  }

  const handleEdit = async (id: string, data: any) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/certificates/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Certificate updated successfully")
        setEditingId(null)
        setIsModalOpen(false)
        fetchCertificates()
      } else {
        toast.error(result.error || "Failed to update certificate")
      }
    } catch (error) {
      console.error("Error updating certificate:", error)
      toast.error("Failed to update certificate")
    }
  }

  const handleDelete = (item: any) => {
    setDeleteConfirm({ open: true, id: item._id })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/certificates/${deleteConfirm.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Certificate deleted successfully")
        fetchCertificates()
      } else {
        toast.error(result.error || "Failed to delete certificate")
      }
    } catch (error) {
      console.error("Error deleting certificate:", error)
      toast.error("Failed to delete certificate")
    } finally {
      setDeleteConfirm({ open: false, id: null })
    }
  }

  const handleBulkAction = async (action: string, selectedIds: string[]) => {
    if (action === "delete") {
      try {
        const token = localStorage.getItem("token")
        await Promise.all(
          selectedIds.map(id =>
            fetch(`${API_URL}/api/certificates/${id}`, {
              method: "DELETE",
              headers: { "Authorization": `Bearer ${token}` }
            })
          )
        )
        toast.success(`${selectedIds.length} certificates deleted`)
        fetchCertificates()
      } catch (error) {
        toast.error("Failed to delete certificates")
      }
    }
  }

  const stats = {
    total: certificates.length,
    active: certificates.filter(c => c.status === "active").length,
    expired: certificates.filter(c => c.status === "expired").length,
    revoked: certificates.filter(c => c.status === "revoked").length
  }

  const columns = [
    {
      key: "studentId",
      label: "Student Details",
      render: (value: any, row: Certificate) => (
        <div>
          <p className="font-medium">{value.firstName} {value.lastName}</p>
          <p className="text-xs text-muted-foreground">{value.rollNumber}</p>
        </div>
      )
    },
    {
      key: "certificateType",
      label: "Certificate Type",
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium capitalize">{value}</span>
        </div>
      )
    },
    {
      key: "title",
      label: "Title",
      render: (value: string) => <span className="text-sm">{value}</span>
    },
    {
      key: "certificateNumber",
      label: "Certificate No.",
      render: (value: string) => <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{value}</span>
    },
    {
      key: "issuedDate",
      label: "Issue Date",
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={value === "active" ? "Issued" : value === "expired" ? "Expired" : "Revoked"} />
        </div>
      )
    },
  ]

  const formFields = [
    {
      name: "studentId",
      label: "Student",
      type: "select" as const,
      options: students.map(s => ({
        value: s._id,
        label: `${s.firstName} ${s.lastName} (${s.rollNumber})`
      })),
      required: true
    },
    {
      name: "certificateType",
      label: "Certificate Type",
      type: "select" as const,
      options: [
        { value: "achievement", label: "Achievement Certificate" },
        { value: "participation", label: "Participation Certificate" },
        { value: "conduct", label: "Conduct Certificate" },
        { value: "completion", label: "Completion Certificate" },
        { value: "merit", label: "Merit Certificate" },
        { value: "attendance", label: "Attendance Certificate" },
        { value: "sports", label: "Sports Certificate" },
        { value: "other", label: "Other" }
      ],
      required: true
    },
    { name: "title", label: "Certificate Title", type: "text" as const, required: true },
    { name: "description", label: "Description", type: "textarea" as const },
    { name: "issuedBy", label: "Issued By", type: "text" as const, required: true },
    { name: "issuedDate", label: "Issue Date", type: "date" as const, required: true },
    { name: "validUntil", label: "Valid Until (Optional)", type: "date" as const },
    { name: "fileUrl", label: "Certificate File URL (Optional)", type: "text" as const },
  ]

  return (
    <DashboardLayout title="Certificate">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Certificate Management</h2>
            <p className="text-sm text-muted-foreground">Generate and manage student certificates</p>
          </div>
          <Button onClick={() => { setEditingId(null); setIsModalOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Certificate
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Certificates"
            value={stats.total.toString()}
            icon={Award}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-100"
          />
          <StatCard
            title="Active"
            value={stats.active.toString()}
            icon={FileCheck}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Expired"
            value={stats.expired.toString()}
            icon={Clock}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
          <StatCard
            title="Revoked"
            value={stats.revoked.toString()}
            icon={FileCheck}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
          </div>
        ) : (
          <AdvancedTable
            columns={columns}
            data={certificates}
            searchable={true}
            searchPlaceholder="Search by student name, roll number, or certificate number..."
            filterable={true}
            filterOptions={[
              { key: "status", label: "Status", options: ["active", "expired", "revoked"] },
              { key: "certificateType", label: "Type", options: [...new Set(certificates.map(c => c.certificateType))] },
            ]}
            selectable={true}
            onEdit={(cert) => {
              setEditingId(cert._id)
              setIsModalOpen(true)
            }}
            onDelete={handleDelete}
            onBulkAction={handleBulkAction}
            pageSize={10}
            emptyMessage="No certificates found."
          />
        )}

        <FormModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingId(null) }}
          onSubmit={(data) => (editingId ? handleEdit(editingId, data) : handleAdd(data))}
          fields={formFields}
          title={editingId ? "Edit Certificate" : "Generate New Certificate"}
          initialData={editingId ? certificates.find((c) => c._id === editingId) : {}}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          title="Delete Certificate"
          description="Are you sure you want to delete this certificate? This action cannot be undone."
          onConfirm={confirmDelete}
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
