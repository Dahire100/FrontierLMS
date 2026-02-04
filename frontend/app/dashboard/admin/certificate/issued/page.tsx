"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { GraduationCap, Loader2, Download, Eye, Printer } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import jsPDF from "jspdf"

interface Certificate {
  _id: string
  studentId: {
    firstName: string
    lastName: string
    rollNumber: string
  }
  certificateType: string
  title: string
  description: string
  certificateNumber: string
  issuedDate: string
  issuedBy: string
  status: string
}

export default function IssuedCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [viewCertificate, setViewCertificate] = useState<Certificate | null>(null)
  const [filters, setFilters] = useState({
    search: "",
    certificateType: "all",
    certificateNumber: ""
  })

  const [schoolSettings, setSchoolSettings] = useState({
    schoolName: "",
    address: "",
    phone: "",
    email: ""
  })

  useEffect(() => {
    fetchCertificates()
    fetchSchoolSettings()
  }, [filters]) // Removed [filters] from dependency if it causes rapid refetch, actually, fetchCertificates depends on filters, so we should keep it or split useEffects.
  // Ideally, fetchSchoolSettings should only run once.

  // Let's split them.
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

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      const queryParams = new URLSearchParams()
      if (filters.certificateType && filters.certificateType !== "all") {
        queryParams.append("certificateType", filters.certificateType)
      }

      const response = await fetch(`${API_URL}/api/certificates?${queryParams}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await response.json()

      if (data.success) {
        let filtered = data.data

        // Apply client-side filters
        if (filters.search) {
          filtered = filtered.filter((cert: Certificate) =>
            `${cert.studentId?.firstName} ${cert.studentId?.lastName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
            cert.studentId?.rollNumber.toLowerCase().includes(filters.search.toLowerCase())
          )
        }

        if (filters.certificateNumber) {
          filtered = filtered.filter((cert: Certificate) =>
            cert.certificateNumber.toLowerCase().includes(filters.certificateNumber.toLowerCase())
          )
        }

        setCertificates(filtered)
      } else {
        toast.error("Failed to fetch certificates")
      }
    } catch (error) {
      console.error("Error fetching certificates:", error)
      toast.error("Failed to fetch certificates")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCertificates()
  }, [])

  const handleSearch = () => {
    fetchCertificates()
  }

  const generatePDF = (cert: Certificate) => {
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

    // -- Certificate Title --
    doc.setFont("times", "bold")
    doc.setFontSize(24)
    doc.setTextColor(0)
    doc.text(cert.title.toUpperCase(), 105, 90, { align: "center" })

    // -- Certificate Info --
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.setTextColor(0)

    const formattedDate = new Date(cert.issuedDate).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    })

    doc.text(`Certificate No:`, 30, 115)
    doc.setFont("helvetica", "bold")
    doc.text(`${cert.certificateNumber}`, 65, 115)

    doc.setFont("helvetica", "normal")
    doc.text(`Date:`, 140, 115)
    doc.setFont("helvetica", "bold")
    doc.text(`${formattedDate}`, 155, 115)

    // -- Body Content --
    doc.setFont("times", "normal")
    doc.setFontSize(14)
    doc.setLineHeightFactor(1.5)

    const studentName = `${cert.studentId?.firstName} ${cert.studentId?.lastName}`.toUpperCase()
    const rollNo = cert.studentId?.rollNumber

    const bodyText = `This is to certify that Mr./Ms. ${studentName}, Roll No. ${rollNo}, has been issued this ${cert.title}.`

    const splitBody = doc.splitTextToSize(bodyText, 150)
    doc.text(splitBody, 30, 140)

    if (cert.description) {
      doc.setFont("times", "italic")
      doc.setFontSize(12)
      doc.setTextColor(80)
      const descText = doc.splitTextToSize(cert.description, 150)
      doc.text(descText, 30, 160)
    }

    // -- Signatures --
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.setTextColor(0)

    const signatureY = 240

    doc.text("Prepared By", 40, signatureY)
    doc.text("Principal", 150, signatureY)
    doc.setFont("times", "bold")
    doc.setFontSize(10)
    doc.text("(Seal & Signature)", 148, signatureY + 5)

    return doc
  }

  const handleDownload = (cert: Certificate) => {
    const doc = generatePDF(cert)
    doc.save(`${cert.certificateNumber}.pdf`)
  }

  const handlePrint = (cert: Certificate) => {
    const doc = generatePDF(cert)
    doc.autoPrint()
    window.open(doc.output('bloburl').toString(), '_blank')
  }

  return (
    <DashboardLayout title="Issued Certificates">
      <div className="space-y-6">
        <Card>
          <CardHeader className="bg-pink-50 border-b border-pink-100">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <GraduationCap className="h-5 w-5" />
              Search Certificates
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <Input
                  placeholder="Name / Roll Number"
                  className="bg-white border-gray-200"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={filters.certificateType} onValueChange={(value) => setFilters({ ...filters, certificateType: value })}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="bonafide">Bonafide Certificate</SelectItem>
                    <SelectItem value="character">Character Certificate</SelectItem>
                    <SelectItem value="transfer">Transfer Certificate</SelectItem>
                    <SelectItem value="consent">Consent Letter</SelectItem>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="participation">Participation</SelectItem>
                    <SelectItem value="completion">Completion</SelectItem>
                    <SelectItem value="merit">Merit</SelectItem>
                    <SelectItem value="attendance">Attendance</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Certificate No</Label>
                <Input
                  placeholder="CERT-..."
                  className="bg-white border-gray-200"
                  value={filters.certificateNumber}
                  onChange={(e) => setFilters({ ...filters, certificateNumber: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} className="bg-blue-900 hover:bg-blue-800 w-full">
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-pink-50 border-b border-pink-100">
            <CardTitle className="text-lg text-gray-800">Issued List ({certificates.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-pink-50 hover:bg-pink-50">
                      <TableHead className="font-bold text-gray-700 uppercase">Student</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Roll No</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Type</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Title</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Certificate No</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Status</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                          No certificates found. Try adjusting your search filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      certificates.map((cert) => (
                        <TableRow key={cert._id}>
                          <TableCell className="font-medium">
                            {cert.studentId?.firstName} {cert.studentId?.lastName}
                          </TableCell>
                          <TableCell>{cert.studentId?.rollNumber}</TableCell>
                          <TableCell className="capitalize">{cert.certificateType}</TableCell>
                          <TableCell>{cert.title}</TableCell>
                          <TableCell>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {cert.certificateNumber}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cert.status === "active"
                              ? "bg-green-100 text-green-800"
                              : cert.status === "expired"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                              }`}>
                              {cert.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-center">
                              <Button size="icon" variant="ghost" onClick={() => setViewCertificate(cert)} title="View">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => handleDownload(cert)} title="Download PDF">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => handlePrint(cert)} title="Print/Reprint">
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
            )}
          </CardContent>
        </Card>

        {/* View Certificate Dialog */}
        <Dialog open={!!viewCertificate} onOpenChange={(open) => !open && setViewCertificate(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Certificate Details</DialogTitle>
              <DialogDescription>
                Issued on {viewCertificate ? new Date(viewCertificate.issuedDate).toLocaleDateString() : ''}
              </DialogDescription>
            </DialogHeader>
            {viewCertificate && (
              <div className="border p-8 rounded-lg space-y-8 bg-white min-h-[500px] flex flex-col items-center text-center">
                <h1 className="text-3xl font-bold uppercase mt-8">{viewCertificate.title}</h1>

                <div className="w-full text-right text-sm">
                  <p><strong>Certificate No:</strong> {viewCertificate.certificateNumber}</p>
                </div>

                <div className="text-lg leading-relaxed flex-1 flex flex-col justify-center max-w-2xl text-left">
                  <p className="text-center mb-6">
                    This is to certify that Mr./Ms. <span className="font-bold border-b border-black">{viewCertificate.studentId?.firstName} {viewCertificate.studentId?.lastName}</span>,
                    Roll No. <span className="font-bold border-b border-black">{viewCertificate.studentId?.rollNumber}</span>,
                    has been issued this certificate.
                  </p>

                  <div className="space-y-4 ml-8">
                    <p>{viewCertificate.description}</p>
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
