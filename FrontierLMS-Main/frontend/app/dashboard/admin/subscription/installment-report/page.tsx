
"use client"
import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Search,
    Copy,
    FileSpreadsheet,
    FileText,
    Printer,
    Columns,
    CalendarDays
} from "lucide-react"

interface Installment {
    id: number
    date: string
    amount: number
    status: string
}

const initialInstallments: Installment[] = []

export default function InstallmentReportPage() {
    const [installments, setInstallments] = useState<Installment[]>(initialInstallments)
    const [searchTerm, setSearchTerm] = useState("")


    // ... imports

    useEffect(() => {
        const fetchInstallments = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch(`${API_URL}/api/fees`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const mappedData = data.map((item: any) => ({
                        id: item._id,
                        date: item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A',
                        amount: item.amount,
                        status: item.status
                    }));
                    setInstallments(mappedData);
                }
            } catch (error) {
                console.error("Failed to fetch installments", error);
            }
        };

        fetchInstallments();
    }, []);

    const filteredInstallments = installments.filter(item =>
        item.date.includes(searchTerm) ||
        item.status.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout title="Installment Report">
            <div className="space-y-6">
                <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <span className="p-2 bg-primary/10 rounded-md">
                            <CalendarDays className="w-5 h-5 text-primary" />
                        </span>
                        Installment Report
                    </h1>
                    <div className="text-sm text-muted-foreground">
                        Subscription / Installment Report
                    </div>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                        <CardTitle className="text-lg font-medium">Installment Report</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="icon" title="Copy">
                                    <Copy size={16} />
                                </Button>
                                <Button variant="outline" size="icon" title="Excel">
                                    <FileSpreadsheet size={16} />
                                </Button>
                                <Button variant="outline" size="icon" title="CSV">
                                    <FileText size={16} />
                                </Button>
                                <Button variant="outline" size="icon" title="PDF">
                                    <FileText size={16} />
                                </Button>
                                <Button variant="outline" size="icon" title="Print">
                                    <Printer size={16} />
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="gap-2">
                                            <Columns size={16} />
                                            Column visibility
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuCheckboxItem checked>Date</DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem checked>Amount</DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem checked>Status</DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem checked>Action</DropdownMenuCheckboxItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Search:</span>
                                <Input
                                    className="w-48 sm:w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-[80px]">#</TableHead>
                                        <TableHead>DATE</TableHead>
                                        <TableHead>AMOUNT</TableHead>
                                        <TableHead>STATUS</TableHead>
                                        <TableHead className="text-right">ACTION</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInstallments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                No matching records found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredInstallments.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell className="font-medium">{item.date}</TableCell>
                                                <TableCell>{item.amount}</TableCell>
                                                <TableCell>
                                                    <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs">
                                                        {item.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {/* Empty action column as per screenshot */}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                            <div>Showing {filteredInstallments.length > 0 ? 1 : 0} to {filteredInstallments.length} of {filteredInstallments.length} entries</div>
                            <div className="flex gap-1">
                                <Button variant="outline" size="sm" disabled>Previous</Button>
                                <Button variant="default" size="sm" className="bg-[#1e1b4b]">1</Button>
                                <Button variant="outline" size="sm" disabled>Next</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
