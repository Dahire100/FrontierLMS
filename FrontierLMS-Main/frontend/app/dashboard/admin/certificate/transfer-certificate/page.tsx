"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollText, Loader2 } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

interface Student {
  _id: string
  firstName: string
  lastName: string
  rollNumber: string
  class: string
  dateOfBirth?: string
  fatherName?: string
}

export default function TransferCertificate() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    studentId: "",
    lastAttendedDate: new Date().toISOString().split('T')[0],
    reasonForLeaving: "",
    transferTo: "",
    remarks: "",
    issuedDate: new Date().toISOString().split('T')[0],
    issuedBy: ""
  })

  const fetchStudents = async () => {
    try {
      setLoading(true)
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
      toast.error("Failed to fetch students")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.studentId || !form.lastAttendedDate || !form.issuedBy) {
      toast.error("Student, last attended date, and issued by are required")
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem("token")

      const description = `Last Attended: ${form.lastAttendedDate}${form.reasonForLeaving ? `\nReason: ${form.reasonForLeaving}` : ''
        }${form.transferTo ? `\nTransferring To: ${form.transferTo}` : ''
        }${form.remarks ? `\nRemarks: ${form.remarks}` : ''
        }`

      const response = await fetch(`${API_URL}/api/certificates`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentId: form.studentId,
          certificateType: "other",
          title: "Transfer Certificate",
          description: description,
          issuedDate: form.issuedDate,
          issuedBy: form.issuedBy
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Transfer certificate generated successfully!")
        setForm({
          studentId: "",
          lastAttendedDate: new Date().toISOString().split('T')[0],
          reasonForLeaving: "",
          transferTo: "",
          remarks: "",
          issuedDate: new Date().toISOString().split('T')[0],
          issuedBy: ""
        })
      } else {
        toast.error(data.error || "Failed to generate certificate")
      }
    } catch (error) {
      console.error("Error generating certificate:", error)
      toast.error("Failed to generate certificate")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Transfer Certificate">
      <div className="space-y-6">
        <Card>
          <CardHeader className="bg-pink-50 border-b border-pink-100">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <ScrollText className="h-5 w-5" />
              Generate Transfer Certificate (TC)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-red-500">Student *</Label>
                  <Select value={form.studentId} onValueChange={(value) => setForm({ ...form, studentId: value })}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student._id} value={student._id}>
                          {student.firstName} {student.lastName} - {student.class} ({student.rollNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-red-500">Last Attended Date *</Label>
                  <Input
                    type="date"
                    className="bg-white border-gray-200"
                    value={form.lastAttendedDate}
                    onChange={(e) => setForm({ ...form, lastAttendedDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Reason for Leaving</Label>
                  <Input
                    placeholder="e.g. Parent transfer, Better opportunity"
                    className="bg-white border-gray-200"
                    value={form.reasonForLeaving}
                    onChange={(e) => setForm({ ...form, reasonForLeaving: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Transferring To</Label>
                  <Input
                    placeholder="New school/institution name"
                    className="bg-white border-gray-200"
                    value={form.transferTo}
                    onChange={(e) => setForm({ ...form, transferTo: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-red-500">Issue Date *</Label>
                  <Input
                    type="date"
                    className="bg-white border-gray-200"
                    value={form.issuedDate}
                    onChange={(e) => setForm({ ...form, issuedDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-500">Issued By *</Label>
                  <Input
                    placeholder="e.g. Principal Name"
                    className="bg-white border-gray-200"
                    value={form.issuedBy}
                    onChange={(e) => setForm({ ...form, issuedBy: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Additional Remarks (Optional)</Label>
                <Textarea
                  placeholder="Any additional information about the student's conduct, performance, or other relevant details..."
                  className="bg-white border-gray-200"
                  rows={3}
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-blue-900 hover:bg-blue-800"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate TC"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
