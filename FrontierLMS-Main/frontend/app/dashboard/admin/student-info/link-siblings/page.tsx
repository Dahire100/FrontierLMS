"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronUp, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

export default function LinkSiblings() {
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchStudents = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/students`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (!res.ok) throw new Error("Failed to fetch students")
            const data = await res.json()
            setStudents(data)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load students")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStudents()
    }, [])

    // Group students by guardian phone
    const groupedStudents = students.reduce((acc, student) => {
        const phone = student.parentPhone || student.guardianPhone || "Unknown"
        if (!acc[phone]) acc[phone] = []
        acc[phone].push(student)
        return acc
    }, {} as Record<string, any[]>)

    return (
        <DashboardLayout title="Student Sibling">
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-pink-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-pink-100 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">Student Sibling List</h3>
                        <Button className="bg-[#1e1e50] hover:bg-[#151538] text-white">
                            Link All Siblings
                        </Button>
                    </div>

                    <div className="p-6 space-y-4">
                        {loading ? (
                            <div className="flex justify-center items-center h-32">
                                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                            </div>
                        ) : Object.keys(groupedStudents).length === 0 ? (
                            <div className="text-center text-gray-500 py-8">No students found</div>
                        ) : (
                            Object.entries(groupedStudents).map(([phone, gs]) => {
                                const groupStudents = gs as any[];
                                return (
                                    <div key={phone} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="bg-[#f0f0f4] px-4 py-3 flex justify-between items-center border-b border-gray-200">
                                            <h4 className="font-medium text-gray-800">Guardian Phone No. - {phone}</h4>
                                            <ChevronUp className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <div className="p-0">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-pink-50 text-gray-700 font-bold border-b border-pink-100">
                                                    <tr>
                                                        <th className="px-4 py-3 w-10"></th>
                                                        <th className="px-4 py-3">STUDENT NAME</th>
                                                        <th className="px-4 py-3">ADMISSION NO</th>
                                                        <th className="px-4 py-3">GUARDIAN NAME</th>
                                                        <th className="px-4 py-3">GUARDIAN PHONE</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {groupStudents.map((student: any) => (
                                                        <tr key={student._id}>
                                                            <td className="px-4 py-3"><Checkbox className="border-gray-400" /></td>
                                                            <td className="px-4 py-3">{student.firstName} {student.lastName} ({student.class}-{student.section})</td>
                                                            <td className="px-4 py-3">{student.admissionNumber || student.studentId}</td>
                                                            <td className="px-4 py-3">{student.parentName || student.guardianName || 'N/A'}</td>
                                                            <td className="px-4 py-3">{student.parentPhone || student.guardianPhone || 'N/A'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <div className="p-4 flex justify-end bg-gray-50">
                                                <Button size="sm" className="bg-[#1e1e50] hover:bg-[#151538] text-white">
                                                    Link Sibling
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
