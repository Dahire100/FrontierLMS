"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    CreditCard,
    Save,
    Info,
    Loader2,
    Lock,
    ShieldCheck,
    Zap,
    RefreshCw,
    BadgeCheck,
    AlertCircle,
    Eye,
    EyeOff
} from "lucide-react"
import { toast } from "sonner"
import { API_URL } from "@/lib/api-config"
import { Switch } from "@/components/ui/switch"

const Gateways = [
    { id: "ccavenue", name: "CC Avenue", website: "ccavenue.com", color: "text-[#ed1c24]", bg: "bg-red-50", desc: "India's largest payment gateway for enterprise." },
    { id: "worldline", name: "Worldline", website: "worldline.com", color: "text-[#005cbb]", bg: "bg-blue-50", desc: "Global leader in payments and transactional services." },
    { id: "easebuzz", name: "Easebuzz", website: "easebuzz.in", color: "text-[#00cb75]", bg: "bg-green-50", desc: "Full-stack payment solution for growing businesses." },
    { id: "razorpay", name: "Razorpay", website: "razorpay.com", color: "text-[#0070e0]", bg: "bg-sky-50", desc: "Easy to integrate API-first payment platform." },
    { id: "paytm", name: "Paytm", website: "paytm.com", color: "text-[#00b9f1]", bg: "bg-cyan-50", desc: "India's most popular digital wallet and gateway." },
    { id: "phonepe", name: "PhonePe", website: "phonepe.com", color: "text-[#6739b7]", bg: "bg-purple-50", desc: "Reliable and fast UPI-first payment gateway." },
    { id: "payu", name: "PayU", website: "payu.in", color: "text-[#a5c339]", bg: "bg-lime-50", desc: "Preferred gateway for high transaction volumes." },
    { id: "stripe", name: "Stripe", website: "stripe.com", color: "text-[#635bff]", bg: "bg-indigo-50", desc: "Integrated payment infrastructure for global e-commerce." }
]

