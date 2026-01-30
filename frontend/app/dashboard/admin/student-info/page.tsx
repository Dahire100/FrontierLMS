"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users,
  UserCheck,
  User,
  GraduationCap,
  Mail,
  Phone,
  Plus,
  Download,
  Loader2
} from "lucide-react"
import FormModal from "@/components/form-modal"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

interface Student {
  id: string
  name: string
  email: string
  rollNo: string
  class: string
  section: string
  status: "Active" | "Inactive" | "Graduated"
  gender: "Male" | "Female"
  admissionDate: string
  parentName: string
  parentPhone: string
  parentEmail: string
  address?: string
}

export default function StudentInfo() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/students`, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (!res.ok) throw new Error("Failed to fetch students")

      const data = await res.json()

      // Map backend data to frontend interface
      const mappedStudents: Student[] = data.map((s: any) => ({
        id: s._id,
        name: `${s.firstName} ${s.lastName}`,
        email: s.email || "N/A",
        rollNo: s.rollNumber ? s.rollNumber.toString() : "N/A",
        class: s.class,
        section: s.section,
        status: s.isActive ? "Active" : "Inactive",
        gender: s.gender,
        admissionDate: s.admissionDate || new Date().toISOString(),
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        parentEmail: s.parentEmail,
        address: s.address
      }))

      setStudents(mappedStudents)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load students")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleAddStudent = async (data: any) => {
    console.log('📝 handleAddStudent called with data:', data)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("You are not logged in. Please log in again.")
        return
      }

      const formData = new FormData()

      // Split name - if only one word, use it for both first and last name
      let firstName = data.name?.trim() || 'Student';
      let lastName = '';

      if (data.name && data.name.includes(' ')) {
        const parts = data.name.trim().split(' ');
        firstName = parts[0];
        lastName = parts.slice(1).join(' ');
      } else {
        // If single word name, use it as lastName too
        lastName = firstName;
      }

      // Parse class and section
      const classParts = data.class?.replace('-', ' ').split(' ') || ['1', 'A']
      const studentClass = classParts[0]
      const section = classParts.length > 1 ? classParts[1] : 'A'

      console.log('📝 Parsed data:', { firstName, lastName, studentClass, section })

      formData.append('firstName', firstName)
      formData.append('lastName', lastName)
      formData.append('class', studentClass)
      formData.append('section', section)
      formData.append('rollNumber', data.rollNo || '0')
      formData.append('email', data.email || '')
      formData.append('parentPhone', data.parentPhone || '')
      formData.append('parentName', data.parentName || '')
      formData.append('parentEmail', data.parentEmail || '')
      formData.append('gender', data.gender || 'Other')
      formData.append('admissionDate', data.admissionDate || new Date().toISOString().split('T')[0])
      if (data.address) formData.append('address', data.address)
      formData.append('isActive', data.status === 'Active' ? 'true' : 'false')

      console.log('📝 Sending to API:', API_URL + '/api/students')

      const res = await fetch(`${API_URL}/api/students`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })

      console.log('📝 API Response status:', res.status)

      const responseData = await res.json()
      console.log('📝 API Response data:', responseData)

      if (!res.ok) {
        throw new Error(responseData.error || "Failed to add student")
      }

      toast.success("Student added successfully!")
      setIsModalOpen(false)
      fetchStudents()
    } catch (error) {
      console.error('❌ Error adding student:', error)
      toast.error(error instanceof Error ? error.message : "Failed to add student")
    }
  }

  const handleEditStudent = async (data: any) => {
    if (!editingStudent) return

    try {
      const token = localStorage.getItem("token")

      const formData = new FormData()

      let firstName = data.name;
      let lastName = '';

      if (data.name.includes(' ')) {
        const parts = data.name.split(' ');
        firstName = parts[0];
        lastName = parts.slice(1).join(' ');
      }


      const classParts = data.class.replace('-', ' ').split(' ')
      const studentClass = classParts[0]
      const section = classParts.length > 1 ? classParts[1] : 'A'

      formData.append('firstName', firstName)
      formData.append('lastName', lastName)
      formData.append('class', studentClass)
      formData.append('section', section)
      formData.append('rollNumber', data.rollNo)
      formData.append('email', data.email)
      formData.append('parentPhone', data.parentPhone)
      formData.append('parentName', data.parentName)
      formData.append('parentEmail', data.parentEmail)
      formData.append('gender', data.gender)
      formData.append('admissionDate', data.admissionDate)
      if (data.address) formData.append('address', data.address)
      formData.append('isActive', data.status === 'Active' ? 'true' : 'false')

      const res = await fetch(`${API_URL}/api/students/${editingStudent.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })

      if (!res.ok) throw new Error("Failed to update student")

      toast.success("Student updated successfully")
      setEditingStudent(null)
      setIsModalOpen(false)
      fetchStudents()
    } catch (error) {
      toast.error("Failed to update student")
    }
  }

  const handleDeleteStudent = async (id: string) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/students/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (!res.ok) throw new Error("Failed to delete student")

      setStudents(prev => prev.filter(s => s.id !== id))
      toast.success("Student deleted successfully")
    } catch (error) {
      toast.error("Failed to delete student")
    }
  }

  const handleDelete = (item: any) => {
    setDeleteConfirm({ open: true, id: item.id })
  }

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      handleDeleteStudent(deleteConfirm.id)
    }
    setDeleteConfirm({ open: false, id: null })
  }

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    if (action === "delete") {
      // Implement bulk delete if backend supports it, or looping
      toast.info("Bulk delete not implemented yet")
    }
  }

  const handleOpenModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student)
    }
    setIsModalOpen(true)
  }

  // Calculate stats
  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === "Active").length,
    inactive: students.filter((s) => s.status === "Inactive").length,
    male: students.filter((s) => s.gender === "Male").length,
    female: students.filter((s) => s.gender === "Female").length
  }

  const columns = [
    {
      key: "name",
      label: "Student",
      render: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {row.profilePicture && <img src={`${API_URL}${row.profilePicture}`} alt={value} className="h-full w-full object-cover" />}
            <AvatarFallback className="bg-purple-100 text-purple-600">
              {value.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-muted-foreground">Roll: {row.rollNo}</p>
          </div>
        </div>
      )
    },
    {
      key: "class",
      label: "Class",
      render: (value: string, row: Student) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}-{row.section}</span>
        </div>
      )
    },
    {
      key: "email",
      label: "Contact",
      render: (value: string, row: Student) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span>{value}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{row.parentName}</span>
          </div>
        </div>
      )
    },
    {
      key: "parentPhone",
      label: "Parent Contact",
      render: (value: string, row: Student) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span>{value}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="text-xs">{row.parentEmail}</span>
          </div>
        </div>
      )
    },
    {
      key: "admissionDate",
      label: "Admission Date",
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: "gender",
      label: "Gender",
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${value === 'Male' ? 'bg-blue-100 text-blue-700' :
          value === 'Female' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'
          }`}>
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => <StatusBadge status={value} />
    },
  ]

  const handleExport = () => {
    // Basic CSV Export
    const headers = ["ID", "Name", "Roll No", "Class", "Section", "Gender", "Parent Name", "Parent Phone"]
    const csvContent = [
      headers.join(","),
      ...students.map(s => [
        s.id, s.name, s.rollNo, s.class, s.section, s.gender, s.parentName, s.parentPhone
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "students_export.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>

  return (
    <DashboardLayout title="Student Info">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Student Management</h2>
            <p className="text-sm text-muted-foreground">Manage all students in the system</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                Print
              </div>
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => {
              setEditingStudent(null)
              setIsModalOpen(true)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={stats.total.toString()}
            icon={Users}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Active"
            value={stats.active.toString()}
            icon={UserCheck}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Male Students"
            value={stats.male.toString()}
            icon={User}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatCard
            title="Female Students"
            value={stats.female.toString()}
            icon={User}
            iconColor="text-pink-600"
            iconBgColor="bg-pink-100"
          />
        </div>

        {/* Advanced Table */}
        <AdvancedTable
          columns={columns}
          data={students}
          searchable={true}
          searchPlaceholder="Search by name, roll number, or parent..."
          searchFields={['name', 'rollNo', 'parentName', 'parentPhone']}
          filterable={true}
          filterOptions={[
            { key: "status", label: "Status", options: ["Active", "Inactive", "Graduated"] },
            { key: "class", label: "Class", options: [...new Set(students.map(s => s.class))] },
            { key: "gender", label: "Gender", options: ["Male", "Female"] }
          ]}
          selectable={true}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          onBulkAction={handleBulkAction}
          pageSize={10}
          emptyMessage="No students found."
        />

        {/* Form Modal */}
        <FormModal
          isOpen={isModalOpen}
          title={editingStudent ? "Edit Student" : "Add New Student"}
          fields={[
            { name: "name", label: "Full Name", type: "text" as const, required: true },
            { name: "email", label: "Student Email", type: "email" as const, required: true },
            { name: "rollNo", label: "Roll Number", type: "text" as const, required: true },
            { name: "class", label: "Class (e.g. 10-A)", type: "text" as const, required: true },
            {
              name: "gender", label: "Gender", type: "select" as const, options: [
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" }
              ], required: true
            },
            { name: "admissionDate", label: "Admission Date", type: "date" as const, required: true },
            { name: "parentName", label: "Parent/Guardian Name", type: "text" as const, required: true },
            { name: "parentPhone", label: "Parent Phone", type: "text" as const, required: true },
            { name: "parentEmail", label: "Parent Email", type: "email" as const, required: true },
            { name: "address", label: "Address", type: "text" as const, required: false },
            {
              name: "status",
              label: "Status",
              type: "select" as const,
              options: [
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
                { value: "Graduated", label: "Graduated" },
              ],
              required: true
            },
          ]}
          initialData={editingStudent ? { ...editingStudent, class: `${editingStudent.class}-${editingStudent.section}` } : undefined}
          onSubmit={editingStudent ? handleEditStudent : handleAddStudent}
          onClose={() => {
            setIsModalOpen(false)
            setEditingStudent(null)
          }}
        />

        {/* Delete Confirmation */}
        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          title="Delete Student"
          description="Are you sure you want to delete this student? This action cannot be undone."
          onConfirm={confirmDelete}
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
