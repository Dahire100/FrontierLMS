"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Users, GraduationCap, Calendar, Plus, School, TrendingUp } from "lucide-react"
import FormModal from "@/components/form-modal"

interface Class {
  id: string
  _id?: string
  name: string
  section: string
  teacher: string
  classTeacher?: { firstName: string; lastName: string }
  students: number
  capacity: number
  subjects: string[]
  room: string
}

const DEFAULT_CLASSES: Class[] = [
  { id: "1", name: "Class 10", section: "A", teacher: "Sarah Wilson", students: 45, capacity: 50, subjects: ["Math", "Science", "English"], room: "Room 101" },
  { id: "2", name: "Class 10", section: "B", teacher: "John Smith", students: 42, capacity: 50, subjects: ["Math", "Science", "English"], room: "Room 102" },
  { id: "3", name: "Class 9", section: "A", teacher: "Emma Davis", students: 48, capacity: 50, subjects: ["Math", "Science", "English", "History"], room: "Room 201" },
  { id: "4", name: "Class 9", section: "B", teacher: "Michael Chen", students: 38, capacity: 45, subjects: ["Math", "Science", "English", "History"], room: "Room 202" },
  { id: "5", name: "Class 11", section: "A", teacher: "Robert Brown", students: 35, capacity: 40, subjects: ["Physics", "Chemistry", "Math"], room: "Room 301" },
]

