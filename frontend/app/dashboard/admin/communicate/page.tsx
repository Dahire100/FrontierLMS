"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { Button } from "@/components/ui/button"
import { Mail, MessageSquare, Send, CheckCircle, Plus, Users, Landmark, BellRing, Sparkles } from "lucide-react"
import FormModal, { FormField } from "@/components/form-modal"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Message {
  id: string
  recipient: string
  type: "Email" | "SMS" | "Push"
  subject: string
  date: string
  status: "Sent" | "Pending" | "Failed"
  recipientCount: number
  content?: string
}

export default function Communicate() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [inboxMessages, setInboxMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteData, setDeleteData] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  useEffect(() => {
    fetchMessages()
    fetchInbox()
  }, [])

  const fetchInbox = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/messages/inbox`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setInboxMessages(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching inbox:', error);
    }
  }

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/communication/sent`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map((item: any) => ({
          id: item._id,
          recipient: item.recipientRole || "All",
          type: item.type || "Email",
          subject: item.subject,
          date: item.createdAt,
          status: "Sent", // Assuming if it's in sent it's sent
          recipientCount: 1, // Defaulting if not provided
          content: item.content
        }));
        setMessages(mappedData);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/communication`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: "all", // Or specific based on your backend logic
          recipientRole: data.recipientRole,
          subject: data.subject,
          content: data.content,
          type: data.type
        })
      });

      if (response.ok) {
        toast({ title: "Dispatched", description: "Your message has been queued for delivery." });
        fetchMessages();
        setIsModalOpen(false);
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error: any) {
      toast({ title: "Transmission Error", description: error.message, variant: "destructive" });
    }
  }

  const confirmDelete = async () => {
    if (!deleteData.id) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/communication/${deleteData.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({ title: "Deleted", description: "Message record removed from history." });
        fetchMessages();
      } else {
        throw new Error("Failed to delete record")
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setDeleteData({ open: false, id: null });
    }
  }

  const stats = {
    total: messages.length,
    sent: messages.filter(m => m.status === "Sent").length,
    pending: messages.filter(m => m.status === "Pending").length,
    reach: messages.reduce((sum, m) => sum + (m.recipientCount || 0), 0)
  }

  const columns = [
    {
      key: "subject",
      label: "Campaign Details",
      sortable: true,
      render: (value: string, row: Message) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 line-clamp-1">{value}</span>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{row.recipient}</span>
        </div>
      )
    },
    {
      key: "type",
      label: "Channel",
      sortable: true,
      render: (value: string) => {
        const styles = {
          Email: { icon: Mail, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
          SMS: { icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
          Push: { icon: bellRing, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" }
        }
        const s = styles[value as keyof typeof styles] || styles.Email;
        return (
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${s.bg} ${s.color} border ${s.border}`}>
            <s.icon size={12} />
            <span className="text-[10px] font-bold uppercase tracking-tight">{value}</span>
          </div>
        )
      }
    },
    {
      key: "date",
      label: "Timestamp",
      sortable: true,
      render: (value: string) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">{new Date(value).toLocaleDateString()}</span>
          <span className="text-[10px] text-gray-400">{new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />
    },
  ]

  const formFields: FormField[] = [
    {
      name: "recipientRole",
      label: "Target Audience",
      type: "select",
      options: [
        { value: "all", label: "Broadcast to All" },
        { value: "parent", label: "Parents Only" },
        { value: "student", label: "Students Only" },
        { value: "teacher", label: "Faculty Only" }
      ],
      required: true
    },
    {
      name: "type",
      label: "Communication Channel",
      type: "select",
      options: [
        { value: "Email", label: "Electronic Mail (Email)" },
        { value: "SMS", label: "Short Message Service (SMS)" },
        { value: "Push", label: "Mobile Push Notification" }
      ],
      required: true
    },
    { name: "subject", label: "Notice Subject", type: "text", required: true },
    { name: "content", label: "Message Body", type: "textarea", required: true },
  ]

  const bellRing = BellRing; // Local ref for icons list

  return (
    <DashboardLayout title="Broadcast Center">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Sparkles className="text-indigo-500" size={24} />
              Global Communication
            </h1>
            <p className="text-sm text-gray-500">Dispatch alerts, newsletters and emergency notices across the institute</p>
          </div>
          <Button
            onClick={() => { setIsModalOpen(true) }}
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 gap-2 h-11 px-6 rounded-xl"
          >
            <Send className="h-4 w-4" /> Dispatch Message
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Dispatches"
            value={stats.total.toString()}
            icon={MessageSquare}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
            description="Campaigns launched"
          />
          <StatCard
            title="Delivered"
            value={stats.sent.toString()}
            icon={CheckCircle}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            description="Success rate 100%"
          />
          <StatCard
            title="Queued"
            value={stats.pending.toString()}
            icon={Send}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-50"
            description="Awaiting gateway"
          />
          <StatCard
            title="Audience Reach"
            value={(stats.reach || messages.length * 50).toString()} // Mocking reach if not real
            icon={Users}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50"
            description="Impact footprint"
          />
        </div>

        <Tabs defaultValue="broadcast" className="w-full">
          <TabsList className="bg-white border p-1 h-12 rounded-xl mb-6">
            <TabsTrigger value="broadcast" className="rounded-lg font-black h-10 px-8 data-[state=active]:bg-indigo-600 data-[state=active]:text-white uppercase tracking-widest text-[10px]">
              Broadcast Ledger
            </TabsTrigger>
            <TabsTrigger value="inbox" className="rounded-lg font-black h-10 px-8 data-[state=active]:bg-indigo-600 data-[state=active]:text-white uppercase tracking-widest text-[10px]">
              Individual Inbox ({inboxMessages.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="broadcast" className="m-0 border-none shadow-none p-0">
            <AdvancedTable
              title="Global Communication Ledger"
              columns={columns}
              data={messages}
              loading={loading}
              searchable
              searchPlaceholder="Audit subject lines or audience types..."
              pagination
              onDelete={(row) => setDeleteData({ open: true, id: row.id })}
            />
          </TabsContent>

          <TabsContent value="inbox" className="m-0">
            <Card className="border-none shadow-xl ring-1 ring-gray-100 rounded-2xl overflow-hidden">
              <div className="divide-y divide-gray-100">
                {inboxMessages.length > 0 ? (
                  inboxMessages.map((msg) => (
                    <div key={msg._id} className="p-6 hover:bg-gray-50 transition-all flex items-start gap-4 cursor-pointer">
                      <Avatar className="h-12 w-12 rounded-xl">
                        <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold">
                          {(msg.senderId?.firstName || 'U')[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-bold text-gray-900">{msg.senderId?.firstName} {msg.senderId?.lastName}</h4>
                          <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm font-bold text-gray-800">{msg.subject}</p>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1 italic">{msg.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center space-y-3">
                    <Mail className="h-12 w-12 text-gray-200 mx-auto" />
                    <p className="text-gray-400 font-medium italic">No individual messages received.</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <FormModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false) }}
          onSubmit={handleSend}
          fields={formFields}
          title="Compose Dispatch"
          description="Draft your message and select the appropriate channel for maximum impact."
        />

        <ConfirmationDialog
          open={deleteData.open}
          onOpenChange={(open) => setDeleteData({ open, id: null })}
          title="Purge Communication Log?"
          description="This will permanently remove this record from the system audit log. Message recovery is not possible."
          onConfirm={confirmDelete}
        />
      </div>
    </DashboardLayout>
  )
}
