"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Package, Plus, ClipboardList, RotateCcw, AlertTriangle, Trash2, CheckCircle2, Loader2, Sparkles, ChevronRight, Boxes } from "lucide-react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface InventoryItem {
    _id: string;
    itemName: string;
    category: string;
    issuedDate?: string;
    returnDate?: string;
    status: string;
    quantity?: number;
    targetClassString?: string;
    description?: string;
    requiredDate?: string;
    logisticsRemark?: string;
    isRequisition?: boolean;
}

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const { toast } = useToast()
    const [classes, setClasses] = useState<any[]>([])
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

    const [formData, setFormData] = useState({
        category: "",
        itemName: "",
        description: "",
        requiredDate: "",
        quantity: 1,
        classId: ""
    })

    useEffect(() => {
        fetchInventory()
        fetchClasses()
    }, [])

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/teacher/classes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setClasses(data.data)
            }
        } catch (err) {
            console.error("Failed to fetch classes")
        }
    }

    const fetchInventory = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/teacher/inventory`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setItems(data.data)
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to load inventory", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleRequestItem = async () => {
        setSubmitting(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/teacher/inventory/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            const data = await res.json()
            if (data.success) {
                toast({ title: "Requisition Dispatched", description: "Your supply request has been queued for logistics review." })
                setIsDialogOpen(false)
                setFormData({ category: "", itemName: "", description: "", requiredDate: "", quantity: 1, classId: "" })
                fetchInventory()
            } else {
                toast({ title: "Submission Failed", description: data.error || "Could not process request.", variant: "destructive" })
            }
        } catch (err) {
            toast({ title: "Submission Failed", description: "Could not process requisition request.", variant: "destructive" })
        } finally {
            setSubmitting(false)
        }
    }

    const inPossessionCount = items.filter(i => i.status === 'In Possession' || i.status === 'Available').length
    const lowStockCount = items.filter(i => i.status === 'Low Stock').length

    if (loading) {
        return (
            <DashboardLayout title="Asset Management">
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Logistics & Assets">
            <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight italic uppercase">Resource Inventory</h2>
                        <p className="text-muted-foreground font-medium italic">Monitor issued equipment and dispatch supply requisitions.</p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 h-14 px-8 rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all active:scale-95 text-white">
                                <Plus className="w-5 h-5 mr-3" /> Execute Requisition
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px] p-0 rounded-3xl overflow-hidden border-none shadow-2xl">
                            <DialogHeader className="bg-gray-50/50 p-8 border-b">
                                <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 uppercase italic">Supply Request</DialogTitle>
                                <DialogDescription className="text-gray-500 font-medium italic">Configure asset requirements for administrative auditing.</DialogDescription>
                            </DialogHeader>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Target Section</Label>
                                        <Select onValueChange={(val) => setFormData({ ...formData, classId: val })}>
                                            <SelectTrigger className="h-14 rounded-xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-100 font-bold">
                                                <SelectValue placeholder="Select Class" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes.map((c) => (
                                                    <SelectItem key={c._id} value={c._id}>
                                                        {c.class} - {c.section}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Inventory Class</Label>
                                        <Select onValueChange={(val) => setFormData({ ...formData, category: val })}>
                                            <SelectTrigger className="h-14 rounded-xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-100 font-bold">
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Electronics" className="font-medium">Electronics</SelectItem>
                                                <SelectItem value="Stationery" className="font-medium">Stationery</SelectItem>
                                                <SelectItem value="Books" className="font-medium">Academic References</SelectItem>
                                                <SelectItem value="Furniture" className="font-medium">Infrastructure</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Asset Identity</Label>
                                        <Input
                                            placeholder="e.g., HDMI Adapter"
                                            className="h-14 rounded-xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-100 font-bold"
                                            value={formData.itemName}
                                            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Required Quantity</Label>
                                        <Input
                                            type="number"
                                            className="h-14 rounded-xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-100 font-bold"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Target Date</Label>
                                    <Input
                                        type="date"
                                        className="h-14 rounded-xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-100 font-bold"
                                        value={formData.requiredDate}
                                        onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Qualitative Justification</Label>
                                    <Textarea
                                        placeholder="Specify precise utilization requirements..."
                                        className="min-h-[100px] rounded-2xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-100 font-medium p-4"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter className="bg-gray-50/50 p-8 border-t">
                                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-12 px-6 font-black uppercase tracking-widest text-xs text-gray-400">Cancel Protocol</Button>
                                <Button className="h-12 px-10 bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-100 rounded-xl" onClick={handleRequestItem} disabled={submitting}>
                                    {submitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Boxes className="h-4 w-4 mr-2" />}
                                    Dispatch Request
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* View Details Dialog */}
                    <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                        <DialogContent className="sm:max-w-[600px] p-0 rounded-3xl overflow-hidden border-none shadow-2xl">
                            <DialogHeader className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                                <div className="relative z-10">
                                    <Badge className="bg-white/20 hover:bg-white/20 text-white border-none mb-3 font-bold uppercase tracking-widest">{selectedItem?.category}</Badge>
                                    <DialogTitle className="text-3xl font-black uppercase italic tracking-tight">{selectedItem?.itemName}</DialogTitle>
                                    <p className="text-indigo-100 font-medium mt-1">UID: {selectedItem?._id?.slice(-8).toUpperCase()}</p>
                                </div>
                                <Boxes className="absolute -right-8 -bottom-8 w-40 h-40 text-indigo-500 opacity-50" />
                            </DialogHeader>
                            <div className="p-8 space-y-8 bg-white">
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Current Status</Label>
                                        <div className="mt-2">
                                            <Badge className={`h-8 px-4 rounded-xl font-black uppercase text-[10px] border-none shadow-sm ${selectedItem?.status === 'Available' || selectedItem?.status === 'In Possession' ? "bg-emerald-50 text-emerald-700" :
                                                selectedItem?.status === 'Low Stock' ? "bg-orange-50 text-orange-700" :
                                                    selectedItem?.status === 'Requested' ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"
                                                }`}>
                                                {selectedItem?.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Quantity</Label>
                                        <div className="mt-2 text-xl font-black text-gray-900">{selectedItem?.quantity} Units</div>
                                    </div>
                                </div>

                                {selectedItem?.isRequisition && (
                                    <>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div>
                                                <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Target Section</Label>
                                                <div className="mt-2 font-bold text-gray-700">{selectedItem?.targetClassString || "N/A"}</div>
                                            </div>
                                            <div>
                                                <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Required By</Label>
                                                <div className="mt-2 font-bold text-gray-700">{selectedItem?.requiredDate ? new Date(selectedItem.requiredDate).toLocaleDateString() : "ASAP"}</div>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Justification</Label>
                                            <div className="mt-2 p-4 bg-gray-50 rounded-2xl text-sm font-medium text-gray-600 leading-relaxed italic">
                                                "{selectedItem?.description || "No description provided."}"
                                            </div>
                                        </div>
                                        {selectedItem?.logisticsRemark && (
                                            <div>
                                                <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400 text-indigo-500">Logistics Response</Label>
                                                <div className="mt-2 p-4 bg-indigo-50 rounded-2xl text-sm font-medium text-indigo-700 leading-relaxed">
                                                    {selectedItem.logisticsRemark}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <DialogFooter className="bg-gray-50 p-6 border-t">
                                <Button className="w-full h-12 bg-gray-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-gray-800" onClick={() => setSelectedItem(null)}>
                                    Close Details
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden group">
                        <CardContent className="p-8 flex items-center gap-6 relative z-10">
                            <div className="p-4 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
                                <Package className="w-8 h-8 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-4xl font-black">{inPossessionCount}</h3>
                                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mt-1">Active Custody</p>
                            </div>
                        </CardContent>
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Boxes className="h-32 w-32" />
                        </div>
                    </Card>
                    <Card className="border-none shadow-xl shadow-indigo-100/30 ring-1 ring-gray-100 rounded-2xl p-8 flex items-center gap-6">
                        <div className="p-4 bg-orange-50 rounded-2xl">
                            <AlertTriangle className="w-8 h-8 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-gray-900">{lowStockCount}</h3>
                            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mt-1">Depletion Alerts</p>
                        </div>
                    </Card>
                    <Card className="border-none shadow-xl shadow-indigo-100/30 ring-1 ring-gray-100 rounded-2xl p-8 flex items-center gap-6">
                        <div className="p-4 bg-emerald-50 rounded-2xl">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-gray-900">{items.length}</h3>
                            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mt-1">Total Assets</p>
                        </div>
                    </Card>
                </div>

                <Card className="border-none shadow-2xl shadow-indigo-100/30 ring-1 ring-gray-100 rounded-2xl overflow-hidden bg-white">
                    <CardHeader className="bg-white border-b py-8 px-8 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black tracking-tight text-gray-800 uppercase italic flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-indigo-600" /> Issued Material Logs
                            </CardTitle>
                            <CardDescription className="italic font-medium">Complete audit trail of institutional assets under your jurisdiction.</CardDescription>
                        </div>
                        <Sparkles className="h-5 w-5 text-indigo-400 opacity-50" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b h-16">
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 pl-8">Resource Identifier</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500">Classification</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500">Volume</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500">Operational Status</TableHead>
                                        <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-gray-500 pr-8">Context</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.length > 0 ? items.map((item, index) => (
                                        <TableRow key={item._id || index} className="group hover:bg-indigo-50/30 transition-all border-b border-gray-50">
                                            <TableCell className="pl-8 py-6">
                                                <div className="space-y-1">
                                                    <p className="font-black text-gray-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors italic">{item.itemName}</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">UID: {item._id ? item._id.slice(-8).toUpperCase() : 'LEGACY-' + Math.floor(Math.random() * 1000)}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="border-indigo-100 bg-white font-black text-indigo-600 h-6 px-3 rounded-lg uppercase tracking-tighter text-[10px]">{item.category}</Badge>
                                            </TableCell>
                                            <TableCell className="font-black text-gray-600">x{item.quantity || 1}</TableCell>
                                            <TableCell>
                                                <Badge className={`h-8 px-4 rounded-xl font-black uppercase text-[10px] border-none shadow-sm ${item.status === 'Available' || item.status === 'In Possession' ? "bg-emerald-50 text-emerald-700" :
                                                    item.status === 'Low Stock' ? "bg-orange-50 text-orange-700" :
                                                        item.status === 'Requested' ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"
                                                    }`}>
                                                    {item.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 rounded-xl" onClick={() => setSelectedItem(item)}>
                                                    <ChevronRight className="h-5 w-5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="p-20 text-center">
                                                <div className="space-y-4">
                                                    <div className="h-16 w-16 bg-gray-50 rounded-2xl mx-auto flex items-center justify-center opacity-50">
                                                        <Boxes className="h-8 w-8 text-gray-300" />
                                                    </div>
                                                    <p className="text-sm font-black text-gray-300 uppercase tracking-widest italic">No Institutional Assets Logged.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
