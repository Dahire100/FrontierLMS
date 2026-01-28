"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MessageSquare,
  Mail,
  Send,
  Plus,
  Clock,
  User as UserIcon,
  Search,
  Inbox,
  ChevronRight,
  Loader2,
  Filter,
  MoreHorizontal,
  Trash2,
  CheckCircle2,
  ArrowRight,
  AtSign,
  Terminal,
  Command,
  Sparkles,
  Trash
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

interface Message {
  _id: string;
  senderId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  } | string;
  recipientId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  } | string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  priority: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function TeacherCommunicate() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [sentMessages, setSentMessages] = useState<Message[]>([])
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [recipients, setRecipients] = useState<User[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("inbox")

  const [formData, setFormData] = useState({
    recipientId: "",
    recipientType: "student",
    subject: "",
    message: "",
    priority: "medium"
  })

  useEffect(() => {
    fetchData()
    fetchRecipients()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const [inboxRes, sentRes] = await Promise.all([
        fetch(`${API_URL}/api/messages/inbox`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/messages/sent`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      const inboxData = await inboxRes.json()
      const sentData = await sentRes.json()

      if (inboxData.success) setMessages(inboxData.data)
      if (sentData.success) setSentMessages(sentData.data)
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch communications", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fetchRecipients = async () => {
    try {
      const token = localStorage.getItem('token')
      // Fetching students/staff/parents - this might need specialized endpoints
      // For now let's assume teacher can message anyone in their classes
      const res = await fetch(`${API_URL}/api/teacher/classes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        // In a real app, you'd fetch all students across all classes
        // Mapping classes for now as an example
        setRecipients(data.data.map((c: any) => ({ _id: c._id, firstName: "Class", lastName: `${c.name}-${c.section}`, role: "student" })))
      }
    } catch (err) {
      console.error("Recipient fetch failed", err)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (data.success) {
        toast({ title: "Signal Dispatched", description: "The communication has been encrypted and sent successfully." })
        setIsComposeOpen(false)
        setFormData({ recipientId: "", recipientType: "student", subject: "", message: "", priority: "medium" })
        fetchData()
      }
    } catch (err) {
      toast({ title: "Signal Lost", description: "Failed to transmit message through the local gateway.", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const deleteMessage = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/messages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        toast({ title: "Data Erased", description: "Message history has been permanently removed." })
        fetchData()
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete record.", variant: "destructive" })
    }
  }

  const getInitials = (firstName: any, lastName: any) => {
    return `${(firstName || 'U')[0]}${(lastName || 'S')[0]}`.toUpperCase()
  }

  if (loading) {
    return (
      <DashboardLayout title="Signal Relay">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Communicate">
      <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Signal Relay Center</h2>
            <p className="text-muted-foreground font-medium">Unified communication gateway for institutional transparency.</p>
          </div>

          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 h-14 px-8 rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all active:scale-95 text-white">
                <Plus className="w-5 h-5 mr-3" /> Initiate Transmission
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] p-0 rounded-3xl overflow-hidden border-none shadow-2xl">
              <form onSubmit={handleSendMessage}>
                <DialogHeader className="bg-gray-50/50 p-8 border-b">
                  <DialogTitle className="text-2xl font-black tracking-tight text-gray-900">Configure Protocol</DialogTitle>
                  <DialogDescription className="text-gray-500 font-medium italic">Define your recipient and payload for immediate delivery.</DialogDescription>
                </DialogHeader>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Recipient Node</Label>
                      <Select value={formData.recipientId} onValueChange={(v) => setFormData({ ...formData, recipientId: v })}>
                        <SelectTrigger className="h-14 rounded-xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-100 font-bold">
                          <SelectValue placeholder="Select Recipient" />
                        </SelectTrigger>
                        <SelectContent>
                          {recipients.map(r => (
                            <SelectItem key={r._id} value={r._id}>{r.firstName} {r.lastName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Priority Tier</Label>
                      <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                        <SelectTrigger className="h-14 rounded-xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-100 font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low - Routine</SelectItem>
                          <SelectItem value="medium">Medium - Standard</SelectItem>
                          <SelectItem value="high">High - Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Transmission Subject</Label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Academic Progress Audit"
                      className="h-14 rounded-xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-100 font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Payload (Message Body)</Label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Input institutional directives here..."
                      className="min-h-[160px] rounded-2xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-100 font-medium p-4 resize-none"
                      required
                    />
                  </div>
                </div>
                <DialogFooter className="bg-gray-50/50 p-8 border-t">
                  <Button type="button" variant="ghost" onClick={() => setIsComposeOpen(false)} className="h-12 px-6 font-black uppercase tracking-widest text-xs text-gray-400">Abort Protocol</Button>
                  <Button type="submit" disabled={submitting} className="h-12 px-10 bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-100 rounded-xl">
                    {submitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Initialize Dispatch
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none shadow-xl shadow-indigo-100/30 ring-1 ring-gray-100 rounded-2xl bg-white p-6 space-y-2">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Inbox className="h-6 w-6 text-indigo-600" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Unread Signals</p>
            <h4 className="text-3xl font-black text-gray-900">{messages.filter(m => !m.isRead).length}</h4>
          </Card>
          <Card className="border-none shadow-xl shadow-indigo-100/30 ring-1 ring-gray-100 rounded-2xl bg-white p-6 space-y-2">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Send className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Dispatched</p>
            <h4 className="text-3xl font-black text-gray-900">{sentMessages.length}</h4>
          </Card>
          <Card className="border-none shadow-xl shadow-indigo-100/30 ring-1 ring-gray-100 rounded-2xl bg-white p-6 space-y-2">
            <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center">
              <Terminal className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Urgent Logic</p>
            <h4 className="text-3xl font-black text-gray-900">{[...messages, ...sentMessages].filter(m => m.priority === 'high').length}</h4>
          </Card>
          <Card className="border-none shadow-xl shadow-indigo-100/30 ring-1 ring-gray-100 rounded-2xl bg-white p-6 space-y-2">
            <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Verified Read</p>
            <h4 className="text-3xl font-black text-gray-900 tracking-tighter">{messages.filter(m => m.isRead).length}</h4>
          </Card>
        </div>

        <Card className="border-none shadow-2xl shadow-indigo-100/30 ring-1 ring-gray-100 rounded-3xl bg-white overflow-hidden">
          <Tabs defaultValue="inbox" className="w-full" onValueChange={setActiveTab}>
            <div className="bg-gray-50/50 border-b px-8 py-4 flex items-center justify-between">
              <TabsList className="bg-white border p-1 h-12 rounded-xl">
                <TabsTrigger value="inbox" className="rounded-lg font-black h-10 px-8 data-[state=active]:bg-indigo-600 data-[state=active]:text-white uppercase tracking-widest text-[10px]">
                  Incoming Relay ({messages.length})
                </TabsTrigger>
                <TabsTrigger value="sent" className="rounded-lg font-black h-10 px-8 data-[state=active]:bg-indigo-600 data-[state=active]:text-white uppercase tracking-widest text-[10px]">
                  Dispatch Records ({sentMessages.length})
                </TabsTrigger>
              </TabsList>
              <div className="flex gap-4">
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Filter signals..." className="pl-10 h-11 bg-white border-gray-100 rounded-xl font-bold italic" />
                </div>
                <Button variant="outline" className="h-11 w-11 p-0 rounded-xl border-gray-100 text-gray-400 hover:text-indigo-600">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="inbox" className="p-0 m-0">
              <div className="divide-y divide-gray-100">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div key={msg._id} className={`p-8 hover:bg-slate-50/50 transition-all group flex items-start gap-6 cursor-pointer ${!msg.isRead ? 'bg-indigo-50/30' : ''}`}>
                      <Avatar className="h-16 w-16 rounded-2xl shadow-lg ring-4 ring-white">
                        <AvatarImage src={(msg.senderId as any)?.profilePicture} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black text-xl">
                          {getInitials((msg.senderId as any)?.firstName, (msg.senderId as any)?.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-black text-gray-900">{(msg.senderId as any)?.firstName} {(msg.senderId as any)?.lastName}</h4>
                              {!msg.isRead && <Badge className="bg-indigo-600 h-5 px-1.5 font-black uppercase text-[8px] animate-pulse">New Protocol</Badge>}
                              {msg.priority === 'high' && <Badge variant="destructive" className="h-5 px-1.5 font-black uppercase text-[8px]">Critical</Badge>}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 italic">{(msg.senderId as any)?.email}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-xs font-black text-gray-400 group-hover:text-gray-600 transition-colors uppercase tracking-tighter">
                              {new Date(msg.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" variant="ghost" className="h-9 w-9 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl" onClick={() => deleteMessage(msg._id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-9 w-9 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-bold text-gray-800 text-sm">{msg.subject}</h5>
                          <p className="text-gray-500 text-sm font-medium leading-relaxed italic line-clamp-2">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-24 text-center space-y-4">
                    <div className="h-24 w-24 bg-gray-50 border-2 border-dashed border-gray-100 rounded-[2.5rem] mx-auto flex items-center justify-center">
                      <AtSign className="h-10 w-10 text-gray-300" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xl font-black text-gray-900 tracking-tight italic">Silent Airwaves</h4>
                      <p className="text-muted-foreground font-medium max-w-xs mx-auto">No incoming signal packets detected in the institutional relay.</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="sent" className="p-0 m-0">
              <div className="divide-y divide-gray-100">
                {sentMessages.length > 0 ? (
                  sentMessages.map((msg) => (
                    <div key={msg._id} className="p-8 hover:bg-slate-50/50 transition-all group flex items-start gap-6 cursor-pointer">
                      <Avatar className="h-16 w-16 rounded-2xl shadow-lg ring-4 ring-white border border-gray-100">
                        <AvatarImage src={(msg.recipientId as any)?.profilePicture} />
                        <AvatarFallback className="bg-gray-100 text-gray-400 font-black text-xl">
                          {getInitials((msg.recipientId as any)?.firstName, (msg.recipientId as any)?.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-black text-gray-900">{(msg.recipientId as any)?.firstName || 'Protocol'} {(msg.recipientId as any)?.lastName || 'Acknowledge'}</h4>
                              <Badge variant="outline" className="h-5 px-1.5 font-black uppercase text-[8px] border-emerald-100 text-emerald-600 bg-emerald-50">Dispatched</Badge>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">{(msg.recipientId as any)?.email || 'relay@institution.edu'}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-xs font-black text-gray-400 group-hover:text-gray-600 transition-colors uppercase tracking-tighter">
                              {new Date(msg.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" variant="ghost" className="h-9 w-9 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl" onClick={() => deleteMessage(msg._id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-bold text-gray-600 text-sm flex items-center gap-2">
                            <Sparkles className="h-3 w-3 text-indigo-400" />
                            {msg.subject}
                          </h5>
                          <p className="text-gray-400 text-sm font-medium leading-relaxed line-clamp-2">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-24 text-center space-y-4">
                    <div className="h-24 w-24 bg-gray-50 border-2 border-dashed border-gray-100 rounded-[2.5rem] mx-auto flex items-center justify-center">
                      <Send className="h-10 w-10 text-gray-300" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xl font-black text-gray-900 tracking-tight italic">Relay Offline</h4>
                      <p className="text-muted-foreground font-medium max-w-xs mx-auto">No outward transmissions have been recorded via this node.</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  )
}
