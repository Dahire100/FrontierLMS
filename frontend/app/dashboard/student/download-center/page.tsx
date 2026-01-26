"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, FolderOpen, File, Calendar, Search, Filter, FileIcon, FileImage, FileCode } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function StudentDownloadCenter() {
  const [searchTerm, setSearchTerm] = useState("")
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
          // Backend returns StudyMaterial objects
          const formattedMaterials = data.data.map((m: any) => ({
            id: m._id,
            title: m.title,
            subject: m.subject || "General", // subject field in StudyMaterial?
            type: m.type ? m.type.toUpperCase() : "FILE",
            size: "N/A", // Size not always tracked
            uploadedBy: "Admin", // or fetch teacher name if populated
            date: m.createdAt,
            downloads: 0, // Not tracked in basic schema
            link: m.fileUrl
          }))
          setMaterials(formattedMaterials)
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

  const categories = [
    { name: "Study Notes", count: materials.filter(m => m.type === 'PDF').length, icon: FileText, color: "bg-blue-100 text-blue-600" },
    { name: "Assignments", count: materials.filter(m => m.type === 'DOC' || m.type === 'DOCX').length, icon: File, color: "bg-green-100 text-green-600" },
    { name: "Other", count: materials.length, icon: FolderOpen, color: "bg-orange-100 text-orange-600" },
  ]

  const totalFiles = materials.length


  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF": return <FileText className="h-5 w-5 text-red-500" />
      case "DOCX": return <FileText className="h-5 w-5 text-blue-500" />
      case "PNG": return <FileImage className="h-5 w-5 text-purple-500" />
      default: return <File className="h-5 w-5 text-gray-500" />
    }
  }

  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith('http')) {
      if (url.startsWith('https//')) return url.replace('https//', 'https://');
      if (url.startsWith('http//')) return url.replace('http//', 'http://');
      return url;
    }
    return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  const handleDownload = (link: string, title: string) => {
    const fullUrl = getFullUrl(link);
    if (fullUrl) {
      const a = document.createElement('a')
      a.href = fullUrl
      a.target = "_blank"
      // a.download = title // Cross-origin might block download attribute
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      toast.success("Download started", { description: `${title} is downloading...` })
    } else {
      toast.error("File not available")
    }
  }

  const filteredMaterials = materials.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="p-8 text-center">Loading Download Center...</div>
  }

  return (
    <DashboardLayout title="Download Center">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Download Center
            </h2>
            <p className="text-muted-foreground mt-1">
              Access study materials and resources
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                className="pl-8 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => toast.info("Filter Options", { description: "Filter menu would appear here." })}>
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <StatCard key={cat.name} title={cat.name} value={cat.count.toString()} icon={cat.icon} iconColor={cat.color.split(" ")[1]} iconBgColor={cat.color.split(" ")[0]} />
          ))}
        </div>


        {/* Materials List */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Study Materials
                </CardTitle>
                <CardDescription>Download resources shared by teachers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredMaterials.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">No materials found.</p>
              ) : filteredMaterials.map((material) => (
                <div key={material.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-xl hover:bg-gray-50/80 hover:border-gray-300 transition-all bg-white gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-gray-50 rounded-xl border">
                      {getFileIcon(material.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 line-clamp-1">{material.title}</h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                        <Badge variant="secondary" className="text-[10px] h-5">{material.subject}</Badge>
                        <span>• {material.uploadedBy}</span>
                        <span>• {new Date(material.date).toLocaleDateString()}</span>
                        <span>• {material.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-medium text-gray-900">{material.size}</p>
                      <p className="text-xs text-muted-foreground">{material.downloads} downloads</p>
                    </div>
                    <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:text-blue-600 border-gray-200" onClick={() => handleDownload(material.link, material.title)}>
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