export default function Academics() {
  const [classes, setClasses] = useState<Class[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  // Fetch classes from API
  const fetchClasses = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/classes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success && data.data) {
        // Map backend data to frontend format
        const mappedClasses = data.data.map((c: any) => ({
          id: c._id,
          name: c.name,
          section: c.section || 'A',
          teacher: c.classTeacher ? `${c.classTeacher.firstName} ${c.classTeacher.lastName}` : 'Not Assigned',
          students: c.students || 0,
          capacity: c.capacity || 50,
          subjects: c.subjects?.map((s: any) => s.name || s) || [],
          room: c.room || 'TBD'
        }))
        setClasses(mappedClasses.length > 0 ? mappedClasses : DEFAULT_CLASSES)
      } else {
        // Use default data if API returns empty
        setClasses(DEFAULT_CLASSES)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      // Fallback to default data
      setClasses(DEFAULT_CLASSES)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClasses()
  }, [])

  const handleAddClass = async (data: any) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: data.name,
          section: data.section,
          room: data.room,
          capacity: Number(data.capacity),
          subjects: data.subjects ? data.subjects.split(',').map((s: string) => s.trim()) : []
        })
      })
      const result = await response.json()
      if (result.success) {
        fetchClasses() // Refresh the list
      } else {
        // Fallback to local state update
        const newClass: Class = {
          id: Date.now().toString(),
          name: data.name,
          section: data.section,
          teacher: data.teacher || 'Not Assigned',
          room: data.room,
          students: 0,
          capacity: Number(data.capacity),
          subjects: data.subjects ? data.subjects.split(',').map((s: string) => s.trim()) : [],
        }
        setClasses([...classes, newClass])
      }
    } catch (error) {
      console.error('Error adding class:', error)
    }
    setIsModalOpen(false)
  }

  const handleEditClass = async (data: any) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/classes/${editingClass?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: data.name,
          section: data.section,
          room: data.room,
          capacity: Number(data.capacity),
          subjects: data.subjects ? data.subjects.split(',').map((s: string) => s.trim()) : []
        })
      })
      const result = await response.json()
      if (result.success) {
        fetchClasses() // Refresh the list
      } else {
        // Fallback to local state update
        const updated = classes.map((c) => 
          c.id === editingClass?.id 
            ? { 
                ...c, 
                name: data.name,
                section: data.section,
                teacher: data.teacher || c.teacher,
                room: data.room,
                students: Number(data.students) || c.students,
                capacity: Number(data.capacity),
                subjects: data.subjects ? data.subjects.split(',').map((s: string) => s.trim()) : c.subjects,
              } 
            : c
        )
        setClasses(updated)
      }
    } catch (error) {
      console.error('Error updating class:', error)
    }
    setEditingClass(null)
    setIsModalOpen(false)
  }

  const handleDeleteClass = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/classes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success) {
        fetchClasses()
      } else {
        setClasses(classes.filter((c) => c.id !== id))
      }
    } catch (error) {
      console.error('Error deleting class:', error)
      setClasses(classes.filter((c) => c.id !== id))
    }
  }

  const handleDelete = (item: any) => {
    setDeleteConfirm({ open: true, id: item.id })
  }

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      handleDeleteClass(deleteConfirm.id)
    }
    setDeleteConfirm({ open: false, id: null })
  }

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    if (action === "delete") {
      setClasses(classes.filter((c) => !selectedIds.includes(c.id)))
    }
  }

  const handleOpenModal = (classItem?: Class) => {
    if (classItem) {
      setEditingClass(classItem)
    }
    setIsModalOpen(true)
  }

  const stats = {
    totalClasses: classes.length,
    totalStudents: classes.reduce((sum, c) => sum + c.students, 0),
    totalCapacity: classes.reduce((sum, c) => sum + c.capacity, 0),
    avgOccupancy: Math.round((classes.reduce((sum, c) => sum + (c.students / c.capacity * 100), 0) / classes.length) || 0)
  }

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 75) return "bg-orange-500"
    return "bg-green-500"
  }

  const getTeacherAvatarColor = (teacher: string) => {
    const colors = [
      { bg: "bg-blue-100", text: "text-blue-600" },
      { bg: "bg-green-100", text: "text-green-600" },
      { bg: "bg-purple-100", text: "text-purple-600" },
      { bg: "bg-orange-100", text: "text-orange-600" },
      { bg: "bg-pink-100", text: "text-pink-600" },
    ]
    const index = teacher.length % colors.length
    return colors[index]
  }

  const columns = [
    {
      key: "name",
      label: "Class Details",
      render: (value: string, row: Class) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <School className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{value} - {row.section}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{row.room}</span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">{row.subjects.length} subjects</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: "teacher",
      label: "Class Teacher",
      render: (value: string) => {
        const colors = getTeacherAvatarColor(value)
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
              <AvatarFallback className={`${colors.bg} ${colors.text} font-medium`}>
                {value.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-gray-700">{value}</span>
          </div>
        )
      }
    },
    {
      key: "students",
      label: "Occupancy",
      render: (value: number, row: Class) => {
        const percentage = Math.round((value / row.capacity) * 100)
        const progressColor = getOccupancyColor(percentage)
        return (
          <div className="space-y-2 min-w-[160px]">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{value}/{row.capacity}</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-gray-400" />
                <span className={`font-semibold ${
                  percentage >= 90 ? "text-red-600" : 
                  percentage >= 75 ? "text-orange-600" : "text-green-600"
                }`}>
                  {percentage}%
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${progressColor}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      }
    },
    {
      key: "subjects",
      label: "Subjects",
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
          {value.slice(0, 3).map((subject, i) => (
            <span 
              key={i} 
              className="text-xs px-2.5 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg border border-blue-200 font-medium shadow-sm"
            >
              {subject}
            </span>
          ))}
          {value.length > 3 && (
            <span className="text-xs px-2.5 py-1.5 bg-gray-50 text-gray-600 rounded-lg border border-gray-200 font-medium">
              +{value.length - 3}
            </span>
          )}
        </div>
      )
    },
  ]

  // Get unique class names for filter options
  const classFilterOptions = [...new Set(classes.map(c => c.name))].map(name => ({ 
    label: name, 
    value: name 
  }))

  // Prepare initial data for editing with subjects as comma-separated string
  const modalInitialData = editingClass ? {
    ...editingClass,
    subjects: editingClass.subjects.join(', ')
  } : undefined

  return (
    <DashboardLayout title="Academics">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Academic Management
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl">
              Efficiently manage classes, sections, subjects, and teacher assignments in one centralized platform
            </p>
          </div>
          <Button 
            onClick={() => handleOpenModal()} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Class
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Classes"
            value={stats.totalClasses.toString()}
            icon={BookOpen}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
            loading={isLoading}
          />
          <StatCard
            title="Total Students"
            value={stats.totalStudents.toString()}
            icon={Users}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            loading={isLoading}
          />
          <StatCard
            title="Total Capacity"
            value={stats.totalCapacity.toString()}
            icon={GraduationCap}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            loading={isLoading}
          />
          <StatCard
            title="Average Occupancy"
            value={`${stats.avgOccupancy}%`}
            icon={Calendar}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
            loading={isLoading}
          />
        </div>

        {/* Classes Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Class Overview</h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage all classes, view occupancy rates, and assign teachers
            </p>
          </div>
          <AdvancedTable
            columns={columns}
            data={classes}
            searchable={true}
            searchPlaceholder="Search classes, teachers, rooms..."
            filterable={true}
            filterOptions={[
              { 
                key: "name", 
                label: "Class Level", 
                options: classFilterOptions
              },
            ]}
            selectable={true}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
            onBulkAction={handleBulkAction}
            pageSize={10}
            emptyMessage={
              <div className="text-center py-12">
                <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first class</p>
                <Button onClick={() => handleOpenModal()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Class
                </Button>
              </div>
            }
            loading={isLoading}
          />
        </div>

        {/* Modals */}
        <FormModal
          isOpen={isModalOpen}
          title={editingClass ? "Edit Class" : "Create New Class"}
          subtitle={editingClass ? "Update class information and settings" : "Add a new class to your academic system"}
          fields={[
            { name: "name", label: "Class Name", type: "text" as const, required: true, placeholder: "e.g., Class 10" },
            { name: "section", label: "Section", type: "text" as const, required: true, placeholder: "e.g., A, B, C" },
            { name: "teacher", label: "Class Teacher", type: "text" as const, required: true, placeholder: "Enter teacher's full name" },
            { name: "room", label: "Room Number", type: "text" as const, required: true, placeholder: "e.g., Room 101" },
            { name: "students", label: "Number of Students", type: "number" as const, required: true, placeholder: "0" },
            { name: "capacity", label: "Class Capacity", type: "number" as const, required: true, placeholder: "0" },
            { name: "subjects", label: "Subjects (comma-separated)", type: "text" as const, required: true, placeholder: "e.g., Math, Science, English" },
          ]}
          initialData={modalInitialData}
          onSubmit={editingClass ? handleEditClass : handleAddClass}
          onClose={() => {
            setIsModalOpen(false)
            setEditingClass(null)
          }}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          title="Delete Class"
          description="This action will permanently remove the class and all associated data. This cannot be undone."
          onConfirm={confirmDelete}
          confirmText="Delete Class"
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}