"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FormField {
  name: string
  label: string
  type: "text" | "email" | "number" | "date" | "select" | "textarea"
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
}

interface FormModalProps {
  isOpen: boolean
  title: string
  description?: string
  subtitle?: string  // Alias for description
  fields: FormField[]
  initialData?: any
  onSubmit: (data: any) => void
  onClose: () => void
}

export default function FormModal({ isOpen, title, description, subtitle, fields, initialData, onSubmit, onClose }: FormModalProps) {
  // Support both description and subtitle for backwards compatibility
  const modalDescription = description || subtitle;
  const [formData, setFormData] = useState(initialData || {})

  useEffect(() => {
    setFormData(initialData || {})
  }, [initialData])

  if (!isOpen) return null

  // Determine if this is a "long form" that benefits from grid layout
  const isLongForm = fields.length > 5

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({})
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={cn(
        "bg-white rounded-xl shadow-2xl w-full max-h-[90vh] flex flex-col transition-all duration-300",
        isLongForm ? "max-w-3xl" : "max-w-md"
      )}>
        <div className="p-6 border-b flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 rounded-full p-1">
              <X size={20} />
            </button>
          </div>
          {modalDescription && <p className="text-sm text-gray-500">{modalDescription}</p>}
        </div>

        <div className="overflow-y-auto p-6 custom-scrollbar">
          <form id="modal-form" onSubmit={handleSubmit} className={cn(
            isLongForm ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"
          )}>
            {fields.map((field) => (
              <div key={field.name} className={cn(
                "space-y-2",
                field.type === "textarea" ? "md:col-span-2" : ""
              )}>
                <Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                {field.type === "select" ? (
                  <select
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    required={field.required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all bg-white"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    required={field.required}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm min-h-[100px] resize-none transition-all"
                    rows={4}
                  />
                ) : (
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    required={field.required}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    className="bg-white border-gray-300 focus:border-primary focus:ring-primary/20"
                  />
                )}
              </div>
            ))}
          </form>
        </div>

        <div className="p-6 border-t bg-gray-50 rounded-b-xl flex-shrink-0 flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onClose} className="px-6 border-gray-300 hover:bg-white hover:text-gray-900">
            Cancel
          </Button>
          <Button type="submit" form="modal-form" className="px-6 bg-[#1e1e50] hover:bg-[#151538] text-white">
            Save Record
          </Button>
        </div>
      </div>
    </div>
  )
}
