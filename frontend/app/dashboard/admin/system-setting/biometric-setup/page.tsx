"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    ScanFace,
    Copy,
    CheckCircle2,
    XCircle,
    RefreshCw,
    Info,
    Loader2,
    ExternalLink,
    Terminal,
    Save
} from "lucide-react"
import { toast } from "sonner"
import { API_URL } from "@/lib/api-config"

export default function BiometricSetupPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)
    const [settings, setSettings] = useState<any>({
        biometric: {
            minop: { config: {}, status: 'disconnected', lastSync: null },
            essl: { config: {}, status: 'disconnected', lastSync: null }
        }
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/system-setting`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await response.json()
            if (result.success && result.data?.biometric) {
                setSettings((prev: any) => ({
                    ...prev,
                    biometric: {
                        ...prev.biometric,
                        ...result.data.biometric
                    }
                }))
            }
        } catch (err) {
            toast.error("Failed to load settings")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (type: string) => {
        try {
            setSaving(true)
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/system-setting`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ biometric: settings.biometric })
            })
            const result = await response.json()
            if (result.success) {
                toast.success(`${type.toUpperCase()} settings updated`)
                fetchData()
            }
        } catch (err) {
            toast.error("Save failed")
        } finally {
            setSaving(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Copied to clipboard")
    }

    const updateConfig = (type: string, key: string, value: string) => {
        setSettings({
            ...settings,
            biometric: {
                ...settings.biometric,
                [type]: {
                    ...settings.biometric[type],
                    config: {
                        ...settings.biometric[type].config,
                        [key]: value
                    }
                }
            }
        })
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'connected': return <CheckCircle2 className="w-4 h-4 text-green-500" />
            case 'disconnected': return <XCircle className="w-4 h-4 text-red-400" />
            default: return <RefreshCw className="w-4 h-4 text-orange-400 animate-spin" />
        }
    }

    if (loading) return (
        <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading biometric configurations...</p>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <span className="p-2 bg-primary/10 rounded-md">
                        <ScanFace className="w-5 h-5 text-primary" />
                    </span>
                    Biometric Setup
                </h1>
                <div className="text-sm text-muted-foreground">
                    System Setting / Biometric Setup
                </div>
            </div>

            {/* Minop Biometric */}
            <Card className="border-primary/10 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b pb-4">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <ScanFace className="text-primary w-5 h-5" /> Minop Biometric Integration
                            </CardTitle>
                            <CardDescription className="text-xs">Configure real-time attendance push for Minop devices.</CardDescription>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${settings.biometric.minop.status === 'connected' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
                            {getStatusIcon(settings.biometric.minop.status)}
                            {settings.biometric.minop.status?.toUpperCase() || 'DISCONNECTED'}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Form Side */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Device Configuration</h3>
                                <div className="space-y-2">
                                    <Label>Device Serial Number (dvcSrNo)</Label>
                                    <Input
                                        placeholder="e.g. 911573950381867"
                                        value={settings.biometric.minop.config?.dvcSrNo || ""}
                                        onChange={(e) => updateConfig('minop', 'dvcSrNo', e.target.value)}
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">Required for identifying your physical device.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Device Secret Code</Label>
                                    <Input
                                        type="password"
                                        placeholder="Enter secret key if applicable"
                                        value={settings.biometric.minop.config?.secret || ""}
                                        onChange={(e) => updateConfig('minop', 'secret', e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button onClick={() => handleSave('minop')} disabled={saving} className="bg-[#1e1b4b] h-9">
                                        {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
                                        Save configuration
                                    </Button>
                                </div>
                            </div>

                            {/* Info Side */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Integration Documentation</h3>
                                <div className="bg-slate-900 rounded-lg p-4 font-mono text-[10px] text-slate-300 space-y-4 relative group">
                                    <div className="flex justify-between items-center text-slate-500 border-b border-slate-800 pb-2 mb-2 uppercase tracking-widest text-[9px]">
                                        <span>Sample Payload</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white" onClick={() => copyToClipboard('URL: https://erp.nletschool.com/api/DeviceApi/saveAttendance \nMethod: POST')}>
                                            <Copy size={12} />
                                        </Button>
                                    </div>
                                    <div className="space-y-2 opacity-80">
                                        <div><span className="text-blue-400">POST</span> https://erp.nletschool.com/api/DeviceApi/saveAttendance</div>
                                        <div className="text-green-400">
                                            {`{ "trans": [ { "txnid": 1, "dvcid": "${settings.biometric.minop.config?.dvcSrNo || 'SERIAL'}", "punchid": "STAFF_ID", "mode": "IN" } ] }`}
                                        </div>
                                    </div>
                                    <div className="text-[9px] text-slate-500 flex items-center gap-2 mt-4">
                                        <Info size={12} /> Use the above endpoint for device push-service.
                                    </div>
                                </div>
                                <div className="bg-blue-50/50 p-3 rounded border border-blue-100 flex gap-2">
                                    <Terminal size={16} className="text-blue-600 shrink-0" />
                                    <p className="text-[10px] text-blue-700 leading-relaxed italic">
                                        Once configured, your biometric device will automatically push attendance logs to our cloud servers.
                                        <strong> Last Sync:</strong> {settings.biometric.minop.lastSync ? new Date(settings.biometric.minop.lastSync).toLocaleString() : 'Never synced'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ESSL Biometric */}
            <Card className="border-primary/10 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b pb-4">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <ScanFace className="text-primary w-5 h-5" /> ESSL Biometric Integration
                            </CardTitle>
                            <CardDescription className="text-xs">Configure Webhook and API settings for eTimeTrack Lite (ESSL).</CardDescription>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${settings.biometric.essl.status === 'connected' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
                            {getStatusIcon(settings.biometric.essl.status)}
                            {settings.biometric.essl.status?.toUpperCase() || 'DISCONNECTED'}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] group">
                            <div className="p-4 bg-muted/10 font-bold text-xs uppercase text-gray-600">Webhook Post URL</div>
                            <div className="p-4 flex items-center justify-between hover:bg-muted/5 transition-colors">
                                <code className="text-[11px] bg-slate-100 px-2 py-1 rounded text-slate-700">https://erp.nletschool.com/api/DeviceApi/saveEtimeAttendance</code>
                                <Button size="sm" variant="outline" className="h-7 text-[10px] uppercase font-bold" onClick={() => copyToClipboard('https://erp.nletschool.com/api/DeviceApi/saveEtimeAttendance')}>
                                    <Copy className="w-3 h-3 mr-1" /> Copy
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] group">
                            <div className="p-4 bg-muted/10 font-bold text-xs uppercase text-gray-600">Expected Response</div>
                            <div className="p-4 flex items-center justify-between hover:bg-muted/5 transition-colors">
                                <code className="text-[11px] font-bold text-green-600 uppercase">"Success"</code>
                                <Button size="sm" variant="outline" className="h-7 text-[10px] uppercase font-bold" onClick={() => copyToClipboard('success')}>
                                    <Copy className="w-3 h-3 mr-1" /> Copy
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] group">
                            <div className="p-4 bg-muted/11 font-bold text-xs uppercase text-gray-600">Integration Guidelines</div>
                            <div className="p-4 text-[11px] text-muted-foreground leading-relaxed">
                                1. Open your ESSL eTimeTrack Desktop software.<br />
                                2. Navigate to <strong>Utilities / Web API Setting</strong>.<br />
                                3. Enter the Webhook URL copied above into the "Destination URL" field.<br />
                                4. Set "Response Type" to JSON and "Request Method" to POST.<br />
                                5. <strong>Last Successful Link:</strong> {settings.biometric.essl.lastSync ? new Date(settings.biometric.essl.lastSync).toLocaleString() : 'No connection established yet'}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-orange-50/30 border-orange-100">
                <CardContent className="p-4 flex gap-4">
                    <div className="p-2 bg-orange-100 rounded-lg h-hit shrink-0">
                        <Info className="text-orange-600 w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-orange-800 text-sm">Need help with Biometric Setup?</h4>
                        <p className="text-xs text-orange-700 mt-1">
                            Biometric integration requires specific device firmware and network settings.
                            If your device status shows "Disconnected" after configuration, please contact our implementation team for remote assistance.
                        </p>
                        <Button variant="link" size="sm" className="p-0 h-auto text-[11px] text-orange-600 font-bold flex items-center gap-1 mt-2">
                            Download SDK Documentation <ExternalLink size={10} />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
