"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import FormModal, { FormField } from "@/components/form-modal"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Plus, GraduationCap, Calendar, BookOpen, Clock, FileText, Layout, Award, Search, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Exam {
  id: string
  examName: string
  studentClass: string
  subject: string
  examDate: string
  totalMarks: number
  startTime: string
  endTime: string
}

export default function ExamList() {
  const { toast } = useToast()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [deleteData, setDeleteData] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/exams`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map((item: any) => ({
          id: item._id,
          examName: item.examName,
          studentClass: item.class,
          subject: item.subject,
          examDate: item.date,
          totalMarks: item.totalMarks,
          startTime: item.startTime,
          endTime: item.endTime
        }));
        setExams(mappedData);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/exams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          examName: data.examName,
          class: data.studentClass,
          subject: data.subject,
          examDate: data.examDate,
          totalMarks: parseInt(data.totalMarks),
          startTime: data.startTime,
          endTime: data.endTime
        })
      });

      if (response.ok) {
        toast({ title: "Success", description: "Examination scheduled successfully." });
        fetchExams();
        setIsModalOpen(false);
      } else {
        throw new Error("Failed to add exam")
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  const handleEdit = async (id: string, data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/exams/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          examName: data.examName,
          class: data.studentClass,
          subject: data.subject,
          examDate: data.examDate,
          totalMarks: parseInt(data.totalMarks),
          startTime: data.startTime,
          endTime: data.endTime
        })
      });

      if (response.ok) {
        toast({ title: "Success", description: "Exam details updated successfully." });
        fetchExams();
        setIsModalOpen(false);
        setEditingExam(null);
      } else {
        throw new Error("Failed to update exam")
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  const confirmDelete = async () => {
    if (!deleteData.id) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/exams/${deleteData.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({ title: "Deleted", description: "Exam record has been cleared." });
        fetchExams();
      } else {
        throw new Error("Failed to delete exam")
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setDeleteData({ open: false, id: null });
    }
  }

  const columns = [
    {
      key: "examName",
      label: "Examination",
      sortable: true,
      render: (value: string, row: Exam) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">{value}</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{row.subject}</span>
        </div>
      )
    },
    {
      key: "studentClass",
      label: "Class",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-1.5">
          <Layout size={14} className="text-gray-400" />
          <span className="font-medium text-gray-700">{value}</span>
        </div>
      )
    },
    {
      key: "examDate",
      label: "Schedule",
      sortable: true,
      render: (value: string, row: Exam) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-800">{new Date(value).toLocaleDateString()}</span>
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <Clock size={10} /> {row.startTime} - {row.endTime}
          </span>
        </div>
      )
    },
    {
      key: "totalMarks",
      label: "Criteria",
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-emerald-500" />
          <span className="font-bold text-gray-900">{value}</span>
          <span className="text-[10px] text-gray-400 uppercase font-bold">Marks</span>
        </div>
      )
    }
  ]

  const formFields: FormField[] = [
    { name: "examName", label: "Exam Name", type: "text", required: true, placeholder: "e.g. Mid-Term Examination 2024" },
    { name: "studentClass", label: "Target Class", type: "text", required: true, placeholder: "e.g. 10" },
    { name: "subject", label: "Subject", type: "text", required: true, placeholder: "e.g. Mathematics" },
    { name: "examDate", label: "Examination Date", type: "date", required: true },
    { name: "totalMarks", label: "Total Marks", type: "number" as any, required: true },
    {
      type: "select",
      name: "startTime",
      label: "Start Time",
      options: [
        { value: "08:00", label: "08:00 AM" },
        { value: "09:00", label: "09:00 AM" },
        { value: "10:00", label: "10:00 AM" },
        { value: "11:00", label: "11:00 AM" },
        { value: "12:00", label: "12:00 PM" },
        { value: "13:00", label: "01:00 PM" },
        { value: "14:00", label: "02:00 PM" },
      ],
      required: true
    },
    {
      type: "select",
      name: "endTime",
      label: "End Time",
      options: [
        { value: "11:00", label: "11:00 AM" },
        { value: "12:00", label: "12:00 PM" },
        { value: "13:00", label: "01:00 PM" },
        { value: "14:00", label: "02:00 PM" },
        { value: "15:00", label: "03:00 PM" },
        { value: "16:00", label: "04:00 PM" },
        { value: "17:00", label: "05:00 PM" },
      ],
      required: true
    },
  ]

  return (
    <DashboardLayout title="Assessment Control">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Sparkles className="text-indigo-500" size={24} />
              Assessment Portfolio
            </h1>
            <p className="text-sm text-gray-500">Configure examination schedules, academic terms, and performance benchmarks</p>
          </div>
          <Button
            onClick={() => {
              setEditingExam(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 gap-2 h-11 px-6 rounded-xl"
          >
            <Plus className="h-4 w-4" /> Schedule Assessment
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Active Exams"
            value={exams.length.toString()}
            icon={FileText}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
            description="Currently scheduled"
          />
          <StatCard
            title="Total Subjects"
            value={[...new Set(exams.map(e => e.subject))].length.toString()}
            icon={BookOpen}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            description="Across classes"
          />
          <StatCard
            title="Total Assessments"
            value={exams.length.toString()}
            icon={GraduationCap}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-50"
            description="Academic records"
          />
          <StatCard
            title="Average Weightage"
            value={exams.length > 0 ? (exams.reduce((acc, curr) => acc + curr.totalMarks, 0) / exams.length).toFixed(0) : "0"}
            icon={Award}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-50"
            description="Marks per unit"
          />
        </div>

        <AdvancedTable
          title="Examination Ledger"
          columns={columns}
          data={exams}
          loading={loading}
          searchable
          searchPlaceholder="Audit assessment names or subjects..."
          pagination
          searchFields={['subject', 'studentClass']}
          onEdit={(row) => {
            const exam = exams.find(e => e.id === row.id);
            if (exam) {
              const formattedExam = {
                ...exam,
                examDate: exam.examDate ? new Date(exam.examDate).toISOString().split('T')[0] : ''
              };
              setEditingExam(formattedExam);
              setIsModalOpen(true);
            }
          }}
          onDelete={(row) => setDeleteData({ open: true, id: row.id })}
        />

        <FormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingExam(null)
          }}
          title={editingExam ? "Modify Assessment Schedule" : "New Examination Protocol"}
          fields={formFields}
          initialData={editingExam || undefined}
          onSubmit={(data: any) => editingExam ? handleEdit(editingExam.id, data) : handleAdd(data)}
        />

        <ConfirmationDialog
          open={deleteData.open}
          onOpenChange={(open) => setDeleteData({ open, id: null })}
          onConfirm={confirmDelete}
          title="Abort Examination?"
          description="This will permanently nullify the scheduled assessment and all associated performance data. This action is terminal."
        />
      </div>
    </DashboardLayout>
  )
}
