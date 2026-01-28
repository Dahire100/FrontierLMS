"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"
import { Award, FileSignature, Download, Printer, Search, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function CertificatePage() {
    const { toast } = useToast()
    const [isGenerateOpen, setIsGenerateOpen] = useState(false)
    const [certificates, setCertificates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [classes, setClasses] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])

    const fetchCertificates = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }
            const res = await fetch(`${API_URL}/api/teacher/certificates?t=${Date.now()}`, { headers })
            const data = await res.json()
            if (data.success) {
                setCertificates(data.data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/teacher/classes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) setClasses(data.data)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchStudents = async (classId: string) => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/teacher/classes/${classId}/students`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) setStudents(data.data.students || [])
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchCertificates()
        fetchClasses()
    }, [])

    const [formData, setFormData] = useState({
        studentId: '',
        classId: '',
        type: '',
        reason: '',
        date: new Date().toISOString().split('T')[0]
    })

    const handleInputChange = (e: any) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleClassChange = (val: string) => {
        setFormData(prev => ({ ...prev, classId: val, studentId: '' }))
        fetchStudents(val)
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleGenerate = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/teacher/certificates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.success) {
                toast({
                    title: "Certificate Generated",
                    description: `Certificate generated successfully.`,
                })
                setIsGenerateOpen(false)
                fetchCertificates()
                setFormData({ studentId: '', classId: '', type: '', reason: '', date: new Date().toISOString().split('T')[0] })
            } else {
                toast({ title: "Error", description: "Failed to generate certificate", variant: "destructive" })
            }
        } catch (err) {
            toast({ title: "Error", description: "Network error", variant: "destructive" })
        }
    }

    const handlePrint = (cert: any) => {
        const studentName = cert.studentId ? `${cert.studentId.firstName} ${cert.studentId.lastName}` : (cert.studentName || 'Student Name');
        const courseName = cert.reason || "General Proficiency";
        const date = new Date(cert.issuedDate || cert.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const certId = cert.certificateNumber || cert._id;
        const issuer = cert.issuedBy || "School Administration";

        const printWindow = window.open('', '', 'width=1123,height=794');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Certificate - ${studentName}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&family=Great+Vibes&display=swap" rel="stylesheet">
                    <style>
                        @page { size: A4 landscape; margin: 0; }
                        body { 
                            margin: 0; 
                            padding: 0; 
                            font-family: 'Lato', sans-serif; 
                            -webkit-print-color-adjust: exact;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            background-color: #f5f5f5;
                        }
                        .certificate-container {
                            width: 1122px; 
                            height: 793px; 
                            background: white;
                            position: relative;
                            box-sizing: border-box;
                            box-shadow: 0 0 20px rgba(0,0,0,0.1);
                            overflow: hidden; 
                        }
                        .border-pattern {
                            position: absolute;
                            top: 15px; left: 15px; right: 15px; bottom: 15px;
                            border: 3px solid #1a237e;
                        }
                        .border-pattern::before {
                            content: '';
                            position: absolute;
                            top: 5px; left: 5px; right: 5px; bottom: 5px;
                            border: 1px solid #c5a47e;
                        }
                        .content {
                            position: relative;
                            z-index: 10;
                            height: 100%;
                            display: flex;
                            flex-direction: column;
                            padding: 50px 80px; 
                            box-sizing: border-box;
                        }
                        .header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 20px;
                        }
                        .school-name {
                            font-family: 'Playfair Display', serif;
                            font-weight: 700;
                            font-size: 26px;
                            color: #1a237e;
                            text-transform: uppercase;
                            letter-spacing: 2px;
                        }
                        .logo-box {
                            width: 50px;
                            height: 50px;
                            background: #1a237e;
                            color: white;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: bold;
                            font-family: 'Playfair Display', serif;
                            font-size: 24px;
                        }
                        .main-body {
                            flex-grow: 1;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            text-align: left; 
                            margin-top: -20px; 
                        }
                        .cert-title {
                            font-family: 'Lato', sans-serif;
                            font-weight: 700;
                            font-size: 14px;
                            text-transform: uppercase;
                            letter-spacing: 4px;
                            color: #555;
                            margin-bottom: 30px;
                        }
                        .cert-text-intro {
                            font-size: 18px;
                            color: #666;
                            margin-bottom: 15px;
                            font-style: italic;
                        }
                        .cert-name {
                            font-family: 'Playfair Display', serif;
                            font-weight: 700;
                            font-size: 64px; 
                            color: #1a237e;
                            line-height: 1.1;
                            margin-bottom: 30px;
                        }
                        .cert-text-body {
                            font-size: 20px;
                            color: #444;
                            line-height: 1.6;
                            max-width: 85%;
                        }
                        .course-name {
                            font-weight: 700;
                            color: #000;
                            border-bottom: 1px solid #ddd;
                        }
                        .footer {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-end;
                            margin-bottom: 20px; 
                            position: relative;
                        }
                        .signature-block {
                            text-align: left;
                            min-width: 200px;
                        }
                        .signature-img {
                            font-family: 'Great Vibes', cursive;
                            font-size: 36px; 
                            color: #1a237e;
                            height: 50px; 
                            display: flex;
                            align-items: flex-end;
                            margin-bottom: 5px;
                        }
                        .signature-line {
                            width: 100%;
                            height: 1px;
                            background-color: #ccc;
                            margin-bottom: 10px;
                        }
                        .signatory-name {
                            font-weight: 700;
                            font-size: 14px;
                            color: #333;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                        }
                        .signatory-title {
                            font-size: 11px;
                            color: #777;
                            letter-spacing: 0.5px;
                        }
                        .seal {
                            width: 110px;
                            height: 110px;
                            border: 3px solid #c5a47e;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            position: absolute;
                            bottom: 10px;
                            right: 40px; 
                            color: #c5a47e;
                            font-family: 'Playfair Display', serif;
                            font-weight: bold;
                            text-align: center;
                            font-size: 12px;
                            letter-spacing: 1px;
                            transform: rotate(-10deg);
                            opacity: 0.9;
                            background: white; 
                            box-shadow: 0 0 10px rgba(197, 164, 126, 0.1);
                        }
                        .cert-id {
                            position: absolute;
                            bottom: 20px;
                            left: 0; 
                            right: 0;
                            text-align: center;
                            font-size: 9px;
                            color: #aaa;
                            letter-spacing: 1px;
                        }
                    </style>
                </head>
                <body>
                    <div class="certificate-container">
                        <div class="border-pattern"></div>
                        <div class="content">
                            <div class="header">
                                <div class="logo-box">F</div>
                                <div class="school-name">Frontier School of Excellence</div>
                            </div>
                            
                            <div class="main-body">
                                <div class="cert-title">Certificate of ${cert.certificateType || cert.type || 'Completion'}</div>
                                <div class="cert-text-intro">This is to certify that</div>
                                <div class="cert-name">${studentName}</div>
                                <div class="cert-text-body">
                                    has successfully completed the requirements for<br>
                                    <span class="course-name">${courseName}</span>
                                </div>
                            </div>

                            <div class="footer">
                                <div class="signature-block">
                                    <div class="signature-img">${issuer}</div>
                                    <div class="signature-line"></div>
                                    <div class="signatory-name">${issuer}</div>
                                    <div class="signatory-title">Class Teacher</div>
                                </div>
                                <div class="seal">
                                    OFFICIAL<br>SEAL<br>${new Date().getFullYear()}
                                </div>
                                <div class="signature-block" style="text-align: right; align-items: flex-end; display: flex; flex-direction: column;">
                                    <div class="signature-img">Jane Doe</div>
                                    <div class="signature-line"></div>
                                    <div class="signatory-name">Jane Doe</div>
                                    <div class="signatory-title">Principal</div>
                                </div>
                            </div>
                        </div>
                        <div class="cert-id">Certificate ID: ${certId} &nbsp;&bull;&nbsp; Issued on ${date}</div>
                    </div>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    }

    return (
        <DashboardLayout title="Certificate">
            <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Certificates</h1>
                        <p className="text-gray-500 mt-1">Generate and manage student certificates.</p>
                    </div>

                    <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700">
                                <Plus className="w-4 h-4 mr-2" /> Generate Certificate
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                            <DialogHeader>
                                <DialogTitle>Generate Certificate</DialogTitle>
                                <DialogDescription>Fill in the details to generate a new certificate.</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Class</Label>
                                    <Select onValueChange={handleClassChange}>
                                        <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                                        <SelectContent>
                                            {classes.map((cls) => (
                                                <SelectItem key={cls._id} value={cls._id}>Class {cls.name}-{cls.section}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Student</Label>
                                    <Select onValueChange={(val) => handleSelectChange('studentId', val)} disabled={!formData.classId}>
                                        <SelectTrigger><SelectValue placeholder="Select Student" /></SelectTrigger>
                                        <SelectContent>
                                            {students.map((student) => (
                                                <SelectItem key={student._id} value={student._id}>{student.firstName} {student.lastName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Certificate Type</Label>
                                    <Select onValueChange={(val) => handleSelectChange('type', val)}>
                                        <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="merit">Merit Certificate</SelectItem>
                                            <SelectItem value="participation">Participation</SelectItem>
                                            <SelectItem value="conduct">Character/Conduct</SelectItem>
                                            <SelectItem value="completion">Course Completion</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Issue Date</Label>
                                    <Input type="date" name="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Reason / Remarks</Label>
                                    <Textarea name="reason" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Reason for certification..." />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>Cancel</Button>
                                <Button className="bg-indigo-600" onClick={handleGenerate}>Generate & Print</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-yellow-50 border-yellow-100">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 rounded-lg text-yellow-700">
                                <Award className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">24</h3>
                                <p className="text-yellow-800 font-medium text-sm">Certificates Issued (YTD)</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-indigo-50 border-indigo-100">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 rounded-lg text-indigo-700">
                                <FileSignature className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">5</h3>
                                <p className="text-indigo-800 font-medium text-sm">Available Templates</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Issued History</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input placeholder="Search..." className="pl-9" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Issue Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">Loading certificates...</TableCell>
                                    </TableRow>
                                ) : certificates.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">No certificates found</TableCell>
                                    </TableRow>
                                ) : (
                                    certificates.map((cert: any) => (
                                        <TableRow key={cert._id || cert.id}>
                                            <TableCell className="font-medium text-indigo-600">CERT-{cert.certificateNumber?.substr(-4) || cert._id?.substr(-4)}</TableCell>
                                            <TableCell className="font-medium">
                                                {cert.studentId ? `${cert.studentId.firstName} ${cert.studentId.lastName}` : (cert.studentName || 'Unknown')}
                                            </TableCell>
                                            <TableCell>
                                                {cert.studentId?.class ? `${cert.studentId.class}-${cert.studentId.section}` : (cert.class || '-')}
                                            </TableCell>
                                            <TableCell className="capitalize">{cert.certificateType || cert.type}</TableCell>
                                            <TableCell>{new Date(cert.issuedDate || cert.date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={cert.status === 'Issued' ? 'default' : 'secondary'} className={cert.status === 'Issued' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                                    {cert.status || 'Issued'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handlePrint(cert)}><Printer className="h-4 w-4" /></Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handlePrint(cert)}><Download className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
