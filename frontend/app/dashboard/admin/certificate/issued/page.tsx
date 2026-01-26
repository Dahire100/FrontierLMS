"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, Loader2, Download } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

interface Certificate {
  _id: string
  studentId: {
    firstName: string
    lastName: string
    rollNumber: string
  }
  certificateType: string
  title: string
  certificateNumber: string
  issuedDate: string
  status: string
}

export default function IssuedCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: "",
    certificateType: "",
    certificateNumber: ""
  })

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      const queryParams = new URLSearchParams()
      if (filters.certificateType) queryParams.append("certificateType", filters.certificateType)

      const response = await fetch(`${API_URL}/api/certificates?${queryParams}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await response.json()

      if (data.success) {
        let filtered = data.data

        // Apply client-side filters
        if (filters.search) {
          filtered = filtered.filter((cert: Certificate) =>
            `${cert.studentId.firstName} ${cert.studentId.lastName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
            cert.studentId.rollNumber.toLowerCase().includes(filters.search.toLowerCase())
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
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="participation">Participation</SelectItem>
                    <SelectItem value="conduct">Conduct</SelectItem>
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
                      <TableHead className="font-bold text-gray-700 uppercase">Date</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Status</TableHead>
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
                            {cert.studentId.firstName} {cert.studentId.lastName}
                          </TableCell>
                          <TableCell>{cert.studentId.rollNumber}</TableCell>
                          <TableCell className="capitalize">{cert.certificateType}</TableCell>
                          <TableCell>{cert.title}</TableCell>
                          <TableCell>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {cert.certificateNumber}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(cert.issuedDate).toLocaleDateString()}</TableCell>
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
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
