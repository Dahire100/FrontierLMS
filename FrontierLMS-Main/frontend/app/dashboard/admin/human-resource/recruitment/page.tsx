"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { Button } from "@/components/ui/button"
import { Plus, Users, Home, Loader2, FileUser } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import { StatusBadge } from "@/components/super-admin/status-badge"
import FormModal, { FormField } from "@/components/form-modal"

export default function RecruitmentPage() {
    const [recruitments, setRecruitments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        fetchRecruitments()
    }, [])

    const fetchRecruitments = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/hr-module/recruitments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                setRecruitments(await response.json())
            }
        } catch (error) {
            toast.error("Failed to load recruitment data")
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (data: any) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/hr-module/recruitments`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            })

            if (response.ok) {
                toast.success("Candidate record added")
                setIsModalOpen(false)
                fetchRecruitments()
            }
        } catch (error) {
            toast.error("Failed to save record")
        }
    }

    const columns = [
        {
            key: "fullName",
            label: "CANDIDATE NAME",
            render: (v: string) => <span className="font-bold text-gray-800 text-xs">{v}</span>
        },
        {
            key: "email",
            label: "EMAIL / CONTACT",
            render: (_: any, row: any) => (
                <div className="flex flex-col">
                    <span className="text-blue-600 font-medium text-[10px]">{row.email}</span>
                    <span className="text-gray-400 text-[9px] font-bold">{row.phone}</span>
                </div>
            )
        },
        {
            key: "workStatus",
            label: "PROFESSIONAL STATUS",
            render: (v: string) => <span className="text-[10px] font-bold text-gray-500 uppercase">{v || 'N/A'}</span>
        },
        {
            key: "status",
            label: "HIRING STAGE",
            render: (v: string) => <StatusBadge status={v.charAt(0).toUpperCase() + v.slice(1)} />
        },
        {
            key: "interviewDate",
            label: "INTERVIEW DATE",
            render: (v: string) => v ? <span className="text-xs font-mono text-blue-500">{new Date(v).toLocaleDateString()}</span> : <span className="text-gray-300">-</span>
        },
        {
            key: "submissionDate",
            label: "APPLIED ON",
            render: (v: string) => <span className="text-[10px] text-gray-400">{new Date(v).toLocaleDateString()}</span>
        }
    ]

    const formFields: FormField[] = [
        { name: "fullName", label: "Full Name", type: "text", required: true },
        { name: "email", label: "Email Address", type: "email", required: true },
        { name: "phone", label: "Phone Number", type: "text", required: true },
        {
            name: "status",
            label: "Hiring Stage",
            type: "select",
            required: true,
            options: [
                { value: "pending", label: "Pending Review" },
                { value: "scheduled", label: "Interview Scheduled" },
                { value: "interviewed", label: "Interviewed" },
                { value: "offered", label: "Job Offered" },
                { value: "joined", label: "Joined" },
                { value: "rejected", label: "Rejected" }
            ]
        },
        { name: "workStatus", label: "Experience Level", type: "text" },
        { name: "interviewDate", label: "Interview Date", type: "date" },
        { name: "expectedSalary", label: "Expected Salary", type: "number" }
    ]

    return (
        <DashboardLayout title="Talent Acquisition">
            <div className="space-y-6 max-w-full pb-10">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-pink-500">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Recruitment Dashboard</h1>
                        <p className="text-xs text-gray-500 font-medium">Manage job applications and monitor the institutional hiring pipeline.</p>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1 border bg-gray-50 px-3 py-1.5 rounded-full">
                        <Home className="h-4 w-4" /> Human Resource <span className="mx-1 text-gray-300">/</span> <span className="text-pink-600 font-bold">Recruitment</span>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b bg-white flex items-center justify-between">
                        <h3 className="text-sm font-bold flex items-center gap-2 text-gray-700 uppercase tracking-widest">
                            <Users className="h-4 w-4 text-pink-500" />
                            Candidate Register
                        </h3>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            size="sm"
                            className="bg-[#0b1c48] hover:bg-[#1a2d65] shadow-lg shadow-blue-50"
                        >
                            <Plus className="h-4 w-4 mr-1" /> New Application
                        </Button>
                    </div>

                    <AdvancedTable
                        columns={columns}
                        data={recruitments}
                        loading={loading}
                        searchable={true}
                        headerClassName="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-widest h-12"
                        emptyMessage={
                            <div className="p-10 text-center space-y-2">
                                <FileUser className="h-10 w-10 mx-auto text-gray-200" />
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">No active applications</p>
                            </div>
                        }
                    />
                </div>

                <FormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleAdd}
                    title="Register Candidate"
                    description="Enter the details for a new job applicant."
                    fields={formFields}
                />
            </div>
        </DashboardLayout>
    )
}

