"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Upload, Monitor, Save, Eye, Loader2, Globe, Layout, Smartphone, Share2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { API_URL } from "@/lib/api-config"

export default function FrontCMSSettingPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [previewMode, setPreviewMode] = useState(false)
    const [settings, setSettings] = useState<any>({
        schoolId: "",
        logo: "",
        favicon: "",
        contactEmail: "",
        complainEmail: "",
        footerText: "Copyright © 2024 NLET School",
        isAppEnabled: true,
        isWebsiteEnabled: true,
        tourVideoUrl: "",
        androidAppLink: "",
        iosAppLink: "",
        themePrimary: "#1e1b4b",
        themeStandard: "#3b82f6",
        selectedTheme: "Default",
        welcomePopup: { title: "", image: "", link: "", isEnabled: false },
        googleAnalytics: "",
        socialLinks: { facebook: "", instagram: "", whatsapp: "", twitter: "", linkedin: "", youtube: "" },
        about: { title: "Empowering Generations: Our Legacy", description: "", image: "" },
        mission: { title: "Our Mission", description: "", image: "" },
        vision: { title: "Our Vision", description: "", image: "" }
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/front-cms/settings`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await response.json()
            if (result.success && result.data) {
                setSettings((prev: any) => ({ ...prev, ...result.data }))
            }
        } catch (error) {
            toast.error("Failed to load CMS settings")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/front-cms/settings`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(settings)
            })
            if (response.ok) {
                toast.success("CMS Settings updated successfully")
            } else {
                toast.error("Failed to update settings")
            }
        } catch (error) {
            toast.error("An error occurred while saving")
        } finally {
            setSaving(false)
        }
    }

    const updateNestedField = (parent: string, field: string, value: any) => {
        setSettings({
            ...settings,
            [parent]: {
                ...settings[parent],
                [field]: value
            }
        })
    }

    if (loading) return (
        <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg border border-primary/10">
                <div className="flex items-center gap-3">
                    <span className="p-2 bg-primary/10 rounded-md">
                        <Monitor className="w-5 h-5 text-primary" />
                    </span>
                    <div>
                        <h1 className="text-xl font-bold">Front CMS Settings</h1>
                        <p className="text-xs text-muted-foreground">Manage your school's public website and mobile app presence</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setPreviewMode(!previewMode)} className="gap-2">
                        {previewMode ? <Settings size={16} /> : <Eye size={16} />}
                        {previewMode ? "Edit Mode" : "Preview Mode"}
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="bg-[#1e1b4b] gap-2">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Changes
                    </Button>
                </div>
            </div>

            {previewMode ? (
                <Card className="border-2 border-dashed border-primary/20 bg-muted/5 p-8 text-center min-h-[600px] flex flex-col items-center justify-center">
                    <Globe size={48} className="text-primary/20 mb-4" />
                    <h2 className="text-2xl font-bold">Website Preview Page</h2>
                    <p className="max-w-md text-muted-foreground mt-2">
                        This mode displays how your changes would look on the live website.
                        (In a fully implemented system, this would render your actual website components).
                    </p>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                        <Card className="p-4"><h3 className="font-bold underline mb-2">About Section</h3><p className="text-xs">{settings.about.title}</p></Card>
                        <Card className="p-4"><h3 className="font-bold underline mb-2">Mission Section</h3><p className="text-xs">{settings.mission.title}</p></Card>
                        <Card className="p-4"><h3 className="font-bold underline mb-2">Vision Section</h3><p className="text-xs">{settings.vision.title}</p></Card>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* Left Column: Core Settings */}
                    <div className="xl:col-span-12 lg:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                        <div className="space-y-6">
                            <Card className="shadow-sm border-primary/10">
                                <CardHeader className="border-b pb-4 bg-primary/5">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <Layout size={16} className="text-primary" /> Core School Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex flex-wrap gap-8">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Website Logo</Label>
                                            <div className="w-28 h-28 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-gray-50/50 group relative hover:bg-gray-100 transition-colors">
                                                {settings.logo ? (
                                                    <img src={settings.logo} className="w-full h-full object-contain p-2" />
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground">PNG/JPG Format</span>
                                                )}
                                                <Button size="icon" variant="secondary" className="absolute -bottom-2 -left-2 h-7 w-7 rounded-full shadow-md"><Upload size={14} /></Button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Fav Icon</Label>
                                            <div className="w-28 h-28 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-gray-50/50 group relative hover:bg-gray-100 transition-colors">
                                                {settings.favicon ? (
                                                    <img src={settings.favicon} className="w-full h-full object-contain p-4" />
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground">ICO/PNG 32x32</span>
                                                )}
                                                <Button size="icon" variant="secondary" className="absolute -bottom-2 -left-2 h-7 w-7 rounded-full shadow-md"><Upload size={14} /></Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Contact Page Email</Label>
                                            <Input
                                                className="h-9"
                                                value={settings.contactEmail}
                                                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Complain Page Email</Label>
                                            <Input
                                                className="h-9"
                                                value={settings.complainEmail}
                                                onChange={(e) => setSettings({ ...settings, complainEmail: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2 sm:col-span-2">
                                            <Label className="text-xs">Footer Text</Label>
                                            <Input
                                                className="h-9"
                                                value={settings.footerText}
                                                onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t bg-muted/20 p-4 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-bold">Front Website</Label>
                                                <p className="text-[10px] text-muted-foreground">Toggle public visibility</p>
                                            </div>
                                            <Switch
                                                checked={settings.isWebsiteEnabled}
                                                onCheckedChange={(v) => setSettings({ ...settings, isWebsiteEnabled: v })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between pl-4 border-l">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-bold">Mobile App</Label>
                                                <p className="text-[10px] text-muted-foreground">Sync data to Play/App store</p>
                                            </div>
                                            <Switch
                                                checked={settings.isAppEnabled}
                                                onCheckedChange={(v) => setSettings({ ...settings, isAppEnabled: v })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border-primary/10">
                                <CardHeader className="border-b pb-4 bg-orange-50/30">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-orange-800">
                                        <Smartphone size={16} /> App & Video Branding
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs">School Tour Video URL</Label>
                                        <Input
                                            placeholder="YouTube or Vimeo Link"
                                            value={settings.tourVideoUrl}
                                            onChange={(e) => setSettings({ ...settings, tourVideoUrl: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-green-700">Android Link</Label>
                                            <Input
                                                placeholder="Play Store URL"
                                                value={settings.androidAppLink}
                                                onChange={(e) => setSettings({ ...settings, androidAppLink: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-blue-700">iOS Link</Label>
                                            <Input
                                                placeholder="App Store URL"
                                                value={settings.iosAppLink}
                                                onChange={(e) => setSettings({ ...settings, iosAppLink: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="shadow-sm border-primary/10">
                                <CardHeader className="border-b pb-4 bg-pink-50/20">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-pink-900">
                                        <Share2 size={16} /> Social Media Presence
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                        {Object.keys(settings.socialLinks).map((key) => (
                                            <div key={key} className="space-y-1.5">
                                                <Label className="text-[10px] uppercase font-bold text-muted-foreground capitalize">{key} Provider</Label>
                                                <Input
                                                    className="h-9"
                                                    placeholder={`Enter ${key} URL`}
                                                    value={settings.socialLinks[key]}
                                                    onChange={(e) => updateNestedField('socialLinks', key, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border-primary/10">
                                <CardHeader className="border-b pb-4 bg-blue-50/20">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <Layout size={16} className="text-blue-700" /> UI Customization
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-xs font-bold">Theme Colors</Label>
                                            <div className="flex items-center justify-between p-2 rounded-lg border bg-gray-50/50">
                                                <span className="text-xs">Primary</span>
                                                <input type="color" value={settings.themePrimary} onChange={(e) => setSettings({ ...settings, themePrimary: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-none p-0" />
                                            </div>
                                            <div className="flex items-center justify-between p-2 rounded-lg border bg-gray-50/50">
                                                <span className="text-xs">Standard</span>
                                                <input type="color" value={settings.themeStandard} onChange={(e) => setSettings({ ...settings, themeStandard: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-none p-0" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold">Welcome Popup</Label>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] text-muted-foreground">Auto-show on load</span>
                                                <Switch checked={settings.welcomePopup.isEnabled} onCheckedChange={(v) => updateNestedField('welcomePopup', 'isEnabled', v)} />
                                            </div>
                                            <Input className="h-8 text-xs mb-2" placeholder="Banner Alt Text" value={settings.welcomePopup.title} onChange={(e) => updateNestedField('welcomePopup', 'title', e.target.value)} />
                                            <div className="w-full h-16 border-2 border-dashed rounded bg-gray-50 flex items-center justify-center relative">
                                                <Button size="icon" variant="secondary" className="h-6 w-6 rounded-full shadow-sm"><Upload size={12} /></Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-blue-900 flex items-center gap-2">Google Analytics Tag <Badge variant="secondary" className="bg-blue-100 font-normal">Advanced</Badge></Label>
                                        <Textarea
                                            className="min-h-[60px] text-xs font-mono bg-slate-900 text-slate-300"
                                            placeholder="<script>...</script>"
                                            value={settings.googleAnalytics}
                                            onChange={(e) => setSettings({ ...settings, googleAnalytics: e.target.value })}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Section Details (Full width below) */}
                    <div className="xl:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['about', 'mission', 'vision'].map((section) => (
                            <Card key={section} className="shadow-sm border-primary/10">
                                <CardHeader className="border-b py-3 bg-muted/30">
                                    <CardTitle className="text-sm font-bold uppercase tracking-tight">{section} Content</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Heading Title</Label>
                                        <Input
                                            className="h-8 font-medium"
                                            value={settings[section].title}
                                            onChange={(e) => updateNestedField(section, 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Description Text</Label>
                                        <Textarea
                                            className="h-28 text-[11px] leading-relaxed"
                                            value={settings[section].description}
                                            onChange={(e) => updateNestedField(section, 'description', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Hero Image</Label>
                                        <div className="w-full aspect-video border-2 border-dashed rounded-lg bg-gray-50 flex items-center justify-center relative overflow-hidden group">
                                            {settings[section].image ? (
                                                <img src={settings[section].image} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground">Upload 1920x1080</span>
                                            )}
                                            <Button size="icon" variant="secondary" className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><Upload size={14} /></Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
