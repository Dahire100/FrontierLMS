"use client"

import { API_URL } from "@/lib/api-config"

import React, { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Upload,
  Search,
  Trash2,
  Maximize2,
  Image as ImageIcon,
  FileVideo,
  FileText,
  File as FileIcon,
  MoreVertical,
  Download,
  Eye,
  HardDrive,
  Youtube,
  Plus
} from "lucide-react"
import { StatCard } from "@/components/super-admin/stat-card"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"

interface MediaItem {
  id: string
  name: string
  type: string
  url: string
  thumbnail?: string
  size?: string
}

export default function MediaManagerPage() {
  const { toast } = useToast()
  const [media, setMedia] = useState<MediaItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filterType, setFilterType] = useState("all")
  const [deleteData, setDeleteData] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  useEffect(() => {
    fetchMedia();
  }, [filterType]);

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cms/media?type=${filterType}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        const mappedMedia = data.map((item: any) => {
          let formattedSize = "0 KB";
          if (item.size) {
            const sizeInBytes = Number(item.size);
            if (sizeInBytes < 1024 * 1024) {
              formattedSize = `${(sizeInBytes / 1024).toFixed(1)} KB`;
            } else {
              formattedSize = `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
            }
          }

          return {
            id: item._id,
            name: item.name,
            type: item.type,
            url: item.url.startsWith('http') ? item.url : `${API_URL}${item.url}`, // Ensure full URL
            thumbnail: item.thumbnail || "/placeholder.svg",
            size: formattedSize
          };
        });
        setMedia(mappedMedia);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      toast({ title: "Error", description: "Failed to load media library.", variant: "destructive" });
    } finally {
      setLoading(false)
    }
  };

  const confirmDelete = async () => {
    if (!deleteData.id) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cms/media/${deleteData.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast({ title: "Deleted", description: "Media asset removed successfully." });
        fetchMedia();
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({ title: "Error", description: "Failed to delete media asset.", variant: "destructive" });
    } finally {
      setDeleteData({ open: false, id: null });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast({ title: "Uploading", description: `Processing ${file.name}...` });

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name); // Optional: Allow user to rename

      const response = await fetch(`${API_URL}/api/cms/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Content-Type is set automatically with FormData
        },
        body: formData
      });

      if (response.ok) {
        toast({ title: "Success", description: "Media uploaded successfully." });
        fetchMedia();
      } else {
        const err = await response.json();
        throw new Error(err.message || "Upload failed");
      }
    } catch (error: any) {
      console.error('Error uploading:', error);
      toast({ title: "Error", description: error.message || "Upload failed.", variant: "destructive" });
    }
  };

  const [youtubeUrl, setYoutubeUrl] = useState("");

  const handleAddYoutube = async () => {
    if (!youtubeUrl) return;

    // Simple validation (can be enhanced)
    if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      toast({ title: "Invalid URL", description: "Please enter a valid YouTube URL.", variant: "destructive" });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', 'YouTube Video');
      formData.append('type', 'video');
      formData.append('url', youtubeUrl);
      formData.append('size', '0');

      const response = await fetch(`${API_URL}/api/cms/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // No Content-Type header directly, let browser set multipart/form-data boundry
        },
        body: formData
      });

      if (response.ok) {
        toast({ title: "Success", description: "YouTube link added." });
        setYoutubeUrl(""); // Clear input
        fetchMedia();
      } else {
        const err = await response.json();
        throw new Error(err.message || "Failed to add link");
      }
    } catch (error: any) {
      console.error('Error adding youtube link:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filteredMedia = media.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon className="text-blue-500" />
    if (type.includes('video')) return <FileVideo className="text-purple-500" />
    if (type.includes('pdf')) return <FileText className="text-red-500" />
    return <FileIcon className="text-gray-500" />
  }

  const stats = {
    totalCount: media.length,
    images: media.filter(m => m.type.includes('image')).length,
    videos: media.filter(m => m.type.includes('video')).length,
    docs: media.filter(m => !m.type.includes('image') && !m.type.includes('video')).length
  }

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <DashboardLayout title="Media Assets">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

        {/* Header section with Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <HardDrive className="text-indigo-600" />
              Media Librarian
            </h1>
            <p className="text-sm text-gray-500">Manage all your website images, videos, and documents</p>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-lg shadow-indigo-100 h-11 px-6 rounded-xl font-semibold"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus size={18} /> New Upload
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Assets"
            value={stats.totalCount.toString()}
            icon={HardDrive}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
            description="Stored in library"
          />
          <StatCard
            title="Images"
            value={stats.images.toString()}
            icon={ImageIcon}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-50"
            description="Optimized formats"
          />
          <StatCard
            title="Videos"
            value={stats.videos.toString()}
            icon={Youtube}
            iconColor="text-red-600"
            iconBgColor="bg-red-50"
            description="Embedded & Hosted"
          />
          <StatCard
            title="Documents"
            value={stats.docs.toString()}
            icon={FileText}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            description="PDFs & Spreadsheets"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Upload Area */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-indigo-50/50 border-b border-indigo-100 py-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Upload className="h-4 w-4 text-indigo-600" />
                  Upload New Media
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="group relative border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-indigo-400 transition-all cursor-pointer bg-gray-50/30">
                  <div className="p-3 bg-white rounded-full shadow-sm w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">Choose files or drag & drop</div>
                  <p className="text-[11px] text-gray-500 mt-1">PNG, JPG, PDF up to 10MB</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleUpload}
                    accept="image/*,video/*,application/pdf"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-600 uppercase">YouTube Integration</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Youtube URL..."
                        className="h-9 text-xs"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                      />
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 h-9"
                        onClick={handleAddYoutube}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Maximize2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Image Resizer</h3>
                    <p className="text-indigo-100 text-xs">Optimize assets for web speed</p>
                  </div>
                </div>
                <Button variant="secondary" className="w-full mt-6 bg-white/20 hover:bg-white/30 border-0 text-white">
                  Launch Tool
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Media Gallery */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search media..."
                      className="pl-9 h-9 text-xs bg-white border-gray-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[140px] h-9 text-xs">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assets</SelectItem>
                      <SelectItem value="image">Images</SelectItem>
                      <SelectItem value="video">Videos</SelectItem>
                      <SelectItem value="application/pdf">PDF Documents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 border-l border-gray-200 pl-4 ml-4">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewMode("grid")}>
                    <ImageIcon size={16} className={cn(viewMode === "grid" ? "text-indigo-600" : "text-gray-400")} />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewMode("list")}>
                    <MoreVertical size={16} className={cn(viewMode === "list" ? "text-indigo-600" : "text-gray-400")} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <div className="h-8 w-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Scanning library...</p>
                  </div>
                ) : filteredMedia.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredMedia.map((item) => (
                      <div key={item.id} className="group relative rounded-xl border border-gray-100 overflow-hidden bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300">
                        <div className="aspect-[4/3] bg-gray-50 relative flex items-center justify-center text-muted-foreground overflow-hidden">
                          {item.type.includes('image') ? (
                            <img
                              src={item.url}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                          ) : (
                            <div className="p-6 bg-gray-50 w-full h-full flex flex-col items-center justify-center gap-2">
                              {getFileIcon(item.type)}
                              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter truncate max-w-full px-2">{item.type}</span>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-indigo-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 hover:bg-white text-indigo-600 border-0">
                              <Eye size={14} />
                            </Button>
                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 hover:bg-white text-indigo-600 border-0" onClick={() => window.open(item.url, '_blank')}>
                              <Download size={14} />
                            </Button>
                            <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full bg-red-500/90 hover:bg-red-500 border-0" onClick={() => setDeleteData({ open: true, id: item.id })}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                        <div className="p-3">
                          <div className="font-semibold text-[11px] truncate text-gray-700">{item.name}</div>
                          <div className="text-[9px] text-gray-400 mt-0.5">{item.size}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-gray-50 rounded-full mb-4">
                      <Search className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="font-bold text-gray-900">No media found</h3>
                    <p className="text-sm text-gray-500 max-w-xs mt-1">Try changing your filters or searching with a different keyword.</p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                  <p className="text-[11px] text-gray-500">Showing <b>{filteredMedia.length}</b> assets</p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-8 text-xs px-3">Prev</Button>
                    <Button size="sm" className="h-8 text-xs px-3 bg-indigo-600">1</Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs px-3">2</Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs px-3">Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={deleteData.open}
        onOpenChange={(open) => setDeleteData({ open, id: null })}
        onConfirm={confirmDelete}
        title="Delete Media?"
        description="This action will permanently remove this asset from your library. This cannot be undone."
        variant="destructive"
      />
    </DashboardLayout>
  )
}
