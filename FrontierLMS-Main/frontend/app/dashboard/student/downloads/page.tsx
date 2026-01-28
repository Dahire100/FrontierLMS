"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileText, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function StudentDownloads() {
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_URL}/api/student/downloads`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) {
          setMaterials(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch downloads", error)
        toast.error("Failed to load study materials")
      } finally {
        setLoading(false)
      }
    }
    fetchDownloads()
  }, [])

  const getFileIcon = (url: string) => {
    // You could add logic here to return different icons based on extension
    return <FileText className="h-4 w-4" />
  }

  const getFullUrl = (url: string) => {
    if (!url) return "#";
    if (url.startsWith('http')) return url;
    return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  if (loading) {
    return (
      <DashboardLayout title="Downloads">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Downloads">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            Download Center
          </h2>
          <p className="text-muted-foreground mt-1">Access your study materials and assignments</p>
        </div>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-pink-600" />
              Available Materials
            </CardTitle>
            <CardDescription>
              List of resources uploaded by your teachers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {materials.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No downloads available at the moment.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-pink-50/50 hover:bg-pink-50/50">
                      <TableHead className="font-semibold text-gray-700">Document Title</TableHead>
                      <TableHead className="font-semibold text-gray-700">Type / Class</TableHead>
                      <TableHead className="font-semibold text-gray-700">Uploaded Date</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((item) => (
                      <TableRow key={item._id} className="hover:bg-gray-50/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getFileIcon(item.fileUrl)}
                            {item.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.type || "General"}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => window.open(getFullUrl(item.fileUrl), '_blank')}
                          >
                            <Download className="mr-2 h-3 w-3" /> Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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

