"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Trash2, Home, Copy, FileText, Printer, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

export default function StudentHouse() {
    const [houses, setHouses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newHouse, setNewHouse] = useState({ name: "", master: "", description: "" })

    const fetchHouses = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/student-houses`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (!res.ok) throw new Error("Failed to fetch houses")
            const data = await res.json()
            setHouses(data.data || [])
        } catch (error) {
            console.error(error)
            toast.error("Failed to load houses")
        } finally {
            setLoading(false)
        }
    }

    const handleAddHouse = async () => {
        if (!newHouse.name.trim()) return;
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/student-houses`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newHouse)
            })
            if (!res.ok) throw new Error("Failed to add house")
            toast.success("House added")
            setNewHouse({ name: "", master: "", description: "" })
            fetchHouses()
        } catch (error) {
            console.error(error)
            toast.error("Failed to add house")
        }
    }

    const handleDeleteHouse = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/student-houses/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (!res.ok) throw new Error("Failed to delete")
            toast.success("House deleted")
            fetchHouses()
        } catch (error) {
            toast.error("Failed to delete")
        }
    }

    useEffect(() => {
        fetchHouses()
    }, [])

    return (
        <DashboardLayout title="Student House">
            <div className="flex flex-col xl:flex-row gap-6">
                {/* Add House Form */}
                <Card className="xl:w-1/3 h-fit">
                    <CardHeader className="bg-pink-50 border-b border-pink-100 py-3">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800 font-normal">
                            <Edit className="h-5 w-5" /> Add Student House
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-red-500">Name *</Label>
                            <Input
                                placeholder="Enter name"
                                className="bg-white border-gray-200"
                                value={newHouse.name}
                                onChange={(e) => setNewHouse({ ...newHouse, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Master</Label>
                            <Input
                                placeholder="Enter master name"
                                className="bg-white border-gray-200"
                                value={newHouse.master}
                                onChange={(e) => setNewHouse({ ...newHouse, master: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                className="bg-white border-gray-200 min-h-[100px]"
                                value={newHouse.description}
                                onChange={(e) => setNewHouse({ ...newHouse, description: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button
                                className="bg-[#1e1e50] hover:bg-[#151538] text-white"
                                onClick={handleAddHouse}
                                disabled={!newHouse.name.trim()}
                            >
                                Save
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* House List */}
                <Card className="xl:w-2/3">
                    <CardHeader className="bg-pink-50 border-b border-pink-100 py-3">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800 font-normal">
                            <Home className="h-5 w-5" /> Student House List
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1e1e50] text-white hover:bg-[#151538] border-none" onClick={() => navigator.clipboard.writeText(JSON.stringify(houses))}><Copy className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1e1e50] text-white hover:bg-[#151538] border-none" onClick={() => {
                                    const csv = "ID,Name,Master,Description\n" + houses.map(h => `${h._id},${h.name},${h.master},${h.description}`).join("\n");
                                    const blob = new Blob([csv], { type: "text/csv" });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.download = "houses.csv";
                                    document.body.appendChild(link);
                                    link.click();
                                }}><FileText className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1e1e50] text-white hover:bg-[#151538] border-none" onClick={() => window.print()}><Printer className="h-4 w-4" /></Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Search:</span>
                                <Input className="w-48 h-8" />
                            </div>
                        </div>

                        <div className="overflow-x-auto border rounded-md">
                            <Table>
                                <TableHeader className="bg-pink-50">
                                    <TableRow className="uppercase text-xs font-bold text-gray-700">
                                        <TableHead className="w-16">ID</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>Master</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                                            </TableCell>
                                        </TableRow>
                                    ) : houses.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-gray-500">No houses found</TableCell>
                                        </TableRow>
                                    ) : (
                                        houses.map((house, index) => (
                                            <TableRow key={house._id} className="text-sm hover:bg-gray-50">
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{house.name}</TableCell>
                                                <TableCell>{house.master}</TableCell>
                                                <TableCell>{house.description}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button size="sm" className="bg-[#1e1e50] text-white hover:bg-[#151538] h-7 px-2">
                                                                Action <span className="ml-1">▼</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>
                                                                <Edit className="h-4 w-4 mr-2" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteHouse(house._id)}>
                                                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
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
