"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Mail, Send, User, Clock, Plus, Bell, Search, Paperclip, MoreVertical, Reply, Trash2, Archive } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

// Static placeholders for valid recipients since we don't have a getTeachers API handy
// In a real app, we would fetch this list from /api/teachers or /api/users/recipients
const recipientOptions = [
  { email: "admin@school.edu", name: "School Admin", role: "Administration" },
  { email: "principal@school.edu", name: "Mrs. Principal", role: "Principal" },
  // Ideally this list comes from backend
]

export default function StudentCommunicate() {
  const [messages, setMessages] = useState<any[]>([])
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [newMessage, setNewMessage] = useState({ to: "", subject: "", body: "" })
  const [recipients, setRecipients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
    fetchRecipients()
  }, [])

  const fetchRecipients = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/messages/recipients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      console.log("Fetched recipients:", data)
      if (data.success) {
        setRecipients(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch recipients", error)
    }
  }

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/messages/inbox`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setMessages(data.data)
        if (data.data.length > 0) {
          setSelectedMessage(data.data[0])
        }
      }
    } catch (error) {
      console.error("Failed to fetch messages", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMessages = messages.filter(m => {
    const sender = m.senderId || m.sender;
    const senderName = sender ? `${sender.firstName || ''} ${sender.lastName || ''}`.toLowerCase() : "";
    return senderName.includes(searchQuery.toLowerCase()) ||
      (m.subject?.toLowerCase() || "").includes(searchQuery.toLowerCase());
  })

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientEmail: newMessage.to, // Backend needs to support email lookup or ID
          subject: newMessage.subject,
          body: newMessage.body
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Message Sent", { description: "Your message has been sent successfully." })
        setIsNewMessageOpen(false)
        setNewMessage({ to: "", subject: "", body: "" })
        fetchMessages() // Refresh
      } else {
        toast.error("Send Failed", { description: data.error || "Could not send message" })
      }
    } catch (error) {
      toast.error("Error sending message")
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return

    try {
      const token = localStorage.getItem('token')
      // Inferring reply flow (create new message with Re: subject)
      const recipientEmail = selectedMessage.sender?.email // Assuming populated

      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientEmail: recipientEmail,
          subject: `Re: ${selectedMessage.subject}`,
          body: replyText
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success("Reply Sent", { description: "Your reply has been sent." })
        setReplyText("")
      } else {
        toast.error("Reply Failed")
      }
    } catch (error) {
      toast.error("Error sending reply")
    }
  }

  return (
    <DashboardLayout title="Communicate">
      <div className="h-[calc(100vh-8rem)] flex flex-col gap-4 p-1">

        {/* Top Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-8 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <form onSubmit={handleSendMessage}>
                <DialogHeader>
                  <DialogTitle>Compose Message</DialogTitle>
                  <DialogDescription>
                    Send a message to your teachers or administration.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="recipient">To</Label>
                      <button
                        type="button"
                        className="text-[10px] text-blue-600 font-bold hover:underline"
                        onClick={fetchRecipients}
                      >
                        Refresh
                      </button>
                    </div>
                    <Select
                      value={newMessage.to}
                      onValueChange={(v) => setNewMessage({ ...newMessage, to: v })}
                    >
                      <SelectTrigger id="recipient" className="w-full">
                        <SelectValue placeholder={recipients.length === 0 ? "Loading..." : "Select Recipient"} />
                      </SelectTrigger>
                      <SelectContent position="popper" className="z-[100]">
                        {recipients.length === 0 ? (
                          <SelectItem value="none" disabled>No recipients found</SelectItem>
                        ) : recipients.map(u => (
                          <SelectItem key={u.email} value={u.email}>{u.firstName} {u.lastName} ({u.role})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Enter subject"
                      required
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Type your message here..."
                      rows={5}
                      required
                      value={newMessage.body}
                      onChange={(e) => setNewMessage({ ...newMessage, body: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Send Message</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content Split View */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 h-full overflow-hidden">

          {/* Message List (Left) */}
          <Card className="md:col-span-4 lg:col-span-3 flex flex-col h-full overflow-hidden border-none shadow-md">
            <div className="p-4 border-b bg-gray-50/50">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4" /> Inbox
                <Badge variant="secondary" className="ml-auto">{filteredMessages.length}</Badge>
              </h3>
            </div>
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground text-sm">Loading...</div>
              ) : filteredMessages.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">No messages found</div>
              ) : (
                <div className="flex flex-col gap-1 p-2">
                  {filteredMessages.map((message) => {
                    const sender = message.senderId || message.sender;
                    const senderName = sender ? `${sender.firstName || ''} ${sender.lastName || ''}`.trim() : "Unknown";
                    return (
                      <button
                        key={message._id}
                        onClick={() => setSelectedMessage(message)}
                        className={cn(
                          "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
                          selectedMessage && selectedMessage._id === message._id ? "bg-blue-50 border-blue-200" : "bg-white",
                          !message.isRead && "font-semibold"
                        )}
                      >
                        <div className="flex w-full flex-col gap-1">
                          <div className="flex items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{senderName}</span>
                              {!message.isRead && (
                                <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                              )}
                            </div>
                            <div className="ml-auto text-xs text-muted-foreground">
                              {new Date(message.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                          <div className="text-xs font-medium">{message.subject}</div>
                          <div className="line-clamp-2 text-xs text-muted-foreground">
                            {message.message ? message.message.substring(0, 50) : ""}...
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Message Details (Right) */}
          <Card className="md:col-span-8 lg:col-span-9 flex flex-col h-full overflow-hidden border-none shadow-md">
            {selectedMessage ? (
              <>
                <div className="flex items-center justify-between p-6 border-b">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {(selectedMessage.senderId?.firstName || selectedMessage.sender?.firstName || "U").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">
                        {selectedMessage.senderId ? `${selectedMessage.senderId.firstName || ''} ${selectedMessage.senderId.lastName || ''}`.trim() :
                          selectedMessage.sender ? `${selectedMessage.sender.firstName || ''} ${selectedMessage.sender.lastName || ''}`.trim() : "Unknown Sender"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedMessage.senderId?.role || selectedMessage.sender?.role || "Sender"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-gray-500" onClick={() => toast.info("Archived")}><Archive className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => toast.error("Deleted")}><Trash2 className="h-4 w-4" /></Button>
                    <Separator orientation="vertical" className="h-6" />

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => toast.success("Marked as Unread")}>Mark as Unread</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success("Starred")}>Star Message</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{selectedMessage.subject}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Separator />
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <p className="whitespace-pre-wrap">{selectedMessage.message || selectedMessage.body}</p>
                    </div>
                  </div>
                </ScrollArea>

                <div className="p-4 border-t bg-gray-50">
                  <div className="flex gap-4">
                    <Textarea
                      placeholder="Reply to this message..."
                      className="min-h-[100px] bg-white resize-none"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Paperclip className="h-4 w-4 mr-2" /> Attach
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSendReply}>
                      <Send className="h-4 w-4 mr-2" /> Send Reply
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Mail className="h-16 w-16 mb-4 opacity-20" />
                <p>Select a message to read</p>
              </div>
            )}
          </Card>
        </div>

      </div>
    </DashboardLayout>
  )
}
