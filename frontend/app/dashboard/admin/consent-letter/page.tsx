"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { FileText, CheckCircle, Clock, XCircle, Plus, Eye, Printer, Download } from "lucide-react"
import FormModal from "@/components/form-modal"
import { toast } from "sonner"
import jsPDF from "jspdf"
import { API_URL } from "@/lib/api-config"

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
  const [viewLetter, setViewLetter] = useState<ConsentLetter | null>(null)
  const [dateFilter, setDateFilter] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })
  const [schoolSettings, setSchoolSettings] = useState({
    schoolName: "",
    address: "",
    phone: "",
    email: ""
  })

  useEffect(() => {
    fetchSchoolSettings()
  }, [])

  const fetchSchoolSettings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/settings/general`, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (!response.ok) {
        console.error("Failed to fetch settings:", response.status)
        return
      }

      const data = await response.json()
      const settings = data.data || data

      if (settings && settings.schoolName) {
        setSchoolSettings({
          schoolName: settings.schoolName,
          address: settings.address || "Address Not Available",
          phone: settings.phone || "",
          email: settings.email || ""
        })
      }
    } catch (error) {
      console.error("Error fetching school settings:", error)
    }
  }

  const handleAdd = (data: any) => {
    const newLetter: ConsentLetter = {
      id: Date.now().toString(),
      ...data,
      submittedDate: new Date().toISOString().split("T")[0]
    }
    setLetters([...letters, newLetter])
    setIsModalOpen(false)
    toast.success("Consent letter added successfully")
  }

  const handleEdit = (id: string, data: any) => {
    setLetters(letters.map((l) => (l.id === id ? { ...l, ...data } : l)))
    setIsModalOpen(false)
    setEditingId(null)
    toast.success("Consent letter updated successfully")
  }

  const handleDelete = (item: any) => {
    setDeleteConfirm({ open: true, id: item.id })
  }

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      setLetters(letters.filter((l) => l.id !== deleteConfirm.id))
      toast.success("Consent letter deleted")
    }
    setDeleteConfirm({ open: false, id: null })
  }

  const generatePDF = (letter: ConsentLetter) => {
    const doc = new jsPDF()

    // -- Decorative Border --
    doc.setDrawColor(41, 58, 122)
    doc.setLineWidth(3)
    doc.rect(10, 10, 190, 277)
    doc.setLineWidth(1)
    doc.rect(15, 15, 180, 267)

    // -- School Header --
    if (!schoolSettings.schoolName) {
      toast.error("School settings not loaded. Please check your connection.")
    }
    doc.setFont("times", "bold")
    doc.setFontSize(28)
    doc.setTextColor(41, 58, 122)
    doc.text(schoolSettings.schoolName.toUpperCase(), 105, 40, { align: "center" })

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(schoolSettings.address, 105, 50, { align: "center" })
    doc.text(`Ph: ${schoolSettings.phone} | Email: ${schoolSettings.email}`, 105, 56, { align: "center" })

    doc.setDrawColor(200)
    doc.setLineWidth(1)
    doc.line(30, 65, 180, 65)

    // -- Title --
    doc.setFont("times", "bold")
    doc.setFontSize(24)
    doc.setTextColor(0)
    doc.text("CONSENT LETTER", 105, 90, { align: "center" })

    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.text(`Date: ${new Date(letter.submittedDate).toLocaleDateString()}`, 150, 105)

    // -- Details Table-ish --
    const detailsY = 120
    doc.text(`Student Name:`, 30, detailsY)
    doc.setFont("helvetica", "bold")
    doc.text(letter.studentName, 70, detailsY)

    doc.setFont("helvetica", "normal")
    doc.text(`Roll No:`, 30, detailsY + 10)
    doc.setFont("helvetica", "bold")
    doc.text(letter.rollNo, 70, detailsY + 10)

    doc.setFont("helvetica", "normal")
    doc.text(`Class:`, 120, detailsY + 10)
    doc.setFont("helvetica", "bold")
    doc.text(letter.class, 140, detailsY + 10)

    doc.setFont("helvetica", "normal")
    doc.text(`Parent/Guardian:`, 30, detailsY + 20)
    doc.setFont("helvetica", "bold")
    doc.text(letter.parentName, 70, detailsY + 20)

    doc.setFont("helvetica", "normal")
    doc.text(`Subject:`, 30, detailsY + 35)
    doc.setFont("helvetica", "bold")
    doc.text(`Consent for ${letter.letterType}`, 50, detailsY + 35)

    // -- Body --
    doc.setFont("times", "normal")
    doc.setFontSize(13)

    const body = `I, ${letter.parentName}, parent/guardian of ${letter.studentName}, hereby give my irrevocable consent for my ward's participation in the stated activity.`

    const splitBody = doc.splitTextToSize(body, 150)
    doc.text(splitBody, 30, detailsY + 55)

    doc.text(`Purpose/Details:`, 30, detailsY + 75)
    const purposeText = doc.splitTextToSize(letter.purpose, 140)
    doc.setFont("times", "italic")
    doc.text(purposeText, 35, detailsY + 85)

    // -- Signatures --
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)


    doc.text("Signature of Parent/Guardian", 30, 240)
    doc.text("Authorized Signatory", 140, 240)
    doc.setFontSize(10)
    doc.text("(School Authority)", 145, 245)

    return doc
  }

  const handleDownload = (letter: ConsentLetter) => {
    const doc = generatePDF(letter)
    doc.save(`${letter.studentName}_Consent.pdf`)
  }

  const handlePrint = (letter: ConsentLetter) => {
    const doc = generatePDF(letter)
    doc.autoPrint()
    window.open(doc.output('bloburl').toString(), '_blank')
  }

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    if (action === "delete") {
      setLetters(letters.filter((l) => !selectedIds.includes(l.id)))
      toast.success("Selected letters deleted")
    } else if (action === "download") {
      // Simple bulk download: just download first one or loop? 
      // Browser might block multiple downloads. 
      // For now, let's just toast
      toast.info("Bulk download started...")
      const selectedLetters = letters.filter(l => selectedIds.includes(l.id))
      selectedLetters.forEach(l => handleDownload(l))
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
    {
      name: "letterType", label: "Letter Type", type: "select" as const, options: [
        { value: "Field Trip", label: "Field Trip" },
        { value: "Medical", label: "Medical" },
        { value: "Event", label: "Event" },
        { value: "Excursion", label: "Excursion" },
        { value: "Sports", label: "Sports" },
        { value: "Other", label: "Other" }
      ], required: true
    },
    { name: "purpose", label: "Purpose", type: "text" as const, required: true },
    {
      name: "status", label: "Status", type: "select" as const, options: [
        { value: "Pending", label: "Pending" },
        { value: "Approved", label: "Approved" },
        { value: "Rejected", label: "Rejected" }
      ], required: true
    },
  ]

  const filteredLetters = dateFilter
    ? letters.filter(l => l.submittedDate === dateFilter)
    : letters

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

        <div className="flex items-end gap-4 w-full sm:w-auto">
          <div className="w-[200px]">
            <Label>Filter by Date</Label>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-white"
            />
          </div>
          {dateFilter && (
            <Button variant="ghost" onClick={() => setDateFilter("")}>Clear</Button>
          )}
        </div>

        <AdvancedTable
          columns={columns}
          data={filteredLetters}
          searchable={true}
          searchPlaceholder="Search by student name, roll no, parent, or purpose..."
          searchFields={["rollNo", "class"]}
          filterable={true}
          filterOptions={[
            { key: "status", label: "Status", options: ["Pending", "Approved", "Rejected"] },
            { key: "letterType", label: "Type", options: Array.from(new Set(letters.map(l => l.letterType))) },
            { key: "class", label: "Class", options: Array.from(new Set(letters.map(l => l.class))) }
          ]}
          selectable={true}
          onView={(item) => setViewLetter(item)}
          onEdit={(item) => {
            setEditingId(item.id)
            setIsModalOpen(true)
          }}
          onDelete={handleDelete}
          onBulkAction={handleBulkAction}
          actions={[
            {
              label: "Download PDF",
              onClick: handleDownload,
              icon: <Download className="h-4 w-4 mr-2" />
            },
            {
              label: "Print",
              onClick: handlePrint,
              icon: <Printer className="h-4 w-4 mr-2" />
            }
          ]}
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

        {/* View Dialog */}
        <Dialog open={!!viewLetter} onOpenChange={(open) => !open && setViewLetter(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Consent Letter Details</DialogTitle>
              <DialogDescription>submitted on {viewLetter ? new Date(viewLetter.submittedDate).toLocaleDateString() : ''}</DialogDescription>
            </DialogHeader>
            {viewLetter && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Student Name</Label>
                    <p className="font-medium">{viewLetter.studentName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Roll No</Label>
                    <p className="font-medium">{viewLetter.rollNo}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Class</Label>
                    <p className="font-medium">{viewLetter.class}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Parent/Guardian</Label>
                    <p className="font-medium">{viewLetter.parentName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Letter Type</Label>
                    <p className="font-medium">{viewLetter.letterType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <StatusBadge status={viewLetter.status} />
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Purpose</Label>
                  <p className="border p-3 rounded-md bg-gray-50 text-sm mt-1">{viewLetter.purpose}</p>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => handlePrint(viewLetter)}>
                    <Printer className="h-4 w-4 mr-2" /> Print
                  </Button>
                  <Button onClick={() => handleDownload(viewLetter)}>
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
