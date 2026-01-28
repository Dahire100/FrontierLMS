"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Settings, Edit2, X, Plus, List, Loader2, ChevronDown } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { ActionMenu } from "@/components/action-menu"

interface CustomField {
    _id: string
    name: string
    belongsTo: string
    fieldType: string
    columnGrid: number
    fieldValues?: string
    validation: {
        required: boolean
    }
    visibility: {
        onTable: boolean
        parentStudent: boolean
    }
}

const CATEGORIES = [
    { id: "student", label: "Student" },
    { id: "staff", label: "Staff" },
    { id: "form", label: "Form" },
    { id: "recruitment", label: "Recruitment" },
    { id: "admission_enquiry", label: "Admission Enquiry" },
    { id: "payroll", label: "Payroll" }
]

const FIELD_TYPES = [
    { id: "text", label: "Text Input" },
    { id: "number", label: "Number Input" },
    { id: "date", label: "Date Picker" },
    { id: "textarea", label: "Textarea" },
    { id: "dropdown", label: "Dropdown" }
]

export default function CustomColumnsPage() {
    const [fields, setFields] = useState<CustomField[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editingField, setEditingField] = useState<CustomField | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        belongsTo: "",
        fieldType: "text",
        name: "",
        columnGrid: 12,
        fieldValues: "",
        validation: { required: false },
        visibility: { onTable: false, parentStudent: false }
    })

    const [deleteId, setDeleteId] = useState<string | null>(null)

    useEffect(() => {
        fetchFields()
    }, [])

    const fetchFields = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/custom-fields`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await response.json()
            if (result.success) {
                setFields(result.data)
            }
        } catch (err) {
            console.error(err)
            toast.error("Failed to load custom fields")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!formData.name || !formData.belongsTo || !formData.fieldType) {
            toast.error("Please fill all required fields")
            return
        }

        try {
            setSaving(true)
            const token = localStorage.getItem("token")
            const url = editingField
                ? `${API_URL}/api/custom-fields/${editingField._id}`
                : `${API_URL}/api/custom-fields`
            const method = editingField ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            })

            const result = await response.json()
            if (result.success) {
                toast.success(editingField ? "Field updated" : "Field added")
                resetForm()
                fetchFields()
            } else {
                toast.error(result.error || "Save failed")
            }
        } catch (err) {
            console.error(err)
            toast.error("An error occurred")
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (field: CustomField) => {
        setEditingField(field)
        setFormData({
            belongsTo: field.belongsTo,
            fieldType: field.fieldType,
            name: field.name,
            columnGrid: field.columnGrid,
            fieldValues: field.fieldValues || "",
            validation: field.validation,
            visibility: field.visibility
        })
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/custom-fields/${deleteId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await response.json()
            if (result.success) {
                toast.success("Field deleted")
                fetchFields()
            }
        } catch (err) {
            toast.error("Delete failed")
        } finally {
            setDeleteId(null)
        }
    }

    const resetForm = () => {
        setEditingField(null)
        setFormData({
            belongsTo: "",
            fieldType: "text",
            name: "",
            columnGrid: 12,
            fieldValues: "",
            validation: { required: false },
            visibility: { onTable: false, parentStudent: false }
        })
    }

    const groupedFields = CATEGORIES.reduce((acc, cat) => {
        acc[cat.id] = fields.filter(f => f.belongsTo === cat.id)
        return acc
    }, {} as Record<string, CustomField[]>)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <span className="p-2 bg-primary/10 rounded-md">
                        <Settings className="w-5 h-5 text-primary" />
                    </span>
                    Custom Columns
                </h1>
                <div className="text-sm text-muted-foreground">
                    System Setting / Custom Columns
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Add/Edit Form */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader className="border-b pb-4">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <Edit2 size={18} />
                                {editingField ? "Edit Custom Field" : "Add Custom Field"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="belongs-to">Field belongs to <span className="text-red-500">*</span></Label>
                                <Select
                                    value={formData.belongsTo}
                                    onValueChange={(v) => setFormData({ ...formData, belongsTo: v })}
                                >
                                    <SelectTrigger id="belongs-to">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="field-type">Field Type <span className="text-red-500">*</span></Label>
                                <Select
                                    value={formData.fieldType}
                                    onValueChange={(v) => setFormData({ ...formData, fieldType: v })}
                                >
                                    <SelectTrigger id="field-type">
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FIELD_TYPES.map(type => (
                                            <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="field-name">Field Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="field-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter field label"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="grid-column">Grid (Bootstrap Column eg. 6) - Max 12</Label>
                                <div className="flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-[#1e1b4b] text-white sm:text-sm">
                                        col-md-
                                    </span>
                                    <Input
                                        type="number"
                                        id="grid-column"
                                        className="rounded-l-none"
                                        min={1}
                                        max={12}
                                        value={formData.columnGrid}
                                        onChange={(e) => setFormData({ ...formData, columnGrid: parseInt(e.target.value) || 12 })}
                                    />
                                </div>
                            </div>

                            {formData.fieldType === 'dropdown' && (
                                <div className="space-y-2">
                                    <Label>Field Values (Separate By Comma)</Label>
                                    <textarea
                                        value={formData.fieldValues}
                                        onChange={(e) => setFormData({ ...formData, fieldValues: e.target.value })}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Option 1, Option 2, Option 3"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                    <Label>Validation</Label>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="required"
                                            checked={formData.validation.required}
                                            onCheckedChange={(checked) => setFormData({
                                                ...formData,
                                                validation: { ...formData.validation, required: !!checked }
                                            })}
                                        />
                                        <Label htmlFor="required" className="text-sm font-normal">Required</Label>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Visibility</Label>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="on-table"
                                                checked={formData.visibility.onTable}
                                                onCheckedChange={(checked) => setFormData({
                                                    ...formData,
                                                    visibility: { ...formData.visibility, onTable: !!checked }
                                                })}
                                            />
                                            <Label htmlFor="on-table" className="text-sm font-normal">On Table</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="parent-student"
                                                checked={formData.visibility.parentStudent}
                                                onCheckedChange={(checked) => setFormData({
                                                    ...formData,
                                                    visibility: { ...formData.visibility, parentStudent: !!checked }
                                                })}
                                            />
                                            <Label htmlFor="parent-student" className="text-sm font-normal">Parent / Student</Label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-2 justify-end">
                                {editingField && (
                                    <Button variant="outline" onClick={resetForm}>Cancel</Button>
                                )}
                                <Button
                                    className="bg-[#1e1b4b] hover:bg-[#1e1b4b]/90 min-w-[100px]"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    {editingField ? "Update" : "Save"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: List */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="border-b pb-4">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <List className="w-5 h-5" />
                                Custom Columns List
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                    <span>Loading fields...</span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {CATEGORIES.map((category) => (
                                        <div key={category.id} className="border rounded-md overflow-hidden">
                                            <div className="bg-muted p-3 font-semibold text-sm flex justify-between items-center">
                                                <span>{category.label}</span>
                                                <div className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full">
                                                    {groupedFields[category.id]?.length || 0} Fields
                                                </div>
                                            </div>
                                            <div className="bg-white">
                                                {groupedFields[category.id]?.length === 0 ? (
                                                    <div className="p-4 text-center text-xs text-muted-foreground">
                                                        No custom fields added yet.
                                                    </div>
                                                ) : (
                                                    groupedFields[category.id].map((field) => (
                                                        <div key={field._id} className="p-3 border-b last:border-0 flex justify-between items-center text-sm hover:bg-muted/10 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-1.5 bg-gray-100 rounded text-gray-500">
                                                                    <Settings size={14} />
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-gray-900">{field.name}</div>
                                                                    <div className="text-[10px] text-muted-foreground uppercase flex gap-2">
                                                                        <span>Type: {field.fieldType}</span>
                                                                        {field.validation.required && <span className="text-red-500">Required</span>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-1 pr-2">
                                                                <ActionMenu
                                                                    onEdit={() => handleEdit(field)}
                                                                    onDelete={() => setDeleteId(field._id)}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ConfirmationDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Custom Field"
                description="Are you sure you want to delete this custom field? This action cannot be undone."
                variant="destructive"
            />
        </div>
    )
}
