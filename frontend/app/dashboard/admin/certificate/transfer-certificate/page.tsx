"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollText, Loader2, Eye, Printer, Download } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import jsPDF from "jspdf"

interface Student {
  _id: string
  firstName: string
  lastName: string
  rollNumber: string
  class: string
  dateOfBirth?: string
  fatherName?: string
}

interface Certificate {
  _id: string
  certificateNumber: string
  studentId: {
    firstName: string
    lastName: string
    rollNumber: string
  }
  title: string
  description: string
  issuedDate: string
  issuedBy: string
}

export default function TransferCertificate() {
  const [students, setStudents] = useState<Student[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [viewCertificate, setViewCertificate] = useState<Certificate | null>(null)

  const [form, setForm] = useState({
    studentId: "",
    lastAttendedDate: new Date().toISOString().split('T')[0],
    reasonForLeaving: "",
    transferTo: "",
    remarks: "",
    issuedDate: new Date().toISOString().split('T')[0],
    issuedBy: ""
  })

  const [schoolSettings, setSchoolSettings] = useState({
    schoolName: "",
    address: "",
    phone: "",
    email: ""
  })

  useEffect(() => {
    fetchStudents()
    fetchCertificates()
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

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/students`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await response.json()
      if (Array.isArray(data)) {
        setStudents(data)
      } else if (data.success && Array.isArray(data.data)) {
        setStudents(data.data)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      toast.error("Failed to fetch students")
    }
  }

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/certificates?certificateType=transfer`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setCertificates(data.data)
      }
    } catch (error) {
      console.error("Error fetching certificates:", error)
      toast.error("Failed to fetch certificates")
    } finally {
      setLoading(false)
    }
  }

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
          certificateType: "transfer",
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
        fetchCertificates()
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

  const generatePDF = (cert: Certificate) => {
    const doc = new jsPDF()

    // -- Decorative Border --
    doc.setDrawColor(41, 58, 122) // Dark Blue borders
    doc.setLineWidth(3)
    doc.rect(10, 10, 190, 277) // Outer box
    doc.setLineWidth(1)
    doc.rect(15, 15, 180, 267) // Inner box

    // -- School Header --
    if (!schoolSettings.schoolName) {
      toast.error("School settings not loaded. Please check your connection.")
    }
    doc.setFont("times", "bold")
    doc.setFontSize(28)
    doc.setTextColor(41, 58, 122) // School Theme Blue
    doc.text(schoolSettings.schoolName.toUpperCase(), 105, 40, { align: "center" })

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(schoolSettings.address, 105, 50, { align: "center" })
    doc.text(`Ph: ${schoolSettings.phone} | Email: ${schoolSettings.email}`, 105, 56, { align: "center" })

    // Divider
    doc.setDrawColor(200)
    doc.setLineWidth(1)
    doc.line(30, 65, 180, 65)

    // -- Certificate Title --
    doc.setFont("times", "bold")
    doc.setFontSize(24)
    doc.setTextColor(0) // Black
    doc.text("TRANSFER CERTIFICATE", 105, 90, { align: "center" })

    // -- Certificate Info --
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.setTextColor(0)

    const formattedDate = new Date(cert.issuedDate).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    })

    doc.text(`TC No:`, 30, 115)
    doc.setFont("helvetica", "bold")
    doc.text(`${cert.certificateNumber}`, 50, 115)

    doc.setFont("helvetica", "normal")
    doc.text(`Date:`, 140, 115)
    doc.setFont("helvetica", "bold")
    doc.text(`${formattedDate}`, 155, 115)

    // -- Body Content --
    doc.setFont("times", "normal")
    doc.setFontSize(14)
    doc.setLineHeightFactor(1.5)

    const studentName = `${cert.studentId.firstName} ${cert.studentId.lastName}`.toUpperCase()
    const rollNo = cert.studentId.rollNumber

    const bodyText = `This is to certify that Mr./Ms. ${studentName}, Roll No. ${rollNo}, has been a student of this institution.`

    // Wrap text manually for cleaner layout
    const splitBody = doc.splitTextToSize(bodyText, 150)
    doc.text(splitBody, 30, 140)

    doc.setFontSize(12)
    doc.text("Details:", 30, 165)

    if (cert.description) {
      const descLines = cert.description.split('\n')
      let yPos = 175
      descLines.forEach(line => {
        doc.text(`- ${line}`, 35, yPos)
        yPos += 10
      })
    }

    // -- Signatures --
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.setTextColor(0)

    const signatureY = 240

    // Left Sig
    doc.text("Prepared By", 40, signatureY)

    // Right Sig
    doc.text("Principal", 150, signatureY)
    doc.setFont("times", "bold")
    doc.setFontSize(10)
    doc.text("(Seal & Signature)", 148, signatureY + 5)

    return doc
  }

  const handleDownload = (cert: Certificate) => {
    const doc = generatePDF(cert)
    doc.save(`${cert.certificateNumber}_TC.pdf`)
  }

  const handlePrint = (cert: Certificate) => {
    const doc = generatePDF(cert)
    doc.autoPrint()
    window.open(doc.output('bloburl').toString(), '_blank')
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

        {/* Issued Certificates Log */}
        <Card>
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle>Issued Transfer Certificates Log</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>TC No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Transfer To</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : certificates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        No certificates issued yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    certificates.map((cert) => (
                      <TableRow key={cert._id}>
                        <TableCell className="font-medium">{cert.certificateNumber}</TableCell>
                        <TableCell>
                          {cert.studentId?.firstName} {cert.studentId?.lastName}
                        </TableCell>
                        <TableCell>{new Date(cert.issuedDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {/* Extract Transfer To from description if possible, else show summary */}
                          <span className="truncate max-w-[150px] inline-block">
                            {cert.description.split('\n').find(l => l.includes("Transferring To"))?.replace("Transferring To: ", "") || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setViewCertificate(cert)} title="View">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDownload(cert)} title="Download PDF">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handlePrint(cert)} title="Print">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* View Certificate Dialog */}
        <Dialog open={!!viewCertificate} onOpenChange={(open) => !open && setViewCertificate(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Certificate Preview</DialogTitle>
              <DialogDescription>
                Issued Transfer Certificate
              </DialogDescription>
            </DialogHeader>
            {viewCertificate && (
              <div className="border p-8 rounded-lg space-y-8 bg-white min-h-[500px] flex flex-col items-center text-center">
                <h1 className="text-3xl font-bold uppercase mt-8">Transfer Certificate</h1>

                <div className="w-full text-right text-sm">
                  <p><strong>TC No:</strong> {viewCertificate.certificateNumber}</p>
                  <p><strong>Date:</strong> {new Date(viewCertificate.issuedDate).toLocaleDateString()}</p>
                </div>

                <div className="text-lg leading-relaxed flex-1 flex flex-col justify-center max-w-2xl text-left">
                  <p className="text-center mb-6">
                    This is to certify that Mr./Ms. <span className="font-bold border-b border-black">{viewCertificate.studentId?.firstName} {viewCertificate.studentId?.lastName}</span>,
                    Roll No. <span className="font-bold border-b border-black">{viewCertificate.studentId?.rollNumber}</span>,
                    has been a student of this institution.
                  </p>

                  <div className="space-y-4 ml-8">
                    {viewCertificate.description.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>

                <div className="w-full flex justify-between mt-auto pt-16 px-8">
                  <div className="text-center">
                    <p className="font-bold">{viewCertificate.issuedBy}</p>
                    <p className="border-t border-black mt-2 pt-1 w-32 mx-auto">Issued By</p>
                  </div>
                  <div className="text-center">
                    <p className="border-t border-black mt-8 pt-1 w-32 mx-auto">Principal</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
