"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Pencil, List, Download, FileText, Printer, Grid, Columns, User, Phone, Mail, MapPin } from "lucide-react"

export default function ItemSupplierPage() {
    return (
        <DashboardLayout title="Item Supplier">
            <div className="flex flex-col xl:flex-row gap-6">
                {/* Left Column: Add / Edit Form */}
                <div className="w-full xl:w-[400px] flex-shrink-0">
                    <Card className="border-t-4 border-t-[#1a237e] shadow-sm">
                        <CardHeader className="bg-pink-50/50 py-4 border-b">
                            <CardTitle className="text-base font-bold flex items-center gap-2 text-[#1a237e]">
                                <Pencil className="h-4 w-4" />
                                Add / Edit Item Supplier
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Name <span className="text-red-500">*</span>
                                </Label>
                                <Input placeholder="Enter Item Supplier Name" className="bg-muted/10 h-10" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Phone
                                </Label>
                                <Input placeholder="Enter Item Supplier Phone" className="bg-muted/10 h-10" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Email
                                </Label>
                                <Input placeholder="Enter Item Supplier Email" className="bg-muted/10 h-10" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Address
                                </Label>
                                <Textarea className="bg-muted/10 min-h-[80px]" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Contact Person Name
                                </Label>
                                <Input placeholder="Enter Item Supplier Contact Person Name" className="bg-muted/10 h-10" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Contact Person Phone
                                </Label>
                                <Input placeholder="Enter Item Supplier Contact Person Phone" className="bg-muted/10 h-10" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Contact Person Email
                                </Label>
                                <Input placeholder="Enter Item Supplier Contact Person Email" className="bg-muted/10 h-10" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Description
                                </Label>
                                <Textarea className="bg-muted/10 min-h-[80px]" />
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button className="bg-[#1a237e] hover:bg-[#1a237e]/90 text-white min-w-[80px]">
                                    Save
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: List */}
                <div className="flex-1">
                    <Card className="border-t-4 border-t-[#1a237e] shadow-sm">
                        <CardHeader className="bg-pink-50/50 py-4 border-b">
                            <CardTitle className="text-base font-bold flex items-center gap-2 text-[#1a237e]">
                                <List className="h-4 w-4" />
                                Item Supplier List
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            {/* Table Toolbar */}
                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                <div className="flex gap-1">
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-[#1a237e] hover:bg-[#1a237e]/90 text-white border-none rounded-sm">
                                        <FileText className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-[#1a237e] hover:bg-[#1a237e]/90 text-white border-none rounded-sm">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-[#1a237e] hover:bg-[#1a237e]/90 text-white border-none rounded-sm">
                                        <Printer className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-[#1a237e] hover:bg-[#1a237e]/90 text-white border-none rounded-sm">
                                        <Grid className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8 text-[#1a237e] border-[#1a237e]/20 gap-2">
                                        <Columns className="h-3 w-3" />
                                        Column visibility
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Search:</span>
                                    <Input className="h-8 w-[150px] lg:w-[200px]" />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader className="bg-pink-50/50">
                                        <TableRow>
                                            <TableHead className="font-bold text-[#1a237e]">ITEM SUPPLIER</TableHead>
                                            <TableHead className="font-bold text-[#1a237e]">CONTACT PERSON</TableHead>
                                            <TableHead className="font-bold text-[#1a237e]">ADDRESS</TableHead>
                                            <TableHead className="font-bold text-[#1a237e] w-[100px] text-right">ACTION</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[
                                            { name: "ABC-Suplier", person: "", address: "" },
                                            { name: "Al Shakad", person: "", address: "" },
                                            { name: "Arusha Card Centre", phone: "0784786017", person: "Kassim Arusha Card", personPhone: "0784786017", address: "" },
                                            { name: "Babulal Prajapat", phone: "123456958", email: "kpsedu.office@gmail.com", person: "", address: "" },
                                            { name: "Bajuta International Tanzania", phone: "0754266810", person: "Bajuta", personPhone: "0754266810", address: "" },
                                        ].map((row, i) => (
                                            <TableRow key={i} className="hover:bg-muted/50">
                                                <TableCell className="align-top">
                                                    <div className="font-medium flex items-center gap-2">
                                                        <User className="h-3 w-3 text-muted-foreground" /> {row.name}
                                                    </div>
                                                    {row.phone && (
                                                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                                            <Phone className="h-3 w-3" /> {row.phone}
                                                        </div>
                                                    )}
                                                    {row.email && (
                                                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                                            <Mail className="h-3 w-3" /> {row.email}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="align-top">
                                                    {row.person && (
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-3 w-3 text-muted-foreground" /> {row.person}
                                                        </div>
                                                    )}
                                                    {row.personPhone && (
                                                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                                            <Phone className="h-3 w-3" /> {row.personPhone}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="align-top">
                                                    {row.address && <MapPin className="h-3 w-3 text-muted-foreground" />}
                                                </TableCell>
                                                <TableCell className="text-right align-top">
                                                    <Button size="sm" className="bg-[#1a237e] hover:bg-[#1a237e]/90 h-8">Action</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between pt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing 1 to 10 of 33 entries
                                </div>
                                <div className="space-x-2">
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>&lt;</Button>
                                    <Button size="sm" className="h-8 w-8 p-0 bg-[#1a237e] text-white hover:bg-[#1a237e]/90">1</Button>
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">2</Button>
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">3</Button>
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">4</Button>
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">&gt;</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
