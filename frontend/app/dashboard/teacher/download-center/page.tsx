"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Upload, Download, Folder, Loader2, Sparkles, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Material {
  _id: string;
  title: string;
  classes: { _id: string; name: string; section: string }[];
  type: string;
  fileSize: string;
  uploadDate: string;
  downloadCount: number;
  fileUrl: string;
}

export default function TeacherDownloadCenter() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadData, setUploadData] = useState({
    title: "",
    type: "syllabus",
    link: "",
    classId: "",
    file: null as File | null
  })
  const [classes, setClasses] = useState<any[]>([])

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/teacher/downloads`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setMaterials(data.data)
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load academic resources", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/teacher/classes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setClasses(data.data)
      }
    } catch (err) {
      console.error("Failed to fetch classes")
    }
  }

  useEffect(() => {
    fetchMaterials()
    fetchClasses()
  }, [])

  const handleUploadSubmit = async () => {
    if (!uploadData.title || !uploadData.classId || (!uploadData.link && !uploadData.file)) {
      toast({ title: "Validation Error", description: "Please provide a title, target class, and either a file or a link.", variant: "destructive" })
      return
    }

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData();
      formData.append('title', uploadData.title);
      formData.append('type', uploadData.type);
      formData.append('classId', uploadData.classId);

      if (uploadData.file) {
        formData.append('file', uploadData.file);
      } else if (uploadData.link) {
        formData.append('fileUrl', uploadData.link);
      }

      const res = await fetch(`${API_URL}/api/teacher/downloads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await res.json()
      if (data.success) {
        toast({ title: "Success", description: "Resource uploaded successfully" })
        setIsUploadOpen(false)
        setUploadData({ title: "", type: "syllabus", link: "", classId: "", file: null })
        fetchMaterials()
      } else {
        toast({ title: "Error", description: data.error || "Failed to upload resource", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong during upload", variant: "destructive" })
    }
  }

  // ... (Calculations remain same)
  const totalFiles = materials.length
  const totalDownloads = materials.reduce((sum: number, m: Material) => sum + (m.downloadCount || 0), 0)
  const totalSizeMB = materials.reduce((sum: number, m: Material) => {
    const size = parseFloat(m.fileSize) || 0
    const isKB = m.fileSize && typeof m.fileSize === 'string' && m.fileSize.includes('KB')
    return sum + (isKB ? size / 1024 : size)
  }, 0)


  if (loading) {
    // ... (Loading state remains same)
    return (
      <DashboardLayout title="Knowledge Repository">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Academic Assets">
      <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight italic uppercase">Knowledge Vault</h2>
            <p className="text-muted-foreground font-medium italic">Centralized repository for institutional study materials and resources.</p>
          </div>

          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 h-14 px-8 rounded-2xl shadow-xl shadow-indigo-100 font-black uppercase tracking-widest text-xs"
              >
                <Plus className="h-5 w-5 mr-2" /> Upload Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Upload Study Material</DialogTitle>
                <DialogDescription>Share resources with your students. You can upload a file or provide a external link.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={uploadData.title} onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. Chapter 1 Notes" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={uploadData.type}
                    onChange={(e) => setUploadData(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="syllabus">Syllabus</option>
                    <option value="book">Book</option>
                    <option value="circular">Circular</option>
                    <option value="assignment">Assignment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="class">Target Class</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={uploadData.classId}
                    onChange={(e) => setUploadData(prev => ({ ...prev, classId: e.target.value }))}
                  >
                    <option value="">Select Class</option>
                    {classes.map(c => (
                      <option key={c._id} value={c._id}>{c.name} - {c.section}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="file">Upload File</Label>
                  <Input id="file" type="file" onChange={(e) => setUploadData(prev => ({ ...prev, file: e.target.files?.[0] || null }))} />
                </div>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-bold">Or provide link</span></div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="link">External Resource Link</Label>
                  <Input id="link" value={uploadData.link} onChange={(e) => setUploadData(prev => ({ ...prev, link: e.target.value }))} placeholder="https://..." disabled={!!uploadData.file} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUploadSubmit}>Submit Resource</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none shadow-xl shadow-indigo-100/30 ring-1 ring-gray-100 p-8 flex flex-col gap-4">
            <div className="p-4 bg-indigo-50 rounded-2xl w-fit">
              <FileText className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-4xl font-black text-gray-900 leading-none">{totalFiles}</h3>
              <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mt-2">Total Assets</p>
            </div>
          </Card>
          <Card className="border-none shadow-xl shadow-indigo-100/30 ring-1 ring-gray-100 p-8 flex flex-col gap-4">
            <div className="p-4 bg-emerald-50 rounded-2xl w-fit">
              <Download className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-4xl font-black text-gray-900 leading-none">{totalDownloads}</h3>
              <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mt-2">Cumulative Downloads</p>
            </div>
          </Card>
          <Card className="border-none shadow-xl shadow-indigo-100/30 ring-1 ring-gray-100 p-8 flex flex-col gap-4">
            <div className="p-4 bg-orange-50 rounded-2xl w-fit">
              <Folder className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h3 className="text-4xl font-black text-gray-900 leading-none">{totalSizeMB.toFixed(1)} MB</h3>
              <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mt-2">Repository Volume</p>
            </div>
          </Card>
          <Card className="bg-slate-900 text-white border-none shadow-2xl p-8 flex flex-col gap-4">
            <div className="p-4 bg-white/10 rounded-2xl w-fit">
              <Sparkles className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-4xl font-black leading-none">High</h3>
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mt-2">Access Velocity</p>
            </div>
          </Card>
        </div>

        <Card className="border-none shadow-2xl shadow-indigo-100/30 ring-1 ring-gray-100 rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-white border-b py-8 px-10">
            <div className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black tracking-tight text-gray-800 uppercase italic flex items-center gap-3">
                  <FileText className="h-6 w-6 text-indigo-600" /> Academic Inventory
                </CardTitle>
                <CardDescription className="italic font-medium text-gray-400 mt-1">Managed academic resources distributed across your designated classes.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {materials.length > 0 ? materials.map((material: Material) => (
                <div key={material._id} className="group relative p-6 bg-gray-50/50 hover:bg-white rounded-2xl border-2 border-transparent hover:border-indigo-100 transition-all shadow-sm hover:shadow-xl">
                  <div className="flex items-start gap-6">
                    <div className="h-16 w-16 bg-white border-2 border-indigo-50 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                      <FileText className="h-8 w-8 text-indigo-400" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-black text-gray-900 line-clamp-1 italic uppercase tracking-tight">{material.title}</h4>
                        <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[9px] uppercase tracking-widest h-6 rounded-lg">
                          {material.type}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Folder className="h-3 w-3" /> Class {material.classes?.map(c => `${c.name}-${c.section}`).join(', ') || "N/A"}</span>
                        <span className="flex items-center gap-1">• {material.fileSize}</span>
                        <span className="flex items-center gap-1">• {new Date(material.uploadDate).toLocaleDateString()}</span>
                      </div>
                      <div className="pt-4 flex items-center justify-between">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                          <Download className="h-3 w-3" /> {material.downloadCount || 0} Downloads
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                            onClick={() => {
                              const url = material.fileUrl.startsWith('http') ? material.fileUrl : `${API_URL}${material.fileUrl}`;
                              window.open(url, '_blank');
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" /> Retrieve
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-gray-300 hover:text-rose-500 hover:bg-rose-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-24 text-center">
                  <div className="h-20 w-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-gray-200">
                    <FileText className="h-10 w-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-black text-gray-300 uppercase tracking-widest italic">Inventory Exhausted</h3>
                  <p className="text-sm text-gray-400 font-medium italic">No academic resources have been uploaded to the registry yet.</p>
                  <Button variant="outline" className="mt-8 h-12 px-8 rounded-xl border-gray-200 font-black uppercase text-[10px] tracking-widest" onClick={() => setIsUploadOpen(true)}>
                    Seed Knowledge Base
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
