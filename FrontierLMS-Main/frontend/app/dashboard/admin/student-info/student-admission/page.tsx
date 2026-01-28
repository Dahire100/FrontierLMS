"use client"

import { API_URL } from "@/lib/api-config"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { FileText, Upload, Download, Plus, ChevronUp, ChevronDown } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

export default function StudentAdmission() {
    const { toast } = useToast()
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [importFile, setImportFile] = useState<File | null>(null)
    const [importing, setImporting] = useState(false)
    const [importedData, setImportedData] = useState<any[] | null>(null)
    const [classes, setClasses] = useState<{ id: string, name: string }[]>([])
    const [sections, setSections] = useState<{ id: string, name: string }[]>([])
    const [studentPhoto, setStudentPhoto] = useState<File | null>(null)
    const [studentPhotoPreview, setStudentPhotoPreview] = useState<string | null>(null)
    const [fatherPhoto, setFatherPhoto] = useState<File | null>(null)
    const [fatherPhotoPreview, setFatherPhotoPreview] = useState<string | null>(null)
    const [motherPhoto, setMotherPhoto] = useState<File | null>(null)
    const [motherPhotoPreview, setMotherPhotoPreview] = useState<string | null>(null)
    const [guardianPhoto, setGuardianPhoto] = useState<File | null>(null)
    const [guardianPhotoPreview, setGuardianPhotoPreview] = useState<string | null>(null)

    const { register, handleSubmit, control, reset, setValue, watch } = useForm()
    const watchedDocuments = watch("documents")

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token')
            try {
                const [classRes, secRes] = await Promise.all([
                    fetch(`${API_URL}/api/classes`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_URL}/api/sections`, { headers: { Authorization: `Bearer ${token}` } })
                ])
                if (classRes.ok) {
                    const data = await classRes.json()
                    // Handle structure array or {data: []}
                    const items = Array.isArray(data) ? data : (data.data || [])
                    setClasses(items.map((c: any) => ({
                        id: c.className || c.name, // robust mapping
                        name: c.className || c.name
                    })))
                }
                if (secRes.ok) {
                    const data = await secRes.json()
                    const items = Array.isArray(data) ? data : (data.data || [])
                    setSections(items.map((s: any) => ({ id: s.name, name: s.name })))
                }
            } catch (e) { console.error(e) }
        }
        fetchData()
    }, [])

    const onSubmit = async (data: any) => {
        try {
            const token = localStorage.getItem('token')

            const formData = new FormData()

            // Append basic fields
            Object.keys(data).forEach(key => {
                if (key !== 'documents' && data[key] !== undefined && data[key] !== null) {
                    formData.append(key, String(data[key]))
                }
            })

            // Computed fields
            formData.append('name', `${data.firstName || ''} ${data.lastName || ''}`)
            formData.append('parentName', data.fatherName || data.guardianName || data.motherName || '')
            formData.append('address', data.currentAddress || '')
            if (data.routeId) formData.append('transportRoute', data.routeId)
            if (data.hostelId) formData.append('hostelName', data.hostelId)

            // Append Student Photo
            if (studentPhoto) {
                formData.append('studentPhoto', studentPhoto)
            }
            if (fatherPhoto) {
                formData.append('fatherPhoto', fatherPhoto)
            }
            if (motherPhoto) {
                formData.append('motherPhoto', motherPhoto)
            }
            if (guardianPhoto) {
                formData.append('guardianPhoto', guardianPhoto)
            }

            // Append Documents
            if (data.documents) {
                Object.keys(data.documents).forEach(docId => {
                    const fileList = data.documents[docId]
                    if (fileList && fileList.length > 0) {
                        formData.append(`doc_${docId}`, fileList[0])
                    }
                })
            }

            const res = await fetch(`${API_URL}/api/students`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || "Failed to admit student")
            }

            toast({ title: "Success", description: "Student admitted successfully" })
            reset()
            setStudentPhoto(null)
            setStudentPhotoPreview(null)
            window.scrollTo(0, 0)
        } catch (error: any) {
            console.error(error)
            toast({ variant: "destructive", title: "Error", description: error.message || "Something went wrong" })
        }
    }

    const downloadCredentials = () => {
        if (!importedData) return

        const headers = ['Student Name', 'Student ID', 'Student Email', 'Student Password', 'Parent Name', 'Parent Email', 'Parent Password']
        const csvContent = [
            headers.join(','),
            ...importedData.map(row => [
                row.name,
                row.studentId,
                row.studentCreds?.email || '',
                row.studentCreds?.password || '',
                row.parentName || '',
                row.parentCreds?.email || '',
                row.parentCreds?.password || ''
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'student_credentials.csv'
        a.click()
    }

    const downloadSampleCsv = () => {
        const headers = ['firstName', 'lastName', 'class', 'section', 'gender', 'dateOfBirth', 'parentName', 'parentPhone', 'email', 'phone', 'address', 'parentEmail']
        const sampleRow = ['John', 'Doe', 'Class 1', 'A', 'Male', '2015-05-12', 'Michael Doe', '9876543210', 'student@example.com', '1234567890', '123 Main St', 'parent@example.com']

        const csvContent = [
            headers.join(','),
            sampleRow.join(',')
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'student_import_sample.csv'
        a.click()
    }

    const downloadAdmissionForm = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Student Admission Form</title>
                <style>
                    body { font-family: 'Times New Roman', serif; padding: 40px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
                    .school-name { font-size: 24px; font-weight: bold; text-transform: uppercase; }
                    .form-title { font-size: 18px; font-weight: bold; margin-top: 10px; text-decoration: underline; }
                    .section { margin-bottom: 25px; }
                    .section-title { font-size: 16px; font-weight: bold; background: #eee; padding: 5px; margin-bottom: 15px; border: 1px solid #000; }
                    .row { display: flex; flex-wrap: wrap; margin-bottom: 10px; }
                    .col { flex: 1; min-width: 200px; margin-right: 15px; margin-bottom: 10px; }
                    .label { font-size: 14px; font-weight: bold; display: block; margin-bottom: 5px; }
                    .input-line { border-bottom: 1px dotted #000; height: 20px; width: 100%; display: block; }
                    .photo-box { border: 1px solid #000; width: 120px; height: 140px; display: flex; align-items: center; justify-content: center; float: right; margin-left: 20px; margin-bottom: 20px; }
                    .clearfix::after { content: ""; clear: both; display: table; }
                    .footer { margin-top: 50px; text-align: center; font-size: 12px; }
                    .signature-row { display: flex; justify-content: space-between; margin-top: 60px; }
                    .signature-line { border-top: 1px solid #000; width: 200px; padding-top: 5px; text-align: center; }
                    @media print {
                        body { -webkit-print-color-adjust: exact; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="school-name">FRONTIER PUBLIC SCHOOL</div>
                    <div>123, Education Lane, Knowledge City, State - 400001</div>
                    <div>Phone: +91 98765 43210 | Email: info@frontier.edu</div>
                    <div class="form-title">STUDENT ADMISSION FORM</div>
                </div>

                <div class="section clearfix">
                    <div class="photo-box">Passport Photo</div>
                    <div class="row">
                        <div class="col"><span class="label">Admission No:</span><span class="input-line"></span></div>
                        <div class="col"><span class="label">Date:</span><span class="input-line"></span></div>
                    </div>
                    <div class="row">
                        <div class="col"><span class="label">Class:</span><span class="input-line"></span></div>
                        <div class="col"><span class="label">Section:</span><span class="input-line"></span></div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">STUDENT DETAILS</div>
                    <div class="row">
                        <div class="col"><span class="label">First Name:</span><span class="input-line"></span></div>
                        <div class="col"><span class="label">Last Name:</span><span class="input-line"></span></div>
                    </div>
                    <div class="row">
                        <div class="col"><span class="label">Date of Birth:</span><span class="input-line"></span></div>
                        <div class="col"><span class="label">Gender:</span><span class="input-line"></span></div>
                        <div class="col"><span class="label">Blood Group:</span><span class="input-line"></span></div>
                    </div>
                    <div class="row">
                        <div class="col"><span class="label">Religion:</span><span class="input-line"></span></div>
                        <div class="col"><span class="label">Caste:</span><span class="input-line"></span></div>
                        <div class="col"><span class="label">Category:</span><span class="input-line"></span></div>
                    </div>
                    <div class="row">
                        <div class="col"><span class="label">Aadhar No:</span><span class="input-line"></span></div>
                        <div class="col"><span class="label">Mobile No:</span><span class="input-line"></span></div>
                    </div>
                    <div class="row">
                        <div class="col"><span class="label">Email:</span><span class="input-line"></span></div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">PARENT / GUARDIAN DETAILS</div>
                    <div class="row">
                        <div class="col"><span class="label">Father's Name:</span><span class="input-line"></span></div>
                        <div class="col"><span class="label">Occupation:</span><span class="input-line"></span></div>
                        <div class="col"><span class="label">Phone:</span><span class="input-line"></span></div>
                    </div>
                    <div class="row">
                        <div class="col"><span class="label">Mother's Name:</span><span class="input-line"></span></div>
                        <div class="col"><span class="label">Occupation:</span><span class="input-line"></span></div>
                        <div class="col"><span class="label">Phone:</span><span class="input-line"></span></div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">ADDRESS DETAILS</div>
                    <div class="row">
                        <div class="col" style="flex: 2;"><span class="label">Current Address:</span><div class="input-line"></div><div class="input-line" style="margin-top:5px;"></div></div>
                    </div>
                    <div class="row">
                        <div class="col" style="flex: 2;"><span class="label">Permanent Address:</span><div class="input-line"></div><div class="input-line" style="margin-top:5px;"></div></div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">PREVIOUS SCHOOL DETAILS</div>
                    <div class="row">
                        <div class="col"><span class="label">Last School Name:</span><span class="input-line"></span></div>
                    </div>
                    <div class="row">
                        <div class="col"><span class="label">Last Class Passed:</span><span class="input-line"></span></div>
                        <div class="col"><span class="label">Year of Passing:</span><span class="input-line"></span></div>
                        <div class="col"><span class="label">Percentage/Grade:</span><span class="input-line"></span></div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">DECLARATION</div>
                    <p style="font-size: 14px; text-align: justify; line-height: 1.5;">
                        I hereby declare that the information provided above is true and correct to the best of my knowledge and belief. 
                        I understand that any incorrect information may lead to the cancellation of admission. I agree to abide by the rules 
                        and regulations of the school.
                    </p>
                </div>

                <div class="signature-row">
                    <div class="signature-line">Signature of Parent/Guardian</div>
                    <div class="signature-line">Signature of Principal</div>
                </div>

                <div class="footer">
                    <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; font-size: 16px; cursor: pointer;">Print Form</button>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImportFile(e.target.files[0])
        }
    }

    const processImport = async () => {
        if (!importFile) return

        setImporting(true)
        try {
            const text = await importFile.text()
            const rows = text.split('\n').filter(r => r.trim() !== '')
            const headers = rows[0].split(',').map(h => h.trim())

            const students = rows.slice(1).map(row => {
                const values = row.split(',').map(v => v.trim())
                const student: any = {}
                headers.forEach((header, index) => {
                    student[header] = values[index]
                })
                return student
            })

            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/students/import`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ students })
            })

            const data = await response.json()

            if (response.ok) {
                toast({
                    title: "Import Successful",
                    description: `Imported ${data.results.success} students. Failed: ${data.results.failed}`
                })
                setImportedData(data.results.importedData)
                // Don't close modal yet, let them download credentials
                // setIsImportOpen(false) 
                setImportFile(null)
            } else {
                throw new Error(data.error || 'Import failed')
            }
        } catch (error: any) {
            console.error('Import error:', error)
            toast({ title: "Import Failed", description: error.message, variant: "destructive" })
        } finally {
            setImporting(false)
        }
    }

    return (
        <DashboardLayout title="Student Admission">
            <div className="space-y-6">
                {/* Import Modal */}
                <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Import Students via CSV</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Select CSV File</Label>
                                <Input type="file" accept=".csv" onChange={handleFileUpload} />
                                <p className="text-xs text-gray-500">
                                    Format: firstName, lastName, class, section, gender, dateOfBirth, parentName, parentPhone, email, phone, address, parentEmail
                                </p>
                            </div>
                        </div>

                        {importedData && (
                            <div className="bg-green-50 p-4 rounded-md border border-green-200">
                                <h4 className="text-green-800 font-medium mb-2">Import Complete!</h4>
                                <p className="text-sm text-green-700 mb-4">
                                    Successfully generated credentials for {importedData.length} students.
                                </p>
                                <Button size="sm" onClick={downloadCredentials} className="bg-green-600 hover:bg-green-700 w-full">
                                    <Download className="h-4 w-4 mr-2" /> Download Credentials CSV
                                </Button>
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => {
                                setIsImportOpen(false)
                                setImportedData(null)
                                setImportFile(null)
                            }}>Close</Button>
                            {!importedData && (
                                <Button onClick={processImport} disabled={!importFile || importing}>
                                    {importing ? "Importing..." : "Upload & Import"}
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between bg-pink-50 border-b border-pink-100 py-3">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800 font-normal">
                            <FileText className="h-5 w-5" />
                            Student Admission Form
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                className="bg-[#1e1e50] hover:bg-[#151538] text-white text-xs"
                                onClick={downloadAdmissionForm}
                            >
                                <Download className="h-4 w-4 mr-2" /> Download Admission Form
                            </Button>
                            <Button
                                size="sm"
                                className="bg-[#1e1e50] hover:bg-[#151538] text-white text-xs"
                                onClick={() => setIsImportOpen(true)}
                            >
                                <Upload className="h-4 w-4 mr-2" /> Import Student
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                            {/* Student Details Section */}
                            <Section title="Student Details" defaultOpen>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-red-500">Admission No. *</Label>
                                        <div className="flex gap-2">
                                            <Input placeholder="Prefix" className="w-24 bg-white" {...register("admissionPrefix")} />
                                            <Input defaultValue="2322212012" className="flex-1 bg-white" {...register("studentId", { required: true })} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-red-500">Class *</Label>
                                        <Controller name="class" control={control} rules={{ required: true }} render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger className="bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent>
                                                    {classes.length > 0 ? classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>) : <SelectItem value="1">Class 1</SelectItem>}
                                                </SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-red-500">Section *</Label>
                                        <Controller name="section" control={control} rules={{ required: true }} render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger className="bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent>
                                                    {sections.length > 0 ? sections.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>) : <SelectItem value="A">A</SelectItem>}
                                                </SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                    <div className="row-span-3 flex justify-center items-start">
                                        <div
                                            className="relative border-2 border-dashed border-gray-300 rounded-lg p-2 w-32 h-32 flex flex-col items-center justify-center text-gray-400 bg-white cursor-pointer hover:bg-gray-50"
                                            onClick={() => document.getElementById('student-photo-upload')?.click()}
                                        >
                                            {studentPhotoPreview ? (
                                                <img src={studentPhotoPreview} alt="Student" className="w-full h-full object-cover rounded-lg" />
                                            ) : (
                                                <div className="text-center text-xs">
                                                    <div className="mb-1 text-2xl">👤</div>
                                                    NO IMAGE AVAILABLE
                                                </div>
                                            )}

                                            <input
                                                type="file"
                                                id="student-photo-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        setStudentPhoto(file)
                                                        setStudentPhotoPreview(URL.createObjectURL(file))
                                                    }
                                                }}
                                            />

                                            <Button type="button" size="icon" className="h-6 w-6 rounded-full bg-[#1e1e50] absolute -top-2 -right-2">
                                                <Upload className="h-3 w-3 text-white" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Roll Number</Label>
                                        <Input className="bg-white" {...register("rollNumber")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Biometric Id</Label>
                                        <Input className="bg-white" {...register("biometricId")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Admission Date</Label>
                                        <Input type="date" defaultValue="2025-12-12" className="bg-white" {...register("admissionDate")} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-red-500">First Name *</Label>
                                        <Input className="bg-white" {...register("firstName", { required: true })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Last Name</Label>
                                        <Input className="bg-white" {...register("lastName", { required: true })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-red-500">Gender *</Label>
                                        <Controller name="gender" control={control} rules={{ required: true }} render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger className="bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                                            </Select>
                                        )} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-red-500">Date of Birth *</Label>
                                        <Input type="date" className="bg-white" {...register("dateOfBirth", { required: true })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Controller name="category" control={control} render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger className="bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent><SelectItem value="General">General</SelectItem><SelectItem value="OBC">OBC</SelectItem><SelectItem value="SC">SC</SelectItem><SelectItem value="ST">ST</SelectItem></SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Religion</Label>
                                        <Input className="bg-white" {...register("religion")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Caste</Label>
                                        <Input className="bg-white" {...register("caste")} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Mobile Number</Label>
                                        <Input className="bg-white" {...register("phone")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input className="bg-white" {...register("email")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Blood Group</Label>
                                        <Controller name="bloodGroup" control={control} render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger className="bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent><SelectItem value="A+">A+</SelectItem><SelectItem value="A-">A-</SelectItem><SelectItem value="B+">B+</SelectItem><SelectItem value="B-">B-</SelectItem><SelectItem value="O+">O+</SelectItem><SelectItem value="AB+">AB+</SelectItem></SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>House</Label>
                                        <Controller name="house" control={control} render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger className="bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent><SelectItem value="Red">Red</SelectItem><SelectItem value="Blue">Blue</SelectItem><SelectItem value="Green">Green</SelectItem><SelectItem value="Yellow">Yellow</SelectItem></SelectContent>
                                            </Select>
                                        )} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Height</Label>
                                        <Input className="bg-white" {...register("height")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Weight</Label>
                                        <Input className="bg-white" {...register("weight")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Aadhar Number</Label>
                                        <Input className="bg-white" {...register("aadharNumber")} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Admitted Class</Label>
                                        <Input className="bg-white" {...register("admittedClass")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>As on Date</Label>
                                        <Input className="bg-white" {...register("asOnDate")} />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <Label>Referral By</Label>
                                        <div className="flex gap-2">
                                            <Select>
                                                <SelectTrigger className="bg-[#1e1e50] text-white border-0"><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent><SelectItem value="1">One</SelectItem></SelectContent>
                                            </Select>
                                            <Button className="bg-[#1e1e50] hover:bg-[#151538]">Add</Button>
                                        </div>
                                        <div className="flex justify-end mt-2">
                                            <Button size="sm" className="bg-[#1e1e50] hover:bg-[#151538] text-white">
                                                <Plus className="h-3 w-3 mr-1" /> Add Sibling
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Section>

                            {/* Custom Field */}
                            <Section title="Custom Field" defaultOpen={true}>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <Label>Shift time</Label>
                                        <Input className="bg-white" {...register("shiftTime")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>GR NO</Label>
                                        <Input className="bg-white" {...register("grNo")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>MID</Label>
                                        <Input className="bg-white" {...register("mid")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>PEN Number</Label>
                                        <Input className="bg-white" {...register("penNumber")} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Reference</Label>
                                        <Input className="bg-white" {...register("reference")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-red-500">Mobile *</Label>
                                        <Input className="bg-white" {...register("additionalMobile")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Family Income</Label>
                                        <Input className="bg-white" {...register("familyIncome")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Family Member Count</Label>
                                        <Input className="bg-white" {...register("familyMemberCount")} />
                                    </div>

                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <Label className="text-red-500">Student Language *</Label>
                                        <div className="flex flex-wrap gap-4 pt-2">
                                            {["Hindi", "Gujrati", "Marathi", "Genral", "English"].map((lang) => (
                                                <label key={lang} className="flex items-center gap-2 text-sm">
                                                    <input type="checkbox" className="rounded border-gray-300" {...register(`language_${lang}`)} /> {lang}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <Label className="text-red-500">Student Old Class *</Label>
                                        <Input className="bg-white" {...register("previousClass")} />
                                    </div>

                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <Label className="text-red-500">Last School Name *</Label>
                                        <Input className="bg-white" {...register("previousSchoolName")} />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <Label>Last School Medium</Label>
                                        <Controller name="previousSchoolMedium" control={control} render={({ field }) => (
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 pt-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="english" id="l_english" />
                                                    <Label htmlFor="l_english">English</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="hindi" id="l_hindi" />
                                                    <Label htmlFor="l_hindi">Hindi</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="marathi" id="l_marathi" />
                                                    <Label htmlFor="l_marathi">Marathi</Label>
                                                </div>
                                            </RadioGroup>
                                        )} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tc/Lc In Hand</Label>
                                        <div className="flex gap-4 pt-2">
                                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("tcDateAvailable")} /> Date</label>
                                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("tcPlaceAvailable")} /> Place</label>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Previous class marks</Label>
                                        <Input className="bg-white" {...register("previousSchoolMarks")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Student address class percentage</Label>
                                        <Input className="bg-white" {...register("addressClassPercentage")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>If Any health issue (YES/NO, give cert)</Label>
                                        <Input className="bg-white" {...register("healthIssues")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Interview Marks</Label>
                                        <Input className="bg-white" {...register("interviewMarks")} />
                                    </div>
                                </div>
                            </Section>

                            {/* Parent / Guardian Details */}
                            <Section title="Parent / Guardian Details" defaultOpen={false}>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {/* Father */}
                                    <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label>Father Name</Label>
                                            <Input className="bg-white" {...register("fatherName")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Father Phone</Label>
                                            <Input className="bg-white" {...register("fatherPhone")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Father Job</Label>
                                            <Input className="bg-white" {...register("fatherOccupation")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Father Class, section</Label>
                                            <Input className="bg-white" {...register("fatherEducation")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Marriage Anniversary Date</Label>
                                            <Input type="date" className="bg-white" {...register("marriageAnniversary")} />
                                        </div>
                                    </div>
                                    <div className="flex justify-center">
                                        <div
                                            className="relative border-2 border-dashed border-gray-300 rounded-lg p-2 w-24 h-24 flex flex-col items-center justify-center text-gray-400 bg-white cursor-pointer hover:bg-gray-50"
                                            onClick={() => document.getElementById('father-photo-upload')?.click()}
                                        >
                                            {fatherPhotoPreview ? (
                                                <img src={fatherPhotoPreview} alt="Father" className="w-full h-full object-cover rounded-lg" />
                                            ) : (
                                                <span className="text-xs text-center">Father Photo</span>
                                            )}
                                            <input
                                                type="file"
                                                id="father-photo-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        setFatherPhoto(file)
                                                        setFatherPhotoPreview(URL.createObjectURL(file))
                                                    }
                                                }}
                                            />
                                            <Button type="button" size="icon" className="h-5 w-5 rounded-full bg-[#1e1e50] absolute -top-1 -right-1">
                                                <Upload className="h-3 w-3 text-white" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Mother */}
                                    <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label>Mother Name</Label>
                                            <Input className="bg-white" {...register("motherName")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Mother Phone</Label>
                                            <Input className="bg-white" {...register("motherPhone")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Mother Job</Label>
                                            <Input className="bg-white" {...register("motherOccupation")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Mother Designation</Label>
                                            <Input className="bg-white" {...register("motherDesignation")} />
                                        </div>
                                    </div>
                                    <div className="flex justify-center">
                                        <div
                                            className="relative border-2 border-dashed border-gray-300 rounded-lg p-2 w-24 h-24 flex flex-col items-center justify-center text-gray-400 bg-white cursor-pointer hover:bg-gray-50"
                                            onClick={() => document.getElementById('mother-photo-upload')?.click()}
                                        >
                                            {motherPhotoPreview ? (
                                                <img src={motherPhotoPreview} alt="Mother" className="w-full h-full object-cover rounded-lg" />
                                            ) : (
                                                <span className="text-xs text-center">Mother Photo</span>
                                            )}
                                            <input
                                                type="file"
                                                id="mother-photo-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        setMotherPhoto(file)
                                                        setMotherPhotoPreview(URL.createObjectURL(file))
                                                    }
                                                }}
                                            />
                                            <Button type="button" size="icon" className="h-5 w-5 rounded-full bg-[#1e1e50] absolute -top-1 -right-1">
                                                <Upload className="h-3 w-3 text-white" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Guardian */}
                                    <div className="md:col-span-4 flex gap-6 items-center">
                                        <Label>If Guardian Is *</Label>
                                        <Controller name="guardianIs" control={control} render={({ field }) => (
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="father" id="g_father" />
                                                    <Label htmlFor="g_father">Father</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="mother" id="g_mother" />
                                                    <Label htmlFor="g_mother">Mother</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="other" id="g_other" />
                                                    <Label htmlFor="g_other">Other</Label>
                                                </div>
                                            </RadioGroup>
                                        )} />
                                    </div>

                                    <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-red-500">Guardian Name *</Label>
                                            <Input className="bg-white" {...register("guardianName", { required: true })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Guardian Relation</Label>
                                            <Input className="bg-white" {...register("guardianRelation")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-red-500">Guardian Phone *</Label>
                                            <Input className="bg-white" {...register("guardianPhone", { required: true })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Guardian Occupation</Label>
                                            <Input className="bg-white" {...register("guardianOccupation")} />
                                        </div>
                                    </div>
                                    <div className="flex justify-center">
                                        <div
                                            className="relative border-2 border-dashed border-gray-300 rounded-lg p-2 w-24 h-24 flex flex-col items-center justify-center text-gray-400 bg-white cursor-pointer hover:bg-gray-50"
                                            onClick={() => document.getElementById('guardian-photo-upload')?.click()}
                                        >
                                            {guardianPhotoPreview ? (
                                                <img src={guardianPhotoPreview} alt="Guardian" className="w-full h-full object-cover rounded-lg" />
                                            ) : (
                                                <span className="text-xs text-center">Guardian Photo</span>
                                            )}
                                            <input
                                                type="file"
                                                id="guardian-photo-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        setGuardianPhoto(file)
                                                        setGuardianPhotoPreview(URL.createObjectURL(file))
                                                    }
                                                }}
                                            />
                                            <Button type="button" size="icon" className="h-5 w-5 rounded-full bg-[#1e1e50] absolute -top-1 -right-1">
                                                <Upload className="h-3 w-3 text-white" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="md:col-span-4 space-y-2">
                                        <Label>Guardian Address</Label>
                                        <Textarea className="bg-white h-20" {...register("guardianAddress")} />
                                    </div>
                                </div>
                            </Section>

                            {/* Other Details */}
                            <Section title="Other Details" defaultOpen={true}>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-3 bg-gray-100 p-2 rounded">Student Address Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <input type="checkbox" id="guardian_addr" className="rounded border-gray-300" {...register("isGuardianAddressCurrent")} />
                                                    <Label htmlFor="guardian_addr" className="font-normal">If Guardian Address is Current Address</Label>
                                                </div>
                                                <Label>Current Address</Label>
                                                <Textarea className="bg-white min-h-[80px]" {...register("currentAddress")} />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <input type="checkbox" id="perm_addr" className="rounded border-gray-300" {...register("isPermanentAddressCurrent")} />
                                                    <Label htmlFor="perm_addr" className="font-normal">If Permanent Address is Current Address</Label>
                                                </div>
                                                <Label>Permanent Address</Label>
                                                <Textarea className="bg-white min-h-[80px]" {...register("permanentAddress")} />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-3 bg-gray-100 p-2 rounded">Student Fee Assign</h4>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-2">
                                                <Label>Fee Group</Label>
                                                <Controller name="feeGroup" control={control} render={({ field }) => (
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <SelectTrigger className="bg-white"><SelectValue placeholder="Select Option" /></SelectTrigger>
                                                        <SelectContent><SelectItem value="1">Option 1</SelectItem></SelectContent>
                                                    </Select>
                                                )} />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-3 bg-gray-100 p-2 rounded">Assign Discount</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Discount Group</Label>
                                                <Controller name="discountGroup" control={control} render={({ field }) => (
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <SelectTrigger className="bg-white"><SelectValue placeholder="Select Option" /></SelectTrigger>
                                                        <SelectContent><SelectItem value="1">Option 1</SelectItem></SelectContent>
                                                    </Select>
                                                )} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Code</Label>
                                                <Controller name="discountCode" control={control} render={({ field }) => (
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <SelectTrigger className="bg-white"><SelectValue placeholder="Select Option" /></SelectTrigger>
                                                        <SelectContent><SelectItem value="1">Option 1</SelectItem></SelectContent>
                                                    </Select>
                                                )} />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-3 bg-gray-100 p-2 rounded">Transport Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Route List</Label>
                                                <Controller name="routeId" control={control} render={({ field }) => (
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <SelectTrigger className="bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                                                        <SelectContent><SelectItem value="1">Route 1</SelectItem></SelectContent>
                                                    </Select>
                                                )} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Bus Stop</Label>
                                                <Controller name="busStop" control={control} render={({ field }) => (
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <SelectTrigger className="bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                                                        <SelectContent><SelectItem value="1">Stop 1</SelectItem></SelectContent>
                                                    </Select>
                                                )} />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-3 bg-gray-100 p-2 rounded">Hostel Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Hostel Name</Label>
                                                <Controller name="hostelId" control={control} render={({ field }) => (
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <SelectTrigger className="bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                                                        <SelectContent><SelectItem value="1">Hostel 1</SelectItem></SelectContent>
                                                    </Select>
                                                )} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Room Name</Label>
                                                <Controller name="roomNumber" control={control} render={({ field }) => (
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <SelectTrigger className="bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                                                        <SelectContent><SelectItem value="1">Room 1</SelectItem></SelectContent>
                                                    </Select>
                                                )} />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-3 bg-gray-100 p-2 rounded">Miscellaneous Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>Bank Account Number</Label>
                                                <Input className="bg-white" {...register("bankAccountNo")} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Bank Name</Label>
                                                <Input className="bg-white" {...register("bankName")} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>IFSC Code</Label>
                                                <Input className="bg-white" {...register("ifscCode")} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>National Identification Number</Label>
                                                <Input className="bg-white" {...register("nationalId")} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Local Identification Number</Label>
                                                <Input className="bg-white" {...register("localId")} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>RTE</Label>
                                                <Controller name="rte" control={control} render={({ field }) => (
                                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 pt-2">
                                                        <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="yes" /> Yes</label>
                                                        <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="no" /> No</label>
                                                    </RadioGroup>
                                                )} />
                                            </div>
                                            <div className="space-y-2 col-span-3">
                                                <Label>Note</Label>
                                                <Textarea className="bg-white" {...register("note")} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Section>

                            {/* Upload Documents */}
                            <Section title="Upload Documents" defaultOpen={true}>
                                <div className="overflow-hidden border rounded-md">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-white text-gray-700 border-b">
                                            <tr>
                                                <th className="px-4 py-3 w-16 border-r">#</th>
                                                <th className="px-4 py-3 w-1/3 border-r">TITLE</th>
                                                <th className="px-4 py-3">DOCUMENTS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {[
                                                { id: 1, title: "Report Card" },
                                                { id: 2, title: "TC" },
                                                { id: 4, title: "NIDA Card Number" },
                                                { id: 5, title: "previous year Marksheet" },
                                                { id: 6, title: "Student" },
                                                { id: 7, title: "studnet DOB" },
                                                { id: 8, title: "Adhaar Card" },
                                                { id: 9, title: "Aman" },
                                                { id: 10, title: "PIP/" },
                                            ].map((doc, idx) => (
                                                <tr key={doc.id}>
                                                    <td className="px-4 py-3 text-gray-900 border-r">{doc.id}.</td>
                                                    <td className="px-4 py-3 border-r">
                                                        <Input value={doc.title} readOnly className="bg-[#eef2f9] border-none font-normal" />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2 border rounded-md p-1 pl-2">
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                id={`file-${doc.id}`}
                                                                {...register(`documents.${doc.id}`)}
                                                            />
                                                            <label htmlFor={`file-${doc.id}`} className="bg-[#1e1e50] text-white hover:bg-[#151538] text-xs h-8 px-4 flex items-center rounded cursor-pointer whitespace-nowrap">
                                                                Choose File
                                                            </label>
                                                            <span className="text-gray-500 text-sm truncate max-w-[150px]">
                                                                {watchedDocuments?.[doc.id]?.[0]?.name || "No file chosen"}
                                                            </span>
                                                            {watchedDocuments?.[doc.id]?.[0] && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="ml-auto h-8 w-8 p-0"
                                                                    onClick={() => window.open(URL.createObjectURL(watchedDocuments[doc.id][0]), '_blank')}
                                                                >
                                                                    <FileText className="h-4 w-4 text-blue-600" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Section>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" className="bg-[#1e1e50] hover:bg-[#151538] text-white px-8">Submit</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

function Section({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden transition-all duration-300">
            <div
                className="bg-[#f0f0f4] px-4 py-3 flex justify-between items-center cursor-pointer border-b border-gray-200"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="font-semibold text-gray-800">{title}</h3>
                {isOpen ? <ChevronUp className="h-4 w-4 text-gray-600" /> : <ChevronDown className="h-4 w-4 text-gray-600" />}
            </div>
            {isOpen && (
                <div className="p-6 bg-gray-50/50 animate-in slide-in-from-top-1">
                    {children}
                </div>
            )}
        </div>
    )
}