export default function PaymentSettingPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)
    const [selectedGatewayId, setSelectedGatewayId] = useState("razorpay")
    const [gatewaysConfig, setGatewaysConfig] = useState<any[]>([])
    const [showKey, setShowKey] = useState<Record<string, boolean>>({})

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
            if (result.success) {
                const configs = result.data?.paymentGateways || []
                setGatewaysConfig(configs)

                // Set active gateway as default selected if exists
                const active = configs.find((c: any) => c.isActive)
                if (active) setSelectedGatewayId(active.gateway)
            }
        } catch (err) {
            toast.error("Failed to load settings")
        } finally {
            setLoading(false)
        }
    }

    const currentGatewayConfig = gatewaysConfig.find(g => g.gateway === selectedGatewayId) || {
        gateway: selectedGatewayId,
        config: {},
        mode: 'test',
        isActive: false
    }

    const updateConfig = (key: string, value: string) => {
        const newConfigs = [...gatewaysConfig]
        const idx = newConfigs.findIndex(g => g.gateway === selectedGatewayId)
        if (idx > -1) {
            newConfigs[idx].config = { ...newConfigs[idx].config, [key]: value }
        } else {
            newConfigs.push({ gateway: selectedGatewayId, config: { [key]: value }, mode: 'test', isActive: false })
        }
        setGatewaysConfig(newConfigs)
    }

    const setMode = (mode: 'test' | 'live') => {
        const newConfigs = [...gatewaysConfig]
        const idx = newConfigs.findIndex(g => g.gateway === selectedGatewayId)
        if (idx > -1) {
            newConfigs[idx].mode = mode
        } else {
            newConfigs.push({ gateway: selectedGatewayId, config: {}, mode, isActive: false })
        }
        setGatewaysConfig(newConfigs)
    }

    const handleSave = async (id: string) => {
        try {
            setSaving(true)
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/system-setting`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ paymentGateways: gatewaysConfig })
            })
            const result = await response.json()
            if (result.success) {
                toast.success(`${Gateways.find(g => g.id === id)?.name} settings updated`)
                fetchData() // Refresh to mask
            }
        } catch (err) {
            toast.error("Save failed")
        } finally {
            setSaving(false)
        }
    }

    const toggleActive = (id: string) => {
        const newConfigs = gatewaysConfig.map(g => ({
            ...g,
            isActive: g.gateway === id
        }))
        // ensure id exists in array
        if (!newConfigs.find(g => g.gateway === id)) {
            newConfigs.push({ gateway: id, config: {}, mode: 'test', isActive: true })
        }
        setGatewaysConfig(newConfigs)
        toast.info(`${Gateways.find(g => g.id === id)?.name} set as primary gateway. Remember to Save.`)
    }

    const handleTest = async () => {
        try {
            setTesting(true)
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/system-setting/test`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ type: 'payment', gateway: selectedGatewayId, config: currentGatewayConfig.config })
            })
            const result = await response.json()
            if (result.success) toast.success(result.message)
        } catch (err) {
            toast.error("Test connection failed")
        } finally {
            setTesting(false)
        }
    }

    const toggleKeyVisibility = (key: string) => {
        setShowKey(prev => ({ ...prev, [key]: !prev[key] }))
    }

    if (loading) return (
        <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Synchronizing secure gateways...</p>
        </div>
    )

    const activeGatewayInfo = Gateways.find(g => g.id === selectedGatewayId)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <span className="p-2 bg-primary/10 rounded-md">
                        <CreditCard className="w-5 h-5 text-primary" />
                    </span>
                    Payment Setting
                </h1>
                <div className="text-sm text-muted-foreground">
                    System Setting / Payment Setting
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Gateway Selection Sidebar */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-4">
                    <Card className="sticky top-6">
                        <CardHeader className="bg-muted/30 border-b p-4">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                                <Zap size={14} /> Registered Gateways
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2">
                            <div className="space-y-1">
                                {Gateways.map(gateway => {
                                    const isConfigured = gatewaysConfig.some(g => g.gateway === gateway.id && Object.keys(g.config || {}).length > 0)
                                    const isActive = gatewaysConfig.some(g => g.gateway === gateway.id && g.isActive)

                                    return (
                                        <div
                                            key={gateway.id}
                                            onClick={() => setSelectedGatewayId(gateway.id)}
                                            className={`
                                                cursor-pointer rounded-lg p-3 flex items-center justify-between transition-all group
                                                ${selectedGatewayId === gateway.id ? 'bg-[#1e1b4b] text-white shadow-md' : 'hover:bg-muted text-gray-700'}
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-full ${selectedGatewayId === gateway.id ? 'bg-white/10' : gateway.bg}`}>
                                                    <CreditCard className={`w-4 h-4 ${selectedGatewayId === gateway.id ? 'text-white' : gateway.color}`} />
                                                </div>
                                                <div className="text-sm font-medium">{gateway.name}</div>
                                            </div>
                                            <div className="flex gap-1">
                                                {isActive && <BadgeCheck size={14} className="text-green-500" />}
                                                {isConfigured && !isActive && <ShieldCheck size={14} className="text-blue-500 opacity-60" />}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Configuration Area */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                    <Card className="border-primary/10 overflow-hidden shadow-sm">
                        <CardHeader className="border-b bg-muted/20 pb-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        {activeGatewayInfo?.name} Configuration
                                    </CardTitle>
                                    <div className="flex items-center gap-3">
                                        <a href={`https://${activeGatewayInfo?.website}`} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium">
                                            Merchant Login <RefreshCw size={10} />
                                        </a>
                                        <span className="text-muted-foreground text-xs">•</span>
                                        <span className="text-xs text-muted-foreground">{activeGatewayInfo?.desc}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
                                    <Button
                                        variant={currentGatewayConfig.mode === 'test' ? 'default' : 'ghost'}
                                        size="sm"
                                        className={`h-7 text-[10px] uppercase font-bold px-4 ${currentGatewayConfig.mode === 'test' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                                        onClick={() => setMode('test')}
                                    >
                                        Test Environment
                                    </Button>
                                    <Button
                                        variant={currentGatewayConfig.mode === 'live' ? 'default' : 'ghost'}
                                        size="sm"
                                        className={`h-7 text-[10px] uppercase font-bold px-4 ${currentGatewayConfig.mode === 'live' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                        onClick={() => setMode('live')}
                                    >
                                        Live Production
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">
                            {/* Security Notice */}
                            <div className="bg-slate-900 rounded-lg p-4 flex gap-4 items-center">
                                <Lock className="text-yellow-400 shrink-0" size={20} />
                                <div className="text-xs text-slate-400 leading-relaxed font-mono">
                                    <span className="text-slate-100 font-bold uppercase tracking-wider block mb-1">Security Standards</span>
                                    Keys are encrypted with AES-256 before storage. Never share your secret keys with unauthorized personnel.
                                    Sensitive values are masked by default.
                                </div>
                            </div>

                            {/* Dynamic Input Fields using Keys based on selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <CreditCard size={14} /> Primary API Credentials
                                    </h3>

                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold">Client ID / Key ID <span className="text-red-500">*</span></Label>
                                        <Input
                                            placeholder="Enter ID provided by gateway"
                                            value={currentGatewayConfig.config?.keyId || ""}
                                            onChange={(e) => updateConfig('keyId', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold">Secret Key / Salt <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <Input
                                                type={showKey['keySecret'] ? "text" : "password"}
                                                placeholder="Enter merchant secret"
                                                value={currentGatewayConfig.config?.keySecret || ""}
                                                onChange={(e) => updateConfig('keySecret', e.target.value)}
                                                className="pr-10"
                                            />
                                            <button
                                                onClick={() => toggleKeyVisibility('keySecret')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                {showKey['keySecret'] ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    {selectedGatewayId === 'ccavenue' && (
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-bold">Access Code</Label>
                                            <Input
                                                placeholder="Merchant access code"
                                                value={currentGatewayConfig.config?.accessCode || ""}
                                                onChange={(e) => updateConfig('accessCode', e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6 bg-muted/10 p-4 rounded-xl border border-dashed border-muted">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <Zap size={14} /> Quick Actions
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm">
                                            <div className="space-y-1">
                                                <div className="text-xs font-bold">Primary Gateway</div>
                                                <p className="text-[10px] text-muted-foreground italic">Use this gateway for all online fee payments.</p>
                                            </div>
                                            <Switch
                                                checked={currentGatewayConfig.isActive}
                                                onCheckedChange={() => toggleActive(selectedGatewayId)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Button
                                                variant="outline"
                                                className="w-full h-10 border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-bold"
                                                onClick={handleTest}
                                                disabled={testing}
                                            >
                                                {testing ? <Loader2 size={14} className="animate-spin mr-2" /> : <RefreshCw size={14} className="mr-2" />}
                                                Test Live Connection
                                            </Button>
                                            <p className="text-[9px] text-center text-muted-foreground">Verify reachability before enabling for students.</p>
                                        </div>
                                    </div>

                                    <div className="mt-8 p-3 rounded-lg bg-yellow-50 border border-yellow-100 text-[10px] flex gap-2">
                                        <AlertCircle className="text-yellow-600 shrink-0" size={14} />
                                        <span className="text-yellow-800 leading-normal">
                                            <strong>Note:</strong> Enabling a new gateway will automatically disable the previous one. Only one gateway can be "Active" at any time.
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t">
                                <Button
                                    className="bg-[#1e1b4b] h-10 px-8"
                                    onClick={() => handleSave(selectedGatewayId)}
                                    disabled={saving}
                                >
                                    {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
                                    Save Gateway Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
