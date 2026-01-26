"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MessageSquare, Mail, Send, User, Clock, Plus, Users, ChevronDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function ParentCommunicate() {
  const [selectedChild, setSelectedChild] = useState<string>("")
  const [children, setChildren] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [messageForm, setMessageForm] = useState({ recipient: "", subject: "", content: "" })
  const [loading, setLoading] = useState(true)

  // Fetch children and messages on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = { 'Authorization': `Bearer ${token}` }

        // Fetch Children
        const childRes = await fetch(`${API_URL}/api/parent/dashboard`, { headers })
        const childData = await childRes.json()
        if (childData.success && childData.data.children.length > 0) {
          setChildren(childData.data.children)
          setSelectedChild(childData.data.children[0]._id)
        }

        // Fetch Messages
        const msgRes = await fetch(`${API_URL}/api/messages/inbox`, { headers })
        const msgData = await msgRes.json()
        if (msgData.success) {
          setMessages(msgData.data)
        }
      } catch (error) {
        console.error("Failed to fetch initial data", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Fetch teachers (via timetable) when selected child changes
  useEffect(() => {
    if (!selectedChild) return

    const fetchTeachers = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_URL}/api/parent/child/${selectedChild}/timetable`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()

        if (data.success && data.data) {
          // Extract unique teachers from timetable
          const uniqueTeachers = new Map()
          data.data.forEach((dayData: any) => {
            dayData.periods.forEach((period: any) => {
              if (period.teacher && typeof period.teacher === 'object') {
                const teacher = period.teacher
                const id = teacher._id
                const name = `${teacher.firstName} ${teacher.lastName}`

                if (id && !uniqueTeachers.has(id)) {
                  uniqueTeachers.set(id, {
                    id,
                    name,
                    subject: period.subject,
                    email: teacher.email
                  })
                }
              }
            })
          })
          setTeachers(Array.from(uniqueTeachers.values()))
        }
      } catch (error) {
        console.error("Failed to fetch teachers", error)
      }
    }
    fetchTeachers()
  }, [selectedChild])


  const handleSendMessage = async () => {
    try {
      if (!messageForm.recipient) {
        toast.error("Please select a recipient")
        return
      }

      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: messageForm.recipient,
          subject: messageForm.subject,
          content: messageForm.content
        })
      })

      const data = await res.json()

      if (data.success) {
        // Find recipient name for toast
        const recipientName = teachers.find(t => t.id === messageForm.recipient)?.name || "Teacher"
        toast.success("Message Sent", { description: `Your message to ${recipientName} has been sent.` })
        setIsComposeOpen(false)
        setMessageForm({ recipient: "", subject: "", content: "" })
        // Refresh messages
        const msgRes = await fetch(`${API_URL}/api/messages/inbox`, { headers: { 'Authorization': `Bearer ${token}` } })
        const msgData = await msgRes.json()
        if (msgData.success) setMessages(msgData.data)

      } else {
        toast.error("Failed to send message", { description: data.error })
      }
    } catch (error) {
      toast.error("Failed to send message")
      console.error(error)
    }
  }

  const getSelectedChildName = () => {
    const child = children.find(c => c._id === selectedChild)
    return child ? `${child.firstName} ${child.lastName}` : "Loading..."
  }

  return (
    <DashboardLayout title="Communicate">
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        {/* Header with Child Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Communication Center
            </h2>
            <p className="text-muted-foreground mt-1">
              Connect with teachers for {getSelectedChildName()}
            </p>
          </div>

          {children.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[180px] justify-between shadow-sm">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    {getSelectedChildName()}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {children.map(child => (
                  <DropdownMenuItem key={child._id} onClick={() => setSelectedChild(child._id)}>
                    {child.firstName} {child.lastName}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Messages"
            value={messages.length.toString()}
            icon={MessageSquare}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Unread"
            value={messages.filter(m => !m.isRead).length.toString()}
            icon={Mail}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
          <StatCard
            title="Teachers"
            value={teachers.length.toString()}
            icon={User}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Messages Inbox */}
          <div className="md:col-span-2">
            <Card className="border-none shadow-md h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Inbox
                  </CardTitle>
                  <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm">
                        <Plus className="h-4 w-4 mr-1" />
                        New Message
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Compose Message</DialogTitle>
                        <DialogDescription>Send a message to a teacher or staff member.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Recipient</Label>
                          <Select
                            value={messageForm.recipient}
                            onValueChange={(value) => setMessageForm({ ...messageForm, recipient: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Teacher" />
                            </SelectTrigger>
                            <SelectContent>
                              {teachers.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.name} - {t.subject}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Subject</Label>
                          <Input placeholder="Message Subject" value={messageForm.subject} onChange={e => setMessageForm({ ...messageForm, subject: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Message</Label>
                          <Textarea placeholder="Type your message here..." className="min-h-[100px]" value={messageForm.content} onChange={e => setMessageForm({ ...messageForm, content: e.target.value })} />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsComposeOpen(false)}>Cancel</Button>
                        <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700"><Send className="h-4 w-4 mr-2" /> Send Message</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <CardDescription>Recent conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div key={message._id} className={`p-4 border rounded-xl hover:shadow-md transition-all cursor-pointer bg-white group ${!message.isRead ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""
                      }`}>
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 border border-gray-200">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                            {(message.senderName || "Unknown").split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <p className="font-bold text-gray-900 truncate">{message.senderName || "Unknown Sender"}</p>
                              <p className="text-xs text-blue-600 font-medium">{message.senderRole || "Staff"}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap">
                                <Clock className="h-3 w-3" />
                                {new Date(message.createdAt).toLocaleDateString()}
                              </span>
                              {!message.isRead && (
                                <span className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></span>
                              )}
                            </div>
                          </div>
                          <p className="font-semibold text-sm text-gray-800 mb-1 truncate">{message.subject}</p>
                          <p className="text-sm text-gray-500 line-clamp-2 group-hover:text-gray-700 transition-colors">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">No messages found.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Teacher Contacts */}
          <div>
            <Card className="border-none shadow-md h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  Teachers
                </CardTitle>
                <CardDescription>Quick contacts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teachers.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground">No teacher contacts available based on timetable.</div>
                  ) : (
                    teachers.map((teacher, index) => (
                      <div key={index} className="p-3 border rounded-xl hover:shadow-sm transition-all hover:bg-gray-50 flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">
                            {teacher.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{teacher.name}</p>
                          <p className="text-xs text-gray-500">{teacher.subject}</p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" onClick={() => {
                          setMessageForm({ ...messageForm, recipient: teacher.id })
                          setIsComposeOpen(true)
                        }}>
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
