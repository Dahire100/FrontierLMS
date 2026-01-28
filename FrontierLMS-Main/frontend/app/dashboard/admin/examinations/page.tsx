"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { ClipboardList, Calendar, CheckCircle, Clock, Plus } from "lucide-react"
import FormModal from "@/components/form-modal"

interface Exam {
  id: string
  name: string
  class: string
  date: string
  totalMarks: number
  status: "Upcoming" | "Ongoing" | "Completed"
  subjects: string[]
  studentsEnrolled: number
  term: string
}

export default function Examinations() {
  const [exams, setExams] = useState<Exam[]>([
    { id: "1", name: "Mid Term Exam", class: "10-A", date: "2025-02-15", totalMarks: 100, status: "Upcoming", subjects: ["Math", "Science", "English"], studentsEnrolled: 45, term: "Term 1" },
    { id: "2", name: "Final Exam", class: "10-B", date: "2025-03-20", totalMarks: 100, status: "Upcoming", subjects: ["Math", "Science", "English", "History"], studentsEnrolled: 42, term: "Term 2" },
    { id: "3", name: "Unit Test 1", class: "9-A", date: "2025-01-10", totalMarks: 50, status: "Completed", subjects: ["Math", "Science"], studentsEnrolled: 48, term: "Term 1" },
    { id: "4", name: "Mid Term Exam", class: "11-A", date: "2025-01-06", totalMarks: 100, status: "Ongoing", subjects: ["Physics", "Chemistry", "Math"], studentsEnrolled: 35, term: "Term 1" },
  ])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  const handleAdd = (data: any) => {
    const newExam: Exam = { 
      id: Date.now().toString(), 
      ...data,
      totalMarks: Number(data.totalMarks),
      studentsEnrolled: Number(data.studentsEnrolled || 0),
      subjects: data.subjects ? data.subjects.split(',').map((s: string) => s.trim()) : []
    }
    setExams([...exams, newExam])
    setIsModalOpen(false)
  }

  const handleEdit = (id: string, data: any) => {
    setExams(exams.map((exam) => (exam.id === id ? { 
      ...exam, 
      ...data,
      totalMarks: Number(data.totalMarks),
      studentsEnrolled: Number(data.studentsEnrolled || 0),
      subjects: data.subjects ? data.subjects.split(',').map((s: string) => s.trim()) : exam.subjects
    } : exam)))
    setEditingId(null)
    setIsModalOpen(false)
  }

  const handleDelete = (item: any) => {
    setDeleteConfirm({ open: true, id: item.id })
  }

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      setExams(exams.filter((exam) => exam.id !== deleteConfirm.id))
    }
    setDeleteConfirm({ open: false, id: null })
  }

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    if (action === "delete") {
      setExams(exams.filter((e) => !selectedIds.includes(e.id)))
    }
  }

  const stats = {
    total: exams.length,
    upcoming: exams.filter(e => e.status === "Upcoming").length,
    ongoing: exams.filter(e => e.status === "Ongoing").length,
    completed: exams.filter(e => e.status === "Completed").length
  }

  const columns = [
    {
      key: "name",
      label: "Exam",
      render: (value: string, row: Exam) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground">{row.term} - {row.class}</p>
        </div>
      )
    },
    {
      key: "date",
      label: "Date",
      render: (value: string, row: Exam) => {
        const examDate = new Date(value)
        const today = new Date()
        const daysUntil = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return (
          <div>
            <p className="text-sm">{examDate.toLocaleDateString()}</p>
            {row.status === "Upcoming" && (
              <p className="text-xs text-muted-foreground">
                {daysUntil > 0 ? `in ${daysUntil} days` : 'Today'}
              </p>
            )}
          </div>
        )
      }
    },
    {
      key: "subjects",
      label: "Subjects",
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((subject, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
              {subject}
            </span>
          ))}
          {value.length > 2 && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
              +{value.length - 2}
            </span>
          )}
        </div>
      )
    },
    {
      key: "studentsEnrolled",
      label: "Enrolled",
      render: (value: number) => (
        <span className="text-sm font-medium">{value} students</span>
      )
    },
    {
      key: "totalMarks",
      label: "Total Marks",
      render: (value: number) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => <StatusBadge status={value} />
    },
  ]

  const formFields = [
    { name: "name", label: "Exam Name", type: "text" as const, required: true },
    { name: "class", label: "Class", type: "text" as const, required: true },
    { name: "term", label: "Term", type: "select" as const, options: [
      { value: "Term 1", label: "Term 1" },
      { value: "Term 2", label: "Term 2" },
      { value: "Term 3", label: "Term 3" }
    ], required: true },
    { name: "date", label: "Date", type: "date" as const, required: true },
    { name: "totalMarks", label: "Total Marks", type: "number" as const, required: true },
    { name: "studentsEnrolled", label: "Students Enrolled", type: "number" as const, required: true },
    { name: "subjects", label: "Subjects (comma separated)", type: "text" as const, required: true },
    { name: "status", label: "Status", type: "select" as const, options: [
      { value: "Upcoming", label: "Upcoming" },
      { value: "Ongoing", label: "Ongoing" },
      { value: "Completed", label: "Completed" }
    ], required: true },
  ]

  return (
    <DashboardLayout title="Examinations">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Examination Management</h2>
            <p className="text-sm text-muted-foreground">Schedule and manage examinations</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Exam
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Exams"
            value={stats.total.toString()}
            icon={ClipboardList}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Upcoming"
            value={stats.upcoming.toString()}
            icon={Calendar}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatCard
            title="Ongoing"
            value={stats.ongoing.toString()}
            icon={Clock}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
          <StatCard
            title="Completed"
            value={stats.completed.toString()}
            icon={CheckCircle}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
        </div>

        <AdvancedTable
          columns={columns}
          data={exams}
          searchable={true}
          searchPlaceholder="Search by exam name, class..."
          filterable={true}
          filterOptions={[
            { key: "status", label: "Status", options: ["Upcoming", "Ongoing", "Completed"] },
            { key: "term", label: "Term", options: [...new Set(exams.map(e => e.term))] },
            { key: "class", label: "Class", options: [...new Set(exams.map(e => e.class))] }
          ]}
          selectable={true}
          onEdit={(exam) => {
            setEditingId(exam.id)
            setIsModalOpen(true)
          }}
          onDelete={handleDelete}
          onBulkAction={handleBulkAction}
          pageSize={10}
          emptyMessage="No examinations found."
        />

        <FormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingId(null)
          }}
          onSubmit={(data) => (editingId ? handleEdit(editingId, data) : handleAdd(data))}
          fields={formFields}
          title={editingId ? "Edit Exam" : "Schedule New Exam"}
          initialData={editingId ? {
            ...exams.find((e) => e.id === editingId),
            subjects: exams.find((e) => e.id === editingId)?.subjects.join(', ')
          } : {}}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          title="Delete Examination"
          description="Are you sure you want to delete this examination? This action cannot be undone."
          onConfirm={confirmDelete}
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
