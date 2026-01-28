"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle, Clock, XCircle, Plus } from "lucide-react"
import FormModal from "@/components/form-modal"

interface ConsentLetter {
  id: string
  studentName: string
  rollNo: string
  class: string
  letterType: string
  status: "Pending" | "Approved" | "Rejected"
  submittedDate: string
  parentName: string
  purpose: string
}

export default function ConsentLetter() {
  const [letters, setLetters] = useState<ConsentLetter[]>([
    { id: "1", studentName: "John Doe", rollNo: "2024001", class: "10-A", letterType: "Field Trip", status: "Pending", submittedDate: "2025-01-15", parentName: "Robert Doe", purpose: "Educational tour to museum" },
    { id: "2", studentName: "Jane Smith", rollNo: "2024002", class: "10-A", letterType: "Medical", status: "Approved", submittedDate: "2025-01-10", parentName: "Mary Smith", purpose: "Medical checkup permission" },
    { id: "3", studentName: "Bob Johnson", rollNo: "2024003", class: "10-B", letterType: "Event", status: "Rejected", submittedDate: "2025-01-08", parentName: "David Johnson", purpose: "Sports event participation" },
    { id: "4", studentName: "Emily Brown", rollNo: "2024004", class: "9-A", letterType: "Excursion", status: "Approved", submittedDate: "2025-01-12", parentName: "Sarah Brown", purpose: "Science exhibition visit" },
  ])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  const handleAdd = (data: any) => {
    const newLetter: ConsentLetter = { 
      id: Date.now().toString(), 
      ...data, 
      submittedDate: new Date().toISOString().split("T")[0] 
    }
    setLetters([...letters, newLetter])
    setIsModalOpen(false)
  }

  const handleEdit = (id: string, data: any) => {
    setLetters(letters.map((l) => (l.id === id ? { ...l, ...data } : l)))
    setIsModalOpen(false)
    setEditingId(null)
  }

  const handleDelete = (item: any) => {
    setDeleteConfirm({ open: true, id: item.id })
  }

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      setLetters(letters.filter((l) => l.id !== deleteConfirm.id))
    }
    setDeleteConfirm({ open: false, id: null })
  }

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    if (action === "delete") {
      setLetters(letters.filter((l) => !selectedIds.includes(l.id)))
    }
  }

  const stats = {
    total: letters.length,
    pending: letters.filter(l => l.status === "Pending").length,
    approved: letters.filter(l => l.status === "Approved").length,
    rejected: letters.filter(l => l.status === "Rejected").length
  }

  const columns = [
    {
      key: "studentName",
      label: "Student Details",
      render: (value: string, row: ConsentLetter) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground">{row.rollNo} - {row.class}</p>
        </div>
      )
    },
    {
      key: "letterType",
      label: "Letter Type",
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: "parentName",
      label: "Parent/Guardian",
      render: (value: string) => <span className="text-sm">{value}</span>
    },
    {
      key: "purpose",
      label: "Purpose",
      render: (value: string) => (
        <span className="text-xs text-muted-foreground max-w-[200px] truncate block">{value}</span>
      )
    },
    {
      key: "submittedDate",
      label: "Submitted Date",
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => <StatusBadge status={value} />
    },
  ]

  const formFields = [
    { name: "studentName", label: "Student Name", type: "text" as const, required: true },
    { name: "rollNo", label: "Roll Number", type: "text" as const, required: true },
    { name: "class", label: "Class", type: "text" as const, required: true },
    { name: "parentName", label: "Parent/Guardian Name", type: "text" as const, required: true },
    { name: "letterType", label: "Letter Type", type: "select" as const, options: [
      { value: "Field Trip", label: "Field Trip" },
      { value: "Medical", label: "Medical" },
      { value: "Event", label: "Event" },
      { value: "Excursion", label: "Excursion" },
      { value: "Sports", label: "Sports" },
      { value: "Other", label: "Other" }
    ], required: true },
    { name: "purpose", label: "Purpose", type: "text" as const, required: true },
    { name: "status", label: "Status", type: "select" as const, options: [
      { value: "Pending", label: "Pending" },
      { value: "Approved", label: "Approved" },
      { value: "Rejected", label: "Rejected" }
    ], required: true },
  ]

  return (
    <DashboardLayout title="Consent Letter Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Consent Letter Management</h2>
            <p className="text-sm text-muted-foreground">Manage and track parent consent letters</p>
          </div>
          <Button onClick={() => { setEditingId(null); setIsModalOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Letter
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Letters"
            value={stats.total.toString()}
            icon={FileText}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Pending"
            value={stats.pending.toString()}
            icon={Clock}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
          <StatCard
            title="Approved"
            value={stats.approved.toString()}
            icon={CheckCircle}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Rejected"
            value={stats.rejected.toString()}
            icon={XCircle}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
          />
        </div>

        <AdvancedTable
          columns={columns}
          data={letters}
          searchable={true}
          searchPlaceholder="Search by student name, parent, or purpose..."
          filterable={true}
          filterOptions={[
            { key: "status", label: "Status", options: ["Pending", "Approved", "Rejected"] },
            { key: "letterType", label: "Type", options: [...new Set(letters.map(l => l.letterType))] },
            { key: "class", label: "Class", options: [...new Set(letters.map(l => l.class))] }
          ]}
          selectable={true}
          onEdit={(item) => {
            setEditingId(item.id)
            setIsModalOpen(true)
          }}
          onDelete={handleDelete}
          onBulkAction={handleBulkAction}
          pageSize={10}
          emptyMessage="No consent letters found."
        />

        <FormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingId(null)
          }}
          onSubmit={(data) => (editingId ? handleEdit(editingId, data) : handleAdd(data))}
          fields={formFields}
          title={editingId ? "Edit Consent Letter" : "Add Consent Letter"}
          initialData={editingId ? letters.find((l) => l.id === editingId) : {}}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          title="Delete Consent Letter"
          description="Are you sure you want to delete this consent letter? This action cannot be undone."
          onConfirm={confirmDelete}
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
