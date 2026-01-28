"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Stamp, Loader2, Pencil, Trash2, FileText } from "lucide-react"
import { toast } from "sonner"

interface Template {
  id: string
  name: string
  type: string
  description: string
  content: string
  createdAt: string
  updatedAt: string
}

export default function CertificateTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: "",
    type: "bonafide",
    description: "",
    content: ""
  })

  // Load templates from localStorage (since there's no backend model)
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = () => {
    try {
      const stored = localStorage.getItem("certificateTemplates")
      if (stored) {
        setTemplates(JSON.parse(stored))
      } else {
        // Set default templates
        const defaultTemplates: Template[] = [
          {
            id: "1",
            name: "Bonafide Certificate Template",
            type: "bonafide",
            description: "Standard bonafide certificate format",
            content: "This is to certify that [Student Name], Roll No. [Roll Number], is a bonafide student of our institution studying in [Class]. This certificate is issued for [Purpose].",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "2",
            name: "Character Certificate Template",
            type: "character",
            description: "Standard character certificate format",
            content: "This is to certify that [Student Name], Roll No. [Roll Number], has been a student of our institution. During their tenure, they have shown [Conduct] conduct and behavior. We wish them success in their future endeavors.",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "3",
            name: "Transfer Certificate Template",
            type: "transfer",
            description: "Standard transfer certificate format",
            content: "This is to certify that [Student Name], Roll No. [Roll Number], was a student of our institution in [Class]. They last attended on [Last Attended Date]. This transfer certificate is issued as per their request.",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
        localStorage.setItem("certificateTemplates", JSON.stringify(defaultTemplates))
        setTemplates(defaultTemplates)
      }
    } catch (error) {
      console.error("Error loading templates:", error)
    }
  }

  const saveTemplates = (updatedTemplates: Template[]) => {
    try {
      localStorage.setItem("certificateTemplates", JSON.stringify(updatedTemplates))
      setTemplates(updatedTemplates)
    } catch (error) {
      console.error("Error saving templates:", error)
      toast.error("Failed to save templates")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.content) {
      toast.error("Template name and content are required")
      return
    }

    setSubmitting(true)

    try {
      if (editingId) {
        // Update existing template
        const updatedTemplates = templates.map(t =>
          t.id === editingId
            ? { ...t, ...form, updatedAt: new Date().toISOString() }
            : t
        )
        saveTemplates(updatedTemplates)
        toast.success("Template updated successfully")
        setEditingId(null)
      } else {
        // Create new template
        const newTemplate: Template = {
          id: Date.now().toString(),
          ...form,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        saveTemplates([...templates, newTemplate])
        toast.success("Template created successfully")
      }

      setForm({
        name: "",
        type: "bonafide",
        description: "",
        content: ""
      })
    } catch (error) {
      toast.error("Failed to save template")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (template: Template) => {
    setForm({
      name: template.name,
      type: template.type,
      description: template.description,
      content: template.content
    })
    setEditingId(template.id)
  }

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return

    const updatedTemplates = templates.filter(t => t.id !== id)
    saveTemplates(updatedTemplates)
    toast.success("Template deleted successfully")
  }

  const cancelEdit = () => {
    setForm({
      name: "",
      type: "bonafide",
      description: "",
      content: ""
    })
    setEditingId(null)
  }

  return (
    <DashboardLayout title="Certificate Templates">
      <div className="space-y-6">
        <Card>
          <CardHeader className="bg-pink-50 border-b border-pink-100">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Stamp className="h-5 w-5" />
              {editingId ? "Edit Template" : "Add Template"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-red-500">Template Name *</Label>
                  <Input
                    placeholder="e.g., Bonafide Certificate Template"
                    className="bg-white border-gray-200"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-500">Template Type *</Label>
                  <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bonafide">Bonafide Certificate</SelectItem>
                      <SelectItem value="character">Character Certificate</SelectItem>
                      <SelectItem value="transfer">Transfer Certificate</SelectItem>
                      <SelectItem value="achievement">Achievement Certificate</SelectItem>
                      <SelectItem value="participation">Participation Certificate</SelectItem>
                      <SelectItem value="completion">Completion Certificate</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Short description of the template"
                  className="bg-white border-gray-200"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-red-500">Template Content *</Label>
                <Textarea
                  placeholder="Enter template content. Use placeholders like [Student Name], [Roll Number], [Class], [Purpose], etc."
                  className="bg-white border-gray-200 min-h-[150px] font-mono text-sm"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={8}
                />
                <p className="text-xs text-gray-500">
                  Available placeholders: [Student Name], [Roll Number], [Class], [Purpose], [Date], [Conduct], [Last Attended Date]
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                {editingId && (
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  className="bg-blue-900 hover:bg-blue-800"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingId ? "Update Template" : "Save Template"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-pink-50 border-b border-pink-100">
            <CardTitle className="text-lg text-gray-800">
              Templates ({templates.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-pink-50 hover:bg-pink-50">
                    <TableHead className="font-bold text-gray-700 uppercase">Name</TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase">Type</TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase">Description</TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase">Last Updated</TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        No templates found. Create your first template above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            {template.name}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{template.type}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {template.description || "-"}
                        </TableCell>
                        <TableCell>{new Date(template.updatedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(template)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(template.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
