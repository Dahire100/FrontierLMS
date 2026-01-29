"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  Settings, 
  Shield, 
  Bell, 
  Mail, 
  Database,
  Zap,
  Globe,
  Lock,
  Users,
  FileText,
  Activity,
  Save,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"

export default function PlatformSettings() {
  const [generalSettings, setGeneralSettings] = useState({
    platformName: "School Management System",
    platformVersion: "2.0.1",
    maintenanceMode: false,
    allowRegistrations: true,
    maxSchools: "100",
    sessionTimeout: "30",
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    passwordExpiry: "90",
    minPasswordLength: "8",
    loginAttempts: "5",
    ipWhitelist: false,
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    systemAlerts: true,
    weeklyReports: true,
  })

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.example.com",
    smtpPort: "587",
    smtpUser: "noreply@example.com",
    smtpEncryption: "TLS",
  })

  const [activityLog, setActivityLog] = useState([
    { action: "Settings Updated", user: "Admin", timestamp: "2025-01-06 14:30", details: "Security settings modified" },
    { action: "System Backup", user: "System", timestamp: "2025-01-06 03:00", details: "Automated backup completed" },
    { action: "User Login", user: "Super Admin", timestamp: "2025-01-06 09:15", details: "Successful login" },
    { action: "Configuration Change", user: "Admin", timestamp: "2025-01-05 16:45", details: "Email settings updated" },
  ])

  const handleSaveGeneral = () => {
    toast.success("General settings saved successfully")
  }

  const handleSaveSecurity = () => {
    toast.success("Security settings saved successfully")
  }

  const handleSaveNotifications = () => {
    toast.success("Notification settings saved successfully")
  }

  const handleSaveEmail = () => {
    toast.success("Email settings saved successfully")
  }

  return (
    <DashboardLayout title="Platform Settings">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold">Platform Configuration</h2>
          <p className="text-sm text-muted-foreground">Manage system-wide settings and configurations</p>
        </div>

        {/* Settings Accordion */}
        <Accordion type="multiple" defaultValue={["general", "security"]} className="space-y-4">
          {/* General Settings */}
          <AccordionItem value="general">
            <Card>
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Settings className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">General Settings</h3>
                    <p className="text-sm text-muted-foreground">Basic platform configuration</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="platformName">Platform Name</Label>
                      <Input
                        id="platformName"
                        value={generalSettings.platformName}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="platformVersion">Platform Version</Label>
                      <Input
                        id="platformVersion"
                        value={generalSettings.platformVersion}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, platformVersion: e.target.value })}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxSchools">Maximum Schools</Label>
                      <Input
                        id="maxSchools"
                        type="number"
                        value={generalSettings.maxSchools}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, maxSchools: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={generalSettings.sessionTimeout}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, sessionTimeout: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">Temporarily disable platform access</p>
                      </div>
                      <Switch
                        checked={generalSettings.maintenanceMode}
                        onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, maintenanceMode: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Allow New Registrations</Label>
                        <p className="text-sm text-muted-foreground">Enable new school registrations</p>
                      </div>
                      <Switch
                        checked={generalSettings.allowRegistrations}
                        onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, allowRegistrations: checked })}
                      />
                    </div>
                  </div>
                  
                  <Button onClick={handleSaveGeneral}>
                    <Save className="h-4 w-4 mr-2" />
                    Save General Settings
                  </Button>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Security Settings */}
          <AccordionItem value="security">
            <Card>
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Shield className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Security Settings</h3>
                    <p className="text-sm text-muted-foreground">Authentication and access control</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                      <Input
                        id="passwordExpiry"
                        type="number"
                        value={securitySettings.passwordExpiry}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, passwordExpiry: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minPasswordLength">Min Password Length</Label>
                      <Input
                        id="minPasswordLength"
                        type="number"
                        value={securitySettings.minPasswordLength}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, minPasswordLength: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                      <Input
                        id="loginAttempts"
                        type="number"
                        value={securitySettings.loginAttempts}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, loginAttempts: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                      </div>
                      <Switch
                        checked={securitySettings.twoFactorAuth}
                        onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>IP Whitelist</Label>
                        <p className="text-sm text-muted-foreground">Restrict access by IP address</p>
                      </div>
                      <Switch
                        checked={securitySettings.ipWhitelist}
                        onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, ipWhitelist: checked })}
                      />
                    </div>
                  </div>
                  
                  <Button onClick={handleSaveSecurity}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Security Settings
                  </Button>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Notification Settings */}
          <AccordionItem value="notifications">
            <Card>
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Bell className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Notification Settings</h3>
                    <p className="text-sm text-muted-foreground">Configure notification preferences</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                    </div>
                    <Switch
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, smsNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Browser push notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, pushNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Alerts</Label>
                      <p className="text-sm text-muted-foreground">Critical system notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.systemAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, systemAlerts: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">Automated weekly summary</p>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyReports}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, weeklyReports: checked })}
                    />
                  </div>
                  
                  <Button onClick={handleSaveNotifications}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Notification Settings
                  </Button>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Email Configuration */}
          <AccordionItem value="email">
            <Card>
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Email Configuration</h3>
                    <p className="text-sm text-muted-foreground">SMTP and email settings</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={emailSettings.smtpHost}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        value={emailSettings.smtpPort}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpUser">SMTP User</Label>
                      <Input
                        id="smtpUser"
                        type="email"
                        value={emailSettings.smtpUser}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpEncryption">Encryption</Label>
                      <Input
                        id="smtpEncryption"
                        value={emailSettings.smtpEncryption}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpEncryption: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <Button onClick={handleSaveEmail}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Email Settings
                  </Button>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>

        {/* System Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              System Actions
            </CardTitle>
            <CardDescription>Perform system-wide operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="w-full justify-start" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Database className="h-4 w-4 mr-2" />
                Backup Database
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Send Announcement
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Globe className="h-4 w-4 mr-2" />
                Update System
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                View Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest configuration changes and system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityLog.map((log, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <div className="p-2 bg-muted rounded-lg">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">By: {log.user}</p>
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
