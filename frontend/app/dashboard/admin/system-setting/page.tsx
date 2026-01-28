"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatusBadge } from "@/components/super-admin/status-badge"
import FormModal from "@/components/form-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  School, 
  Calendar, 
  Shield, 
  Settings,
  Clock,
  Save,
  Edit,
  Trash2,
  Plus
} from "lucide-react"
import { toast } from "sonner"

interface Session {
  id: number
  session: string
  term: string
  status: "Active" | "Inactive"
  startDate: string
  endDate: string
}

export default function SystemSetting() {
  const [schoolInfo, setSchoolInfo] = useState({
    schoolName: "ABC International School",
    schoolCode: "ABC-2024",
    address: "123 Education Street, City, State 12345",
    phone: "+1-800-SCHOOL",
    email: "info@abcschool.edu",
    website: "www.abcschool.edu",
    principal: "Dr. John Smith",
    established: "1995",
    lastModified: "2025-01-05 14:30"
  })

  const [sessions, setSessions] = useState<Session[]>([
    { 
      id: 1, 
      session: "2024-2025", 
      term: "Term 1", 
      status: "Active",
      startDate: "2024-08-01",
      endDate: "2024-12-20"
    },
    { 
      id: 2, 
      session: "2024-2025", 
      term: "Term 2", 
      status: "Inactive",
      startDate: "2025-01-05",
      endDate: "2025-05-30"
    }
  ])

  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    allowParentLogin: true,
    allowStudentLogin: true
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isEditingSchool, setIsEditingSchool] = useState(false)

  const handleSaveSchool = () => {
    setSchoolInfo({ ...schoolInfo, lastModified: new Date().toLocaleString() })
    setIsEditingSchool(false)
    toast.success("School information updated successfully")
  }

  const handleSaveSystemSettings = () => {
    toast.success("System settings updated successfully")
  }

  const handleAddSession = (data: any) => {
    const newSession: Session = {
      id: Date.now(),
      ...data,
      status: data.status || "Inactive"
    }
    setSessions([...sessions, newSession])
    setIsModalOpen(false)
    toast.success("Session added successfully")
  }

  const handleEditSession = (id: number, data: any) => {
    setSessions(sessions.map((s) => (s.id === id ? { ...s, ...data } : s)))
    setEditingId(null)
    setIsModalOpen(false)
    toast.success("Session updated successfully")
  }

  const handleDeleteSession = (id: number) => {
    setSessions(sessions.filter((s) => s.id !== id))
    toast.success("Session deleted successfully")
  }

  return (
    <DashboardLayout title="System Setting">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold">System Configuration</h2>
          <p className="text-sm text-muted-foreground">Manage school information, sessions, and system settings</p>
        </div>

        {/* Settings Accordion */}
        <Accordion type="multiple" defaultValue={["school", "sessions"]} className="space-y-4">
          {/* School Information */}
          <AccordionItem value="school">
            <Card>
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <School className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">School Information</h3>
                    <p className="text-sm text-muted-foreground">Basic school details and contact information</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="space-y-6 pt-6">
                  {isEditingSchool ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="schoolName">School Name</Label>
                          <Input
                            id="schoolName"
                            value={schoolInfo.schoolName}
                            onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="schoolCode">School Code</Label>
                          <Input
                            id="schoolCode"
                            value={schoolInfo.schoolCode}
                            onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolCode: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={schoolInfo.address}
                            onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={schoolInfo.phone}
                            onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={schoolInfo.email}
                            onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={schoolInfo.website}
                            onChange={(e) => setSchoolInfo({ ...schoolInfo, website: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="principal">Principal</Label>
                          <Input
                            id="principal"
                            value={schoolInfo.principal}
                            onChange={(e) => setSchoolInfo({ ...schoolInfo, principal: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="established">Established Year</Label>
                          <Input
                            id="established"
                            value={schoolInfo.established}
                            onChange={(e) => setSchoolInfo({ ...schoolInfo, established: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveSchool}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditingSchool(false)}>
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-muted-foreground">School Name</Label>
                          <p className="font-medium mt-1">{schoolInfo.schoolName}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">School Code</Label>
                          <p className="font-medium mt-1">{schoolInfo.schoolCode}</p>
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-muted-foreground">Address</Label>
                          <p className="font-medium mt-1">{schoolInfo.address}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Phone</Label>
                          <p className="font-medium mt-1">{schoolInfo.phone}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Email</Label>
                          <p className="font-medium mt-1">{schoolInfo.email}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Website</Label>
                          <p className="font-medium mt-1">{schoolInfo.website}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Principal</Label>
                          <p className="font-medium mt-1">{schoolInfo.principal}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Established</Label>
                          <p className="font-medium mt-1">{schoolInfo.established}</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          Last modified: {schoolInfo.lastModified}
                        </p>
                        <Button onClick={() => setIsEditingSchool(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Information
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Session Management */}
          <AccordionItem value="sessions">
            <Card>
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">Session Management</h3>
                      <p className="text-sm text-muted-foreground">Manage academic sessions and terms</p>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex justify-end">
                    <Button onClick={() => setIsModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Session
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold">{session.session} - {session.term}</h4>
                            <StatusBadge status={session.status} />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingId(session.id)
                              setIsModalOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSession(session.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* System Settings */}
          <AccordionItem value="system">
            <Card>
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Settings className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">System Settings</h3>
                    <p className="text-sm text-muted-foreground">Configure system preferences and features</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Backup</Label>
                      <p className="text-sm text-muted-foreground">Automatically backup data daily</p>
                    </div>
                    <Switch
                      checked={systemSettings.autoBackup}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, autoBackup: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send email notifications to users</p>
                    </div>
                    <Switch
                      checked={systemSettings.emailNotifications}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, emailNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send SMS notifications to users</p>
                    </div>
                    <Switch
                      checked={systemSettings.smsNotifications}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, smsNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Temporarily disable system access</p>
                    </div>
                    <Switch
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, maintenanceMode: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Parent Login</Label>
                      <p className="text-sm text-muted-foreground">Enable parent portal access</p>
                    </div>
                    <Switch
                      checked={systemSettings.allowParentLogin}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, allowParentLogin: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Student Login</Label>
                      <p className="text-sm text-muted-foreground">Enable student portal access</p>
                    </div>
                    <Switch
                      checked={systemSettings.allowStudentLogin}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, allowStudentLogin: checked })}
                    />
                  </div>
                  
                  <Button onClick={handleSaveSystemSettings}>
                    <Save className="h-4 w-4 mr-2" />
                    Save System Settings
                  </Button>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Role Management */}
          <AccordionItem value="roles">
            <Card>
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Shield className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Role Management</h3>
                    <p className="text-sm text-muted-foreground">Configure user roles and permissions</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {["Admin", "Teacher", "Student", "Parent", "Accountant", "Librarian"].map((role) => (
                      <div key={role} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{role}</p>
                          <p className="text-sm text-muted-foreground">Manage {role.toLowerCase()} permissions</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Permissions
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>

        {/* Session Modal */}
        <FormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingId(null)
          }}
          onSubmit={(data) => (editingId ? handleEditSession(editingId, data) : handleAddSession(data))}
          fields={[
            { name: "session", label: "Session", type: "text" as const, required: true },
            { name: "term", label: "Term", type: "text" as const, required: true },
            { name: "startDate", label: "Start Date", type: "date" as const, required: true },
            { name: "endDate", label: "End Date", type: "date" as const, required: true },
            { name: "status", label: "Status", type: "select" as const, options: [
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" }
            ], required: true },
          ]}
          title={editingId ? "Edit Session" : "Add Session"}
          initialData={editingId ? sessions.find((s) => s.id === editingId) : {}}
        />
      </div>
    </DashboardLayout>
  )
}
